import { useState, useEffect } from 'react';
import { X, Ruler, Package, FileText, Calendar, User, Phone, AlertCircle } from 'lucide-react';
import jobOrdersApi from '../../services/jobOrdersApi';

export default function JobOrderMeasurementModal({ open, onClose, jobOrder }) {
  const [measurements, setMeasurements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && jobOrder?.id) {
      loadMeasurements();
    }
  }, [open, jobOrder]);

  const loadMeasurements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobOrdersApi.getJobOrderMeasurements(jobOrder.id);
      setMeasurements(data || []);
    } catch (error) {
      console.error('Error loading measurements:', error);
      setError('Failed to load measurements. Please try again.');
      setMeasurements([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'delivered':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  if (!open || !jobOrder) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Ruler className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Job Order Measurements
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {jobOrder.job_order_number}
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

        {/* Job Order Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customer</p>
                <p className="font-medium text-gray-900 dark:text-white">{jobOrder.customer_name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">{jobOrder.customer_phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Date</p>
                <p className="font-medium text-gray-900 dark:text-white">{formatDate(jobOrder.delivery_date)}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(jobOrder.status)}`}>
                {jobOrder.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                ${parseFloat(jobOrder.total_amount).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Measurements Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading measurements...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <AlertCircle className="w-8 h-8 text-red-500 mr-2" />
              <span className="text-red-600 dark:text-red-400">{error}</span>
            </div>
          ) : measurements.length === 0 ? (
            <div className="text-center py-8">
              <Ruler className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No measurements found for this job order.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {measurements.map((measurement, index) => (
                <div key={measurement.id || index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {measurement.material_name || 'Material'}
                      </h3>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Measurement #{index + 1}
                    </span>
                  </div>

                  {/* Measurements Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Thool</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {measurement.thool} cm
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Kethef</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {measurement.kethet} cm
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Thool Kum</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {measurement.thool_kum} cm
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ardh F. Kum</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {measurement.ardh_f_kum} cm
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Jamba</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {measurement.jamba} cm
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ragab</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {measurement.ragab} cm
                      </p>
                    </div>
                  </div>

                  {/* Notes Section */}
                  {(measurement.note1 || measurement.note2 || measurement.note3 || measurement.note4) && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {measurement.note1 && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Note 1</p>
                            <p className="text-sm text-gray-900 dark:text-white">{measurement.note1}</p>
                          </div>
                        )}
                        {measurement.note2 && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Note 2</p>
                            <p className="text-sm text-gray-900 dark:text-white">{measurement.note2}</p>
                          </div>
                        )}
                        {measurement.note3 && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Note 3</p>
                            <p className="text-sm text-gray-900 dark:text-white">{measurement.note3}</p>
                          </div>
                        )}
                        {measurement.note4 && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Note 4</p>
                            <p className="text-sm text-gray-900 dark:text-white">{measurement.note4}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
