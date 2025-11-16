import api from './api';

const customerApi = {
  // Get all customers
  getCustomers: async (params = {}) => {
    try {
      const response = await api.get('/crm/customers/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  // Search customers
  searchCustomers: async (query) => {
    try {
      const response = await api.get('/crm/customers/search/', { 
        params: { q: query } 
      });
      return response.data;
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  },

  // Get customer by ID
  getCustomer: async (id) => {
    try {
      const response = await api.get(`/crm/customers/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  },

  // Create new customer
  createCustomer: async (customerData) => {
    try {
      const response = await api.post('/crm/customers/', customerData);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Update customer
  updateCustomer: async (id, customerData) => {
    try {
      const response = await api.put(`/crm/customers/${id}/`, customerData);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  // Partial update customer
  patchCustomer: async (id, customerData) => {
    try {
      const response = await api.patch(`/crm/customers/${id}/`, customerData);
      return response.data;
    } catch (error) {
      console.error('Error patching customer:', error);
      throw error;
    }
  },

  // Delete customer
  deleteCustomer: async (id) => {
    try {
      const response = await api.delete(`/crm/customers/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Get active customers only
  getActiveCustomers: async () => {
    try {
      const response = await api.get('/crm/customers/active/');
      return response.data;
    } catch (error) {
      console.error('Error fetching active customers:', error);
      throw error;
    }
  },

  // Update customer balance
  updateCustomerBalance: async (id, balance) => {
    try {
      const response = await api.patch(`/crm/customers/${id}/update_balance/`, { balance });
      return response.data;
    } catch (error) {
      console.error('Error updating customer balance:', error);
      throw error;
    }
  },

  // Update customer points
  updateCustomerPoints: async (id, points) => {
    try {
      const response = await api.patch(`/crm/customers/${id}/update_points/`, { points });
      return response.data;
    } catch (error) {
      console.error('Error updating customer points:', error);
      throw error;
    }
  },

  // Toggle customer status
  toggleCustomerStatus: async (id) => {
    try {
      const response = await api.patch(`/crm/customers/${id}/toggle_status/`);
      return response.data;
    } catch (error) {
      console.error('Error toggling customer status:', error);
      throw error;
    }
  },

  // Get customer report with calculated fields
  getCustomerReport: async (params = {}) => {
    try {
      const response = await api.get('/crm/customers/report/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer report:', error);
      throw error;
    }
  }
};

export { customerApi };
export default customerApi;