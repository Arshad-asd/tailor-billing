'use client';

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, Users, Mail, Phone, MapPin, Calendar, DollarSign, Clock, Star, CheckCircle, AlertCircle, XCircle, Loader2, Ruler, FileText, Printer } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import CustomerModal from '../../components/modals/CustomerModal';
import customerApi from '../../services/customerApi';
import { useNotification } from '../../hooks/useNotification';

export default function Customers() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [detailTab, setDetailTab] = useState('profile');
  const [measurements, setMeasurements] = useState([]);
  const [measurementsLoading, setMeasurementsLoading] = useState(false);
  const { showNotification } = useNotification();

  // Debounce search term (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerApi.getCustomers();
      setCustomers(response.results || response);
    } catch (error) {
      console.error('Error loading customers:', error);
      const errorMessage = error.message || 'Failed to load customers';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (isActive) => {
    return isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         customer.phone.includes(debouncedSearchTerm) ||
                         customer.customer_id.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && customer.is_active) ||
                         (statusFilter === 'inactive' && !customer.is_active);
    return matchesSearch && matchesStatus;
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.is_active).length;
  const totalBalance = customers.reduce((sum, customer) => sum + parseFloat(customer.balance || 0), 0);
  const totalPoints = customers.reduce((sum, customer) => sum + (customer.points || 0), 0);

  const loadCustomerMeasurements = async (customerId) => {
    try {
      setMeasurementsLoading(true);
      const data = await customerApi.getCustomerMeasurements(customerId);
      setMeasurements(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error('Error loading measurements:', error);
      setMeasurements([]);
    } finally {
      setMeasurementsLoading(false);
    }
  };

  const handlePrintMeasurement = (measurement) => {
    if (!selectedCustomer) return;

    const formatValue = (val) => {
      if (val === '' || val === null || val === undefined) return '';
      return String(val).trim();
    };

    const measurementValues = [
      formatValue(measurement.thool),
      formatValue(measurement.kethet),
      formatValue(measurement.thool_kum),
      formatValue(measurement.ardh_f_kum),
      formatValue(measurement.jamba),
      formatValue(measurement.ragab),
    ]
      .filter((val) => val !== '')
      .map((val) => `<span>${val}</span>`)
      .join('<span class="measurement-separator"> - </span>');

    const note1 = measurement.note1?.trim() || '';
    const note2 = measurement.note2?.trim() || '';
    const note3 = measurement.note3?.trim() || '';
    const note4 = measurement.note4?.trim() || '';

    let notesHtml = '';
    if (note1 || note2 || note3 || note4) {
      notesHtml = '<div class="notes">';
      if (note1 || note2) {
        notesHtml += '<div class="notes-row">';
        if (note1) notesHtml += `<div class="notes-row-item">${note1}</div>`;
        if (note2) notesHtml += `<div class="notes-row-item">${note2}</div>`;
        notesHtml += '</div>';
      }
      if (note3 || note4) {
        notesHtml += '<div class="notes-row">';
        if (note3) notesHtml += `<div class="notes-row-item">${note3}</div>`;
        if (note4) notesHtml += `<div class="notes-row-item">${note4}</div>`;
        notesHtml += '</div>';
      }
      notesHtml += '</div>';
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Customer Measurement - ${selectedCustomer.name}</title>
          <style>
            @page { size: A5 portrait; margin: 5mm; }
            html, body { height: auto; overflow: visible; }
            body { font-family: Arial, sans-serif; font-size: 16px; line-height: 1.4; margin: 0; padding: 0; color: #111; }
            .a5 { width: 100%; max-width: 100%; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 4mm; border-bottom: 1px solid #000; padding-bottom: 2mm; }
            .header-left, .header-center, .header-right { flex: 1; max-width: 33%; display: flex; flex-direction: column; justify-content: flex-start; line-height: 1.4; }
            .header-left { text-align: left; }
            .header-center { text-align: center; }
            .header-right { text-align: right; }
            .header h1 { margin: 0; padding: 0; font-size: 16px; color: #111; line-height: 1.4; }
            .header p { margin: 0; padding: 0; font-size: 16px; color: #444; line-height: 1.4; }
            .measurement-item { margin-bottom: 3mm; padding-bottom: 2mm; border-bottom: 0.5px solid #ccc; page-break-inside: avoid; break-inside: avoid; }
            .measurement-left { flex: 1 1 auto; min-width: 0; width: 100%; overflow: visible; }
            .material-name { font-weight: 600; font-size: 16px; margin: 0 0 1mm 0; padding: 0; color: #111; line-height: 1.4; }
            .notes { font-size: 16px; color: #555; margin: 0 0 1mm 0; padding: 0; line-height: 1.4; width: 100%; max-width: 100%; }
            .notes-row { display: table; width: 100%; table-layout: fixed; margin-bottom: 0.5mm; border-collapse: separate; border-spacing: 1.5mm 0; }
            .notes-row-item { display: table-cell; width: 50%; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word; hyphens: auto; line-height: 1.4; padding: 0; margin: 0; vertical-align: top; }
            .measurement-values { font-size: 20px; color: #333; white-space: nowrap; margin: 1mm 0; padding: 0; line-height: 1.4; letter-spacing: 0.5px; }
            .measurement-values .measurement-separator { padding: 0 3mm; display: inline-block; }
            .measurement-values span:not(.measurement-separator) { display: inline-block; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .measurement-item { page-break-inside: avoid; break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="a5">
            <div class="header">
              <div class="header-left">
                <h1>${selectedCustomer.customer_id || 'N/A'}</h1>
              </div>
              <div class="header-center">
                <h1>${selectedCustomer.name}</h1>
              </div>
              <div class="header-right">
                <p>${selectedCustomer.phone || ''}</p>
              </div>
            </div>
            <div class="measurements-container">
              <div class="measurement-item">
                <div class="measurement-left">
                  <div class="material-name">${measurement.material_name || 'Material'}</div>
                  <div class="measurement-values">${measurementValues || ''}</div>
                  ${notesHtml}
                </div>
              </div>
            </div>
          </div>
          <script>
            window.document.close();
            window.focus();
            window.print();
            window.close();
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      alert('Please allow popups for this site to print measurements.');
    }
  };

  const handlePrintAllMeasurements = () => {
    if (!selectedCustomer || measurements.length === 0) return;

    const formatValue = (val) => {
      if (val === '' || val === null || val === undefined) return '';
      return String(val).trim();
    };

    const measurementsHtml = measurements
      .map((measurement) => {
        const measurementValues = [
          formatValue(measurement.thool),
          formatValue(measurement.kethet),
          formatValue(measurement.thool_kum),
          formatValue(measurement.ardh_f_kum),
          formatValue(measurement.jamba),
          formatValue(measurement.ragab),
        ]
          .filter((val) => val !== '')
          .map((val) => `<span>${val}</span>`)
          .join('<span class="measurement-separator"> - </span>');

        const note1 = measurement.note1?.trim() || '';
        const note2 = measurement.note2?.trim() || '';
        const note3 = measurement.note3?.trim() || '';
        const note4 = measurement.note4?.trim() || '';

        let notesHtml = '';
        if (note1 || note2 || note3 || note4) {
          notesHtml = '<div class="notes">';
          if (note1 || note2) {
            notesHtml += '<div class="notes-row">';
            if (note1) notesHtml += `<div class="notes-row-item">${note1}</div>`;
            if (note2) notesHtml += `<div class="notes-row-item">${note2}</div>`;
            notesHtml += '</div>';
          }
          if (note3 || note4) {
            notesHtml += '<div class="notes-row">';
            if (note3) notesHtml += `<div class="notes-row-item">${note3}</div>`;
            if (note4) notesHtml += `<div class="notes-row-item">${note4}</div>`;
            notesHtml += '</div>';
          }
          notesHtml += '</div>';
        }

        return `
          <div class="measurement-item">
            <div class="measurement-left">
              <div class="material-name">${measurement.material_name || 'Material'}</div>
              <div class="measurement-values">${measurementValues || ''}</div>
              ${notesHtml}
            </div>
          </div>
        `;
      })
      .join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Customer Measurements - ${selectedCustomer.name}</title>
          <style>
            @page { size: A5 portrait; margin: 5mm; }
            html, body { height: auto; overflow: visible; }
            body { font-family: Arial, sans-serif; font-size: 16px; line-height: 1.4; margin: 0; padding: 0; color: #111; }
            .a5 { width: 100%; max-width: 100%; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 4mm; border-bottom: 1px solid #000; padding-bottom: 2mm; }
            .header-left, .header-center, .header-right { flex: 1; max-width: 33%; display: flex; flex-direction: column; justify-content: flex-start; line-height: 1.4; }
            .header-left { text-align: left; }
            .header-center { text-align: center; }
            .header-right { text-align: right; }
            .header h1 { margin: 0; padding: 0; font-size: 16px; color: #111; line-height: 1.4; }
            .header p { margin: 0; padding: 0; font-size: 16px; color: #444; line-height: 1.4; }
            .measurement-item { margin-bottom: 3mm; padding-bottom: 2mm; border-bottom: 0.5px solid #ccc; page-break-inside: avoid; break-inside: avoid; orphans: 3; widows: 3; }
            .measurement-left { flex: 1 1 auto; min-width: 0; width: 100%; overflow: visible; }
            .material-name { font-weight: 600; font-size: 16px; margin: 0 0 1mm 0; padding: 0; color: #111; line-height: 1.4; }
            .notes { font-size: 16px; color: #555; margin: 0 0 1mm 0; padding: 0; line-height: 1.4; width: 100%; max-width: 100%; }
            .notes-row { display: table; width: 100%; table-layout: fixed; margin-bottom: 0.5mm; border-collapse: separate; border-spacing: 1.5mm 0; }
            .notes-row-item { display: table-cell; width: 50%; word-wrap: break-word; word-break: break-word; overflow-wrap: break-word; hyphens: auto; line-height: 1.4; padding: 0; margin: 0; vertical-align: top; }
            .measurement-values { font-size: 20px; color: #333; white-space: nowrap; margin: 1mm 0; padding: 0; line-height: 1.4; letter-spacing: 0.5px; }
            .measurement-values .measurement-separator { padding: 0 3mm; display: inline-block; }
            .measurement-values span:not(.measurement-separator) { display: inline-block; }
            .measurements-container { page-break-inside: auto; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .measurement-item { page-break-inside: avoid; break-inside: avoid; page-break-after: auto; orphans: 3; widows: 3; }
            }
          </style>
        </head>
        <body>
          <div class="a5">
            <div class="header">
              <div class="header-left">
                <h1>${selectedCustomer.customer_id || 'N/A'}</h1>
              </div>
              <div class="header-center">
                <h1>${selectedCustomer.name}</h1>
              </div>
              <div class="header-right">
                <p>${selectedCustomer.phone || ''}</p>
              </div>
            </div>
            <div class="measurements-container">
              ${measurementsHtml}
            </div>
          </div>
          <script>
            window.document.close();
            window.focus();
            window.print();
            window.close();
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      alert('Please allow popups for this site to print measurements.');
    }
  };

  const openCustomerDetail = (customer) => {
    setSelectedCustomer(customer);
    setDetailTab('profile');
    setMeasurements([]);
    setIsDetailModalOpen(true);
  };

  // Check for search result navigation and open detail view
  useEffect(() => {
    if (location.state?.openEditForm && location.state?.editId) {
      const editId = location.state.editId;
      // Wait for customers to load, then find and open detail view
      if (customers.length > 0) {
        const customer = customers.find(c => c.id === editId);
        if (customer) {
          const timer = setTimeout(() => {
            openCustomerDetail(customer);
            // Clear the state to prevent reopening on re-render
            navigate(location.pathname, { replace: true, state: {} });
          }, 100);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [location.state, customers, navigate, location.pathname]);

  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowCustomerModal(true);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleCloseCustomerModal = () => {
    setShowCustomerModal(false);
    setEditingCustomer(null);
  };

  const handleSubmitCustomer = async (savedCustomer) => {
    try {
      // Show success notification
      if (editingCustomer) {
        showNotification('Customer updated successfully', 'success');
      } else {
        showNotification('Customer created successfully', 'success');
      }
      
      // Reload customers list
      await loadCustomers();
      // Note: CustomerModal will handle closing via onClose()
    } catch (error) {
      console.error('Error after saving customer:', error);
      const errorMessage = error.message || 'Failed to process customer save';
      showNotification(errorMessage, 'error');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }
    
    try {
      await customerApi.deleteCustomer(customerId);
      showNotification('Customer deleted successfully', 'success');
      await loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      const errorMessage = error.message || 'Failed to delete customer';
      showNotification(errorMessage, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage customer information and relationships</p>
        </div>
        <button 
          onClick={handleAddCustomer}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCustomers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCustomers}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalBalance.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Star className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Points</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name, phone, customer ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading customers...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Order Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">{customer.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: {customer.customer_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{customer.phone}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Phone</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">${parseFloat(customer.balance || 0).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.points || 0}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">points</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{customer.total_orders || 0}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">orders</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">${parseFloat(customer.total_order_amount || 0).toFixed(2)}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">total</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(customer.is_active)}`}>
                          {getStatusIcon(customer.is_active)}
                          <span className="ml-1">{customer.is_active ? 'Active' : 'Inactive'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(customer.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openCustomerDetail(customer)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditCustomer(customer)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700" 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="w-[95vw] max-w-[1200px] max-h-[90vh] overflow-y-auto p-0">
          {selectedCustomer && (
            <>
              {/* Header Section with Gradient Background */}
              <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                    <span className="text-white font-bold text-2xl">{selectedCustomer.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white">{selectedCustomer.name}</h3>
                    <p className="text-blue-100 text-sm">Customer ID: {selectedCustomer.customer_id}</p>
                    <div className="flex items-center mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        selectedCustomer.is_active 
                          ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                          : 'bg-gray-500/20 text-gray-100 border border-gray-400/30'
                      }`}>
                        {getStatusIcon(selectedCustomer.is_active)}
                        <span className="ml-1">{selectedCustomer.is_active ? 'Active Customer' : 'Inactive Customer'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <nav className="flex">
                  <button
                    onClick={() => setDetailTab('profile')}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      detailTab === 'profile'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Customer Profile
                  </button>
                  <button
                    onClick={() => {
                      setDetailTab('measurements');
                      if (measurements.length === 0 && !measurementsLoading) {
                        loadCustomerMeasurements(selectedCustomer.id);
                      }
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      detailTab === 'measurements'
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Ruler className="w-4 h-4" />
                    Customer Measurements
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              {detailTab === 'profile' ? (
                <>
                  {/* Profile Content */}
                  <div className="p-6 space-y-6">
                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Account Balance</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                              ${parseFloat(selectedCustomer.balance || 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="p-3 bg-green-100 dark:bg-green-800/50 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Loyalty Points</p>
                            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                              {selectedCustomer.points || 0}
                            </p>
                          </div>
                          <div className="p-3 bg-orange-100 dark:bg-orange-800/50 rounded-lg">
                            <Star className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Phone className="w-5 h-5 mr-2 text-blue-600" />
                        Contact Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                            <p className="font-medium text-gray-900 dark:text-white">{selectedCustomer.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Timeline */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                        Account Timeline
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
                          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                            <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Account Created</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(selectedCustomer.created_at).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(selectedCustomer.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(selectedCustomer.updated_at).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(selectedCustomer.updated_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex flex-row gap-3 justify-end border-t border-gray-200 dark:border-gray-700">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDetailModalOpen(false)}
                      className="px-6"
                    >
                      Close
                    </Button>
                    <Button 
                      type="button"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6"
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        handleEditCustomer(selectedCustomer);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Customer
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Measurements Content */}
                  <div className="p-6">
                    {measurementsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading measurements...</span>
                      </div>
                    ) : measurements.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                          <Ruler className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Measurements Found</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">This customer doesn't have any measurements yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {measurements.map((m) => (
                          <div key={m.id} className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Ruler className="w-4 h-4 text-white" />
                                <span className="text-white font-semibold">
                                  {m.material_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                {m.material_arabic_name && (
                                  <span className="text-white/80 text-sm font-medium">
                                    {m.material_arabic_name}
                                  </span>
                                )}
                                <span className="text-white/60 text-xs">
                                  Updated: {new Date(m.updated_at).toLocaleDateString()}
                                </span>
                                <button
                                  onClick={() => handlePrintMeasurement(m)}
                                  className="p-1.5 rounded-md bg-white/20 hover:bg-white/30 transition-colors"
                                  title="Print this measurement"
                                >
                                  <Printer className="w-4 h-4 text-white" />
                                </button>
                              </div>
                            </div>
                            {/* Card Body - All measurements in one row */}
                            <div className="p-4">
                              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                {[
                                  { label: 'Thool', value: m.thool },
                                  { label: 'Kethet', value: m.kethet },
                                  { label: 'Thool Kum', value: m.thool_kum },
                                  { label: 'Ardh F. Kum', value: m.ardh_f_kum },
                                  { label: 'Jamba', value: m.jamba },
                                  { label: 'Ragab', value: m.ragab },
                                ].map((field) => (
                                  <div key={field.label} className="text-center py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-600/50 border border-gray-100 dark:border-gray-600">
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">{field.label}</p>
                                    <p className="text-base font-bold text-gray-900 dark:text-white">{field.value || '-'}</p>
                                  </div>
                                ))}
                              </div>
                              {/* Notes */}
                              {(m.note1 || m.note2 || m.note3 || m.note4) && (
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                  <div className="flex items-center gap-1 mb-2">
                                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Notes</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {[m.note1, m.note2, m.note3, m.note4].filter(Boolean).map((note, i) => (
                                      <span key={i} className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-600/30 px-2 py-1 rounded">
                                        {note}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex flex-row gap-3 justify-end border-t border-gray-200 dark:border-gray-700">
                    {measurements.length > 0 && (
                      <Button
                        type="button"
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6"
                        onClick={handlePrintAllMeasurements}
                      >
                        <Printer className="w-4 h-4 mr-2" />
                        Print All
                      </Button>
                    )}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDetailModalOpen(false)}
                      className="px-6"
                    >
                      Close
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Add/Edit Modal */}
      <CustomerModal
        isOpen={showCustomerModal}
        onClose={handleCloseCustomerModal}
        onSave={handleSubmitCustomer}
        customer={editingCustomer}
        isEdit={!!editingCustomer}
      /> 
    </div>
  );
}
