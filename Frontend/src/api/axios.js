import axios from "axios";

const api = axios.create({
  baseURL: "https://aura-booking-nine.vercel.app/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("aura_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      // Ensure we redirect only if not already on login page to avoid loops
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
