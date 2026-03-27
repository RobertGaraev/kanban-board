import axios from "axios";

export const api = axios.create({
  baseURL:
    typeof window === "undefined"
      ? "http://backend:3000" // внутри Docker
      : "http://localhost:3000", // браузер
});

// Добавляем токен автоматически
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
