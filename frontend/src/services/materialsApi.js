import api from './api';

const materialsApi = {
  // Get all materials
  getMaterials: async (params = {}) => {
    try {
      const response = await api.get('/materials/materials/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  },

  // Search materials
  searchMaterials: async (query) => {
    try {
      const response = await api.get('/materials/materials/search/', { 
        params: { q: query } 
      });
      return response.data;
    } catch (error) {
      console.error('Error searching materials:', error);
      throw error;
    }
  },

  // Get material by ID
  getMaterial: async (id) => {
    try {
      const response = await api.get(`/materials/materials/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching material:', error);
      throw error;
    }
  },

  // Create new material
  createMaterial: async (materialData) => {
    try {
      const response = await api.post('/materials/materials/', materialData);
      return response.data;
    } catch (error) {
      console.error('Error creating material:', error);
      throw error;
    }
  },

  // Update material
  updateMaterial: async (id, materialData) => {
    try {
      const response = await api.put(`/materials/materials/${id}/`, materialData);
      return response.data;
    } catch (error) {
      console.error('Error updating material:', error);
      throw error;
    }
  },

  // Partial update material
  patchMaterial: async (id, materialData) => {
    try {
      const response = await api.patch(`/materials/materials/${id}/`, materialData);
      return response.data;
    } catch (error) {
      console.error('Error patching material:', error);
      throw error;
    }
  },

  // Delete material
  deleteMaterial: async (id) => {
    try {
      const response = await api.delete(`/materials/materials/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  },

  // Get active materials only
  getActiveMaterials: async () => {
    try {
      const response = await api.get('/materials/materials/active/');
      return response.data;
    } catch (error) {
      console.error('Error fetching active materials:', error);
      throw error;
    }
  },

  // Update material price
  updateMaterialPrice: async (id, price) => {
    try {
      const response = await api.patch(`/materials/materials/${id}/update_price/`, { price });
      return response.data;
    } catch (error) {
      console.error('Error updating material price:', error);
      throw error;
    }
  },

  // Toggle material status
  toggleMaterialStatus: async (id) => {
    try {
      const response = await api.patch(`/materials/materials/${id}/toggle_status/`);
      return response.data;
    } catch (error) {
      console.error('Error toggling material status:', error);
      throw error;
    }
  },

  // Get material statistics
  getMaterialStatistics: async () => {
    try {
      const response = await api.get('/materials/materials/statistics/');
      return response.data;
    } catch (error) {
      console.error('Error fetching material statistics:', error);
      throw error;
    }
  }
};

export default materialsApi;
