import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import jobOrderReducer from './slices/jobOrderSlice';
import inventoryReducer from './slices/inventorySlice';
import transactionReducer from './slices/transactionSlice';
import serviceReducer from './slices/serviceSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobOrder: jobOrderReducer,
    inventory: inventoryReducer,
    transaction: transactionReducer,
    service: serviceReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
