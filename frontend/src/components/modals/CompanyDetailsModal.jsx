import { useState, useEffect } from 'react';
import { X, Save, Building2, Globe, Mail, Phone, MapPin, Clock, DollarSign, Image as ImageIcon, Upload } from 'lucide-react';
import companyDetailsApi from '../../services/companyDetailsApi';

export default function CompanyDetailsModal({ isOpen, onClose, onSave, company = null, isEdit = false, allCompanies = [] }) {
  const [formData, setFormData] = useState({
    company_name: '',
    company_name_ar: '',
    company_address: '',
    company_phone: '',
    company_email: '',
    company_website: '',
    company_logo: null,
    company_currency: 'QAR',
    company_open_time: '09:00',
    company_close_time: '18:00',
    company_is_active: true,
    is_default: false
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (company && isEdit) {
        setFormData({
          company_name: company.company_name || '',
          company_name_ar: company.company_name_ar || '',
          company_address: company.company_address || '',
          company_phone: company.company_phone || '',
          company_email: company.company_email || '',
          company_website: company.company_website || '',
          company_logo: null, // Don't set file, just preview
          company_currency: company.company_currency || 'QAR',
          company_open_time: company.company_open_time || '09:00',
          company_close_time: company.company_close_time || '18:00',
          company_is_active: company.company_is_active !== undefined ? company.company_is_active : true,
          is_default: company.is_default || false
        });
        
        // Set logo preview if exists
        if (company.company_logo) {
          setLogoPreview(company.company_logo);
        } else {
          setLogoPreview(null);
        }
      } else {
        setFormData({
          company_name: '',
          company_name_ar: '',
          company_address: '',
          company_phone: '',
          company_email: '',
          company_website: '',
          company_logo: null,
          company_currency: 'QAR',
          company_open_time: '09:00',
          company_close_time: '18:00',
          company_is_active: true,
          is_default: false
        });
        setLogoPreview(null);
      }
      setErrors({});
    }
  }, [isOpen, company, isEdit]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          company_logo: 'Please select an image file'
        }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          company_logo: 'Image size should be less than 5MB'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        company_logo: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear error
      if (errors.company_logo) {
        setErrors(prev => ({
          ...prev,
          company_logo: ''
        }));
      }
    }
  };

  const validateForm = async () => {
    const newErrors = {};
    
    if (!formData.company_name.trim()) {
      newErrors.company_name = 'Company name is required';
    }
    
    if (!formData.company_phone.trim()) {
      newErrors.company_phone = 'Phone number is required';
    }
    
    if (!formData.company_email.trim()) {
      newErrors.company_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.company_email)) {
      newErrors.company_email = 'Please enter a valid email address';
    }
    
    if (formData.company_website && !/^https?:\/\/.+/.test(formData.company_website)) {
      newErrors.company_website = 'Please enter a valid URL (starting with http:// or https://)';
    }
    
    // Check if another company is already set as default
    if (formData.is_default) {
      const existingDefault = allCompanies.find(
        c => c.is_default && 
        c.company_is_active && 
        (!isEdit || c.id !== company?.id)
      );
      
      if (existingDefault) {
        newErrors.is_default = `Another company "${existingDefault.company_name}" is already set as default. Please unset it first or uncheck this option.`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate form (including default company check)
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }
    
    setLoading(true);
    try {
      let savedCompany;
      const submitData = { ...formData };
      
      // Only include logo if it's a new file
      if (!submitData.company_logo || !(submitData.company_logo instanceof File)) {
        delete submitData.company_logo;
      }
      
      if (isEdit && company) {
        savedCompany = await companyDetailsApi.updateCompanyDetail(company.id, submitData);
      } else {
        savedCompany = await companyDetailsApi.createCompanyDetail(submitData);
      }
      
      await onSave(savedCompany);
      onClose();
    } catch (error) {
      console.error('Error saving company details:', error);
      
      // Handle backend validation errors
      const errorResponse = error.response?.data;
      let errorMessage = 'Failed to save company details';
      const fieldErrors = {};
      
      if (errorResponse) {
        // Check for default company error in details
        if (errorResponse.details) {
          // Handle string error (non-field validation error)
          if (typeof errorResponse.details === 'string') {
            if (errorResponse.details.includes('default')) {
              fieldErrors.is_default = errorResponse.details;
            } else {
              errorMessage = errorResponse.details;
            }
          }
          // Handle array of errors
          else if (Array.isArray(errorResponse.details)) {
            const errorText = errorResponse.details[0] || errorResponse.details;
            if (typeof errorText === 'string' && errorText.includes('default')) {
              fieldErrors.is_default = errorText;
            } else {
              errorMessage = errorText;
            }
          }
          // Handle object/dict of field errors
          else if (typeof errorResponse.details === 'object') {
            Object.keys(errorResponse.details).forEach(key => {
              if (Array.isArray(errorResponse.details[key])) {
                fieldErrors[key] = errorResponse.details[key][0];
              } else {
                fieldErrors[key] = errorResponse.details[key];
              }
            });
          }
        }
        
        // Check for error in error field
        if (errorResponse.error) {
          if (errorResponse.error.includes('default')) {
            fieldErrors.is_default = errorResponse.error;
          } else {
            errorMessage = errorResponse.error;
          }
        }
        
        // Check for non-field errors directly in response
        if (typeof errorResponse === 'string' && errorResponse.includes('default')) {
          fieldErrors.is_default = errorResponse;
        } else if (Array.isArray(errorResponse) && errorResponse[0]?.includes('default')) {
          fieldErrors.is_default = errorResponse[0];
        }
      }
      
      // Set errors - if we have field errors, use them, otherwise show general error
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Company Details' : 'New Company Details'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isEdit ? `Editing: ${company?.company_name}` : 'Create a new company profile'}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Company Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                Company Name (English) *
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.company_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter company name"
              />
              {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                Company Name (Arabic)
              </label>
              <input
                type="text"
                value={formData.company_name_ar}
                onChange={(e) => handleInputChange('company_name_ar', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter company name in Arabic"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Company Address
            </label>
            <textarea
              value={formData.company_address}
              onChange={(e) => handleInputChange('company_address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter company address"
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.company_phone}
                onChange={(e) => handleInputChange('company_phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.company_phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter phone number"
              />
              {errors.company_phone && <p className="text-red-500 text-sm mt-1">{errors.company_phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                value={formData.company_email}
                onChange={(e) => handleInputChange('company_email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.company_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter email address"
              />
              {errors.company_email && <p className="text-red-500 text-sm mt-1">{errors.company_email}</p>}
            </div>
          </div>

          {/* Website and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Globe className="w-4 h-4 inline mr-2" />
                Website
              </label>
              <input
                type="url"
                value={formData.company_website}
                onChange={(e) => handleInputChange('company_website', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.company_website ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="https://example.com"
              />
              {errors.company_website && <p className="text-red-500 text-sm mt-1">{errors.company_website}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Currency
              </label>
              <select
                value={formData.company_currency}
                onChange={(e) => handleInputChange('company_currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="QAR">QAR (﷼)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="SAR">SAR (﷼)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="EGP">EGP (E£)</option>
              </select>
            </div>
          </div>

          {/* Business Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Open Time
              </label>
              <input
                type="time"
                value={formData.company_open_time}
                onChange={(e) => handleInputChange('company_open_time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Close Time
              </label>
              <input
                type="time"
                value={formData.company_close_time}
                onChange={(e) => handleInputChange('company_close_time', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-2" />
              Company Logo
            </label>
            <div className="flex items-center space-x-4">
              {logoPreview && (
                <div className="w-24 h-24 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </label>
                {errors.company_logo && <p className="text-red-500 text-sm mt-1">{errors.company_logo}</p>}
              </div>
            </div>
          </div>

          {/* Status Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.company_is_active}
                  onChange={(e) => handleInputChange('company_is_active', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active Company</span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => {
                    handleInputChange('is_default', e.target.checked);
                    // Clear error when user unchecks
                    if (!e.target.checked && errors.is_default) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.is_default;
                        return newErrors;
                      });
                    }
                  }}
                  className={`rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                    errors.is_default ? 'border-red-500' : ''
                  }`}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Set as Default</span>
              </label>
              {errors.is_default && (
                <p className="text-red-500 text-sm mt-1 ml-6">{errors.is_default}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600 sticky bottom-0">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Company'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

