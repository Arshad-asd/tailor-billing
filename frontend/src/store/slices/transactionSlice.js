import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { transactionAPI } from '../../services';

// Async thunks for transaction actions
export const fetchTransactions = createAsyncThunk(
  'transaction/fetchTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getTransactions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchTransaction = createAsyncThunk(
  'transaction/fetchTransaction',
  async (id, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getTransaction(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.createTransaction(transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create transaction');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transaction/updateTransaction',
  async ({ id, transactionData }, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.updateTransaction(id, transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update transaction');
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transaction/deleteTransaction',
  async (id, { rejectWithValue }) => {
    try {
      await transactionAPI.deleteTransaction(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete transaction');
    }
  }
);

export const updateTransactionStatus = createAsyncThunk(
  'transaction/updateTransactionStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.updateTransactionStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update transaction status');
    }
  }
);

export const generateReceipt = createAsyncThunk(
  'transaction/generateReceipt',
  async (id, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.generateReceipt(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate receipt');
    }
  }
);

// Sales
export const fetchSales = createAsyncThunk(
  'transaction/fetchSales',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getSales(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales');
    }
  }
);

export const fetchSale = createAsyncThunk(
  'transaction/fetchSale',
  async (id, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getSale(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sale');
    }
  }
);

export const createSale = createAsyncThunk(
  'transaction/createSale',
  async (saleData, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.createSale(saleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create sale');
    }
  }
);

export const updateSale = createAsyncThunk(
  'transaction/updateSale',
  async ({ id, saleData }, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.updateSale(id, saleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update sale');
    }
  }
);

export const deleteSale = createAsyncThunk(
  'transaction/deleteSale',
  async (id, { rejectWithValue }) => {
    try {
      await transactionAPI.deleteSale(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete sale');
    }
  }
);

export const completeSale = createAsyncThunk(
  'transaction/completeSale',
  async (id, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.completeSale(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete sale');
    }
  }
);

export const refundSale = createAsyncThunk(
  'transaction/refundSale',
  async ({ id, refundData }, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.refundSale(id, refundData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refund sale');
    }
  }
);

// Purchases
export const fetchPurchases = createAsyncThunk(
  'transaction/fetchPurchases',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getPurchases(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchases');
    }
  }
);

export const fetchPurchase = createAsyncThunk(
  'transaction/fetchPurchase',
  async (id, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getPurchase(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchase');
    }
  }
);

export const createPurchase = createAsyncThunk(
  'transaction/createPurchase',
  async (purchaseData, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.createPurchase(purchaseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create purchase');
    }
  }
);

export const updatePurchase = createAsyncThunk(
  'transaction/updatePurchase',
  async ({ id, purchaseData }, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.updatePurchase(id, purchaseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update purchase');
    }
  }
);

export const deletePurchase = createAsyncThunk(
  'transaction/deletePurchase',
  async (id, { rejectWithValue }) => {
    try {
      await transactionAPI.deletePurchase(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete purchase');
    }
  }
);

export const approvePurchase = createAsyncThunk(
  'transaction/approvePurchase',
  async (id, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.approvePurchase(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve purchase');
    }
  }
);

export const receivePurchase = createAsyncThunk(
  'transaction/receivePurchase',
  async (id, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.receivePurchase(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to receive purchase');
    }
  }
);

// Reports
export const fetchSalesReport = createAsyncThunk(
  'transaction/fetchSalesReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getSalesReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sales report');
    }
  }
);

export const fetchPurchaseReport = createAsyncThunk(
  'transaction/fetchPurchaseReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getPurchaseReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch purchase report');
    }
  }
);

export const fetchRevenueReport = createAsyncThunk(
  'transaction/fetchRevenueReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transactionAPI.getRevenueReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue report');
    }
  }
);

// Initial state
const initialState = {
  // Transactions
  transactions: [],
  currentTransaction: null,
  transactionsLoading: false,
  transactionsError: null,
  
  // Sales
  sales: [],
  currentSale: null,
  salesLoading: false,
  salesError: null,
  
  // Purchases
  purchases: [],
  currentPurchase: null,
  purchasesLoading: false,
  purchasesError: null,
  
  // Reports
  salesReport: null,
  purchaseReport: null,
  revenueReport: null,
  reportsLoading: false,
  reportsError: null,
  
  // General
  loading: false,
  error: null,
};

