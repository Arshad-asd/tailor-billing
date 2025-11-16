import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, Building2, Mail, Phone, MapPin, Globe, Clock, DollarSign, CheckCircle, AlertCircle, XCircle, Loader2, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import CompanyDetailsModal from '../../components/modals/CompanyDetailsModal';
import companyDetailsApi from '../../services/companyDetailsApi';
import { useNotification } from '../../hooks/useNotification';

export default function CompanyDetails() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showNotification } = useNotification();

  // Load companies on component mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await companyDetailsApi.getCompanyDetails();
      // Handle both array and paginated response
      setCompanies(Array.isArray(response) ? response : (response.results || []));
    } catch (error) {
      console.error('Error loading companies:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load company details';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusIcon = (isActive) => {
    return isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.company_name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.company_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.company_phone?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && company.company_is_active) ||
                         (statusFilter === 'inactive' && !company.company_is_active);
    return matchesSearch && matchesStatus;
  });

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.company_is_active).length;
  const defaultCompany = companies.find(c => c.is_default);

  const openCompanyDetail = (company) => {
    setSelectedCompany(company);
    setIsDetailModalOpen(true);
  };

  const handleAddCompany = () => {
    setEditingCompany(null);
    setShowCompanyModal(true);
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setShowCompanyModal(true);
  };

  const handleCloseCompanyModal = () => {
    setShowCompanyModal(false);
    setEditingCompany(null);
  };

  const handleSubmitCompany = async (formData, companyId) => {
    try {
      setSubmitting(true);
      
      if (companyId) {
        // Update existing company
        await companyDetailsApi.updateCompanyDetail(companyId, formData);
        showNotification('Company details updated successfully', 'success');
      } else {
        // Create new company
        await companyDetailsApi.createCompanyDetail(formData);
        showNotification('Company details created successfully', 'success');
      }
      
      // Reload companies list
      await loadCompanies();
      handleCloseCompanyModal();
    } catch (error) {
      console.error('Error submitting company:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Failed to save company details';
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }
    
    try {
      await companyDetailsApi.deleteCompanyDetail(companyId);
      showNotification('Company deleted successfully', 'success');
      await loadCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete company';
      showNotification(errorMessage, 'error');
    }
  };

  const handleToggleDefault = async (company) => {
    try {
      if (company.is_default) {
        // If already default, unset it
        await companyDetailsApi.unsetDefaultCompany(company.id);
        showNotification('Default company unset successfully', 'success');
      } else {
        // If not default, set it (backend will unset others)
        await companyDetailsApi.setDefaultCompany(company.id);
        showNotification('Default company updated successfully', 'success');
      }
      await loadCompanies();
    } catch (error) {
      console.error('Error toggling default company:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message || 'Failed to update default company';
      showNotification(errorMessage, 'error');
    }
  };

  const handleToggleStatus = async (companyId) => {
    try {
      await companyDetailsApi.toggleCompanyStatus(companyId);
      showNotification('Company status updated successfully', 'success');
      await loadCompanies();
    } catch (error) {
      console.error('Error toggling company status:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update company status';
      showNotification(errorMessage, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Details</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage company information and settings</p>
        </div>
        <button 
          onClick={handleAddCompany}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCompanies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Companies</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCompanies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Default Company</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {defaultCompany ? defaultCompany.company_name : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading companies...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Business Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status / Default
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
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No companies found
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {company.company_logo ? (
                            <img
                              src={company.company_logo}
                              alt={company.company_name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {company.company_name}
                              </div>
                              {company.is_default && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                            </div>
                            {company.company_name_ar && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {company.company_name_ar}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{company.company_phone}</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1 mt-1">
                          <Mail className="w-3 h-3" />
                          <span>{company.company_email}</span>
                        </div>
                        {company.company_website && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-1 mt-1">
                            <Globe className="w-3 h-3" />
                            <span className="truncate max-w-xs">{company.company_website}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{company.company_open_time} - {company.company_close_time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center space-x-1">
                          <DollarSign className="w-3 h-3" />
                          <span>{company.company_currency}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(company.company_is_active)}`}>
                            {getStatusIcon(company.company_is_active)}
                            <span className="ml-1">{company.company_is_active ? 'Active' : 'Inactive'}</span>
                          </span>
                          {company.is_default && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              <Star className="w-3 h-3 fill-yellow-500 mr-1" />
                              <span>Currently Default</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {new Date(company.company_created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(company.company_created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openCompanyDetail(company)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditCompany(company)}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700" 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleDefault(company)}
                            className={`p-1 rounded ${
                              company.is_default
                                ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                : 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                            }`}
                            title={company.is_default ? 'Unset as Default' : 'Set as Default'}
                          >
                            <Star className={`w-4 h-4 ${company.is_default ? 'fill-yellow-500' : ''}`} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCompany(company.id)}
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

      {/* Company Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="w-[700px] h-[700px] max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col p-0">
          {selectedCompany && (
            <>
              {/* Header Section with Logo */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex-shrink-0">
                <div className="flex items-center space-x-3">
                  {selectedCompany.company_logo ? (
                    <div className="w-16 h-16 rounded-lg bg-white p-1.5 shadow-lg flex-shrink-0">
                      <img
                        src={selectedCompany.company_logo}
                        alt={selectedCompany.company_name}
                        className="w-full h-full rounded object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg flex-shrink-0">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <h2 className="text-xl font-bold truncate">{selectedCompany.company_name}</h2>
                      {selectedCompany.is_default && (
                        <Star className="w-4 h-4 text-yellow-300 fill-yellow-300 flex-shrink-0" />
                      )}
                    </div>
                    {selectedCompany.company_name_ar && (
                      <p className="text-blue-100 text-xs truncate">{selectedCompany.company_name_ar}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        selectedCompany.company_is_active 
                          ? 'bg-green-500/20 text-green-100' 
                          : 'bg-gray-500/20 text-gray-100'
                      }`}>
                        {getStatusIcon(selectedCompany.company_is_active)}
                        <span className="ml-1">{selectedCompany.company_is_active ? 'Active' : 'Inactive'}</span>
                      </span>
                      {selectedCompany.is_default && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-100">
                          <Star className="w-3 h-3 fill-yellow-300" />
                          <span className="ml-1">Default</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 space-y-3 overflow-y-auto flex-1">
                {/* Basic Information */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Company Name (English)
                      </label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedCompany.company_name}
                      </p>
                    </div>
                    {selectedCompany.company_name_ar && (
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Company Name (Arabic)
                        </label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedCompany.company_name_ar}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        Address
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedCompany.company_address || <span className="text-gray-400 italic">Not provided</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        Phone Number
                      </label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedCompany.company_phone}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        Email Address
                      </label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                        {selectedCompany.company_email}
                      </p>
                    </div>
                    {selectedCompany.company_website && (
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          Website
                        </label>
                        <a
                          href={selectedCompany.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                          {selectedCompany.company_website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Information */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
                    Business Information
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Currency
                      </label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedCompany.company_currency}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Open Time
                      </label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedCompany.company_open_time}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Close Time
                      </label>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedCompany.company_close_time}
                      </p>
                    </div>
                  </div>
                </div>

                {/* System Information */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                    System Information
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Created At
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedCompany.company_created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Last Updated
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedCompany.company_updated_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end space-x-2 flex-shrink-0">
                <Button
                  onClick={() => setIsDetailModalOpen(false)}
                  variant="outline"
                  className="min-w-[100px]"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleEditCompany(selectedCompany);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-w-[120px]"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Company
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Company Modal */}
      <CompanyDetailsModal
        isOpen={showCompanyModal}
        onClose={handleCloseCompanyModal}
        onSave={(company) => handleSubmitCompany(company, editingCompany?.id)}
        company={editingCompany}
        isEdit={!!editingCompany}
        allCompanies={companies}
      />
    </div>
  );
}

