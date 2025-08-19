import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serviceAPI } from '../../services';

// Async thunks for service actions
export const fetchServices = createAsyncThunk(
  'service/fetchServices',
  async (params, { rejectWithValue }) => {
    try {
      const response = await serviceAPI.getServices(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
    }
  }
);

export const fetchService = createAsyncThunk(
  'service/fetchService',
  async (id, { rejectWithValue }) => {
    try {
      const response = await serviceAPI.getService(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service');
    }
  }
);

export const createService = createAsyncThunk(
  'service/createService',
  async (serviceData, { rejectWithValue }) => {
    try {
      const response = await serviceAPI.createService(serviceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create service');
    }
  }
);

export const updateService = createAsyncThunk(
  'service/updateService',
  async ({ id, serviceData }, { rejectWithValue }) => {
    try {
      const response = await serviceAPI.updateService(id, serviceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update service');
    }
  }
);

export const deleteService = createAsyncThunk(
  'service/deleteService',
  async (id, { rejectWithValue }) => {
    try {
      await serviceAPI.deleteService(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete service');
    }
  }
);

export const updateServicePricing = createAsyncThunk(
  'service/updateServicePricing',
  async ({ id, pricing }, { rejectWithValue }) => {
    try {
      const response = await serviceAPI.updateServicePricing(id, pricing);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update service pricing');
    }
  }
);

export const updateServiceAvailability = createAsyncThunk(
  'service/updateServiceAvailability',
  async ({ id, availability }, { rejectWithValue }) => {
    try {
      const response = await serviceAPI.updateServiceAvailability(id, availability);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update service availability');
    }
  }
);

// Customers
export const fetchCustomers = createAsyncThunk(
  'service/fetchCustomers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await serviceAPI.getCustomers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const fetchCustomer = createAsyncThunk(
  'service/fetchCustomer',
  async (id, { rejectWithValue }) => {
    try {
      const response = await serviceAPI.getCustomer(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'service/createCustomer',
  async (customerData, { rejectWithValue }) => {
    try {
      const response = await serviceAPI.createCustomer(customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'service/updateCustomer',
  async ({ id, customerData }, { rejectWithValue }) => {
    try {
      const response = await serviceAPI.updateCustomer(id, customerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'service/deleteCustomer',
  async (id, { rejectWithValue }) => {
    try {
      await serviceAPI.deleteCustomer(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete customer');
    }
  }
);

export const getCustomerHistory = createAsyncThunk(
  'service/getCustomerHistory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await serviceAPI.getCustomerHistory(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get customer history');
    }
  }
);

export const getCustomerPreferences = createAsyncThunk(
  'service/getCustomerPreferences',
  async (id, { rejectWithValue }) => {
    try {
      const response = await serviceAPI.getCustomerPreferences(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get customer preferences');
    }
  }
);

// Reports
export const fetchServiceReport = createAsyncThunk(
  'service/fetchServiceReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await serviceAPI.getServiceReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service report');
    }
  }
);

export const fetchCustomerReport = createAsyncThunk(
  'service/fetchCustomerReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await serviceAPI.getCustomerReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer report');
    }
  }
);

// Initial state
const initialState = {
  // Services
  services: [],
  currentService: null,
  servicesLoading: false,
  servicesError: null,
  
  // Customers
  customers: [],
  currentCustomer: null,
  customersLoading: false,
  customersError: null,
  
  // Reports
  serviceReport: null,
  customerReport: null,
  reportsLoading: false,
  reportsError: null,
  
  // General
  loading: false,
  error: null,
};

// Service slice
const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearServicesError: (state) => {
      state.servicesError = null;
    },
    clearCustomersError: (state) => {
      state.customersError = null;
    },
    clearReportsError: (state) => {
      state.reportsError = null;
    },
    setCurrentService: (state, action) => {
      state.currentService = action.payload;
    },
    clearCurrentService: (state) => {
      state.currentService = null;
    },
    setCurrentCustomer: (state, action) => {
      state.currentCustomer = action.payload;
    },
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Services
      .addCase(fetchServices.pending, (state) => {
        state.servicesLoading = true;
        state.servicesError = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.servicesLoading = false;
        state.services = action.payload;
        state.servicesError = null;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.servicesLoading = false;
        state.servicesError = action.payload;
      })
      
      .addCase(fetchService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchService.fulfilled, (state, action) => {
        state.loading = false;
        state.currentService = action.payload;
        state.error = null;
      })
      .addCase(fetchService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.loading = false;
        state.services.unshift(action.payload);
        state.error = null;
      })
      .addCase(createService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.services.findIndex(service => service.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
        if (state.currentService && state.currentService.id === action.payload.id) {
          state.currentService = action.payload;
        }
        state.error = null;
      })
      .addCase(updateService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.loading = false;
        state.services = state.services.filter(service => service.id !== action.payload);
        if (state.currentService && state.currentService.id === action.payload) {
          state.currentService = null;
        }
        state.error = null;
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateServicePricing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateServicePricing.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.services.findIndex(service => service.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
        if (state.currentService && state.currentService.id === action.payload.id) {
          state.currentService = action.payload;
        }
        state.error = null;
      })
      .addCase(updateServicePricing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateServiceAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateServiceAvailability.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.services.findIndex(service => service.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
        if (state.currentService && state.currentService.id === action.payload.id) {
          state.currentService = action.payload;
        }
        state.error = null;
      })
      .addCase(updateServiceAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.customersLoading = true;
        state.customersError = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.customersLoading = false;
        state.customers = action.payload;
        state.customersError = null;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.customersLoading = false;
        state.customersError = action.payload;
      })
      
      .addCase(fetchCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCustomer = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers.unshift(action.payload);
        state.error = null;
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.customers.findIndex(customer => customer.id === action.payload.id);
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
        if (state.currentCustomer && state.currentCustomer.id === action.payload.id) {
          state.currentCustomer = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = state.customers.filter(customer => customer.id !== action.payload);
        if (state.currentCustomer && state.currentCustomer.id === action.payload) {
          state.currentCustomer = null;
        }
        state.error = null;
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getCustomerHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomerHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getCustomerHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getCustomerPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCustomerPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getCustomerPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reports
      .addCase(fetchServiceReport.pending, (state) => {
        state.reportsLoading = true;
        state.reportsError = null;
      })
      .addCase(fetchServiceReport.fulfilled, (state, action) => {
        state.reportsLoading = false;
        state.serviceReport = action.payload;
        state.reportsError = null;
      })
      .addCase(fetchServiceReport.rejected, (state, action) => {
        state.reportsLoading = false;
        state.reportsError = action.payload;
      })
      
      .addCase(fetchCustomerReport.pending, (state) => {
        state.reportsLoading = true;
        state.reportsError = null;
      })
      .addCase(fetchCustomerReport.fulfilled, (state, action) => {
        state.reportsLoading = false;
        state.customerReport = action.payload;
        state.reportsError = null;
      })
      .addCase(fetchCustomerReport.rejected, (state, action) => {
        state.reportsLoading = false;
        state.reportsError = action.payload;
      });
  },
});

export const {
  clearError,
  clearServicesError,
  clearCustomersError,
  clearReportsError,
  setCurrentService,
  clearCurrentService,
  setCurrentCustomer,
  clearCurrentCustomer,
} = serviceSlice.actions;

export default serviceSlice.reducer; 