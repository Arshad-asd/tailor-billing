import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Ruler, 
  User, 
  Calendar, 
  Phone, 
  FileText,
  Printer,
  Save,
  Undo,
  X,
  Check,
  AlertCircle,
  Clock,
  CheckCircle
} from 'lucide-react';
import MeasurementModal from '../../components/modals/MeasurementModal';

export default function Measurements() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobOrder, setSelectedJobOrder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState(null);

  // Mock data for job orders with measurements
  const jobOrdersWithMeasurements = [
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
      balance: 100.00,
      measurements: {
        thool: 145,
        kethet: 43,
        thoolKum: 61,
        ardhFKum: 17,
        jamba: '9...19',
        ragab: '12 56 5',
        chest: 42,
        waist: 38,
        hips: 44,
        shoulder: 18,
        sleeveLength: 65,
        sleeveWidth: 16,
        neck: 16,
        inseam: 80,
        outseam: 110
      }
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
      balance: 200.00,
      measurements: {
        thool: 140,
        kethet: 40,
        thoolKum: 58,
        ardhFKum: 16,
        jamba: '8...18',
        ragab: '11 55 4',
        chest: 40,
        waist: 36,
        hips: 42,
        shoulder: 17,
        sleeveLength: 62,
        sleeveWidth: 15,
        neck: 15,
        inseam: 78,
        outseam: 108
      }
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
      balance: 600.00,
      measurements: {
        thool: 135,
        kethet: 38,
        thoolKum: 55,
        ardhFKum: 15,
        jamba: '7...17',
        ragab: '10 54 3',
        chest: 44,
        waist: 40,
        hips: 46,
        shoulder: 19,
        sleeveLength: 68,
        sleeveWidth: 18,
        neck: 17,
        inseam: 82,
        outseam: 112
      }
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

  const openMeasurementDetail = (jobOrder) => {
    setSelectedJobOrder(jobOrder);
    setIsDetailModalOpen(true);
  };

  const handleNewMeasurement = () => {
    setEditingMeasurement(null);
    setIsMeasurementModalOpen(true);
  };

  const handleEditMeasurement = (jobOrder) => {
    setEditingMeasurement(jobOrder);
    setIsMeasurementModalOpen(true);
  };

  const handleMeasurementSubmit = (formData, editingId) => {
    // Handle form submission - you can add your API call here
    console.log('Measurement submitted:', formData);
    if (editingId) {
      // Update existing measurement
      console.log('Updating measurement with ID:', editingId);
    } else {
      // Add new measurement
      console.log('Adding new measurement');
    }
    setIsMeasurementModalOpen(false);
    setEditingMeasurement(null);
  };

  const handleMeasurementModalClose = () => {
    setIsMeasurementModalOpen(false);
    setEditingMeasurement(null);
  };

  const filteredJobOrders = jobOrdersWithMeasurements.filter(jobOrder =>
    jobOrder.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jobOrder.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    jobOrder.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Measurements</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage customer measurements for job orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2">
            <Printer className="w-4 h-4" />
            <span>Print Measurements</span>
          </button>
          <button 
            onClick={handleNewMeasurement}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Measurement</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer name, job order ID, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Measurements List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredJobOrders.map((jobOrder) => (
                <tr key={jobOrder.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{jobOrder.id}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{jobOrder.startDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{jobOrder.customerName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{jobOrder.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{jobOrder.service}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{jobOrder.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(jobOrder.status)}`}>
                      {getStatusIcon(jobOrder.status)}
                      <span className="ml-1 capitalize">{jobOrder.status.replace('-', ' ')}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{jobOrder.dueDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(jobOrder.priority)}`}>
                      {jobOrder.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => openMeasurementDetail(jobOrder)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Measurements"
                      >
                        <Ruler className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditMeasurement(jobOrder)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        title="Edit Measurements"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Ruler className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Measurements</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
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
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Measurement Detail Modal */}
      {isDetailModalOpen && selectedJobOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsDetailModalOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Measurements - {selectedJobOrder.id}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedJobOrder.customerName} - {selectedJobOrder.service}
                </p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Name:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Phone:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Service:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.service}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Order Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Start Date:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.startDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Due Date:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.dueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Price:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">${selectedJobOrder.price}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Measurements Grid */}
              <div className="space-y-6">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white flex items-center">
                  <Ruler className="w-4 h-4 mr-2" />
                  Measurement Details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Traditional Measurements */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Traditional Measurements</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Thool</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.measurements.thool} cm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Kethet</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.measurements.kethet} cm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Thool Kum</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.measurements.thoolKum} cm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Ardh F. Kum</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.measurements.ardhFKum} cm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Jamba</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.measurements.jamba}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Ragab</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.measurements.ragab}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Measurements */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Body Measurements</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Chest</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.measurements.chest} cm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Waist</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.measurements.waist} cm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Hips</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.measurements.hips} cm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Shoulder</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.measurements.shoulder} cm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Neck</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.measurements.neck} cm</span>
                      </div>
                    </div>
                  </div>

                  {/* Sleeve & Length Measurements */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sleeve & Length</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Sleeve Length</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.measurements.sleeveLength} cm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Sleeve Width</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.measurements.sleeveWidth} cm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Inseam</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.measurements.inseam} cm</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Outseam</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedJobOrder.measurements.outseam} cm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit Measurements</span>
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Save as PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Measurement Modal */}
      <MeasurementModal
        open={isMeasurementModalOpen}
        onClose={handleMeasurementModalClose}
        onSubmit={handleMeasurementSubmit}
        editingMeasurement={editingMeasurement}
      />
    </div>
  );
} 