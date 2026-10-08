import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../api/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = useCallback(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    initAuth();

    // Listen to session expired event triggered by Axios interceptor
    const handleSessionExpired = () => {
      setUser(null);
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [initAuth]);

  const login = async (credentials) => {
    const authData = await authService.login(credentials);
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    return authData;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user && !!user.token,
    isAdmin: user?.role === "ADMIN",
    isCitizen: user?.role === "CITIZEN",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
