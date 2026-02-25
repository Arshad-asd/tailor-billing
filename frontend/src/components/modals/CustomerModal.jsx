import { useState, useEffect, useRef } from 'react';
import { X, Save, User, Phone, Hash } from 'lucide-react';
import customerApi from '../../services/customerApi';

export default function CustomerModal({ isOpen, onClose, onSave, customer = null, isEdit = false }) {
  const [formData, setFormData] = useState({
    customer_id: '',
    name: '',
    phone: '',
    balance: 0.00,
    points: 0,
    is_active: true
  });
  const customerIdRef = useRef(null);
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (customer && isEdit) {
        setFormData({
          customer_id: customer.customer_id || '',
          name: customer.name || '',
          phone: customer.phone || '',
          balance: customer.balance || 0.00,
          points: customer.points || 0,
          is_active: customer.is_active !== undefined ? customer.is_active : true
        });
      } else {
        // Fetch next customer ID for new customers
        const fetchNextCustomerId = async () => {
          try {
            const response = await customerApi.getNextCustomerId();
            setFormData({
              customer_id: response.next_customer_id || '',
              name: '',
              phone: '',
              balance: 0.00,
              points: 0,
              is_active: true
            });
          } catch (error) {
            // If fetching fails, just use empty string
            setFormData({
              customer_id: '',
              name: '',
              phone: '',
              balance: 0.00,
              points: 0,
              is_active: true
            });
          }
        };
        fetchNextCustomerId();
      }
      setErrors({});
    }
  }, [isOpen, customer, isEdit]);

  // Focus first input when modal opens (only if not already focused)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        // Only auto-focus if no input is currently focused
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          customerIdRef.current?.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enter: move to next field; on last field (phone) save the form
  const handleKeyDown = (field, e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const next = {
      customer_id: () => nameRef.current?.focus(),
      name: () => phoneRef.current?.focus(),
      phone: () => handleSave()
    };
    next[field]?.();
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!isEdit && !payload.customer_id?.trim()) delete payload.customer_id; // omit to let backend auto-gen on create
      let savedCustomer;
      if (isEdit && customer) {
        savedCustomer = await customerApi.updateCustomer(customer.id, payload);
      } else {
        savedCustomer = await customerApi.createCustomer(payload);
      }
      
      await onSave(savedCustomer);
      onClose();
    } catch (error) {
      console.error('Error saving customer:', error);
      const data = error.response?.data;
      const details = data?.details ?? data;
      if (details && typeof details === 'object' && !Array.isArray(details)) {
        const fieldErrors = {};
        for (const [field, messages] of Object.entries(details)) {
          if (Array.isArray(messages) && messages.length) {
            fieldErrors[field] = messages[0];
          } else if (typeof messages === 'string') {
            fieldErrors[field] = messages;
          }
        }
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // Only close if clicking directly on the overlay, not on the modal content
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Customer' : 'New Customer'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isEdit ? `Editing: ${customer?.name}` : 'Create a new customer'}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Customer ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Hash className="w-4 h-4 inline mr-2" />
              Customer ID
            </label>
            <input
              ref={customerIdRef}
              type="text"
              value={formData.customer_id}
              onChange={(e) => handleInputChange('customer_id', e.target.value)}
              onKeyDown={(e) => handleKeyDown('customer_id', e)}
              onClick={(e) => e.target.focus()}
              className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.customer_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Optional - leave blank to auto-generate"
            />
            {errors.customer_id && <p className="text-red-500 text-sm mt-1">{errors.customer_id}</p>}
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Customer Name *
            </label>
            <input
              ref={nameRef}
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onKeyDown={(e) => handleKeyDown('name', e)}
              onClick={(e) => e.target.focus()}
              className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter customer name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number *
            </label>
            <input
              ref={phoneRef}
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onKeyDown={(e) => handleKeyDown('phone', e)}
              onClick={(e) => e.target.focus()}
              className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter phone number"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active Customer</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Customer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}