// Transaction slice
const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTransactionsError: (state) => {
      state.transactionsError = null;
    },
    clearSalesError: (state) => {
      state.salesError = null;
    },
    clearPurchasesError: (state) => {
      state.purchasesError = null;
    },
    clearReportsError: (state) => {
      state.reportsError = null;
    },
    setCurrentTransaction: (state, action) => {
      state.currentTransaction = action.payload;
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
    setCurrentSale: (state, action) => {
      state.currentSale = action.payload;
    },
    clearCurrentSale: (state) => {
      state.currentSale = null;
    },
    setCurrentPurchase: (state, action) => {
      state.currentPurchase = action.payload;
    },
    clearCurrentPurchase: (state) => {
      state.currentPurchase = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.transactionsLoading = true;
        state.transactionsError = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false;
        state.transactions = action.payload;
        state.transactionsError = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.transactionsLoading = false;
        state.transactionsError = action.payload;
      })
      
      .addCase(fetchTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
        state.error = null;
      })
      .addCase(fetchTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload);
        state.error = null;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transactions.findIndex(transaction => transaction.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.currentTransaction && state.currentTransaction.id === action.payload.id) {
          state.currentTransaction = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter(transaction => transaction.id !== action.payload);
        if (state.currentTransaction && state.currentTransaction.id === action.payload) {
          state.currentTransaction = null;
        }
        state.error = null;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateTransactionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransactionStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transactions.findIndex(transaction => transaction.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.currentTransaction && state.currentTransaction.id === action.payload.id) {
          state.currentTransaction = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTransactionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(generateReceipt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateReceipt.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(generateReceipt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Sales
      .addCase(fetchSales.pending, (state) => {
        state.salesLoading = true;
        state.salesError = null;
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.salesLoading = false;
        state.sales = action.payload;
        state.salesError = null;
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.salesLoading = false;
        state.salesError = action.payload;
      })
      
      .addCase(fetchSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSale.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSale = action.payload;
        state.error = null;
      })
      .addCase(fetchSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales.unshift(action.payload);
        state.error = null;
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSale.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sales.findIndex(sale => sale.id === action.payload.id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
        if (state.currentSale && state.currentSale.id === action.payload.id) {
          state.currentSale = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = state.sales.filter(sale => sale.id !== action.payload);
        if (state.currentSale && state.currentSale.id === action.payload) {
          state.currentSale = null;
        }
        state.error = null;
      })
      .addCase(deleteSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(completeSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeSale.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sales.findIndex(sale => sale.id === action.payload.id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
        if (state.currentSale && state.currentSale.id === action.payload.id) {
          state.currentSale = action.payload;
        }
        state.error = null;
      })
      .addCase(completeSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(refundSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refundSale.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sales.findIndex(sale => sale.id === action.payload.id);
        if (index !== -1) {
          state.sales[index] = action.payload;
        }
        if (state.currentSale && state.currentSale.id === action.payload.id) {
          state.currentSale = action.payload;
        }
        state.error = null;
      })
      .addCase(refundSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Purchases
      .addCase(fetchPurchases.pending, (state) => {
        state.purchasesLoading = true;
        state.purchasesError = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.purchasesLoading = false;
        state.purchases = action.payload;
        state.purchasesError = null;
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.purchasesLoading = false;
        state.purchasesError = action.payload;
      })
      
      .addCase(fetchPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPurchase = action.payload;
        state.error = null;
      })
      .addCase(fetchPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases.unshift(action.payload);
        state.error = null;
      })
      .addCase(createPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updatePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchase.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchases.findIndex(purchase => purchase.id === action.payload.id);
        if (index !== -1) {
          state.purchases[index] = action.payload;
        }
        if (state.currentPurchase && state.currentPurchase.id === action.payload.id) {
          state.currentPurchase = action.payload;
        }
        state.error = null;
      })
      .addCase(updatePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deletePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.purchases = state.purchases.filter(purchase => purchase.id !== action.payload);
        if (state.currentPurchase && state.currentPurchase.id === action.payload) {
          state.currentPurchase = null;
        }
        state.error = null;
      })
      .addCase(deletePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(approvePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approvePurchase.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchases.findIndex(purchase => purchase.id === action.payload.id);
        if (index !== -1) {
          state.purchases[index] = action.payload;
        }
        if (state.currentPurchase && state.currentPurchase.id === action.payload.id) {
          state.currentPurchase = action.payload;
        }
        state.error = null;
      })
      .addCase(approvePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(receivePurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(receivePurchase.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.purchases.findIndex(purchase => purchase.id === action.payload.id);
        if (index !== -1) {
          state.purchases[index] = action.payload;
        }
        if (state.currentPurchase && state.currentPurchase.id === action.payload.id) {
          state.currentPurchase = action.payload;
        }
        state.error = null;
      })
      .addCase(receivePurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reports
      .addCase(fetchSalesReport.pending, (state) => {
        state.reportsLoading = true;
        state.reportsError = null;
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.reportsLoading = false;
        state.salesReport = action.payload;
        state.reportsError = null;
      })
      .addCase(fetchSalesReport.rejected, (state, action) => {
        state.reportsLoading = false;
        state.reportsError = action.payload;
      })
      
      .addCase(fetchPurchaseReport.pending, (state) => {
        state.reportsLoading = true;
        state.reportsError = null;
      })
      .addCase(fetchPurchaseReport.fulfilled, (state, action) => {
        state.reportsLoading = false;
        state.purchaseReport = action.payload;
        state.reportsError = null;
      })
      .addCase(fetchPurchaseReport.rejected, (state, action) => {
        state.reportsLoading = false;
        state.reportsError = action.payload;
      })
      
      .addCase(fetchRevenueReport.pending, (state) => {
        state.reportsLoading = true;
        state.reportsError = null;
      })
      .addCase(fetchRevenueReport.fulfilled, (state, action) => {
        state.reportsLoading = false;
        state.revenueReport = action.payload;
        state.reportsError = null;
      })
      .addCase(fetchRevenueReport.rejected, (state, action) => {
        state.reportsLoading = false;
        state.reportsError = action.payload;
      });
  },
});

export const {
  clearError,
  clearTransactionsError,
  clearSalesError,
  clearPurchasesError,
  clearReportsError,
  setCurrentTransaction,
  clearCurrentTransaction,
  setCurrentSale,
  clearCurrentSale,
  setCurrentPurchase,
  clearCurrentPurchase,
} = transactionSlice.actions;

export default transactionSlice.reducer; 