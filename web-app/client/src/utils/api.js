import axios from "axios";
import { isTokenValid, clearAuthData } from "../services/authService";

const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL || "http://localhost:4004",
  withCredentials: false, // IMPORTANT: keep false unless using cookies
});

/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Do NOT attach token or check expiration for login
  if (config.url.includes("/api/auth/login")) {
    config.headers["Content-Type"] = "application/json";
    return config;
  }

  // Check token validity before making request
  if (!token || !isTokenValid()) {
    // Clear stale auth data and redirect
    clearAuthData();
    window.location.href = "/login";
    return Promise.reject(new Error("Token expired or missing"));
  }

  config.headers["x-auth-token"] = token;
  config.headers["Content-Type"] = "application/json";
  return config;
});

/* ================= RESPONSE INTERCEPTOR ================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // ⛔ DO NOT redirect during login
    if (status === 401 && !url.includes("/api/auth/login")) {
      localStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
