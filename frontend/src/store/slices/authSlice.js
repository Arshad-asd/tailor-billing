import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, setAuthToken, setRefreshToken, clearAuthTokens, refreshAuthToken } from '../../services';

// Async thunks for authentication actions
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      const { tokens, user } = response.data;
      
      // Set tokens in localStorage and axios headers
      setAuthToken(tokens.access);
      setRefreshToken(tokens.refresh);
      
      return { user, tokens };
    } catch (error) {
      // Handle different types of errors
      if (error.response?.status === 400) {
        // Validation errors
        const errorData = error.response.data;
        if (errorData.email) {
          return rejectWithValue(errorData.email[0]);
        } else if (errorData.password) {
          return rejectWithValue(errorData.password[0]);
        } else if (errorData.non_field_errors) {
          return rejectWithValue(errorData.non_field_errors[0]);
        } else {
          return rejectWithValue('Invalid credentials. Please check your email and password.');
        }
      } else if (error.response?.status === 401) {
        return rejectWithValue('Invalid email or password. Please try again.');
      } else if (error.response?.status === 403) {
        return rejectWithValue('Account is disabled. Please contact support.');
      } else if (error.response?.status === 429) {
        return rejectWithValue('Too many login attempts. Please try again later.');
      } else if (error.response?.status >= 500) {
        return rejectWithValue('Server error. Please try again later.');
      } else if (!error.response) {
        return rejectWithValue('Network error. Please check your internet connection.');
      } else {
        return rejectWithValue(error.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.signup(userData);
      const { tokens, user } = response.data;
      
      // Set tokens in localStorage and axios headers
      setAuthToken(tokens.access);
      setRefreshToken(tokens.refresh);
      
      return { user, tokens };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();
      // Clear tokens from localStorage and axios headers
      clearAuthTokens();
      return null;
    } catch (error) {
      // Even if logout API fails, clear local tokens
      clearAuthTokens();
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user info');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const newToken = await refreshAuthToken();
      setAuthToken(newToken);
      return { token: newToken };
    } catch (error) {
      clearAuthTokens();
      return rejectWithValue('Token refresh failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authAPI.forgotPassword(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset email');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await authAPI.resetPassword(token, password);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
  }
);

// Initialize auth state and fetch user data if token exists
export const initializeAuth = createAsyncThunk(
  'auth/initializeAuth',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem('tailor_token');
      const refreshToken = localStorage.getItem('tailor_refresh_token');
      
      console.log('Initializing auth with token:', !!token);
      
      if (token) {
        // Set auth token in axios headers
        setAuthToken(token);
        
        // Try to get current user data
        try {
          const response = await authAPI.getCurrentUser();
          console.log('User data fetched successfully:', response.data);
          return {
            user: response.data,
            token,
            refreshToken,
            isAuthenticated: true
          };
        } catch (userError) {
          console.log('Failed to get user data:', userError);
          // If getting user fails, token might be expired
          clearAuthTokens();
          return rejectWithValue('Token expired or invalid');
        }
      } else {
        console.log('No token found in localStorage');
        return rejectWithValue('No token found');
      }
    } catch (error) {
      console.log('Auth initialization error:', error);
      clearAuthTokens();
      return rejectWithValue('Failed to initialize auth');
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('tailor_token'),
  refreshToken: localStorage.getItem('tailor_refresh_token'),
  isAuthenticated: !!localStorage.getItem('tailor_token'),
  userRole: null, // 'admin', 'tailor', 'cashier', 'staff'
  loading: false,
  error: null,
  forgotPasswordLoading: false,
  forgotPasswordError: null,
  forgotPasswordSuccess: false,
  initialized: false, // Track if auth has been initialized
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearForgotPasswordError: (state) => {
      state.forgotPasswordError = null;
    },
    clearForgotPasswordSuccess: (state) => {
      state.forgotPasswordSuccess = false;
    },
    setUserRole: (state, action) => {
      state.userRole = action.payload;
    },
    // Handle token refresh
    tokenRefreshed: (state, action) => {
      state.token = action.payload.token;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.userRole = action.payload.user.role;
        state.error = null;
        state.initialized = true;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.userRole = null;
        state.error = action.payload;
        state.initialized = true;
        clearAuthTokens();
      })
      
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.userRole = null;
        state.error = action.payload;
        clearAuthTokens();
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.tokens.access;
        state.refreshToken = action.payload.tokens.refresh;
        state.userRole = action.payload.user.role;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.tokens.access;
        state.refreshToken = action.payload.tokens.refresh;
        state.userRole = action.payload.user.role;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.userRole = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        // Even if logout fails, clear the state
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.userRole = null;
      })
      
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.userRole = action.payload.role;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // If getting current user fails, user might not be authenticated
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.userRole = null;
        clearAuthTokens();
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordLoading = true;
        state.forgotPasswordError = null;
        state.forgotPasswordSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordSuccess = true;
        state.forgotPasswordError = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordError = action.payload;
        state.forgotPasswordSuccess = false;
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearForgotPasswordError,
  clearForgotPasswordSuccess,
  setUserRole,
  tokenRefreshed,
} = authSlice.actions;

export default authSlice.reducer;
