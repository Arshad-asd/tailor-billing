import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  // Modals
  modals: {
    addMenuItem: false,
    editMenuItem: false,
    addTable: false,
    editTable: false,
    addEmployee: false,
    editEmployee: false,
    orderDetails: false,
    confirmDelete: false,
  },
  
  // Notifications
  notifications: [],
  
  // Sidebar
  sidebar: {
    isOpen: true,
    isMobileOpen: false,
  },
  
  // Loading states
  loading: {
    global: false,
    page: false,
  },
  
  // Theme
  theme: {
    mode: 'light', // 'light' | 'dark'
    color: 'orange', // 'orange' | 'blue' | 'green' | 'purple'
  },
  
  // Search
  search: { 
    query: '',
    filters: {},
  },
  
  // Pagination
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
  },
  
  // Sort
  sort: {
    field: '',
    direction: 'asc', // 'asc' | 'desc'
  },
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal actions
    openModal: (state, action) => {
      const { modalName } = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = true;
      }
    },
    
    closeModal: (state, action) => {
      const { modalName } = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = false;
      }
    },
    
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    
    // Notification actions
    addNotification: (state, action) => {
      const { id, type, title, message, duration = 5000 } = action.payload;
      state.notifications.push({
        id,
        type, // 'success' | 'error' | 'warning' | 'info'
        title,
        message,
        duration,
        timestamp: Date.now(),
      });
    },
    
    removeNotification: (state, action) => {
      const { id } = action.payload;
      state.notifications = state.notifications.filter(notification => notification.id !== id);
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    
    setSidebarOpen: (state, action) => {
      state.sidebar.isOpen = action.payload;
    },
    
    toggleMobileSidebar: (state) => {
      state.sidebar.isMobileOpen = !state.sidebar.isMobileOpen;
    },
    
    setMobileSidebarOpen: (state, action) => {
      state.sidebar.isMobileOpen = action.payload;
    },
    
    // Loading actions
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    
    setPageLoading: (state, action) => {
      state.loading.page = action.payload;
    },
    
    // Theme actions
    setThemeMode: (state, action) => {
      state.theme.mode = action.payload;
    },
    
    setThemeColor: (state, action) => {
      state.theme.color = action.payload;
    },
    
    toggleThemeMode: (state) => {
      state.theme.mode = state.theme.mode === 'light' ? 'dark' : 'light';
    },
    
    // Search actions
    setSearchQuery: (state, action) => {
      state.search.query = action.payload;
    },
    
    setSearchFilters: (state, action) => {
      state.search.filters = { ...state.search.filters, ...action.payload };
    },
    
    clearSearchFilters: (state) => {
      state.search.filters = {};
    },
    
    clearSearch: (state) => {
      state.search.query = '';
      state.search.filters = {};
    },
    
    // Pagination actions
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    
    setItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1; // Reset to first page when changing items per page
    },
    
    setTotalItems: (state, action) => {
      state.pagination.totalItems = action.payload;
    },
    
    resetPagination: (state) => {
      state.pagination.currentPage = 1;
      state.pagination.itemsPerPage = 10;
      state.pagination.totalItems = 0;
    },
    
    // Sort actions
    setSortField: (state, action) => {
      state.sort.field = action.payload;
    },
    
    setSortDirection: (state, action) => {
      state.sort.direction = action.payload;
    },
    
    toggleSortDirection: (state) => {
      state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc';
    },
    
    setSort: (state, action) => {
      const { field, direction } = action.payload;
      state.sort.field = field;
      state.sort.direction = direction;
    },
    
    clearSort: (state) => {
      state.sort.field = '';
      state.sort.direction = 'asc';
    },
    
    // Reset all UI state
    resetUI: (state) => {
      return initialState;
    },
  },
});

export const {
  // Modal actions
  openModal,
  closeModal,
  closeAllModals,
  
  // Notification actions
  addNotification,
  removeNotification,
  clearNotifications,
  
  // Sidebar actions
  toggleSidebar,
  setSidebarOpen,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  
  // Loading actions
  setGlobalLoading,
  setPageLoading,
  
  // Theme actions
  setThemeMode,
  setThemeColor,
  toggleThemeMode,
  
  // Search actions
  setSearchQuery,
  setSearchFilters,
  clearSearchFilters,
  clearSearch,
  
  // Pagination actions
  setCurrentPage,
  setItemsPerPage,
  setTotalItems,
  resetPagination,
  
  // Sort actions
  setSortField,
  setSortDirection,
  toggleSortDirection,
  setSort,
  clearSort,
  
  // Reset
  resetUI,
} = uiSlice.actions;

// Selectors
export const selectModals = (state) => state.ui.modals;
export const selectNotifications = (state) => state.ui.notifications;
export const selectSidebar = (state) => state.ui.sidebar;
export const selectLoading = (state) => state.ui.loading;
export const selectTheme = (state) => state.ui.theme;
export const selectSearch = (state) => state.ui.search;
export const selectPagination = (state) => state.ui.pagination;
export const selectSort = (state) => state.ui.sort;

export default uiSlice.reducer; 