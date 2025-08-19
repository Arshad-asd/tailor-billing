import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '../../services/api';

// Async thunks for admin actions
export const fetchRestaurants = createAsyncThunk(
  'admin/fetchRestaurants',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getRestaurants(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurants');
    }
  }
);

export const fetchRestaurant = createAsyncThunk(
  'admin/fetchRestaurant',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getRestaurant(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch restaurant');
    }
  }
);

export const createRestaurant = createAsyncThunk(
  'admin/createRestaurant',
  async (restaurantData, { rejectWithValue }) => {
    try {
      const response = await adminAPI.createRestaurant(restaurantData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create restaurant');
    }
  }
);

export const updateRestaurant = createAsyncThunk(
  'admin/updateRestaurant',
  async ({ id, restaurantData }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateRestaurant(id, restaurantData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update restaurant');
    }
  }
);

export const deleteRestaurant = createAsyncThunk(
  'admin/deleteRestaurant',
  async (id, { rejectWithValue }) => {
    try {
      await adminAPI.deleteRestaurant(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete restaurant');
    }
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUsers(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchUser = createAsyncThunk(
  'admin/fetchUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUser(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await adminAPI.createUser(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateUser(id, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await adminAPI.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

export const fetchSubscriptions = createAsyncThunk(
  'admin/fetchSubscriptions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getSubscriptions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscriptions');
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'admin/updateSubscription',
  async ({ id, subscriptionData }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateSubscription(id, subscriptionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subscription');
    }
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getDashboardStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchRevenueStats = createAsyncThunk(
  'admin/fetchRevenueStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getRevenueStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue stats');
    }
  }
);

// Initial state
const initialState = {
  // Restaurants
  restaurants: [],
  currentRestaurant: null,
  restaurantsLoading: false,
  restaurantsError: null,
  
  // Users
  users: [],
  currentUser: null,
  usersLoading: false,
  usersError: null,
  
  // Subscriptions
  subscriptions: [],
  subscriptionsLoading: false,
  subscriptionsError: null,
  
  // Analytics
  dashboardStats: null,
  revenueStats: null,
  analyticsLoading: false,
  analyticsError: null,
  
  // General
  loading: false,
  error: null,
};

// Admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRestaurantsError: (state) => {
      state.restaurantsError = null;
    },
    clearUsersError: (state) => {
      state.usersError = null;
    },
    clearSubscriptionsError: (state) => {
      state.subscriptionsError = null;
    },
    clearAnalyticsError: (state) => {
      state.analyticsError = null;
    },
    setCurrentRestaurant: (state, action) => {
      state.currentRestaurant = action.payload;
    },
    clearCurrentRestaurant: (state) => {
      state.currentRestaurant = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Restaurants
      .addCase(fetchRestaurants.pending, (state) => {
        state.restaurantsLoading = true;
        state.restaurantsError = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.restaurantsLoading = false;
        state.restaurants = action.payload;
        state.restaurantsError = null;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.restaurantsLoading = false;
        state.restaurantsError = action.payload;
      })
      
      .addCase(fetchRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRestaurant = action.payload;
        state.error = null;
      })
      .addCase(fetchRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants.push(action.payload);
        state.error = null;
      })
      .addCase(createRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.restaurants.findIndex(restaurant => restaurant.id === action.payload.id);
        if (index !== -1) {
          state.restaurants[index] = action.payload;
        }
        if (state.currentRestaurant && state.currentRestaurant.id === action.payload.id) {
          state.currentRestaurant = action.payload;
        }
        state.error = null;
      })
      .addCase(updateRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = state.restaurants.filter(restaurant => restaurant.id !== action.payload);
        if (state.currentRestaurant && state.currentRestaurant.id === action.payload) {
          state.currentRestaurant = null;
        }
        state.error = null;
      })
      .addCase(deleteRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
        state.usersError = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload;
      })
      
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        if (state.currentUser && state.currentUser.id === action.payload) {
          state.currentUser = null;
        }
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Subscriptions
      .addCase(fetchSubscriptions.pending, (state) => {
        state.subscriptionsLoading = true;
        state.subscriptionsError = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.subscriptionsLoading = false;
        state.subscriptions = action.payload;
        state.subscriptionsError = null;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.subscriptionsLoading = false;
        state.subscriptionsError = action.payload;
      })
      
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.subscriptions.findIndex(subscription => subscription.id === action.payload.id);
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Analytics
      .addCase(fetchDashboardStats.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.dashboardStats = action.payload;
        state.analyticsError = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload;
      })
      
      .addCase(fetchRevenueStats.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(fetchRevenueStats.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.revenueStats = action.payload;
        state.analyticsError = null;
      })
      .addCase(fetchRevenueStats.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload;
      });
  },
});

export const {
  clearError,
  clearRestaurantsError,
  clearUsersError,
  clearSubscriptionsError,
  clearAnalyticsError,
  setCurrentRestaurant,
  clearCurrentRestaurant,
  setCurrentUser,
  clearCurrentUser,
} = adminSlice.actions;

export default adminSlice.reducer; 