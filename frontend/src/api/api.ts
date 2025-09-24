import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers!["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fixed response interceptor
api.interceptors.response.use(
  (response) => {
    // Your backend returns { status: true/false, message: "..." }
    // If status is false, treat it as an error even if HTTP status is 200
    if (response.data && response.data.status === false) {
      return Promise.reject({
        response: {
          status: 400,
          data: response.data,
        },
      });
    }
    return response;
  },
  (error) => {
    // Handle HTTP errors (4xx, 5xx)
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      // Your backend error format: { message: "..." } (no success field)
      const errorMessage = data?.message || "An error occurred";

      console.error(`Error ${status}:`, errorMessage);

      // Handle specific status codes
      switch (status) {
        case 401:
          console.warn("Unauthorized! Logging out...");
          localStorage.removeItem("token");
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
          break;

        case 403:
          console.warn("Forbidden: You don't have permission for this action");
          break;

        case 404:
          console.warn("Resource not found");
          break;

        case 400:
          console.warn("Bad request:", errorMessage);
          break;

        default:
          if (status >= 500) {
            console.error("Server error:", errorMessage);
          }
      }

      // Attach formatted error message for components to use
      error.message = errorMessage;
    } else if (error.request) {
      console.error("No response received:", error.request);
      error.message = "Network error - please check your connection";
    } else {
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);
