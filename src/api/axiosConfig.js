import axios from "axios";

const rawBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const getAssetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Accommodate Render free-tier cold-start wakeups (30-50s)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT Bearer token without exposing or logging it
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 (expired/invalid) and 403 (unauthorized role)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config ? error.config.url : "";

      if (status === 401 && !url.includes("/api/auth/login")) {
        // Token has expired, is invalid, or was revoked
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        localStorage.removeItem("uname");
        localStorage.removeItem("userId");

        // Notify app of auth session invalidation
        window.dispatchEvent(new Event("auth:session-expired"));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
