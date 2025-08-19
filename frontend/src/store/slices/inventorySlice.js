import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryAPI } from '../../services';

// Async thunks for inventory actions
export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (params, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getInventory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory');
    }
  }
);

export const fetchInventoryItem = createAsyncThunk(
  'inventory/fetchInventoryItem',
  async (id, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getInventoryItem(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory item');
    }
  }
);

export const createInventoryItem = createAsyncThunk(
  'inventory/createInventoryItem',
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.createInventoryItem(itemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create inventory item');
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/updateInventoryItem',
  async ({ id, itemData }, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.updateInventoryItem(id, itemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update inventory item');
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'inventory/deleteInventoryItem',
  async (id, { rejectWithValue }) => {
    try {
      await inventoryAPI.deleteInventoryItem(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete inventory item');
    }
  }
);

export const adjustInventory = createAsyncThunk(
  'inventory/adjustInventory',
  async ({ id, adjustment }, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.adjustInventory(id, adjustment);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to adjust inventory');
    }
  }
);

export const checkLowStock = createAsyncThunk(
  'inventory/checkLowStock',
  async (id, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.checkLowStock(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check low stock');
    }
  }
);

// Materials
export const fetchMaterials = createAsyncThunk(
  'inventory/fetchMaterials',
  async (params, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getMaterials(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch materials');
    }
  }
);

export const fetchMaterial = createAsyncThunk(
  'inventory/fetchMaterial',
  async (id, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getMaterial(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch material');
    }
  }
);

export const createMaterial = createAsyncThunk(
  'inventory/createMaterial',
  async (materialData, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.createMaterial(materialData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create material');
    }
  }
);

export const updateMaterial = createAsyncThunk(
  'inventory/updateMaterial',
  async ({ id, materialData }, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.updateMaterial(id, materialData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update material');
    }
  }
);

export const deleteMaterial = createAsyncThunk(
  'inventory/deleteMaterial',
  async (id, { rejectWithValue }) => {
    try {
      await inventoryAPI.deleteMaterial(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete material');
    }
  }
);

export const getMaterialUsage = createAsyncThunk(
  'inventory/getMaterialUsage',
  async (id, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getMaterialUsage(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get material usage');
    }
  }
);

// Categories
export const fetchCategories = createAsyncThunk(
  'inventory/fetchCategories',
  async (params, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getCategories(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchCategory = createAsyncThunk(
  'inventory/fetchCategory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getCategory(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch category');
    }
  }
);

export const createCategory = createAsyncThunk(
  'inventory/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.createCategory(categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create category');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'inventory/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.updateCategory(id, categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update category');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'inventory/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await inventoryAPI.deleteCategory(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete category');
    }
  }
);

// Reports
export const fetchInventoryReport = createAsyncThunk(
  'inventory/fetchInventoryReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getInventoryReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory report');
    }
  }
);

export const fetchMaterialReport = createAsyncThunk(
  'inventory/fetchMaterialReport',
  async (params, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getMaterialReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch material report');
    }
  }
);

// Initial state
const initialState = {
  // Inventory
  inventory: [],
  currentInventoryItem: null,
  inventoryLoading: false,
  inventoryError: null,
  
  // Materials
  materials: [],
  currentMaterial: null,
  materialsLoading: false,
  materialsError: null,
  
  // Categories
  categories: [],
  currentCategory: null,
  categoriesLoading: false,
  categoriesError: null,
  
  // Reports
  inventoryReport: null,
  materialReport: null,
  reportsLoading: false,
  reportsError: null,
  
  // General
  loading: false,
  error: null,
};

