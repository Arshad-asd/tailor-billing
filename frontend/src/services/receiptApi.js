import api from './api';

// Receipt API service
export const receiptApi = {
  // Get all receipts
  getReceipts: async (params = {}) => {
    try {
      const response = await api.get('/receipts/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching receipts:', error);
      throw error;
    }
  },

  // Get receipt by ID
  getReceipt: async (id) => {
    try {
      const response = await api.get(`/receipts/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching receipt:', error);
      throw error;
    }
  },

  // Create new receipt
  createReceipt: async (receiptData) => {
    try {
      const response = await api.post('/receipts/', receiptData);
      return response.data;
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  },

  // Update receipt
  updateReceipt: async (id, receiptData) => {
    try {
      const response = await api.put(`/receipts/${id}/`, receiptData);
      return response.data;
    } catch (error) {
      console.error('Error updating receipt:', error);
      throw error;
    }
  },

  // Partial update receipt
  patchReceipt: async (id, receiptData) => {
    try {
      const response = await api.patch(`/receipts/${id}/`, receiptData);
      return response.data;
    } catch (error) {
      console.error('Error patching receipt:', error);
      throw error;
    }
  },

  // Delete receipt
  deleteReceipt: async (id) => {
    try {
      const response = await api.delete(`/receipts/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  },

  // Get active receipts
  getActiveReceipts: async () => {
    try {
      const response = await api.get('/receipts/active/');
      return response.data;
    } catch (error) {
      console.error('Error fetching active receipts:', error);
      throw error;
    }
  },

  // Search receipts
  searchReceipts: async (query) => {
    try {
      const response = await api.get('/receipts/search/', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Error searching receipts:', error);
      throw error;
    }
  },

  // Get receipts by job order
  getReceiptsByJobOrder: async (jobOrderId) => {
    try {
      const response = await api.get(`/receipts/by-job-order/${jobOrderId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching receipts by job order:', error);
      throw error;
    }
  },

  // Get today's receipts
  getTodayReceipts: async () => {
    try {
      const response = await api.get('/receipts/today/');
      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s receipts:', error);
      throw error;
    }
  },

  // Get receipt summary
  getReceiptSummary: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get('/receipts/summary/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching receipt summary:', error);
      throw error;
    }
  },

  // Toggle receipt status
  toggleReceiptStatus: async (id) => {
    try {
      const response = await api.patch(`/receipts/${id}/toggle_status/`);
      return response.data;
    } catch (error) {
      console.error('Error toggling receipt status:', error);
      throw error;
    }
  }
};

export default receiptApi;
