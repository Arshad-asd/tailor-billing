import api from './api';

// Services API
export const serviceAPI = {
  // Services
  getServices: (params) => api.get('/services/services/', { params }),
  getService: (id) => api.get(`/services/services/${id}/`),
  createService: (serviceData) => api.post('/services/services/', serviceData),
  updateService: (id, serviceData) => api.put(`/services/services/${id}/`, serviceData),
  deleteService: (id) => api.delete(`/services/services/${id}/`),
  updateServicePricing: (id, pricing) => api.patch(`/services/services/${id}/pricing/`, pricing),
  updateServiceAvailability: (id, availability) => api.patch(`/services/services/${id}/availability/`, availability),
  
  // Customers
  getCustomers: (params) => api.get('/services/customers/', { params }),
  getCustomer: (id) => api.get(`/services/customers/${id}/`),
  createCustomer: (customerData) => api.post('/services/customers/', customerData),
  updateCustomer: (id, customerData) => api.put(`/services/customers/${id}/`, customerData),
  deleteCustomer: (id) => api.delete(`/services/customers/${id}/`),
  getCustomerHistory: (id) => api.get(`/services/customers/${id}/history/`),
  getCustomerPreferences: (id) => api.get(`/services/customers/${id}/preferences/`),
  
  // Reports
  getServiceReport: (params) => api.get('/services/reports/services/', { params }),
  getCustomerReport: (params) => api.get('/services/reports/customers/', { params }),
}; 