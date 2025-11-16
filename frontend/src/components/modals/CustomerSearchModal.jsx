import { useState, useEffect } from 'react';
import { Search, Plus, Edit, X, User, Phone, DollarSign, CheckCircle } from 'lucide-react';
import customerApi from '../../services/customerApi';
import { formatCurrency } from '../../utils/currencyUtils';

export default function CustomerSearchModal({ isOpen, onClose, onSelectCustomer, onEditCustomer, onCreateCustomer }) {
  const [searchQuery, setSearchQuery] = useState('');
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
      loadCustomers();
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await customerApi.getActiveCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
      // Fallback to sample data if API fails
      setCustomers(sampleCustomers);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setLoading(true);
    
    try {
      if (query.trim() === '') {
        const data = await customerApi.getActiveCustomers();
        setCustomers(data);
      } else {
        const data = await customerApi.searchCustomers(query);
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
      // Fallback to local filtering with sample data
      if (query.trim() === '') {
        setCustomers(sampleCustomers);
      } else {
        const filtered = sampleCustomers.filter(customer =>
          customer.name.toLowerCase().includes(query.toLowerCase()) ||
          customer.phone.includes(query) ||
          customer.customer_id.includes(query)
        );
        setCustomers(filtered);
      }
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
    onCreateCustomer();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or customer ID..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              <p className="text-gray-600 dark:text-gray-400">No customers found</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">Try adjusting your search or create a new customer</p>
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
