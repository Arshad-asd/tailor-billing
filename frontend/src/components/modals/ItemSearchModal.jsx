import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Search, Plus, X } from 'lucide-react';
import { inventoryAPI } from '../../services/inventoryApi';
import APIDiagnostic from '../APIDiagnostic';

export default function ItemSearchModal({ open, onClose, onSelectItem, selectedItems = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load items when modal opens
  useEffect(() => {
    if (open) {
      loadItems();
    }
  }, [open]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug: Log the API call
      console.log('Loading items from inventory API...');
      
      const response = await inventoryAPI.getItems();
      console.log('Items response:', response);
      
      setItems(response || []);
    } catch (err) {
      console.error('Error loading items:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        method: err.config?.method
      });
      
      if (err.response?.status === 401) {
        setError('Authentication required. Please login again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view items.');
      } else if (err.response?.status === 405) {
        setError('Method not allowed. The API endpoint may not support this request method.');
      } else if (err.response?.status === 404) {
        setError('Items endpoint not found. Please check your API configuration.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(`Failed to load items: ${err.message}`);
      }
      
      // Set empty array as fallback
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const notAlreadySelected = !selectedItems.some(selected => selected.id === item.id);
    return matchesSearch && notAlreadySelected;
  });

  const handleSelectItem = (item) => {
    onSelectItem(item);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 max-h-[90vh] overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Select Items</DialogTitle>
          <DialogDescription>
            Search and select items to add to the sale.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search items by name, SKU, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading items...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-y-2">
                <Button onClick={loadItems} className="mr-2">
                  Retry
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    console.log('Testing API endpoint manually...');
                    fetch('/api/inventory/items/')
                      .then(response => {
                        console.log('Manual test response:', response);
                        return response.json();
                      })
                      .then(data => console.log('Manual test data:', data))
                      .catch(err => console.error('Manual test error:', err));
                  }}
                >
                  Test API
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && filteredItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? 'No items found matching your search.' : 'No items available.'}
              </p>
            </div>
          )}

          {!loading && !error && filteredItems.length > 0 && (
            <div className="space-y-2 pb-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          SKU: {item.sku} | {item.description || 'No description'}
                        </p>
                        {item.category && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mt-1">
                            {item.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSelectItem(item)}
                    size="sm"
                    className="ml-4"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          {error && (
            <div className="mb-4">
              <APIDiagnostic />
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
