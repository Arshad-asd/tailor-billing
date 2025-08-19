import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobOrderAPI } from '../../services';

// Async thunks for job order actions
export const fetchJobOrders = createAsyncThunk(
  'jobOrder/fetchJobOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await jobOrderAPI.getJobOrders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch job orders');
    }
  }
);

export const fetchJobOrder = createAsyncThunk(
  'jobOrder/fetchJobOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await jobOrderAPI.getJobOrder(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch job order');
    }
  }
);

export const createJobOrder = createAsyncThunk(
  'jobOrder/createJobOrder',
  async (jobOrderData, { rejectWithValue }) => {
    try {
      const response = await jobOrderAPI.createJobOrder(jobOrderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create job order');
    }
  }
);

export const updateJobOrder = createAsyncThunk(
  'jobOrder/updateJobOrder',
  async ({ id, jobOrderData }, { rejectWithValue }) => {
    try {
      const response = await jobOrderAPI.updateJobOrder(id, jobOrderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update job order');
    }
  }
);

export const deleteJobOrder = createAsyncThunk(
  'jobOrder/deleteJobOrder',
  async (id, { rejectWithValue }) => {
    try {
      await jobOrderAPI.deleteJobOrder(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete job order');
    }
  }
);

export const updateJobOrderStatus = createAsyncThunk(
  'jobOrder/updateJobOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await jobOrderAPI.updateJobOrderStatus(id, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update job order status');
    }
  }
);

export const assignJobOrder = createAsyncThunk(
  'jobOrder/assignJobOrder',
  async ({ id, tailorId }, { rejectWithValue }) => {
    try {
      const response = await jobOrderAPI.assignJobOrder(id, tailorId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign job order');
    }
  }
);

export const completeJobOrder = createAsyncThunk(
  'jobOrder/completeJobOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await jobOrderAPI.completeJobOrder(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete job order');
    }
  }
);

