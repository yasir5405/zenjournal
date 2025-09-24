import { Navigate } from "react-router-dom";

interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute = ({ children }: GuestRouteProps) => {
  const token = localStorage.getItem("token");

  // If token exists, redirect to dashboard or home
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the page (Login/Signup)
  return <>{children}</>;
};

export default GuestRoute;
