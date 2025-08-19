import axios from 'axios';
import { isTokenExpired } from '../utils/tokenUtils';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tailor_token');
    if (token) {
      // Check if token is expired before making request
      if (isTokenExpired(token)) {
        console.log('Token expired in request interceptor');
        // Clear expired token
        localStorage.removeItem('tailor_token');
        localStorage.removeItem('tailor_refresh_token');
        delete api.defaults.headers.common['Authorization'];
        
        // Trigger logout by dispatching a custom event
        window.dispatchEvent(new CustomEvent('tokenExpired'));
        
        // Reject the request
        return Promise.reject(new Error('Token expired'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('tailor_refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh/`,
            { refresh: refreshToken }
          );

          const { access } = response.data;
          
          // Update localStorage and axios headers
          localStorage.setItem('tailor_token', access);
          api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.log('Token refresh failed:', refreshError);
        // Refresh failed, clear tokens and trigger logout
        localStorage.removeItem('tailor_token');
        localStorage.removeItem('tailor_refresh_token');
        delete api.defaults.headers.common['Authorization'];
        
        // Trigger logout by dispatching a custom event
        window.dispatchEvent(new CustomEvent('tokenExpired'));
        
        // Only redirect if not already on a login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('tailor_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('tailor_token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const setRefreshToken = (refreshToken) => {
  if (refreshToken) {
    localStorage.setItem('tailor_refresh_token', refreshToken);
  } else {
    localStorage.removeItem('tailor_refresh_token');
  }
};

export const clearAuthTokens = () => {
  localStorage.removeItem('tailor_token');
  localStorage.removeItem('tailor_refresh_token');
  delete api.defaults.headers.common['Authorization'];
};

export default api;
