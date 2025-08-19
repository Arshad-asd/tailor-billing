import api from './api';

// Auth API methods
export const authAPI = {
  // User authentication
  signup: (userData) => api.post('/auth/signup/', userData),
  login: (credentials) => api.post('/auth/login/', credentials),
  logout: () => api.post('/auth/logout/'),
  refreshToken: (refreshToken) => api.post('/auth/refresh/', { refresh: refreshToken }),
  getCurrentUser: () => api.get('/auth/me/'),
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password/', { token, password }),
};

// User management API
export const userAPI = {
  getUsers: (params) => api.get('/users/', { params }),
  getUser: (id) => api.get(`/users/${id}/`),
  createUser: (userData) => api.post('/users/', userData),
  updateUser: (id, userData) => api.put(`/users/${id}/`, userData),
  deleteUser: (id) => api.delete(`/users/${id}/`),
};

// Token refresh utility
export const refreshAuthToken = async () => {
  try {
    const refreshToken = localStorage.getItem('tailor_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await authAPI.refreshToken(refreshToken);
    const { access } = response.data;
    
    // Update localStorage
    localStorage.setItem('tailor_token', access);
    
    return access;
  } catch (error) {
    // Clear tokens on refresh failure
    localStorage.removeItem('tailor_token');
    localStorage.removeItem('tailor_refresh_token');
    throw error;
  }
}; 