import api from './api';

// Inventory API
export const inventoryAPI = {
  // Inventory
  getInventory: (params) => api.get('/inventory/inventory/', { params }),
  getInventoryItem: (id) => api.get(`/inventory/inventory/${id}/`),
  createInventoryItem: (itemData) => api.post('/inventory/inventory/', itemData),
  updateInventoryItem: (id, itemData) => api.put(`/inventory/inventory/${id}/`, itemData),
  deleteInventoryItem: (id) => api.delete(`/inventory/inventory/${id}/`),
  adjustInventory: (id, adjustment) => api.patch(`/inventory/inventory/${id}/adjust/`, adjustment),
  checkLowStock: (id) => api.get(`/inventory/inventory/${id}/low-stock/`),
  
  // Materials
  getMaterials: (params) => api.get('/inventory/materials/', { params }),
  getMaterial: (id) => api.get(`/inventory/materials/${id}/`),
  createMaterial: (materialData) => api.post('/inventory/materials/', materialData),
  updateMaterial: (id, materialData) => api.put(`/inventory/materials/${id}/`, materialData),
  deleteMaterial: (id) => api.delete(`/inventory/materials/${id}/`),
  getMaterialUsage: (id) => api.get(`/inventory/materials/${id}/usage/`),
  
  // Categories
  getCategories: (params) => api.get('/inventory/categories/', { params }),
  getCategory: (id) => api.get(`/inventory/categories/${id}/`),
  createCategory: (categoryData) => api.post('/inventory/categories/', categoryData),
  updateCategory: (id, categoryData) => api.put(`/inventory/categories/${id}/`, categoryData),
  deleteCategory: (id) => api.delete(`/inventory/categories/${id}/`),
  
  // Reports
  getInventoryReport: (params) => api.get('/inventory/reports/inventory/', { params }),
  getMaterialReport: (params) => api.get('/inventory/reports/materials/', { params }),
}; 