import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, Truck, CheckCircle, Clock, AlertCircle, MapPin, Phone, Calendar, Check, X, Lock, Unlock } from 'lucide-react';
import { deliveryApi } from '../../services/deliveryApi';
import DeliveryEditModal from '../../components/modals/DeliveryEditModal';
import { formatCurrency, safeParseFloat } from '../../utils/currencyUtils';

export default function Delivery() {
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [blockedFilter, setBlockedFilter] = useState('unblocked'); // Default to unblocked
  const [fromDate, setFromDate] = useState(getTodayDate());
  const [toDate, setToDate] = useState(getTodayDate());
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    scheduled: 0,
    in_transit: 0,
    completed: 0,
    todays_deliveries: 0
  });
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState(null); // { deliveryId, field }
  const [editValue, setEditValue] = useState('');

  // Fetch deliveries on component mount
  useEffect(() => {
    fetchDeliveries();
    fetchStats();
  }, []);

  // Fetch deliveries when filters change
  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter, searchTerm, fromDate, toDate, blockedFilter]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (blockedFilter !== 'all') {
        params.is_blocked = blockedFilter === 'blocked';
      }
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (fromDate) {
        params.from_date = fromDate;
      }
      
      if (toDate) {
        params.to_date = toDate;
      }
      
      const data = await deliveryApi.getDeliveries(params);
      setDeliveries(data);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      setError('Failed to fetch deliveries');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await deliveryApi.getDeliveryStats();
      setStats({
        scheduled: data.pending || 0,
        in_transit: data.in_progress || 0,
        completed: data.completed || 0,
        todays_deliveries: data.delivered || 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      await deliveryApi.updateDeliveryStatus(deliveryId, newStatus);
      fetchDeliveries(); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update delivery status');
    }
  };

  const handleEditDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedDelivery(null);
  };

  const handleDeliveryUpdate = (updatedDelivery) => {
    // Update the delivery in the list
    setDeliveries(prevDeliveries => 
      prevDeliveries.map(delivery => 
        delivery.id === updatedDelivery.id ? updatedDelivery : delivery
      )
    );
    fetchStats(); // Refresh stats
  };

  const handleToggleBlock = async (deliveryId) => {
    const delivery = transformedDeliveries.find(d => d.id === deliveryId);
    if (!delivery) return;

    try {
      await deliveryApi.toggleBlock(delivery.jobOrderId);
      // Refresh the list
      await fetchDeliveries();
    } catch (err) {
      console.error('Error toggling block status:', err);
      setError('Failed to toggle block status');
    }
  };

  const handleCellEditStart = (deliveryId, field, currentValue) => {
    setEditingCell({ deliveryId, field });
    setEditValue(currentValue || '');
  };

  const handleCellEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleCellEditSave = async (deliveryId) => {
    if (!editingCell) return;

    const delivery = transformedDeliveries.find(d => d.id === deliveryId);
    if (!delivery) return;

    try {
      let updateData = {};

      if (editingCell.field === 'received_amount') {
        const numericValue = safeParseFloat(editValue, 0);
        updateData = {
          received_on_delivery_amount: numericValue
        };
        // Use updateDelivery endpoint
        await deliveryApi.updateDelivery(delivery.jobOrderId, updateData);
      } else if (editingCell.field === 'delivery_date') {
        // Preserve the original time when updating the date
        let updatedDateTime;
        if (delivery.deliveryDateTime) {
          // Parse the original datetime and update only the date part
          const originalDate = new Date(delivery.deliveryDateTime);
          const [year, month, day] = editValue.split('-').map(Number);
          updatedDateTime = new Date(year, month - 1, day, originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds());
        } else {
          // If no original datetime, use noon as default
          updatedDateTime = new Date(`${editValue} 12:00:00`);
        }
        
        updateData = {
          delivery_date: updatedDateTime.toISOString()
        };
        // Use scheduleDelivery endpoint for date updates
        await deliveryApi.scheduleDelivery(delivery.jobOrderId, updateData);
      } else if (editingCell.field === 'status') {
        updateData = {
          status: editValue
        };
        // Use updateDeliveryStatus endpoint
        await deliveryApi.updateDeliveryStatus(delivery.jobOrderId, editValue);
      }

      // Refresh the list
      await fetchDeliveries();
      await fetchStats(); // Also refresh stats as status might have changed
      
      setEditingCell(null);
      setEditValue('');
    } catch (err) {
      console.error(`Error updating ${editingCell.field}:`, err);
      setError(`Failed to update ${editingCell.field}`);
      setEditingCell(null);
      setEditValue('');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Truck className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };


  // Transform job order data to delivery format
  const transformJobOrderToDelivery = (jobOrder) => {
    const deliveryDateTime = jobOrder.delivery_date ? new Date(jobOrder.delivery_date) : null;
    const createdAtDateTime = jobOrder.created_at ? new Date(jobOrder.created_at) : null;
    return {
      id: `DEL-${jobOrder.id}`,
      jobOrderId: jobOrder.id, // Use the actual database ID, not the job_order_number
      jobOrderNumber: jobOrder.job_order_number, // Keep the job order number for display
      customerName: jobOrder.customer_name,
      phone: jobOrder.customer_phone,
      service: jobOrder.job_order_items?.[0]?.material_name || 'Service',
      status: jobOrder.status,
      deliveryDate: deliveryDateTime ? deliveryDateTime.toISOString().split('T')[0] : '',
      deliveryTime: deliveryDateTime ? deliveryDateTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) : '',
      deliveryDateTime: deliveryDateTime ? deliveryDateTime.toISOString() : null, // Keep original datetime for updates
      createdAt: createdAtDateTime ? createdAtDateTime.toISOString().split('T')[0] : '',
      createdAtTime: createdAtDateTime ? createdAtDateTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }) : '',
      notes: jobOrder.remarks || '',
      totalAmount: jobOrder.total_amount,
      balanceAmount: jobOrder.balance_amount,
      // Add all the original job order data for the modal
      recived_on_delivery_amount: jobOrder.recived_on_delivery_amount,
      advance_amount: jobOrder.advance_amount,
      total_amount: jobOrder.total_amount,
      balance_amount: jobOrder.balance_amount,
      // Include job order items for the modal
      job_order_items: jobOrder.job_order_items || [],
      is_blocked: jobOrder.is_blocked || false
    };
  };

  const transformedDeliveries = deliveries.map(transformJobOrderToDelivery);

  const filteredDeliveries = transformedDeliveries.filter(delivery => {
    const matchesSearch = delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.jobOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.jobOrderId.toString().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    const matchesBlocked = blockedFilter === 'all' || 
                          (blockedFilter === 'blocked' && delivery.is_blocked) ||
                          (blockedFilter === 'unblocked' && !delivery.is_blocked);
    return matchesSearch && matchesStatus && matchesBlocked;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Delivery Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage deliveries and pickups</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scheduled}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Truck className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Transit</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.in_transit}</p>
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
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Deliveries</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todays_deliveries}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deliveries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
              </select>
              <select
                value={blockedFilter}
                onChange={(e) => setBlockedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="unblocked">Unblocked</option>
                <option value="blocked">Blocked</option>
                <option value="all">All</option>
              </select>
              <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Date Range Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Range:</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">From:</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">To:</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading deliveries...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button 
                onClick={fetchDeliveries}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Job Order Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Job Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Delivery Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Received on Delivery Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No deliveries found
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${delivery.is_blocked ? 'opacity-60 bg-red-50 dark:bg-red-900/20' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{delivery.jobOrderNumber}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Job Order ID: {delivery.jobOrderId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{delivery.createdAt || 'N/A'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{delivery.createdAtTime || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{delivery.customerName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {delivery.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{delivery.service}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingCell?.deliveryId === delivery.id && editingCell?.field === 'delivery_date' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCellEditSave(delivery.id);
                            } else if (e.key === 'Escape') {
                              handleCellEditCancel();
                            }
                          }}
                          className="px-2 py-1 border border-blue-500 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleCellEditSave(delivery.id)}
                          className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCellEditCancel}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleCellEditStart(delivery.id, 'delivery_date', delivery.deliveryDate)}
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                        title="Click to edit"
                      >
                        <div className="text-sm text-gray-900 dark:text-white">{delivery.deliveryDate}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{delivery.deliveryTime}</div>
                      </div>
                    )}
                  </td>
                
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingCell?.deliveryId === delivery.id && editingCell?.field === 'status' ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCellEditSave(delivery.id);
                            } else if (e.key === 'Escape') {
                              handleCellEditCancel();
                            }
                          }}
                          className="px-2 py-1 border border-blue-500 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <button
                          onClick={() => handleCellEditSave(delivery.id)}
                          className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCellEditCancel}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span
                        onClick={() => handleCellEditStart(delivery.id, 'status', delivery.status)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(delivery.status)}`}
                        title="Click to edit"
                      >
                        {getStatusIcon(delivery.status)}
                        <span className="ml-1 capitalize">{delivery.status.replace('-', ' ')}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(delivery.totalAmount || 0)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingCell?.deliveryId === delivery.id && editingCell?.field === 'received_amount' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleCellEditSave(delivery.id);
                            } else if (e.key === 'Escape') {
                              handleCellEditCancel();
                            }
                          }}
                          className="w-32 px-2 py-1 border border-blue-500 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleCellEditSave(delivery.id)}
                          className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCellEditCancel}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => handleCellEditStart(delivery.id, 'received_amount', delivery.recived_on_delivery_amount)}
                        className="text-sm text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                        title="Click to edit"
                      >
                        {formatCurrency(delivery.recived_on_delivery_amount || 0)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleToggleBlock(delivery.id)}
                        className={`${delivery.is_blocked ? 'text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300'}`}
                        title={delivery.is_blocked ? 'Unblock Job Order' : 'Block Job Order'}
                      >
                        {delivery.is_blocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditDelivery(delivery)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Edit Delivery"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                  ))
                )}
                {/* Grand Totals Row */}
                {filteredDeliveries.length > 0 && (
                  <tr className="bg-gray-50 dark:bg-gray-700 font-semibold border-t-2 border-gray-300 dark:border-gray-600">
                    <td colSpan="6" className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">
                      Grand Total:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(
                        filteredDeliveries.reduce((sum, delivery) => 
                          sum + safeParseFloat(delivery.totalAmount, 0), 0
                        )
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(
                        filteredDeliveries.reduce((sum, delivery) => 
                          sum + safeParseFloat(delivery.recived_on_delivery_amount, 0), 0
                        )
                      )}
                    </td>
                    <td className="px-6 py-4"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delivery Edit Modal */}
      <DeliveryEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        delivery={selectedDelivery}
        onUpdate={handleDeliveryUpdate}
      />
    </div>
  );
} 