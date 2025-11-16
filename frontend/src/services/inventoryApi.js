import api from './api';

// Item Categories API
const getCategories = async (params = {}) => {
  const response = await api.get('/inventory/categories/', { params });
  return response.data;
};

const getCategory = async (id) => {
  const response = await api.get(`/inventory/categories/${id}/`);
  return response.data;
};

const createCategory = async (data) => {
  const response = await api.post('/inventory/categories/', data);
  return response.data;
};

const updateCategory = async (id, data) => {
  const response = await api.put(`/inventory/categories/${id}/`, data);
  return response.data;
};

const deleteCategory = async (id) => {
  const response = await api.delete(`/inventory/categories/${id}/`);
  return response.data;
};

// Items API
const getItems = async (params = {}) => {
  const response = await api.get('/inventory/items/', { params });
  return response.data;
};

const getItem = async (id) => {
  const response = await api.get(`/inventory/items/${id}/`);
  return response.data;
};

const createItem = async (data) => {
  const response = await api.post('/inventory/items/', data);
  return response.data;
};

const updateItem = async (id, data) => {
  const response = await api.put(`/inventory/items/${id}/`, data);
  return response.data;
};

const deleteItem = async (id) => {
  const response = await api.delete(`/inventory/items/${id}/`);
  return response.data;
};

// Stock Management
const getItemStockHistory = async (id) => {
  const response = await api.get(`/inventory/items/${id}/stock-history/`);
  return response.data;
};

const adjustItemStock = async (id, data) => {
  const response = await api.post(`/inventory/items/${id}/adjust-stock/`, data);
  return response.data;
};

// Stock API
const getStock = async (params = {}) => {
  const response = await api.get('/inventory/stock/', { params });
  return response.data;
};

const getStockRecord = async (id) => {
  const response = await api.get(`/inventory/stock/${id}/`);
  return response.data;
};

const createStockRecord = async (data) => {
  const response = await api.post('/inventory/stock/', data);
  return response.data;
};

const updateStockRecord = async (id, data) => {
  const response = await api.put(`/inventory/stock/${id}/`, data);
  return response.data;
};

const deleteStockRecord = async (id) => {
  const response = await api.delete(`/inventory/stock/${id}/`);
  return response.data;
};

const getLowStockAlerts = async (threshold = 10) => {
  const response = await api.get('/inventory/stock/low-stock-alerts/', { 
    params: { threshold } 
  });
  return response.data;
};

// Stock Movements API
const getStockMovements = async (params = {}) => {
  const response = await api.get('/inventory/movements/', { params });
  return response.data;
};

const getStockMovement = async (id) => {
  const response = await api.get(`/inventory/movements/${id}/`);
  return response.data;
};

const createStockMovement = async (data) => {
  const response = await api.post('/inventory/movements/', data);
  return response.data;
};

const updateStockMovement = async (id, data) => {
  const response = await api.put(`/inventory/movements/${id}/`, data);
  return response.data;
};

const deleteStockMovement = async (id) => {
  const response = await api.delete(`/inventory/movements/${id}/`);
  return response.data;
};

const getStockMovementSummary = async (params = {}) => {
  const response = await api.get('/inventory/movements/summary/', { params });
  return response.data;
};

// Export as inventoryAPI object
export const inventoryAPI = {
  // Categories
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Items
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  
  // Stock Management
  getItemStockHistory,
  adjustItemStock,
  
  // Stock
  getStock,
  getStockRecord,
  createStockRecord,
  updateStockRecord,
  deleteStockRecord,
  getLowStockAlerts,
  
  // Stock Movements
  getStockMovements,
  getStockMovement,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement,
  getStockMovementSummary,
};

// Also export individual functions for direct imports
export {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getItemStockHistory,
  adjustItemStock,
  getStock,
  getStockRecord,
  createStockRecord,
  updateStockRecord,
  deleteStockRecord,
  getLowStockAlerts,
  getStockMovements,
  getStockMovement,
  createStockMovement,
  updateStockMovement,
  deleteStockMovement,
  getStockMovementSummary,
};