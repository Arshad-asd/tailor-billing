import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { useNotification } from "../../hooks/useNotification";
import receiptApi from "../../services/receiptApi";
import jobOrdersApi from "../../services/jobOrdersApi";

export default function AddReceiptModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    receipt_date: "",
    receipt_amount: "",
    receipt_remarks: "",
    job_order: "",
  });
  const [jobOrders, setJobOrders] = useState([]);
  const [filteredJobOrders, setFilteredJobOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobOrdersLoading, setJobOrdersLoading] = useState(false);
  const [jobOrderSearchTerm, setJobOrderSearchTerm] = useState('');
  const [showJobOrderDropdown, setShowJobOrderDropdown] = useState(false);
  const { showNotification } = useNotification();

  // Fetch job orders when modal opens
  useEffect(() => {
    if (open) {
      fetchJobOrders();
      // Set default date to today
      const today = new Date().toISOString().slice(0, 16);
      setForm(prev => ({ ...prev, receipt_date: today }));
    }
  }, [open]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showJobOrderDropdown && !event.target.closest('.job-order-dropdown')) {
        setShowJobOrderDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showJobOrderDropdown]);

  const fetchJobOrders = async () => {
    try {
      setJobOrdersLoading(true);
      const response = await jobOrdersApi.getJobOrders({ is_active: true });
      // Handle both paginated and non-paginated responses
      const jobOrdersData = response.results || response;
      const jobOrdersArray = Array.isArray(jobOrdersData) ? jobOrdersData : [];
      setJobOrders(jobOrdersArray);
      setFilteredJobOrders(jobOrdersArray);
    } catch (error) {
      console.error('Error fetching job orders:', error);
      showNotification('Error fetching job orders', 'error');
      // Fallback to empty array on error
      setJobOrders([]);
      setFilteredJobOrders([]);
    } finally {
      setJobOrdersLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    if (name === 'job_order') {
      // When job order is selected, auto-set the receipt amount to the balance amount
      const selectedJobOrder = jobOrders.find(jo => jo.id === parseInt(value));
      setForm((f) => ({ 
        ...f, 
        [name]: value,
        receipt_amount: selectedJobOrder?.balance_amount || ''
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Filter job orders based on search term
  const handleJobOrderSearch = (searchTerm) => {
    setJobOrderSearchTerm(searchTerm);
    setShowJobOrderDropdown(true);
    
    if (!searchTerm.trim()) {
      setFilteredJobOrders(jobOrders);
    } else {
      const filtered = jobOrders.filter(jobOrder => 
        jobOrder.job_order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jobOrder.customer_phone?.includes(searchTerm) ||
        jobOrder.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobOrders(filtered);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = {
        ...form,
        receipt_amount: parseFloat(form.receipt_amount) || 0,
        job_order: parseInt(form.job_order) || null,
      };

      const response = await receiptApi.createReceipt(formData);
      
      showNotification('Receipt created successfully!', 'success');
      onSubmit(response);
      
      // Reset form
      setForm({
        receipt_date: "",
        receipt_amount: "",
        receipt_remarks: "",
        job_order: "",
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating receipt:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details || 
                          'Failed to create receipt';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      receipt_date: "",
      receipt_amount: "",
      receipt_remarks: "",
      job_order: "",
    });
    setJobOrderSearchTerm('');
    setShowJobOrderDropdown(false);
    onClose();
  };

  const selectedJobOrder = jobOrders.find(jo => jo.id === parseInt(form.job_order));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full p-0 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <DialogHeader>
            <DialogTitle>Add New Receipt</DialogTitle>
            <DialogDescription>
              Create a new receipt. The receipt ID will be automatically generated.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="job_order">Job Order</Label>
              
              {/* Searchable Select Component */}
              <div className="relative job-order-dropdown">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search and select job order..."
                    value={selectedJobOrder ? `${selectedJobOrder.job_order_number} - ${selectedJobOrder.customer_name}` : jobOrderSearchTerm}
                    onChange={(e) => handleJobOrderSearch(e.target.value)}
                    onFocus={() => setShowJobOrderDropdown(true)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                
                {/* Custom Dropdown */}
                {showJobOrderDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {jobOrdersLoading ? (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                        Loading job orders...
                      </div>
                    ) : filteredJobOrders.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                        {jobOrderSearchTerm ? 'No job orders found matching your search' : 'No active job orders found'}
                      </div>
                    ) : (
                      filteredJobOrders.map((jobOrder) => (
                        <div
                          key={jobOrder.id}
                          onClick={() => {
                            handleSelectChange("job_order", jobOrder.id.toString());
                            setShowJobOrderDropdown(false);
                            setJobOrderSearchTerm('');
                          }}
                          className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {jobOrder.job_order_number} - {jobOrder.customer_name || 'Unknown Customer'}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Phone: {jobOrder.customer_phone} | Balance: ${jobOrder.balance_amount || 0}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {selectedJobOrder && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Available balance: ${selectedJobOrder.balance_amount || 0}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="receipt_amount">Receipt Amount</Label>
              <Input
                id="receipt_amount"
                name="receipt_amount"
                type="number"
                step="0.01"
                value={form.receipt_amount}
                onChange={handleChange}
                placeholder="Enter receipt amount"
                required
                min="0.01"
                max={selectedJobOrder?.balance_amount || undefined}
              />
              {selectedJobOrder && form.receipt_amount && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remaining balance: ${((selectedJobOrder.balance_amount || 0) - parseFloat(form.receipt_amount || 0)).toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="receipt_date">Receipt Date</Label>
              <Input
                id="receipt_date"
                name="receipt_date"
                type="datetime-local"
                value={form.receipt_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="receipt_remarks">Remarks</Label>
              <Textarea
                id="receipt_remarks"
                name="receipt_remarks"
                value={form.receipt_remarks}
                onChange={handleChange}
                placeholder="Enter any additional remarks"
                rows={3}
              />
            </div>
          </div>

          {selectedJobOrder && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Job Order Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Order Number:</span>
                  <span className="ml-2 text-blue-900 dark:text-blue-100">{selectedJobOrder.job_order_number}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Customer:</span>
                  <span className="ml-2 text-blue-900 dark:text-blue-100">{selectedJobOrder.customer_name || 'Unknown Customer'}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Total Amount:</span>
                  <span className="ml-2 text-blue-900 dark:text-blue-100">${selectedJobOrder.balance_amount || 0}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Receipt Amount:</span>
                  <span className="ml-2 text-blue-900 dark:text-blue-100">${form.receipt_amount || '0.00'}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || jobOrdersLoading || !form.job_order || !form.receipt_amount}>
              {loading ? 'Creating...' : 'Create Receipt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
