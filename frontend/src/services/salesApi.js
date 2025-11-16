import api from './api';

// Sales API
export const salesAPI = {
  // Sales CRUD operations
  getSales: async (params) => {
    try {
      const response = await api.get('/sales/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  },
  getSale: (id) => api.get(`/sales/${id}/`),
  createSale: (saleData) => api.post('/sales/', saleData),
  updateSale: (id, saleData) => api.put(`/sales/${id}/`, saleData),
  patchSale: (id, saleData) => api.patch(`/sales/${id}/`, saleData),
  deleteSale: (id) => api.delete(`/sales/${id}/`),
  
  // Sales actions
  addItem: (id, itemData) => api.post(`/sales/${id}/add_item/`, itemData),
  removeItem: (id, itemId) => api.delete(`/sales/${id}/remove_item/`, { data: { item_id: itemId } }),
  markCompleted: (id) => api.post(`/sales/${id}/mark_completed/`),
  markCancelled: (id) => api.post(`/sales/${id}/mark_cancelled/`),
  
  // Sales filtering
  getSalesByCustomer: (customerName) => api.get('/sales/by_customer/', { params: { customer_name: customerName } }),
  getSalesByDateRange: (startDate, endDate) => api.get('/sales/by_date_range/', { 
    params: { start_date: startDate, end_date: endDate } 
  }),
  
  // Sale Items CRUD operations
  getSaleItems: (params) => api.get('/sale-items/', { params }),
  getSaleItem: (id) => api.get(`/sale-items/${id}/`),
  createSaleItem: (itemData) => api.post('/sale-items/', itemData),
  updateSaleItem: (id, itemData) => api.put(`/sale-items/${id}/`, itemData),
  patchSaleItem: (id, itemData) => api.patch(`/sale-items/${id}/`, itemData),
  deleteSaleItem: (id) => api.delete(`/sale-items/${id}/`),
  
  // Get sale items by sale ID
  getSaleItemsBySale: (saleId) => api.get('/sale-items/', { params: { sale_id: saleId } }),
};

export default salesAPI;
