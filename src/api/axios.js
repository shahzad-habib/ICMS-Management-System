import axios from 'axios';

let BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fix for production environment variables missing the /api suffix
if (BASE_URL.endsWith('.vercel.app') || BASE_URL.endsWith('.onrender.com')) {
  BASE_URL += '/api';
} else if (!BASE_URL.endsWith('/api') && !BASE_URL.endsWith('/api/')) {
  // Catch any other cases where /api is missing (unless it's an explicitly different path)
  if (BASE_URL.match(/^https?:\/\/[^\/]+$/)) {
    BASE_URL += '/api';
  }
}

const api = axios.create({
  baseURL: BASE_URL,
});

// Request interceptor to attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — catch expired/invalid tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear session and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
