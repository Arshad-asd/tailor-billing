import { useState, useEffect } from 'react';
import { Search, Plus, Edit, X, User, Phone, DollarSign, CheckCircle } from 'lucide-react';
import customerApi from '../../services/customerApi';
import { formatCurrency } from '../../utils/currencyUtils';

export default function CustomerSearchModal({ isOpen, onClose, onSelectCustomer, onEditCustomer, onCreateCustomer }) {
  const [nameSearch, setNameSearch] = useState('');
  const [customerIdSearch, setCustomerIdSearch] = useState('');
  const [phoneSearch, setPhoneSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Sample customer data for demo - replace with actual API call
  const sampleCustomers = [
    {
      id: 1,
      customer_id: '2769',
      name: 'AYMAN HASHIM MOHAMED',
      phone: '66641990',
      balance: 0.00,
      points: 0,
      is_active: true
    },
    {
      id: 2,
      customer_id: '2770',
      name: 'Sarah Johnson',
      phone: '(555) 123-4567',
      balance: 150.00,
      points: 25,
      is_active: true
    },
    {
      id: 3,
      customer_id: '2771',
      name: 'Mike Chen',
      phone: '(555) 234-5678',
      balance: 0.00,
      points: 10,
      is_active: true
    },
    {
      id: 4,
      customer_id: '2772',
      name: 'Emily Davis',
      phone: '(555) 345-6789',
      balance: 75.50,
      points: 15,
      is_active: true
    }
  ];

  useEffect(() => {
    if (isOpen) {
      // Reset search fields and clear customer list when modal opens
      setNameSearch('');
      setCustomerIdSearch('');
      setPhoneSearch('');
      setCustomers([]);
    }
  }, [isOpen]);

  const handleSearch = async (name = nameSearch, customerId = customerIdSearch, phone = phoneSearch) => {
    setLoading(true);
    
    try {
      // Call backend API with separate search parameters
      const data = await customerApi.searchCustomers(name, customerId, phone);
      setCustomers(data);
    } catch (error) {
      console.error('Error searching customers:', error);
      // Fallback to sample data on error
      setCustomers(sampleCustomers);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    onSelectCustomer(customer);
    onClose();
  };

  const handleEditCustomer = (customer) => {
    onEditCustomer(customer);
  };

  const handleCreateCustomer = () => {
    // Pass the search values to pre-fill the create form
    onCreateCustomer({
      name: nameSearch,
      customer_id: customerIdSearch,
      phone: phoneSearch
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && customers.length > 0) {
      // Select the first customer when Enter is pressed
      handleSelectCustomer(customers[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Search Customer</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Select or create a new customer</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCreateCustomer}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Customer</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Customer Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={nameSearch}
                  onChange={(e) => {
                    setNameSearch(e.target.value);
                    handleSearch(e.target.value, customerIdSearch, phoneSearch);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Customer ID Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Customer ID
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID..."
                  value={customerIdSearch}
                  onChange={(e) => {
                    setCustomerIdSearch(e.target.value);
                    handleSearch(nameSearch, e.target.value, phoneSearch);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Phone Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by phone..."
                  value={phoneSearch}
                  onChange={(e) => {
                    setPhoneSearch(e.target.value);
                    handleSearch(nameSearch, customerIdSearch, e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {nameSearch || customerIdSearch || phoneSearch 
                  ? 'No customers found' 
                  : 'Start typing to search for customers'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {nameSearch || customerIdSearch || phoneSearch 
                  ? 'Try adjusting your search or create a new customer' 
                  : 'Search by name, ID, or phone number'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    selectedCustomer?.id === customer.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900' : ''
                  }`}
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{customer.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <span className="font-medium">ID:</span>
                              <span>{customer.customer_id}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{customer.phone}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-sm">
                          <DollarSign className="w-3 h-3 text-green-600" />
                          <span className="text-green-600 font-medium">${formatCurrency(customer.balance)}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {customer.points || 0} points
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCustomer(customer);
                          }}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCustomer(customer);
                          }}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Select</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {customers.length} customer{customers.length !== 1 ? 's' : ''} found
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
