import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const baseURL = rawUrl.replace(/\/+$/, '');

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const activeConnection = localStorage.getItem('active_connection_id');
  if (activeConnection) {
    config.headers['X-Connection-ID'] = activeConnection;
  }
  return config;
});

export default api;
