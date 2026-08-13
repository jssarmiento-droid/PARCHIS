import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'https://parchis-iot-backend.onrender.com';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
