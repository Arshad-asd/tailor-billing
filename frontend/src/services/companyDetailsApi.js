import api from './api';

const companyDetailsApi = {
  // Get all company details
  getCompanyDetails: async (params = {}) => {
    try {
      const response = await api.get('/master/company-details/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching company details:', error);
      throw error;
    }
  },

  // Get company detail by ID
  getCompanyDetail: async (id) => {
    try {
      const response = await api.get(`/master/company-details/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching company detail:', error);
      throw error;
    }
  },

  // Get default company
  getDefaultCompany: async () => {
    try {
      const response = await api.get('/master/company-details/default/');
      return response.data;
    } catch (error) {
      console.error('Error fetching default company:', error);
      throw error;
    }
  },

  // Get active companies
  getActiveCompanies: async () => {
    try {
      const response = await api.get('/master/company-details/active/');
      return response.data;
    } catch (error) {
      console.error('Error fetching active companies:', error);
      throw error;
    }
  },

  // Create new company detail
  createCompanyDetail: async (companyData) => {
    try {
      const formData = new FormData();
      
      // Append all fields to FormData, excluding logo if not a File
      Object.keys(companyData).forEach(key => {
        if (companyData[key] !== null && companyData[key] !== undefined) {
          // Only include company_logo if it's a File object
          if (key === 'company_logo') {
            if (companyData[key] instanceof File) {
              formData.append(key, companyData[key]);
            }
            // Skip if it's not a File (e.g., string URL or null)
          } else {
            formData.append(key, companyData[key]);
          }
        }
      });

      const response = await api.post('/master/company-details/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating company detail:', error);
      throw error;
    }
  },

  // Update company detail
  updateCompanyDetail: async (id, companyData) => {
    try {
      const formData = new FormData();
      
      // Append all fields to FormData, excluding logo if not a File
      Object.keys(companyData).forEach(key => {
        if (companyData[key] !== null && companyData[key] !== undefined) {
          // Only include company_logo if it's a File object
          if (key === 'company_logo') {
            if (companyData[key] instanceof File) {
              formData.append(key, companyData[key]);
            }
            // Skip if it's not a File (e.g., string URL or null)
          } else {
            formData.append(key, companyData[key]);
          }
        }
      });

      const response = await api.put(`/master/company-details/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating company detail:', error);
      throw error;
    }
  },

  // Partial update company detail
  patchCompanyDetail: async (id, companyData) => {
    try {
      const formData = new FormData();
      
      // Append all fields to FormData, excluding logo if not a File
      Object.keys(companyData).forEach(key => {
        if (companyData[key] !== null && companyData[key] !== undefined) {
          // Only include company_logo if it's a File object
          if (key === 'company_logo') {
            if (companyData[key] instanceof File) {
              formData.append(key, companyData[key]);
            }
            // Skip if it's not a File (e.g., string URL or null)
          } else {
            formData.append(key, companyData[key]);
          }
        }
      });

      const response = await api.patch(`/master/company-details/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error patching company detail:', error);
      throw error;
    }
  },

  // Delete company detail
  deleteCompanyDetail: async (id) => {
    try {
      const response = await api.delete(`/master/company-details/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting company detail:', error);
      throw error;
    }
  },

  // Set company as default
  setDefaultCompany: async (id) => {
    try {
      const response = await api.patch(`/master/company-details/${id}/set_default/`);
      return response.data;
    } catch (error) {
      console.error('Error setting default company:', error);
      throw error;
    }
  },

  // Unset default company
  unsetDefaultCompany: async (id) => {
    try {
      const response = await api.patch(`/master/company-details/${id}/`, { is_default: false });
      return response.data;
    } catch (error) {
      console.error('Error unsetting default company:', error);
      throw error;
    }
  },

  // Toggle company status
  toggleCompanyStatus: async (id) => {
    try {
      const response = await api.patch(`/master/company-details/${id}/toggle_status/`);
      return response.data;
    } catch (error) {
      console.error('Error toggling company status:', error);
      throw error;
    }
  },
};

export default companyDetailsApi;

