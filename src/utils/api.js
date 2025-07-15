import axios from 'axios';

const api = axios.create({
  baseURL: 'https://cloudkitchenbackend.fly.dev/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (credentials) => api.post('api/auth/google', credentials);
export const addMenuItem = (item) => api.post('api/menu', item);
export const createOrder = (order) => api.post('api/orders', order);

export default api;
