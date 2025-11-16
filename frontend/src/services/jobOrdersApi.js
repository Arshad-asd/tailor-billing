import api from './api';

const JOB_ORDERS_BASE_URL = '/job-orders/';

export const jobOrdersApi = {
  // Get all job orders with optional filters
  getJobOrders: async (params = {}) => {
    try {
      const response = await api.get(JOB_ORDERS_BASE_URL, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching job orders:', error);
      throw error;
    }
  },

  // Get job order by ID
  getJobOrder: async (id) => {
    try {
      const response = await api.get(`${JOB_ORDERS_BASE_URL}${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job order:', error);
      throw error;
    }
  },

  // Create new job order
  createJobOrder: async (jobOrderData) => {
    try {
      console.log('Creating job order with data:', jobOrderData);
      console.log('API URL:', JOB_ORDERS_BASE_URL);
      
      const response = await api.post(JOB_ORDERS_BASE_URL, jobOrderData);
      console.log('Job order created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating job order:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  },

  // Update job order
  updateJobOrder: async (id, jobOrderData) => {
    try {
      const response = await api.put(`${JOB_ORDERS_BASE_URL}${id}/`, jobOrderData);
      return response.data;
    } catch (error) {
      console.error('Error updating job order:', error);
      throw error;
    }
  },

  // Partial update job order
  partialUpdateJobOrder: async (id, jobOrderData) => {
    try {
      const response = await api.patch(`${JOB_ORDERS_BASE_URL}${id}/`, jobOrderData);
      return response.data;
    } catch (error) {
      console.error('Error partially updating job order:', error);
      throw error;
    }
  },

  // Delete job order (soft delete)
  deleteJobOrder: async (id) => {
    try {
      const response = await api.delete(`${JOB_ORDERS_BASE_URL}${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting job order:', error);
      throw error;
    }
  },

  // Update job order status
  updateJobOrderStatus: async (id, status) => {
    try {
      const response = await api.post(`${JOB_ORDERS_BASE_URL}${id}/update_status/`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating job order status:', error);
      throw error;
    }
  },

  // Get job order items
  getJobOrderItems: async (id) => {
    try {
      const response = await api.get(`${JOB_ORDERS_BASE_URL}${id}/items/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job order items:', error);
      throw error;
    }
  },

  // Get job order measurements
  getJobOrderMeasurements: async (id) => {
    try {
      const response = await api.get(`${JOB_ORDERS_BASE_URL}${id}/measurements/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job order measurements:', error);
      throw error;
    }
  },

  // Get job order statistics
  getJobOrderStats: async () => {
    try {
      const response = await api.get(`${JOB_ORDERS_BASE_URL}stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job order stats:', error);
      throw error;
    }
  },

  // Get recent job orders
  getRecentJobOrders: async (limit = 10) => {
    try {
      const response = await api.get(`${JOB_ORDERS_BASE_URL}recent/`, { 
        params: { limit } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent job orders:', error);
      throw error;
    }
  },

  // Test methods
  testGet: async () => {
    try {
      const response = await api.get(`${JOB_ORDERS_BASE_URL}test/`);
      return response.data;
    } catch (error) {
      console.error('Error testing GET:', error);
      throw error;
    }
  },

  testPost: async (data) => {
    try {
      const response = await api.post(`${JOB_ORDERS_BASE_URL}test_post/`, data);
      return response.data;
    } catch (error) {
      console.error('Error testing POST:', error);
      throw error;
    }
  }
};

export default jobOrdersApi;