// Measurements
export const fetchMeasurements = createAsyncThunk(
  'jobOrder/fetchMeasurements',
  async (params, { rejectWithValue }) => {
    try {
      const response = await jobOrderAPI.getMeasurements(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch measurements');
    }
  }
);

export const fetchMeasurement = createAsyncThunk(
  'jobOrder/fetchMeasurement',
  async (id, { rejectWithValue }) => {
    try {
      const response = await jobOrderAPI.getMeasurement(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch measurement');
    }
  }
);

export const createMeasurement = createAsyncThunk(
  'jobOrder/createMeasurement',
  async (measurementData, { rejectWithValue }) => {
    try {
      const response = await jobOrderAPI.createMeasurement(measurementData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create measurement');
    }
  }
);

export const updateMeasurement = createAsyncThunk(
  'jobOrder/updateMeasurement',
  async ({ id, measurementData }, { rejectWithValue }) => {
    try {
      const response = await jobOrderAPI.updateMeasurement(id, measurementData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update measurement');
    }
  }
);

export const deleteMeasurement = createAsyncThunk(
  'jobOrder/deleteMeasurement',
  async (id, { rejectWithValue }) => {
    try {
      await jobOrderAPI.deleteMeasurement(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete measurement');
    }
  }
);

// Dashboard and Reports
export const fetchDashboardStats = createAsyncThunk(
  'jobOrder/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await jobOrderAPI.getDashboardStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchJobOrderReport = createAsyncThunk(
  'jobOrder/fetchJobOrderReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await jobOrderAPI.getJobOrderReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch job order report');
    }
  }
);

// Initial state
const initialState = {
  // Job Orders
  jobOrders: [],
  currentJobOrder: null,
  jobOrdersLoading: false,
  jobOrdersError: null,
  
  // Measurements
  measurements: [],
  currentMeasurement: null,
  measurementsLoading: false,
  measurementsError: null,
  
  // Dashboard and Reports
  dashboardStats: null,
  jobOrderReport: null,
  reportsLoading: false,
  reportsError: null,
  
  // General
  loading: false,
  error: null,
};

// Job Order slice
const jobOrderSlice = createSlice({
  name: 'jobOrder',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearJobOrdersError: (state) => {
      state.jobOrdersError = null;
    },
    clearMeasurementsError: (state) => {
      state.measurementsError = null;
    },
    clearReportsError: (state) => {
      state.reportsError = null;
    },
    setCurrentJobOrder: (state, action) => {
      state.currentJobOrder = action.payload;
    },
    clearCurrentJobOrder: (state) => {
      state.currentJobOrder = null;
    },
    setCurrentMeasurement: (state, action) => {
      state.currentMeasurement = action.payload;
    },
    clearCurrentMeasurement: (state) => {
      state.currentMeasurement = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Job Orders
      .addCase(fetchJobOrders.pending, (state) => {
        state.jobOrdersLoading = true;
        state.jobOrdersError = null;
      })
      .addCase(fetchJobOrders.fulfilled, (state, action) => {
        state.jobOrdersLoading = false;
        state.jobOrders = action.payload;
        state.jobOrdersError = null;
      })
      .addCase(fetchJobOrders.rejected, (state, action) => {
        state.jobOrdersLoading = false;
        state.jobOrdersError = action.payload;
      })
      
      .addCase(fetchJobOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJobOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchJobOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createJobOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJobOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.jobOrders.unshift(action.payload);
        state.error = null;
      })
      .addCase(createJobOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateJobOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJobOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.jobOrders.findIndex(jobOrder => jobOrder.id === action.payload.id);
        if (index !== -1) {
          state.jobOrders[index] = action.payload;
        }
        if (state.currentJobOrder && state.currentJobOrder.id === action.payload.id) {
          state.currentJobOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(updateJobOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteJobOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJobOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.jobOrders = state.jobOrders.filter(jobOrder => jobOrder.id !== action.payload);
        if (state.currentJobOrder && state.currentJobOrder.id === action.payload) {
          state.currentJobOrder = null;
        }
        state.error = null;
      })
      .addCase(deleteJobOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateJobOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJobOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.jobOrders.findIndex(jobOrder => jobOrder.id === action.payload.id);
        if (index !== -1) {
          state.jobOrders[index] = action.payload;
        }
        if (state.currentJobOrder && state.currentJobOrder.id === action.payload.id) {
          state.currentJobOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(updateJobOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(assignJobOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignJobOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.jobOrders.findIndex(jobOrder => jobOrder.id === action.payload.id);
        if (index !== -1) {
          state.jobOrders[index] = action.payload;
        }
        if (state.currentJobOrder && state.currentJobOrder.id === action.payload.id) {
          state.currentJobOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(assignJobOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(completeJobOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeJobOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.jobOrders.findIndex(jobOrder => jobOrder.id === action.payload.id);
        if (index !== -1) {
          state.jobOrders[index] = action.payload;
        }
        if (state.currentJobOrder && state.currentJobOrder.id === action.payload.id) {
          state.currentJobOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(completeJobOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Measurements
      .addCase(fetchMeasurements.pending, (state) => {
        state.measurementsLoading = true;
        state.measurementsError = null;
      })
      .addCase(fetchMeasurements.fulfilled, (state, action) => {
        state.measurementsLoading = false;
        state.measurements = action.payload;
        state.measurementsError = null;
      })
      .addCase(fetchMeasurements.rejected, (state, action) => {
        state.measurementsLoading = false;
        state.measurementsError = action.payload;
      })
      
      .addCase(fetchMeasurement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeasurement.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMeasurement = action.payload;
        state.error = null;
      })
      .addCase(fetchMeasurement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createMeasurement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMeasurement.fulfilled, (state, action) => {
        state.loading = false;
        state.measurements.unshift(action.payload);
        state.error = null;
      })
      .addCase(createMeasurement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateMeasurement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeasurement.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.measurements.findIndex(measurement => measurement.id === action.payload.id);
        if (index !== -1) {
          state.measurements[index] = action.payload;
        }
        if (state.currentMeasurement && state.currentMeasurement.id === action.payload.id) {
          state.currentMeasurement = action.payload;
        }
        state.error = null;
      })
      .addCase(updateMeasurement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteMeasurement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMeasurement.fulfilled, (state, action) => {
        state.loading = false;
        state.measurements = state.measurements.filter(measurement => measurement.id !== action.payload);
        if (state.currentMeasurement && state.currentMeasurement.id === action.payload) {
          state.currentMeasurement = null;
        }
        state.error = null;
      })
      .addCase(deleteMeasurement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Dashboard and Reports
      .addCase(fetchDashboardStats.pending, (state) => {
        state.reportsLoading = true;
        state.reportsError = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.reportsLoading = false;
        state.dashboardStats = action.payload;
        state.reportsError = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.reportsLoading = false;
        state.reportsError = action.payload;
      })
      
      .addCase(fetchJobOrderReport.pending, (state) => {
        state.reportsLoading = true;
        state.reportsError = null;
      })
      .addCase(fetchJobOrderReport.fulfilled, (state, action) => {
        state.reportsLoading = false;
        state.jobOrderReport = action.payload;
        state.reportsError = null;
      })
      .addCase(fetchJobOrderReport.rejected, (state, action) => {
        state.reportsLoading = false;
        state.reportsError = action.payload;
      });
  },
});

export const {
  clearError,
  clearJobOrdersError,
  clearMeasurementsError,
  clearReportsError,
  setCurrentJobOrder,
  clearCurrentJobOrder,
  setCurrentMeasurement,
  clearCurrentMeasurement,
} = jobOrderSlice.actions;

export default jobOrderSlice.reducer; 