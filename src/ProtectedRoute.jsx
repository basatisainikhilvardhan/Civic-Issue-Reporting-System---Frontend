import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export function ProtectedRoute({ children, requiredRole, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-state" style={{ padding: "4rem 0" }}>
          <div className="spinner"></div>
          <p>Verifying authentication credentials...</p>
        </div>
      </div>
    );
  }

  // 1. If not authenticated, redirect to login, preserving intended path
  if (!isAuthenticated || !user) {
    return <Navigate to="/log" state={{ from: location }} replace />;
  }

  // 2. If requiredRole is specified (e.g. ADMIN), check user's role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. If allowedRoles list is specified, ensure user's role is in the list
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
