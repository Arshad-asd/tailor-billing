import api from './api';

const settingsApi = {
  // Sidebar Item Configuration APIs
  // Get all sidebar items
  getSidebarItems: async (params = {}) => {
    try {
      const response = await api.get('/master/sidebar-items/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching sidebar items:', error);
      throw error;
    }
  },

  // Get active sidebar items
  getActiveSidebarItems: async () => {
    try {
      const response = await api.get('/master/sidebar-items/active/');
      return response.data;
    } catch (error) {
      console.error('Error fetching active sidebar items:', error);
      throw error;
    }
  },

  // Get sidebar item by ID
  getSidebarItem: async (id) => {
    try {
      const response = await api.get(`/master/sidebar-items/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sidebar item:', error);
      throw error;
    }
  },

  // Create sidebar item
  createSidebarItem: async (itemData) => {
    try {
      const response = await api.post('/master/sidebar-items/', itemData);
      return response.data;
    } catch (error) {
      console.error('Error creating sidebar item:', error);
      throw error;
    }
  },

  // Update sidebar item
  updateSidebarItem: async (id, itemData) => {
    try {
      const response = await api.put(`/master/sidebar-items/${id}/`, itemData);
      return response.data;
    } catch (error) {
      console.error('Error updating sidebar item:', error);
      throw error;
    }
  },

  // Partial update sidebar item
  patchSidebarItem: async (id, itemData) => {
    try {
      const response = await api.patch(`/master/sidebar-items/${id}/`, itemData);
      return response.data;
    } catch (error) {
      console.error('Error patching sidebar item:', error);
      throw error;
    }
  },

  // Delete sidebar item
  deleteSidebarItem: async (id) => {
    try {
      const response = await api.delete(`/master/sidebar-items/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting sidebar item:', error);
      throw error;
    }
  },

  // Page Background Settings APIs
  // Get all page backgrounds
  getPageBackgrounds: async (params = {}) => {
    try {
      const response = await api.get('/master/page-backgrounds/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching page backgrounds:', error);
      throw error;
    }
  },

  // Get active page backgrounds
  getActivePageBackgrounds: async () => {
    try {
      const response = await api.get('/master/page-backgrounds/active/');
      return response.data;
    } catch (error) {
      console.error('Error fetching active page backgrounds:', error);
      throw error;
    }
  },

  // Get page background by route
  getPageBackgroundByRoute: async (route) => {
    try {
      // Remove leading slash if present and encode the route
      const cleanRoute = route.startsWith('/') ? route.slice(1) : route;
      const response = await api.get(`/master/page-backgrounds/by-route/${cleanRoute}/`);
      return response.data;
    } catch (error) {
      // Return null if not found (404) instead of throwing
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching page background by route:', error);
      throw error;
    }
  },

  // Get page background by ID
  getPageBackground: async (id) => {
    try {
      const response = await api.get(`/master/page-backgrounds/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching page background:', error);
      throw error;
    }
  },

  // Create page background
  createPageBackground: async (backgroundData) => {
    try {
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.keys(backgroundData).forEach(key => {
        if (backgroundData[key] !== null && backgroundData[key] !== undefined) {
          if (key === 'background_image') {
            if (backgroundData[key] instanceof File) {
              formData.append(key, backgroundData[key]);
            }
          } else {
            formData.append(key, backgroundData[key]);
          }
        }
      });

      const response = await api.post('/master/page-backgrounds/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating page background:', error);
      throw error;
    }
  },

  // Update page background
  updatePageBackground: async (id, backgroundData) => {
    try {
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.keys(backgroundData).forEach(key => {
        if (backgroundData[key] !== null && backgroundData[key] !== undefined) {
          if (key === 'background_image') {
            if (backgroundData[key] instanceof File) {
              formData.append(key, backgroundData[key]);
            }
          } else {
            formData.append(key, backgroundData[key]);
          }
        }
      });

      const response = await api.put(`/master/page-backgrounds/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating page background:', error);
      throw error;
    }
  },

  // Partial update page background
  patchPageBackground: async (id, backgroundData) => {
    try {
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.keys(backgroundData).forEach(key => {
        if (backgroundData[key] !== null && backgroundData[key] !== undefined) {
          if (key === 'background_image') {
            if (backgroundData[key] instanceof File) {
              formData.append(key, backgroundData[key]);
            }
          } else {
            formData.append(key, backgroundData[key]);
          }
        }
      });

      const response = await api.patch(`/master/page-backgrounds/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error patching page background:', error);
      throw error;
    }
  },

  // Delete page background
  deletePageBackground: async (id) => {
    try {
      const response = await api.delete(`/master/page-backgrounds/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting page background:', error);
      throw error;
    }
  },
};

export default settingsApi;








