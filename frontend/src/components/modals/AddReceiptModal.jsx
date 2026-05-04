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
import { nowDateTimeLocal } from "../../utils/dateUtils";

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
  const [searchJobOrderNumber, setSearchJobOrderNumber] = useState('');
  const [searchJobCustomerId, setSearchJobCustomerId] = useState('');
  const [searchJobPhone, setSearchJobPhone] = useState('');
  const [showJobOrderDropdown, setShowJobOrderDropdown] = useState(false);
  const { showNotification } = useNotification();

  // Fetch job orders when modal opens
  useEffect(() => {
    if (open) {
      fetchJobOrders();
      // Set default date/time to now in Qatar
      setForm(prev => ({ ...prev, receipt_date: nowDateTimeLocal() }));
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
      // Filter to only show job orders with balance_amount > 0
      const filteredByBalance = jobOrdersArray.filter(
        jobOrder => parseFloat(jobOrder.balance_amount || 0) > 0
      );
      setJobOrders(filteredByBalance);
      setFilteredJobOrders(filteredByBalance);
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

  // Filter job orders based on search terms with debouncing
  const [debouncedJobOrderNumber, setDebouncedJobOrderNumber] = useState('');
  const [debouncedJobCustomerId, setDebouncedJobCustomerId] = useState('');
  const [debouncedJobPhone, setDebouncedJobPhone] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedJobOrderNumber(searchJobOrderNumber), 150);
    return () => clearTimeout(timer);
  }, [searchJobOrderNumber]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedJobCustomerId(searchJobCustomerId), 150);
    return () => clearTimeout(timer);
  }, [searchJobCustomerId]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedJobPhone(searchJobPhone), 150);
    return () => clearTimeout(timer);
  }, [searchJobPhone]);

  useEffect(() => {
    if (!debouncedJobOrderNumber.trim() && !debouncedJobCustomerId.trim() && !debouncedJobPhone.trim()) {
      // Already filtered by balance > 0 in fetchJobOrders
      setFilteredJobOrders(jobOrders);
    } else {
      const filtered = jobOrders.filter(jobOrder => {
        const matchesJobOrder = !debouncedJobOrderNumber.trim() ||
          jobOrder.job_order_number?.toLowerCase().includes(debouncedJobOrderNumber.toLowerCase());
        const matchesCustomerId = !debouncedJobCustomerId.trim() ||
          jobOrder.customer_id?.toString().includes(debouncedJobCustomerId);
        const matchesPhone = !debouncedJobPhone.trim() ||
          jobOrder.customer_phone?.includes(debouncedJobPhone);
        const hasBalance = parseFloat(jobOrder.balance_amount || 0) > 0;
        return matchesJobOrder && matchesCustomerId && matchesPhone && hasBalance;
      });
      setFilteredJobOrders(filtered);
    }
  }, [debouncedJobOrderNumber, debouncedJobCustomerId, debouncedJobPhone, jobOrders]);

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
    setSearchJobOrderNumber('');
    setSearchJobCustomerId('');
    setSearchJobPhone('');
    setShowJobOrderDropdown(false);
    onClose();
  };

  const selectedJobOrder = jobOrders.find(jo => jo.id === parseInt(form.job_order));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!w-[600px] !max-w-[90vw] !h-auto !max-h-[85vh] p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
          <DialogHeader className="pb-2 flex-shrink-0">
            <DialogTitle className="text-xl">Add New Receipt</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Create a new receipt. The receipt ID will be automatically generated.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label htmlFor="job_order" className="text-sm">Job Order Search</Label>
              
              {/* Three Search Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Job Order Number..."
                    value={searchJobOrderNumber}
                    onChange={(e) => setSearchJobOrderNumber(e.target.value)}
                    onFocus={() => setShowJobOrderDropdown(true)}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Customer ID..."
                    value={searchJobCustomerId}
                    onChange={(e) => setSearchJobCustomerId(e.target.value)}
                    onFocus={() => setShowJobOrderDropdown(true)}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Phone..."
                    value={searchJobPhone}
                    onChange={(e) => setSearchJobPhone(e.target.value)}
                    onFocus={() => setShowJobOrderDropdown(true)}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                </div>
              </div>
              
              {/* Searchable Select Component */}
              <div className="relative job-order-dropdown">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Selected job order..."
                    value={selectedJobOrder ? `${selectedJobOrder.job_order_number} - ${selectedJobOrder.customer_name}` : ''}
                    readOnly
                    onFocus={() => setShowJobOrderDropdown(true)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
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
                        {(searchJobOrderNumber || searchJobCustomerId || searchJobPhone) ? 'No job orders found matching your search' : 'No active job orders found'}
                      </div>
                    ) : (
                      filteredJobOrders.map((jobOrder) => (
                        <div
                          key={jobOrder.id}
                          onClick={() => {
                            handleSelectChange("job_order", jobOrder.id.toString());
                            setShowJobOrderDropdown(false);
                            setSearchJobOrderNumber('');
                            setSearchJobCustomerId('');
                            setSearchJobPhone('');
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="receipt_amount" className="text-sm">Receipt Amount</Label>
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
              />
              {selectedJobOrder && form.receipt_amount && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remaining balance: ${((selectedJobOrder.balance_amount || 0) - parseFloat(form.receipt_amount || 0)).toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="receipt_date" className="text-sm">Receipt Date</Label>
              <Input
                id="receipt_date"
                name="receipt_date"
                type="datetime-local"
                value={form.receipt_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="receipt_remarks" className="text-sm">Remarks</Label>
              <Textarea
                id="receipt_remarks"
                name="receipt_remarks"
                value={form.receipt_remarks}
                onChange={handleChange}
                placeholder="Enter any additional remarks"
                rows={2}
                className="text-sm"
              />
            </div>
          </div>

          {selectedJobOrder && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-2">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 text-sm">Job Order Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
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

          <DialogFooter className="pt-2 border-t border-gray-200 dark:border-gray-700">
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
