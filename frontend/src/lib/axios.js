import axios from "axios";

// Empty in production (same origin as the page) and in dev (Vite proxies /api).
// Set VITE_API_URL only if the API is hosted on a different domain than the frontend.
export const API_URL = import.meta.env.VITE_API_URL || "";

export const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

// Always send the Clerk session token so it also works when the API is on another domain.
axiosInstance.interceptors.request.use(async (config) => {
  const token = await window.Clerk?.session?.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
