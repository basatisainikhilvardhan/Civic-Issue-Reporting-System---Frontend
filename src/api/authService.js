import api from "./axiosConfig";

export const authService = {
  // Register citizen (POST /api/auth/register)
  async register(data) {
    const response = await api.post("/api/auth/register", {
      name: data.name || data.username,
      email: data.email,
      phone: data.phone || "9999999999",
      password: data.password,
    });
    return response.data;
  },

  // Login (POST /api/auth/login)
  async login(credentials) {
    const response = await api.post("/api/auth/login", {
      email: credentials.email || credentials.uname,
      password: credentials.password || credentials.psw,
    });
    
    const authData = response.data;
    if (authData && authData.token) {
      localStorage.setItem("token", authData.token);
      localStorage.setItem("role", authData.role);
      localStorage.setItem("email", authData.email);
      localStorage.setItem("uname", authData.email.split("@")[0]);
      if (authData.userId) {
        localStorage.setItem("userId", authData.userId);
      }
    }
    return authData;
  },

  // Logout
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("uname");
    localStorage.removeItem("userId");
    localStorage.removeItem("upsw");
  },

  // Current session info
  getCurrentUser() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return {
      token,
      role: localStorage.getItem("role") || "CITIZEN",
      email: localStorage.getItem("email") || "",
      name: localStorage.getItem("uname") || "User",
      userId: localStorage.getItem("userId") || null,
    };
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },

  isAdmin() {
    return localStorage.getItem("role") === "ADMIN";
  },
};

export default authService;
