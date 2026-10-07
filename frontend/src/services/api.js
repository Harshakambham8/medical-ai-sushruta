import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && window.location.hostname
    ? `http://${window.location.hostname}:8000`
    : "http://localhost:8000");

const API = axios.create({
  baseURL: API_BASE_URL,
});

export { API_BASE_URL };
export default API;