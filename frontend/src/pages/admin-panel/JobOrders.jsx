import { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Clock, CheckCircle, AlertCircle, DollarSign, User, Phone, Calendar, Printer, Ruler, Calculator, X } from 'lucide-react';

export default function JobOrders() {
  const [activeTab, setActiveTab] = useState('customer');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormMode, setIsFormMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentOrderData, setCurrentOrderData] = useState(null);
  const [formData, setFormData] = useState({
    customer: {
      customerNo: '',
      customerName: '',
      customerReference: '',
      mobileNo: '',
      currentBalance: 0.00
    },
    measurement: {
      remarks: '',
      notes: ''
    },
    bill: {
      orderDate: '',
      orderReference: '',
      deliveryDate: '',
      total: 0,
      advance: 0,
      balance: 0
    }
  });

  // Sample customer data for demo
  const sampleCustomerData = {
    customerNo: '2769',
    customerName: 'AYMAN HASHIM MOHAMED',
    customerReference: '2769',
    mobileNo: '66641990',
    currentBalance: 0.00
  };

  // Measurement Items
  const measurementItems = [
    {
      id: 1,
      itemName: 'Jalabiya',
      measurements: {
        thool: 145,
        kethet: 43,
        thoolKum: 61,
        ardhFKum: 17,
        jamba: '9...19',
        ragab: '12 56 5'
      }
    },
    {
      id: 2,
      itemName: 'Aragi',
      measurements: {
        thool: 140,
        kethet: 40,
        thoolKum: 58,
        ardhFKum: 16,
        jamba: '8...18',
        ragab: '11 55 4'
      }
    },
    {
      id: 3,
      itemName: 'Alallah',
      measurements: {
        thool: 135,
        kethet: 38,
        thoolKum: 55,
        ardhFKum: 15,
        jamba: '7...17',
        ragab: '10 54 3'
      }
    },
    {
      id: 4,
      itemName: 'Thagiya',
      measurements: {
        thool: 130,
        kethet: 35,
        thoolKum: 52,
        ardhFKum: 14,
        jamba: '6...16',
        ragab: '9 53 2'
      }
    },
    {
      id: 5,
      itemName: 'Jalabiya(a)',
      measurements: {
        thool: 142,
        kethet: 42,
        thoolKum: 60,
        ardhFKum: 16,
        jamba: '8...18',
        ragab: '11 55 4'
      }
    },
    {
      id: 6,
      itemName: 'Jalabiya(b)',
      measurements: {
        thool: 138,
        kethet: 41,
        thoolKum: 59,
        ardhFKum: 16,
        jamba: '8...18',
        ragab: '11 55 4'
      }
    }
  ];

  // Bill Items
  const billItems = [
    {
      sl: 1,
      orderNo: 'JO-001',
      itemName: 'Jalabiya',
      remarks: 'BARA BARMMA MAKINA',
      qty: 1,
      fees: 150.00,
      amount: 150.00
    }
  ];

  const jobOrders = [
    {
      id: 'JO-001',
      customerName: 'AYMAN HASHIM MOHAMED',
      phone: '66641990',
      service: 'Jalabiya',
      status: 'in-progress',
      startDate: '2025-06-29',
      dueDate: '2025-07-05',
      price: 150,
      priority: 'high',
      description: 'BARA BARMMA MAKINA',
      orderReference: 'REF-001',
      advance: 50.00,
      balance: 100.00
    },
    {
      id: 'JO-002',
      customerName: 'Sarah Johnson',
      phone: '(555) 123-4567',
      service: 'Wedding Dress Alterations',
      status: 'completed',
      startDate: '2025-06-25',
      dueDate: '2025-07-01',
      price: 300,
      priority: 'medium',
      description: 'Hemming and waist adjustments for wedding dress',
      orderReference: 'REF-002',
      advance: 100.00,
      balance: 200.00
    },
    {
      id: 'JO-003',
      customerName: 'Mike Chen',
      phone: '(555) 234-5678',
      service: 'Custom Suit',
      status: 'pending',
      startDate: '2025-06-28',
      dueDate: '2025-07-10',
      price: 800,
      priority: 'high',
      description: 'Full custom suit creation with fittings',
      orderReference: 'REF-003',
      advance: 200.00,
      balance: 600.00
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const openOrderDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleNewJobOrder = () => {
    setIsFormMode(true);
    setIsEditMode(false);
    setCurrentOrderData(null);
    // Reset form data to empty
    setFormData({
      customer: {
        customerNo: '',
        customerName: '',
        customerReference: '',
        mobileNo: '',
        currentBalance: 0.00
      },
      measurement: {
        remarks: '',
        notes: ''
      },
      bill: {
        orderDate: '',
        orderReference: '',
        deliveryDate: '',
        total: 0,
        advance: 0,
        balance: 0
      }
    });
    setActiveTab('customer');
  };

  const handleEditJobOrder = (order) => {
    setIsFormMode(true);
    setIsEditMode(true);
    setCurrentOrderData(order);
    // Pre-fill form data with order details
    setFormData({
      customer: {
        customerNo: order.customerNo || '',
        customerName: order.customerName || '',
        customerReference: order.orderReference || '',
        mobileNo: order.phone || '',
        currentBalance: order.balance || 0.00
      },
      measurement: {
        remarks: order.description || '',
        notes: ''
      },
      bill: {
        orderDate: order.startDate || '',
        orderReference: order.orderReference || '',
        deliveryDate: order.dueDate || '',
        total: order.price || 0,
        advance: order.advance || 0,
        balance: order.balance || 0
      }
    });
    setActiveTab('customer');
  };

  const handleCancelForm = () => {
    setIsFormMode(false);
    setIsEditMode(false);
    setCurrentOrderData(null);
    setActiveTab('customer');
  };

  const handleFormChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage tailoring job orders and customer measurements</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2">
            <Printer className="w-4 h-4" />
            <span>Print Slip</span>
          </button>
          <button 
            onClick={handleNewJobOrder}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Job Order</span>
          </button>
        </div>
      </div>

      {/* Main Job Order Form */}
      {isFormMode && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {/* Form Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditMode ? 'Edit Job Order' : 'New Job Order'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isEditMode ? `Editing: ${currentOrderData?.id}` : 'Create a new job order'}
              </p>
            </div>
            <button
              onClick={handleCancelForm}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        {/* Form Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('customer')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'customer'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Customer</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('measurement')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'measurement'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Ruler className="w-4 h-4" />
                <span>Measurement</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bill')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bill'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Bill</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {activeTab === 'customer' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer No</label>
                    <input
                      type="text"
                      value={formData.customer.customerNo}
                      onChange={(e) => handleFormChange('customer', 'customerNo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Name</label>
                    <input
                      type="text"
                      value={formData.customer.customerName}
                      onChange={(e) => handleFormChange('customer', 'customerName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Reference</label>
                    <input
                      type="text"
                      value={formData.customer.customerReference}
                      onChange={(e) => handleFormChange('customer', 'customerReference', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mobile No</label>
                    <input
                      type="text"
                      value={formData.customer.mobileNo}
                      onChange={(e) => handleFormChange('customer', 'mobileNo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Balance</label>
                    <div className="w-full px-3 py-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                      <span className="text-yellow-800 dark:text-yellow-200 font-medium">${formData.customer.currentBalance.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>New Customer</span>
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Find Customer</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'measurement' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Measurement Details</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item Name</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Thool</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Kethet</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Thool Kum</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ardh F. Kum</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Jamba</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ragab</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {measurementItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{item.itemName}</td>
                        <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{item.measurements.thool}</td>
                        <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{item.measurements.kethet}</td>
                        <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{item.measurements.thoolKum}</td>
                        <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{item.measurements.ardhFKum}</td>
                        <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{item.measurements.jamba}</td>
                        <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{item.measurements.ragab}</td>
                        <td className="px-4 py-3 text-center">
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remarks</label>
                  <input
                    type="text"
                    value={formData.measurement.remarks}
                    onChange={(e) => handleFormChange('measurement', 'remarks', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                  <input
                    type="text"
                    value={formData.measurement.notes}
                    onChange={(e) => handleFormChange('measurement', 'notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Ruler className="w-4 h-4" />
                  <span>Measurement</span>
                </button>
                <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2">
                  <Printer className="w-4 h-4" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'bill' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bill Information</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SL</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Order No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item Name / No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Remarks</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fees</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {billItems.map((item) => (
                      <tr key={item.sl} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{item.sl}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{item.orderNo}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{item.itemName}</td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white">{item.remarks}</td>
                        <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{item.qty}</td>
                        <td className="px-4 py-3 text-right text-gray-900 dark:text-white">${item.fees.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">${item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.bill.orderDate}
                      onChange={(e) => handleFormChange('bill', 'orderDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Reference</label>
                  <input
                    type="text"
                    value={formData.bill.orderReference}
                    onChange={(e) => handleFormChange('bill', 'orderReference', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.bill.deliveryDate}
                      onChange={(e) => handleFormChange('bill', 'deliveryDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total</label>
                  <input
                    type="number"
                    value={formData.bill.total}
                    onChange={(e) => handleFormChange('bill', 'total', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Advance (-)</label>
                  <input
                    type="number"
                    value={formData.bill.advance}
                    onChange={(e) => handleFormChange('bill', 'advance', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Balance Amount</label>
                  <input
                    type="number"
                    value={formData.bill.balance}
                    onChange={(e) => handleFormChange('bill', 'balance', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      )}

      {/* Job Orders List */}
      {!isFormMode && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Job Orders</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {jobOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{order.id}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{order.startDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{order.customerName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{order.service}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{order.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status.replace('-', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{order.dueDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">${order.price}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => openOrderDetail(order)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditJobOrder(order)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$1,250</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-center space-x-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Save Job Order</button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">Print</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">Close</button>
        </div>
      </div> */}
    </div>
  );
} 