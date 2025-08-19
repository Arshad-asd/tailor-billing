import api from './api';

// Transactions API
export const transactionAPI = {
  // Transactions
  getTransactions: (params) => api.get('/transactions/transactions/', { params }),
  getTransaction: (id) => api.get(`/transactions/transactions/${id}/`),
  createTransaction: (transactionData) => api.post('/transactions/transactions/', transactionData),
  updateTransaction: (id, transactionData) => api.put(`/transactions/transactions/${id}/`, transactionData),
  deleteTransaction: (id) => api.delete(`/transactions/transactions/${id}/`),
  updateTransactionStatus: (id, status) => api.patch(`/transactions/transactions/${id}/status/`, { status }),
  generateReceipt: (id) => api.get(`/transactions/transactions/${id}/receipt/`),
  
  // Sales
  getSales: (params) => api.get('/transactions/sales/', { params }),
  getSale: (id) => api.get(`/transactions/sales/${id}/`),
  createSale: (saleData) => api.post('/transactions/sales/', saleData),
  updateSale: (id, saleData) => api.put(`/transactions/sales/${id}/`, saleData),
  deleteSale: (id) => api.delete(`/transactions/sales/${id}/`),
  completeSale: (id) => api.post(`/transactions/sales/${id}/complete/`),
  refundSale: (id, refundData) => api.post(`/transactions/sales/${id}/refund/`, refundData),
  
  // Purchases
  getPurchases: (params) => api.get('/transactions/purchases/', { params }),
  getPurchase: (id) => api.get(`/transactions/purchases/${id}/`),
  createPurchase: (purchaseData) => api.post('/transactions/purchases/', purchaseData),
  updatePurchase: (id, purchaseData) => api.put(`/transactions/purchases/${id}/`, purchaseData),
  deletePurchase: (id) => api.delete(`/transactions/purchases/${id}/`),
  approvePurchase: (id) => api.post(`/transactions/purchases/${id}/approve/`),
  receivePurchase: (id) => api.post(`/transactions/purchases/${id}/receive/`),
  
  // Reports
  getSalesReport: (params) => api.get('/transactions/reports/sales/', { params }),
  getPurchaseReport: (params) => api.get('/transactions/reports/purchases/', { params }),
  getRevenueReport: (params) => api.get('/transactions/reports/revenue/', { params }),
}; 