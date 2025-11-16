import { useState, useEffect } from 'react';
import { X, User, Phone, Calendar, DollarSign, Package, CheckCircle, AlertCircle, Truck } from 'lucide-react';
import { deliveryApi } from '../../services/deliveryApi';

export default function DeliveryEditModal({ isOpen, onClose, delivery, onUpdate }) {
  const [formData, setFormData] = useState({
    received_on_delivery_amount: 0,
    status: 'delivered'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobOrderDetails, setJobOrderDetails] = useState(null);

  useEffect(() => {
    if (isOpen && delivery) {
      // Reset form when modal opens
      setFormData({
        received_on_delivery_amount: delivery.recived_on_delivery_amount || 0,
        status: delivery.status || 'delivered'
      });
      setError(null);
      
      // Use the delivery data directly instead of making an API call
      setJobOrderDetails(delivery);
    }
  }, [isOpen, delivery]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'received_on_delivery_amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!delivery?.jobOrderId) return;

    try {
      setLoading(true);
      setError(null);
      
      const updateData = {
        received_on_delivery_amount: formData.received_on_delivery_amount,
        status: formData.status
      };

      const updatedDelivery = await deliveryApi.updateDelivery(delivery.jobOrderId, updateData);
      
      onUpdate(updatedDelivery);
      onClose();
    } catch (err) {
      console.error('Error updating delivery:', err);
      setError('Failed to update delivery');
    } finally {
      setLoading(false);
    }
  };

  const calculateNewBalance = () => {
    if (!jobOrderDetails) return 0;
    const totalAmount = jobOrderDetails.total_amount || jobOrderDetails.totalAmount || 0;
    const advanceAmount = jobOrderDetails.advance_amount || 0;
    const receivedAmount = formData.received_on_delivery_amount || 0;
    return totalAmount - advanceAmount - receivedAmount;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Delivery Details
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Job Order: {delivery?.jobOrderNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {!jobOrderDetails ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No delivery data available</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Job Order Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Customer Name</label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {jobOrderDetails?.customer_name || delivery?.customerName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number</label>
                    <p className="text-gray-900 dark:text-white flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {jobOrderDetails?.customer_phone || delivery?.phone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Order Date</label>
                    <p className="text-gray-900 dark:text-white flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(jobOrderDetails?.created_at || delivery?.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Financial Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ${jobOrderDetails?.total_amount || jobOrderDetails?.totalAmount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Advance Received:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ${jobOrderDetails?.advance_amount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Balance:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ${jobOrderDetails?.balance_amount || jobOrderDetails?.balanceAmount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items List */}
            {jobOrderDetails?.job_order_items && jobOrderDetails.job_order_items.length > 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Items
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Item</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Quantity</th>
                        <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Fees</th>
                        <th className="text-right py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobOrderDetails.job_order_items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200 dark:border-gray-600">
                          <td className="py-2 text-sm text-gray-900 dark:text-white">{item.material_name}</td>
                          <td className="py-2 text-sm text-gray-900 dark:text-white">{item.quantity}</td>
                          <td className="py-2 text-sm text-gray-900 dark:text-white">${item.fees}</td>
                          <td className="py-2 text-sm text-gray-900 dark:text-white text-right">${item.total_amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Items
                </h3>
                <p className="text-gray-600 dark:text-gray-400">No items available for this order</p>
              </div>
            )}

            {/* Delivery Update Form */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Update Delivery
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Received on Delivery Amount
                    </label>
                    <input
                      type="number"
                      name="received_on_delivery_amount"
                      value={formData.received_on_delivery_amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      max={jobOrderDetails?.balance_amount || jobOrderDetails?.balanceAmount || 0}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter amount received"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                {/* Balance Calculation */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">New Balance:</span>
                    <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                      ${calculateNewBalance().toFixed(2)}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <span className="text-red-700 dark:text-red-300">{error}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Update Delivery
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
