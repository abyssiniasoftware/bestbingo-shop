// src/components/common/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isTokenValid } from "../../services/authService";
import useUserStore from "../../stores/userStore";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();
  const { clearUser } = useUserStore();

  // Check both token existence AND expiration
  if (!token || !isTokenValid()) {
    // Clear any stale auth data
    clearUser();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check role-based access if allowedRoles is provided
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/404" replace />;
  }

  return children;
};

export default ProtectedRoute;

