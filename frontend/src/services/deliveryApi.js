import api from './api';
import { jobOrdersApi } from './jobOrdersApi';

const DELIVERY_BASE_URL = '/job-orders/';

export const deliveryApi = {
  // Get all deliveries (job orders with delivery information)
  // Uses the deliveries action endpoint which filters by delivery_date
  getDeliveries: async (params = {}) => {
    try {
      const response = await api.get(`${DELIVERY_BASE_URL}deliveries/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      throw error;
    }
  },

  // Get delivery by ID
  getDelivery: async (id) => {
    try {
      const response = await api.get(`${DELIVERY_BASE_URL}${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery:', error);
      throw error;
    }
  },

  // Get deliveries by status
  getDeliveriesByStatus: async (status) => {
    try {
      const response = await api.get(DELIVERY_BASE_URL, { 
        params: { status } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching deliveries by status:', error);
      throw error;
    }
  },

  // Update delivery status
  updateDeliveryStatus: async (id, status) => {
    try {
      const response = await api.post(`${DELIVERY_BASE_URL}${id}/update_status/`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw error;
    }
  },

  // Get delivery statistics
  getDeliveryStats: async () => {
    try {
      const response = await api.get(`${DELIVERY_BASE_URL}stats/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery stats:', error);
      throw error;
    }
  },

  // Get today's deliveries
  getTodaysDeliveries: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(DELIVERY_BASE_URL, { 
        params: { 
          delivery_date: today,
          status: 'scheduled,in_progress,completed'
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s deliveries:', error);
      throw error;
    }
  },

  // Search deliveries
  searchDeliveries: async (query) => {
    try {
      const response = await api.get(DELIVERY_BASE_URL, { 
        params: { search: query } 
      });
      return response.data;
    } catch (error) {
      console.error('Error searching deliveries:', error);
      throw error;
    }
  },

  // Get deliveries for customer
  getCustomerDeliveries: async (customerId) => {
    try {
      const response = await api.get(DELIVERY_BASE_URL, { 
        params: { customer_id: customerId } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer deliveries:', error);
      throw error;
    }
  },

  // Schedule delivery (update job order with delivery date)
  scheduleDelivery: async (id, deliveryData) => {
    try {
      const response = await api.patch(`${DELIVERY_BASE_URL}${id}/`, deliveryData);
      return response.data;
    } catch (error) {
      console.error('Error scheduling delivery:', error);
      throw error;
    }
  },

  // Mark delivery as completed
  markDeliveryCompleted: async (id) => {
    try {
      const response = await api.post(`${DELIVERY_BASE_URL}${id}/update_status/`, { 
        status: 'delivered' 
      });
      return response.data;
    } catch (error) {
      console.error('Error marking delivery as completed:', error);
      throw error;
    }
  },

  // Get delivery history
  getDeliveryHistory: async (params = {}) => {
    try {
      const response = await api.get(DELIVERY_BASE_URL, { 
        params: { 
          ...params,
          status: 'completed,delivered'
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching delivery history:', error);
      throw error;
    }
  },

  // Update delivery with received amount
  updateDelivery: async (id, deliveryData) => {
    try {
      const response = await api.post(`${DELIVERY_BASE_URL}${id}/update_delivery/`, deliveryData);
      return response.data;
    } catch (error) {
      console.error('Error updating delivery:', error);
      throw error;
    }
  },

  // Toggle block/unblock status
  toggleBlock: async (id) => {
    try {
      const response = await api.post(`${DELIVERY_BASE_URL}${id}/toggle_block/`);
      return response.data;
    } catch (error) {
      console.error('Error toggling block status:', error);
      throw error;
    }
  }
};

export default deliveryApi;
