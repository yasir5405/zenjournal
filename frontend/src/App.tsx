import { Route, Routes } from "react-router-dom";
import { Dashboard, Home, LoginPage, NotFoundPage, SignupPage } from "./pages";
import RecentEntries from "./pages/RecentEntries";
import { useEffect } from "react";
import { api } from "./api/api";
import { useDispatch } from "react-redux";
import { login, logout } from "./store/authSlice";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import Navbar from "./components/Navbar";
import { Toaster } from "@/components/ui/toaster";

// Layout wrapper for pages that need padding
const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="px-28 ">{children}</div>
);

// Layout wrapper for auth pages (no padding)
const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        dispatch(logout());
        return;
      }
      try {
        const user = await api.get("/auth/me");
        if (user.data.status === true) {
          dispatch(login(user.data.user));
        } else {
          dispatch(logout());
          localStorage.removeItem("token");
        }
        console.log("User details:", user.data);
      } catch (error: unknown) {
        dispatch(logout());
        localStorage.removeItem("token");
        const errorMessage = error instanceof Error ? error.message : "An error occurred";
        console.log(errorMessage);
      }
    };
    fetchUserDetails();
  }, [dispatch]);
  return (
    <div className="w-full h-dvh min-h-dvh relative">
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <Navbar />  
              <Home />
            </MainLayout>
          }
        />
        <Route
          path="/login"
          element={
            <AuthLayout>
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            </AuthLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthLayout>
              <GuestRoute>
                <SignupPage />
              </GuestRoute>
            </AuthLayout>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/recent"
          element={
            <ProtectedRoute>
              <RecentEntries />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <MainLayout>
              <NotFoundPage />
            </MainLayout>
          }
        />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