// Inventory slice
const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearInventoryError: (state) => {
      state.inventoryError = null;
    },
    clearMaterialsError: (state) => {
      state.materialsError = null;
    },
    clearCategoriesError: (state) => {
      state.categoriesError = null;
    },
    clearReportsError: (state) => {
      state.reportsError = null;
    },
    setCurrentInventoryItem: (state, action) => {
      state.currentInventoryItem = action.payload;
    },
    clearCurrentInventoryItem: (state) => {
      state.currentInventoryItem = null;
    },
    setCurrentMaterial: (state, action) => {
      state.currentMaterial = action.payload;
    },
    clearCurrentMaterial: (state) => {
      state.currentMaterial = null;
    },
    setCurrentCategory: (state, action) => {
      state.currentCategory = action.payload;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Inventory
      .addCase(fetchInventory.pending, (state) => {
        state.inventoryLoading = true;
        state.inventoryError = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.inventoryLoading = false;
        state.inventory = action.payload;
        state.inventoryError = null;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.inventoryLoading = false;
        state.inventoryError = action.payload;
      })
      
      .addCase(fetchInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInventoryItem = action.payload;
        state.error = null;
      })
      .addCase(fetchInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory.unshift(action.payload);
        state.error = null;
      })
      .addCase(createInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.inventory.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.inventory[index] = action.payload;
        }
        if (state.currentInventoryItem && state.currentInventoryItem.id === action.payload.id) {
          state.currentInventoryItem = action.payload;
        }
        state.error = null;
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = state.inventory.filter(item => item.id !== action.payload);
        if (state.currentInventoryItem && state.currentInventoryItem.id === action.payload) {
          state.currentInventoryItem = null;
        }
        state.error = null;
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(adjustInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adjustInventory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.inventory.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.inventory[index] = action.payload;
        }
        if (state.currentInventoryItem && state.currentInventoryItem.id === action.payload.id) {
          state.currentInventoryItem = action.payload;
        }
        state.error = null;
      })
      .addCase(adjustInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(checkLowStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkLowStock.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(checkLowStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Materials
      .addCase(fetchMaterials.pending, (state) => {
        state.materialsLoading = true;
        state.materialsError = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.materialsLoading = false;
        state.materials = action.payload;
        state.materialsError = null;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.materialsLoading = false;
        state.materialsError = action.payload;
      })
      
      .addCase(fetchMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMaterial = action.payload;
        state.error = null;
      })
      .addCase(fetchMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.materials.unshift(action.payload);
        state.error = null;
      })
      .addCase(createMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMaterial.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.materials.findIndex(material => material.id === action.payload.id);
        if (index !== -1) {
          state.materials[index] = action.payload;
        }
        if (state.currentMaterial && state.currentMaterial.id === action.payload.id) {
          state.currentMaterial = action.payload;
        }
        state.error = null;
      })
      .addCase(updateMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = state.materials.filter(material => material.id !== action.payload);
        if (state.currentMaterial && state.currentMaterial.id === action.payload) {
          state.currentMaterial = null;
        }
        state.error = null;
      })
      .addCase(deleteMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(getMaterialUsage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMaterialUsage.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(getMaterialUsage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload;
      })
      
      .addCase(fetchCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
        state.error = null;
      })
      .addCase(fetchCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.unshift(action.payload);
        state.error = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(category => category.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        if (state.currentCategory && state.currentCategory.id === action.payload.id) {
          state.currentCategory = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(category => category.id !== action.payload);
        if (state.currentCategory && state.currentCategory.id === action.payload) {
          state.currentCategory = null;
        }
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reports
      .addCase(fetchInventoryReport.pending, (state) => {
        state.reportsLoading = true;
        state.reportsError = null;
      })
      .addCase(fetchInventoryReport.fulfilled, (state, action) => {
        state.reportsLoading = false;
        state.inventoryReport = action.payload;
        state.reportsError = null;
      })
      .addCase(fetchInventoryReport.rejected, (state, action) => {
        state.reportsLoading = false;
        state.reportsError = action.payload;
      })
      
      .addCase(fetchMaterialReport.pending, (state) => {
        state.reportsLoading = true;
        state.reportsError = null;
      })
      .addCase(fetchMaterialReport.fulfilled, (state, action) => {
        state.reportsLoading = false;
        state.materialReport = action.payload;
        state.reportsError = null;
      })
      .addCase(fetchMaterialReport.rejected, (state, action) => {
        state.reportsLoading = false;
        state.reportsError = action.payload;
      });
  },
});

export const {
  clearError,
  clearInventoryError,
  clearMaterialsError,
  clearCategoriesError,
  clearReportsError,
  setCurrentInventoryItem,
  clearCurrentInventoryItem,
  setCurrentMaterial,
  clearCurrentMaterial,
  setCurrentCategory,
  clearCurrentCategory,
} = inventorySlice.actions;

export default inventorySlice.reducer; 