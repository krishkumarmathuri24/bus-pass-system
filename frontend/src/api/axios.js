import axios from 'axios';

// In production, set REACT_APP_API_URL to your deployed backend URL.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

// Attach the JWT to every request automatically once the user is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
