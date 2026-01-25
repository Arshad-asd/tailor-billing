import { useState, useEffect, useCallback } from 'react';
import { Search, X, Package, CheckCircle } from 'lucide-react';
import materialsApi from '../../services/materialsApi';
import { formatCurrency } from '../../utils/currencyUtils';

export default function MaterialSearchModal({ isOpen, onClose, onSelectMaterial, onEditMaterial, onCreateMaterial, filterByMeasurementRequired = null }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);


  useEffect(() => {
    if (isOpen) {
      loadMaterials();
    }
  }, [isOpen, filterByMeasurementRequired]);

  const loadMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { is_active: true };
      if (filterByMeasurementRequired !== null) {
        params.is_measurement_required = filterByMeasurementRequired;
      }
      const data = await materialsApi.getMaterials(params);
      // Filter materials client-side if needed (as backup)
      let filteredData = data || [];
      if (filterByMeasurementRequired !== null) {
        filteredData = filteredData.filter(m => m.is_measurement_required === filterByMeasurementRequired);
      }
      setMaterials(filteredData);
    } catch (error) {
      console.error('Error loading materials:', error);
      if (error.response?.status === 404) {
        setError('Materials API not available. Please check if the backend is running.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to load materials. Please try again.');
      }
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    setLoading(true);
    setError(null);
    
    try {
      let data = [];
      if (query.trim() === '') {
        const params = { is_active: true };
        if (filterByMeasurementRequired !== null) {
          params.is_measurement_required = filterByMeasurementRequired;
        }
        data = await materialsApi.getMaterials(params);
      } else {
        data = await materialsApi.searchMaterials(query);
      }
      
      // Filter materials client-side if needed
      if (filterByMeasurementRequired !== null) {
        data = data.filter(m => m.is_measurement_required === filterByMeasurementRequired);
      }
      
      setMaterials(data || []);
    } catch (error) {
      console.error('Error searching materials:', error);
      if (error.response?.status === 404) {
        setError('Materials API not available. Please check if the backend is running.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to search materials. Please try again.');
      }
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [filterByMeasurementRequired]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isOpen) {
        handleSearch(searchQuery);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isOpen, handleSearch]);

  const handleSelectMaterial = (material) => {
    setSelectedMaterial(material);
    // Pass the complete material object with all measurement data
    const materialWithMeasurements = {
      ...material,
      measurements: {
        thool: material.thool,
        kethet: material.kethet,
        thool_kum: material.thool_kum,
        ardh_f_kum: material.ardh_f_kum,
        jamba: material.jamba,
        ragab: material.ragab
      }
    };
    onSelectMaterial(materialWithMeasurements);
    onClose();
  };

  const handleEditMaterial = (material) => {
    onEditMaterial(material);
  };

  const handleCreateMaterial = () => {
    onCreateMaterial();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Search Materials</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filterByMeasurementRequired === true 
                ? 'Select materials that require measurements' 
                : filterByMeasurementRequired === false
                ? 'Select materials for bill items (no measurements required)'
                : 'Select materials (all materials available)'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadMaterials}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>Refresh</span>
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
            {loading ? (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            )}
            <input
              type="text"
              placeholder="Search materials by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Materials List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading materials...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
              <div className="mt-4 space-y-2">
                <button
                  onClick={loadMaterials}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-2"
                >
                  Try Again
                </button>
                <button
                  onClick={handleCreateMaterial}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Material
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                If the backend is not running, start it with: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">python manage.py runserver</code>
              </p>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? 'No materials found matching your search' : 'No materials available'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {searchQuery ? 'Try a different search term' : 'Create a new material to get started'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedMaterial?.id === material.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{material.name}</h3>
                      {material.material_number && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Number: {material.material_number}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Price: {formatCurrency(material.price || 0)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMaterial(material);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Select</span>
                      </button>
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
              {loading ? (
                'Loading materials...'
              ) : error ? (
                'Error loading materials'
              ) : (
                `${materials.length} material${materials.length !== 1 ? 's' : ''} found`
              )}
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
