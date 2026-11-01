import axios from "axios";

const TOKEN_KEY = "nf_token";
const USER_KEY = "nf_user";

// Same-origin "/api" in production (backend serves the build); override with REACT_APP_API_URL.
export const API_URL = (process.env.REACT_APP_API_URL || "/api").replace(/\/$/, "");

const api = axios.create({ baseURL: API_URL, timeout: 6 * 60 * 1000 });

export const session = {
  get token() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      return null;
    }
  },
  get user() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch (e) {
      return null;
    }
  },
  save(user) {
    try {
      localStorage.setItem(TOKEN_KEY, user.token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      /* storage unavailable (private mode) - session lasts for this tab only */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      /* ignore */
    }
  },
};

api.interceptors.request.use((config) => {
  const { token } = session;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith("/users/")) {
      session.clear();
      window.dispatchEvent(new Event("nf:logout"));
    }
    return Promise.reject(error);
  }
);

/** Human readable message from an axios error. */
export const errorMessage = (err, fallback = "Something went wrong. Please try again.") =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  (err?.code === "ERR_NETWORK" ? "Cannot reach the server. Check your connection." : null) ||
  err?.message ||
  fallback;

export default api;
