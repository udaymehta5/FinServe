import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-render-url.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach authorization tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expirations and 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('finToken');
      localStorage.removeItem('finUser');
      // Redirect to login if window is available
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
