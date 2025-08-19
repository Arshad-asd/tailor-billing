import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { customerAPI } from '../../services/api';

// Async thunks for customer actions
export const fetchCustomerOrders = createAsyncThunk(
  'customer/fetchOrders',
  async (params, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getOrders(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchCustomerOrder = createAsyncThunk(
  'customer/fetchOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getOrder(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const createCustomerOrder = createAsyncThunk(
  'customer/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await customerAPI.createOrder(orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const cancelCustomerOrder = createAsyncThunk(
  'customer/cancelOrder',
  async (id, { rejectWithValue }) => {
    try {
      const response = await customerAPI.cancelOrder(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

export const fetchCustomerProfile = createAsyncThunk(
  'customer/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateCustomerProfile = createAsyncThunk(
  'customer/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await customerAPI.updateProfile(profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchCustomerFavorites = createAsyncThunk(
  'customer/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerAPI.getFavorites();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch favorites');
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'customer/addToFavorites',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await customerAPI.addToFavorites(restaurantId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to favorites');
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'customer/removeFromFavorites',
  async (restaurantId, { rejectWithValue }) => {
    try {
      await customerAPI.removeFromFavorites(restaurantId);
      return restaurantId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from favorites');
    }
  }
);

// Initial state
const initialState = {
  // Orders
  orders: [],
  currentOrder: null,
  ordersLoading: false,
  ordersError: null,
  
  // Profile
  profile: null,
  profileLoading: false,
  profileError: null,
  
  // Favorites
  favorites: [],
  favoritesLoading: false,
  favoritesError: null,
  
  // General
  loading: false,
  error: null,
};

// Customer slice
const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOrdersError: (state) => {
      state.ordersError = null;
    },
    clearProfileError: (state) => {
      state.profileError = null;
    },
    clearFavoritesError: (state) => {
      state.favoritesError = null;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Orders
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.ordersLoading = true;
        state.ordersError = null;
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload;
        state.ordersError = null;
      })
      .addCase(fetchCustomerOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.ordersError = action.payload;
      })
      
      .addCase(fetchCustomerOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.error = null;
      })
      .addCase(fetchCustomerOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createCustomerOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomerOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
        state.error = null;
      })
      .addCase(createCustomerOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(cancelCustomerOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelCustomerOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder && state.currentOrder.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
        state.error = null;
      })
      .addCase(cancelCustomerOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Profile
      .addCase(fetchCustomerProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
        state.profileError = null;
      })
      .addCase(fetchCustomerProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      })
      
      .addCase(updateCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(updateCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Favorites
      .addCase(fetchCustomerFavorites.pending, (state) => {
        state.favoritesLoading = true;
        state.favoritesError = null;
      })
      .addCase(fetchCustomerFavorites.fulfilled, (state, action) => {
        state.favoritesLoading = false;
        state.favorites = action.payload;
        state.favoritesError = null;
      })
      .addCase(fetchCustomerFavorites.rejected, (state, action) => {
        state.favoritesLoading = false;
        state.favoritesError = action.payload;
      })
      
      .addCase(addToFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites.push(action.payload);
        state.error = null;
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(removeFromFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = state.favorites.filter(favorite => favorite.id !== action.payload);
        state.error = null;
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearOrdersError,
  clearProfileError,
  clearFavoritesError,
  setCurrentOrder,
  clearCurrentOrder,
} = customerSlice.actions;

export default customerSlice.reducer; 