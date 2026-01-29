import api from './api';

// Transactions API
export const transactionAPI = {
  // Transactions CRUD
  getTransactions: (params) => api.get('/accounts/transactions/', { params }),
  getTransaction: (id) => api.get(`/accounts/transactions/${id}/`),
  createTransaction: (transactionData) => api.post('/accounts/transactions/', transactionData),
  updateTransaction: (id, transactionData) => api.put(`/accounts/transactions/${id}/`, transactionData),
  deleteTransaction: (id) => api.delete(`/accounts/transactions/${id}/`),
  
  // Reports
  getDailyReport: async (date) => {
    try {
      const params = date ? { date } : {};
      const response = await api.get('/accounts/transactions/daily-report/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching daily report:', error);
      throw error;
    }
  },
  getMonthlyReport: async (year) => {
    try {
      const params = year ? { year } : {};
      const response = await api.get('/accounts/transactions/monthly-report/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      throw error;
    }
  },
  getMonthDailyReport: async (year, month) => {
    try {
      const params = { year, month };
      const response = await api.get('/accounts/transactions/month-daily-report/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching month daily report:', error);
      throw error;
    }
  },
}; 