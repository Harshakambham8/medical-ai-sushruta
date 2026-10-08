import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname
    ? `http://${window.location.hostname}:8000`
    : "http://localhost:8000");

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Attach authenticated user credentials & role to every outgoing request
API.interceptors.request.use((config) => {
  try {
    const rawUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user?.email) {
        config.headers["x-user-email"] = user.email;
      }
      if (user?.role) {
        config.headers["x-user-role"] = user.role;
      }
      if (user?.id) {
        config.headers["x-user-id"] = user.id;
      }
    }
  } catch (err) {
    console.warn("API interceptor parse error:", err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export { API_BASE_URL };
export default API;