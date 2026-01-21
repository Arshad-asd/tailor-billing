import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Save, X, User, Ruler, Calculator, Calendar } from 'lucide-react';
import CustomerSearchModal from '../modals/CustomerSearchModal';
import CustomerModal from '../modals/CustomerModal';
import MaterialSearchModal from '../modals/MaterialSearchModal';
import customerApi from '../../services/customerApi';
import materialsApi from '../../services/materialsApi';
import jobOrdersApi from '../../services/jobOrdersApi';
import { formatCurrency, safeParseFloat } from '../../utils/currencyUtils';

export default function AddJobOrder({ onClose, onSuccess }) {
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isEditCustomer, setIsEditCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  // Separate state for customer number search
  const [customerNoSearchQuery, setCustomerNoSearchQuery] = useState('');
  const [customerNoSearchResults, setCustomerNoSearchResults] = useState([]);
  const [showCustomerNoDropdown, setShowCustomerNoDropdown] = useState(false);
  const [isSearchingCustomerNo, setIsSearchingCustomerNo] = useState(false);
  const [isMaterialSearchOpen, setIsMaterialSearchOpen] = useState(false);
  const [materialSearchType, setMaterialSearchType] = useState('measurement'); // 'measurement' or 'bill'
  const [linkingItemSl, setLinkingItemSl] = useState(null); // Track which item is being linked to a material
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  // State for material name search in measurement section
  const [materialNameSearchQuery, setMaterialNameSearchQuery] = useState('');
  const [materialNameSearchResults, setMaterialNameSearchResults] = useState([]);
  const [showMaterialNameDropdown, setShowMaterialNameDropdown] = useState(false);
  const [isSearchingMaterialName, setIsSearchingMaterialName] = useState(false);
  const [billItems, setBillItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  
  // Refs for customer input fields
  const customerNameInputRef = useRef(null);
  const customerReferenceInputRef = useRef(null);
  const customerMobileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    customer: {
      customerNo: '',
      customerName: '',
      customerReference: '',
      mobileNo: '',
      currentBalance: 0.00
    },
    measurement: {
      remarks: '',
      notes: '',
      extraField1: '',
      extraField2: ''
    },
    bill: {
      orderDate: new Date().toISOString().split('T')[0],
      orderReference: '',
      deliveryDate: '',
      total: 0,
      advance: 0,
      balance: 0,
      paymentMethod: 'cash',
      cashAmount: 0,
      cardAmount: 0
    }
  });

  // Function to update bill items based on selected materials
  const updateBillItemsFromMaterials = (materials) => {
    const newBillItems = materials.map((material, index) => {
      const qty = 1;
      const fees = parseFloat(material.material_price) || 0;
      const amount = fees * qty;
      return {
        sl: index + 1,
        itemName: material.material_name,
        remarks: formData.measurement.remarks || 'Custom tailoring service',
        qty: qty,
        fees: fees,
        amount: amount,
        material_id: material.material_id || material.id
      };
    });
    
    setBillItems(newBillItems);
    updateBillTotal(newBillItems);
  };

  // Function to update bill items when materials change
  const handleMaterialsChange = (newMaterials) => {
    setSelectedMaterials(newMaterials);
    updateBillItemsFromMaterials(newMaterials);
  };

  // Function to update bill item quantity
  const handleBillItemQtyChange = (itemSl, newQty) => {
    const updatedBillItems = billItems.map(item => {
      if (item.sl === itemSl) {
        const fees = parseFloat(item.fees) || 0;
        const qty = parseInt(newQty) || 1;
        const newAmount = fees * qty;
        return { ...item, qty: qty, amount: newAmount };
      }
      return item;
    });
    
    setBillItems(updatedBillItems);
    updateBillTotal(updatedBillItems);
  };

  // Function to update bill item fees
  const handleBillItemFeesChange = (itemSl, newFees) => {
    const updatedBillItems = billItems.map(item => {
      if (item.sl === itemSl) {
        const fees = parseFloat(newFees) || 0;
        const qty = parseInt(item.qty) || 1;
        const newAmount = fees * qty;
        return { ...item, fees: fees, amount: newAmount };
      }
      return item;
    });
    
    setBillItems(updatedBillItems);
    updateBillTotal(updatedBillItems);
  };

  // Function to update total amount when bill items change
  const updateBillTotal = (items) => {
    const totalAmount = items.reduce((sum, item) => {
      const amount = parseFloat(item.amount) || 0;
      return sum + amount;
    }, 0);
    setFormData(prev => {
      const advance = parseFloat(prev.bill.advance) || 0;
      return {
        ...prev,
        bill: {
          ...prev.bill,
          total: totalAmount,
          balance: totalAmount - advance
        }
      };
    });
  };

  // Function to remove a bill item
  const handleRemoveBillItem = (itemSl) => {
    const updatedBillItems = billItems.filter(item => item.sl !== itemSl);
    const renumberedItems = updatedBillItems.map((item, index) => ({
      ...item,
      sl: index + 1
    }));
    setBillItems(renumberedItems);
    updateBillTotal(renumberedItems);
  };

  // Function to add a new bill item
  const handleAddBillItem = () => {
    const newItem = {
      sl: billItems.length + 1,
      itemName: 'New Item',
      remarks: 'Custom item',
      qty: 1,
      fees: 0,
      amount: 0
    };
    const updatedBillItems = [...billItems, newItem];
    setBillItems(updatedBillItems);
    updateBillTotal(updatedBillItems);
  };

  const handleFormChange = (section, field, value) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
      
      if (section === 'bill' && field === 'advance') {
        const advance = parseFloat(value) || 0;
        const total = prev.bill.total;
        newFormData.bill.balance = total - advance;
      }
      
      // Handle payment method changes
      if (section === 'bill' && field === 'paymentMethod') {
        const total = prev.bill.total;
        if (value === 'cash') {
          newFormData.bill.cashAmount = total;
          newFormData.bill.cardAmount = 0;
        } else if (value === 'card') {
          newFormData.bill.cashAmount = 0;
          newFormData.bill.cardAmount = total;
        } else if (value === 'cash_card') {
          // For cash_card, split the total amount
          newFormData.bill.cashAmount = total / 2;
          newFormData.bill.cardAmount = total / 2;
        }
      }
      
      // Handle cash/card amount changes for cash_card payment method
      if (section === 'bill' && (field === 'cashAmount' || field === 'cardAmount') && prev.bill.paymentMethod === 'cash_card') {
        const total = prev.bill.total;
        if (field === 'cashAmount') {
          const cashAmount = parseFloat(value) || 0;
          newFormData.bill.cardAmount = total - cashAmount;
        } else if (field === 'cardAmount') {
          const cardAmount = parseFloat(value) || 0;
          newFormData.bill.cashAmount = total - cardAmount;
        }
      }
      
      return newFormData;
    });
  };

  // Customer search and management functions
  const handleCustomerSearch = () => {
    setIsCustomerSearchOpen(true);
  };

  // Handle customer number search query change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (customerNoSearchQuery.trim() === '') {
        setCustomerNoSearchResults([]);
        setShowCustomerNoDropdown(false);
        return;
      }

      setIsSearchingCustomerNo(true);
      try {
        const results = await customerApi.searchCustomers(customerNoSearchQuery);
        setCustomerNoSearchResults(results || []);
        setShowCustomerNoDropdown(true);
      } catch (error) {
        console.error('Error searching customers:', error);
        setCustomerNoSearchResults([]);
      } finally {
        setIsSearchingCustomerNo(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [customerNoSearchQuery]);


  // Handle customer number input change
  const handleCustomerNoInputChange = (value) => {
    setCustomerNoSearchQuery(value);
    handleFormChange('customer', 'customerNo', value);
    if (value.trim() === '') {
      // Clear selected customer if input is cleared
      setSelectedCustomer(null);
      setFormData(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          customerName: '',
          customerReference: '',
          mobileNo: '',
          currentBalance: 0.00
        }
      }));
    } else if (selectedCustomer && selectedCustomer.customer_id !== value) {
      // Clear selected customer if user manually changes the number
      setSelectedCustomer(null);
    }
  };

  // Handle customer selection from dropdown (for customer number field)
  const handleCustomerNoSelectFromDropdown = (customer) => {
    setCustomerNoSearchQuery(customer.customer_id || '');
    handleSelectCustomer(customer);
    setShowCustomerNoDropdown(false);
    setCustomerNoSearchResults([]);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.customer-no-search-container')) {
        setShowCustomerNoDropdown(false);
      }
      if (!event.target.closest('.material-name-search-container')) {
        setShowMaterialNameDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sync customer search queries when customer is selected via modal
  useEffect(() => {
    if (selectedCustomer) {
      setCustomerNoSearchQuery(selectedCustomer.customer_id || formData.customer.customerNo);
    }
  }, [selectedCustomer]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      customer: {
        customerNo: customer.customer_id || '',
        customerName: customer.name || '',
        customerReference: customer.customer_id || '',
        mobileNo: customer.phone || '',
        currentBalance: safeParseFloat(customer.balance, 0)
      }
    }));
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setIsEditCustomer(true);
    setIsCustomerModalOpen(true);
  };

  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    setIsEditCustomer(false);
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (savedCustomer) => {
    try {
      setSelectedCustomer(savedCustomer);
      handleSelectCustomer(savedCustomer);
    } catch (error) {
      console.error('Error handling saved customer:', error);
    }
  };

  // Function to save/update customer when Enter is pressed on mobile number field
  const handleSaveCustomerOnEnter = async () => {
    // Check if all required fields are filled
    if (!formData.customer.customerName.trim() || !formData.customer.mobileNo.trim()) {
      setError('Please fill in customer name and mobile number before saving.');
      return;
    }

    setIsSavingCustomer(true);
    setError(null);

    try {
      const customerData = {
        customer_id: formData.customer.customerNo || undefined,
        name: formData.customer.customerName,
        phone: formData.customer.mobileNo,
        balance: formData.customer.currentBalance || 0,
        points: selectedCustomer?.points || 0,
        is_active: true
      };

      let savedCustomer;
      
      // If customer is already selected, update the existing customer
      if (selectedCustomer && selectedCustomer.id) {
        savedCustomer = await customerApi.updateCustomer(selectedCustomer.id, customerData);
      } else {
        // Otherwise, create a new customer
        savedCustomer = await customerApi.createCustomer(customerData);
      }

      // Update the selected customer with the saved data
      setSelectedCustomer(savedCustomer);
      handleSelectCustomer(savedCustomer);
      
      // Update search query
      setCustomerNoSearchQuery(savedCustomer.customer_id || '');
      
    } catch (error) {
      console.error('Error saving customer:', error);
      setError(error.response?.data?.error || error.message || 'Failed to save customer');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  // Handle Enter key press on customer number field
  const handleCustomerNoKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If dropdown is open and has results, don't navigate
      if (showCustomerNoDropdown && customerNoSearchResults.length > 0) {
        return;
      }
      // Navigate to customer name field
      setTimeout(() => {
        customerNameInputRef.current?.focus();
      }, 0);
    }
  };

  // Handle Enter key press on customer name field
  const handleCustomerNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Navigate to customer reference field
      setTimeout(() => {
        customerReferenceInputRef.current?.focus();
      }, 0);
    }
  };

  // Handle Enter key press on customer reference field
  const handleCustomerReferenceKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Navigate to mobile number field
      setTimeout(() => {
        customerMobileInputRef.current?.focus();
      }, 0);
    }
  };

  // Handle Enter key press on mobile number field
  const handleCustomerMobileKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Save customer if all fields are filled
      handleSaveCustomerOnEnter();
    }
  };

  const handleCloseCustomerModal = () => {
    setIsCustomerModalOpen(false);
    setEditingCustomer(null);
    setIsEditCustomer(false);
  };

  // Material search and management functions
  const handleMaterialSearch = () => {
    setMaterialSearchType('measurement');
    setIsMaterialSearchOpen(true);
  };

  // Handle material name search query change with debounce (for measurement section)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (materialNameSearchQuery.trim() === '') {
        setMaterialNameSearchResults([]);
        setShowMaterialNameDropdown(false);
        return;
      }

      setIsSearchingMaterialName(true);
      try {
        const results = await materialsApi.searchMaterials(materialNameSearchQuery);
        // Filter for materials that require measurements
        const filteredResults = (results || []).filter(material => material.is_measurement_required === true);
        setMaterialNameSearchResults(filteredResults);
        setShowMaterialNameDropdown(true);
      } catch (error) {
        console.error('Error searching materials:', error);
        setMaterialNameSearchResults([]);
      } finally {
        setIsSearchingMaterialName(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [materialNameSearchQuery]);

  // Handle material selection from dropdown (for measurement section)
  const handleMaterialNameSelectFromDropdown = (material) => {
    // Check if material is already selected
    const isAlreadySelected = selectedMaterials.some(m => m.id === material.id);
    
    if (!isAlreadySelected) {
      const measurementItem = {
        id: material.id,
        material_id: material.id,
        material_name: material.name,
        material_price: material.price,
        measurements: {
          thool: material.thool || 0,
          kethet: material.kethet || 0,
          thool_kum: material.thool_kum || 0,
          ardh_f_kum: material.ardh_f_kum || 0,
          jamba: material.jamba || 0,
          ragab: material.ragab || 0
        },
        custom_thool: '',
        custom_kethet: '',
        custom_thool_kum: '',
        custom_ardh_f_kum: '',
        custom_jamba: '',
        custom_ragab: '',
        note1: '',
        note2: '',
        note3: '',
        note4: '',
        is_customized: false
      };
      
      const newMaterials = [...selectedMaterials, measurementItem];
      handleMaterialsChange(newMaterials);
    }
    
    setMaterialNameSearchQuery('');
    setShowMaterialNameDropdown(false);
    setMaterialNameSearchResults([]);
  };

  // Bill item material search
  const handleBillItemMaterialSearch = (itemSl = null) => {
    setMaterialSearchType('bill');
    setLinkingItemSl(itemSl); // Set which item to link if provided
    setIsMaterialSearchOpen(true);
  };

  const handleSelectMaterial = (material) => {
    if (materialSearchType === 'bill') {
      // Check if we're linking to an existing item
      if (linkingItemSl !== null) {
        // Link material to existing item
        const materialId = material.id || material.material_id;
        const updatedBillItems = billItems.map(item => {
          if (item.sl === linkingItemSl) {
            const newFees = item.fees === 0 ? parseFloat(material.price) || 0 : item.fees;
            return {
              ...item,
              material_id: materialId,
              itemName: item.itemName === 'New Item' ? material.name : item.itemName,
              fees: newFees,
              amount: newFees * item.qty
            };
          }
          return item;
        });
        setBillItems(updatedBillItems);
        updateBillTotal(updatedBillItems);
        setLinkingItemSl(null);
        setIsMaterialSearchOpen(false);
        return;
      }
      
      // Handle new bill item material selection
      const qty = 1;
      const fees = parseFloat(material.price) || 0;
      const amount = fees * qty;
      const materialId = material.id || material.material_id;
      
      const newBillItem = {
        sl: billItems.length + 1,
        itemName: material.name,
        remarks: 'Custom tailoring service',
        qty: qty,
        fees: fees,
        amount: amount,
        material_id: materialId
      };
      const updatedBillItems = [...billItems, newBillItem];
      setBillItems(updatedBillItems);
      updateBillTotal(updatedBillItems);
      setIsMaterialSearchOpen(false);
      return;
    }

    // Handle measurement material selection
    const isAlreadySelected = selectedMaterials.some(m => m.id === material.id);
    
    if (!isAlreadySelected) {
      const measurementItem = {
        id: material.id,
        material_id: material.id,
        material_name: material.name,
        material_price: material.price,
        measurements: {
          thool: material.thool,
          kethet: material.kethet,
          thool_kum: material.thool_kum,
          ardh_f_kum: material.ardh_f_kum,
          jamba: material.jamba,
          ragab: material.ragab
        },
        custom_thool: '',
        custom_kethet: '',
        custom_thool_kum: '',
        custom_ardh_f_kum: '',
        custom_jamba: '',
        custom_ragab: '',
        note1: '',
        note2: '',
        note3: '',
        note4: '',
        is_customized: false
      };
      
      const newMaterials = [...selectedMaterials, measurementItem];
      handleMaterialsChange(newMaterials);
    }
  };

  const handleRemoveMaterial = (materialId) => {
    const newMaterials = selectedMaterials.filter(m => m.id !== materialId);
    handleMaterialsChange(newMaterials);
  };

  const handleMeasurementChange = (materialId, field, value) => {
    setSelectedMaterials(prev => 
      prev.map(material => 
        material.id === materialId 
          ? { 
              ...material, 
              [field]: value === '' ? '' : (isNaN(value) ? value : parseFloat(value) || ''),
              is_customized: true
            }
          : material
      )
    );
  };

  const handleResetMeasurements = (materialId) => {
    setSelectedMaterials(prev => 
      prev.map(material => 
        material.id === materialId 
          ? { 
              ...material, 
              custom_thool: '',
              custom_kethet: '',
              custom_thool_kum: '',
              custom_ardh_f_kum: '',
              custom_jamba: '',
              custom_ragab: '',
              is_customized: false
            }
          : material
      )
    );
  };

  const handleSaveAll = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate bill items have material_id
      const itemsWithoutMaterial = billItems.filter(item => !item.material_id);
      if (itemsWithoutMaterial.length > 0) {
        setError(`Please select materials for all bill items. ${itemsWithoutMaterial.length} item(s) missing material.`);
        setIsLoading(false);
        return;
      }

      // Prepare job order payload
      const jobOrderPayload = {
        customer_id: selectedCustomer?.id,
        ...(selectedCustomer ? {} : {
          customer_data: {
            customer_id: formData.customer.customerNo,
            name: formData.customer.customerName,
            phone: formData.customer.mobileNo,
            balance: formData.customer.currentBalance,
            points: 0,
            is_active: true
          }
        }),
        status: 'pending',
        delivery_date: formData.bill.deliveryDate ? new Date(formData.bill.deliveryDate).toISOString() : null,
        total_amount: formData.bill.total,
        advance_amount: formData.bill.advance,
        balance_amount: formData.bill.balance,
        payment_method: formData.bill.paymentMethod,
        cash_amount: formData.bill.cashAmount,
        card_amount: formData.bill.cardAmount,
        remarks: formData.measurement.remarks,
        job_order_items: billItems.map(item => {
          const materialId = parseInt(item.material_id);
          if (!materialId || isNaN(materialId)) {
            throw new Error(`Invalid material ID for item: ${item.itemName}. Please select a material.`);
          }
          return {
            material: materialId,
            quantity: parseInt(item.qty) || 1,
            fees: parseFloat(item.fees) || 0
          };
        }),
        job_order_measurements: selectedMaterials.map(material => {
          const materialId = parseInt(material.material_id || material.id);
          if (!materialId || isNaN(materialId)) {
            throw new Error(`Invalid material ID for measurement: ${material.material_name}`);
          }
          // Helper function to convert empty string to 0, otherwise parse float
          const parseMeasurement = (value) => {
            if (value === '' || value === null || value === undefined) return 0;
            return parseFloat(value) || 0;
          };
          return {
            material: materialId,
            thool: parseMeasurement(material.custom_thool),
            kethet: parseMeasurement(material.custom_kethet),
            thool_kum: parseMeasurement(material.custom_thool_kum),
            ardh_f_kum: parseMeasurement(material.custom_ardh_f_kum),
            jamba: parseMeasurement(material.custom_jamba),
            ragab: parseMeasurement(material.custom_ragab),
            note1: material.note1 || '',
            note2: material.note2 || '',
            note3: material.note3 || '',
            note4: material.note4 || ''
          };
        })
      };

      console.log('Job Order Payload:', JSON.stringify(jobOrderPayload, null, 2));

      const result = await jobOrdersApi.createJobOrder(jobOrderPayload);
      console.log('Job order created successfully:', result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Reset form
      setFormData({
        customer: {
          customerNo: '',
          customerName: '',
          customerReference: '',
          mobileNo: '',
          currentBalance: 0.00
        },
        measurement: {
          remarks: '',
          notes: '',
          extraField1: '',
          extraField2: ''
        },
        bill: {
          orderDate: new Date().toISOString().split('T')[0],
          orderReference: '',
          deliveryDate: '',
          total: 0,
          advance: 0,
          balance: 0,
          paymentMethod: 'cash',
          cashAmount: 0,
          cardAmount: 0
        }
      });
      setSelectedCustomer(null);
      setSelectedMaterials([]);
      setBillItems([]);
      
    } catch (error) {
      console.error('Error creating job order:', error);
      setError(error.response?.data?.error || 'Failed to create job order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Form Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            New Job Order
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create a new job order
          </p>
        </div>
        <button
          onClick={onClose}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
        >
          <X className="w-4 h-4" />
          <span>Cancel</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Form Content */}
      <div className="p-6 space-y-8">
        {/* Customer Section */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleCreateCustomer}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>New</span>
              </button>
              <button 
                onClick={() => selectedCustomer && handleEditCustomer(selectedCustomer)}
                disabled={!selectedCustomer}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Edit</span>
              </button>
              <button 
                onClick={handleCustomerSearch}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <Search className="w-3 h-3" />
                <span>Find</span>
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Customer</span>
            </h3>
          </div>
          
          {/* Selected Customer Indicator */}
          {selectedCustomer && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Selected Customer: {selectedCustomer.name} (ID: {selectedCustomer.customer_id})
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-6 gap-4">
            <div className="relative customer-no-search-container">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">No</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={customerNoSearchQuery || formData.customer.customerNo}
                  onChange={(e) => handleCustomerNoInputChange(e.target.value)}
                  onKeyDown={handleCustomerNoKeyDown}
                  onFocus={() => {
                    if (customerNoSearchQuery.trim() && customerNoSearchResults.length > 0) {
                      setShowCustomerNoDropdown(true);
                    }
                  }}
                  placeholder="Search customer number..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {isSearchingCustomerNo && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
                {/* Customer Dropdown for Customer No */}
                {showCustomerNoDropdown && customerNoSearchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {customerNoSearchResults.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => handleCustomerNoSelectFromDropdown(customer)}
                        className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {customer.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              ID: {customer.customer_id} | {customer.phone}
                            </div>
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                            ${formatCurrency(customer.balance || 0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showCustomerNoDropdown && customerNoSearchResults.length === 0 && customerNoSearchQuery.trim() !== '' && !isSearchingCustomerNo && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                      No customers found. Try a different search or create a new customer.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Name</label>
              <input
                ref={customerNameInputRef}
                type="text"
                value={formData.customer.customerName}
                onChange={(e) => handleFormChange('customer', 'customerName', e.target.value)}
                onKeyDown={handleCustomerNameKeyDown}
                placeholder="Customer name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Reference</label>
              <input
                ref={customerReferenceInputRef}
                type="text"
                value={formData.customer.customerReference}
                onChange={(e) => handleFormChange('customer', 'customerReference', e.target.value)}
                onKeyDown={handleCustomerReferenceKeyDown}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mobile No {isSavingCustomer && <span className="text-blue-600 text-xs">(Saving...)</span>}
              </label>
              <input
                ref={customerMobileInputRef}
                type="text"
                value={formData.customer.mobileNo}
                onChange={(e) => {
                  handleFormChange('customer', 'mobileNo', e.target.value);
                  // Clear selected customer if user manually changes the mobile number
                  if (selectedCustomer && selectedCustomer.phone !== e.target.value) {
                    setSelectedCustomer(null);
                  }
                }}
                onKeyDown={handleCustomerMobileKeyDown}
                disabled={isSavingCustomer}
                placeholder="Press Enter to save customer"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Balance</label>
              <div className="w-full px-3 py-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg flex items-center justify-between">
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">${formatCurrency(formData.customer.currentBalance)}</span>
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
              </label>
            </div>
          </div>
        </div>

        {/* Measurement Section */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => selectedMaterials.length > 0 && handleMaterialsChange([])}
                disabled={selectedMaterials.length === 0}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Remove All</span>
              </button>
              <button 
                onClick={handleMaterialSearch}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Ruler className="w-5 h-5" />
              <span>Measurement</span>
              {selectedMaterials.length > 0 && (
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
                  {selectedMaterials.length} material{selectedMaterials.length !== 1 ? 's' : ''} selected
                </span>
              )}
            </h3>
          </div>

          {/* Material Name Search Input */}
          <div className="mb-4 relative material-name-search-container">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Material Name
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={materialNameSearchQuery}
                onChange={(e) => setMaterialNameSearchQuery(e.target.value)}
                onFocus={() => {
                  if (materialNameSearchQuery.trim() && materialNameSearchResults.length > 0) {
                    setShowMaterialNameDropdown(true);
                  }
                }}
                placeholder="Search material name to add..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {isSearchingMaterialName && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
              {/* Material Dropdown */}
              {showMaterialNameDropdown && materialNameSearchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {materialNameSearchResults.map((material) => {
                    const isAlreadySelected = selectedMaterials.some(m => m.id === material.id);
                    return (
                      <div
                        key={material.id}
                        onClick={() => !isAlreadySelected && handleMaterialNameSelectFromDropdown(material)}
                        className={`px-4 py-3 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
                          isAlreadySelected 
                            ? 'bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {material.name}
                              {isAlreadySelected && (
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Already added)</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Price: {formatCurrency(material.price || 0)}
                            </div>
                          </div>
                          {material.is_measurement_required && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                              Measurement Required
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {showMaterialNameDropdown && materialNameSearchResults.length === 0 && materialNameSearchQuery.trim() !== '' && !isSearchingMaterialName && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    No materials found. Try a different search or use the "Add Item" button.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Selected Materials Display - Rectangular Card Format */}
          {selectedMaterials.length > 0 ? (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Selected Materials with Measurements:</h4>
              <div className="space-y-4">
                {selectedMaterials.map((material, index) => (
                  <div key={material.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                    {/* Material Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                        <div>
                          <h5 className="font-medium text-gray-900 dark:text-white">{material.material_name}</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Price: {formatCurrency(material.material_price)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMaterial(material.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="Remove material"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Individual Measurement Fields for each material */}
                    <div className="grid grid-cols-6 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Thool</label>
                        <input
                          type="number"
                          step="0.01"
                          value={material.custom_thool || ''}
                          onChange={(e) => handleMeasurementChange(material.id, 'custom_thool', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Kethef</label>
                        <input
                          type="number"
                          step="0.01"
                          value={material.custom_kethet || ''}
                          onChange={(e) => handleMeasurementChange(material.id, 'custom_kethet', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Thool Kum</label>
                        <input
                          type="number"
                          step="0.01"
                          value={material.custom_thool_kum || ''}
                          onChange={(e) => handleMeasurementChange(material.id, 'custom_thool_kum', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Ardh F Kum</label>
                        <input
                          type="number"
                          step="0.01"
                          value={material.custom_ardh_f_kum || ''}
                          onChange={(e) => handleMeasurementChange(material.id, 'custom_ardh_f_kum', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Jamba</label>
                        <input
                          type="number"
                          step="0.01"
                          value={material.custom_jamba || ''}
                          onChange={(e) => handleMeasurementChange(material.id, 'custom_jamba', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Ragab</label>
                        <input
                          type="number"
                          step="0.01"
                          value={material.custom_ragab || ''}
                          onChange={(e) => handleMeasurementChange(material.id, 'custom_ragab', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Notes section for each material */}
                    <div className="mt-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Note1</label>
                          <input
                            type="text"
                            value={material.note1 || ''}
                            onChange={(e) => handleMeasurementChange(material.id, 'note1', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Note 1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Note2</label>
                          <input
                            type="text"
                            value={material.note2 || ''}
                            onChange={(e) => handleMeasurementChange(material.id, 'note2', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Note 2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Note3</label>
                          <input
                            type="text"
                            value={material.note3 || ''}
                            onChange={(e) => handleMeasurementChange(material.id, 'note3', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Note 3"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Note4</label>
                          <input
                            type="text"
                            value={material.note4 || ''}
                            onChange={(e) => handleMeasurementChange(material.id, 'note4', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Note 4"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Edit/Save buttons for each material */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => console.log('Edit material:', material)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs px-2 py-1 rounded border border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => console.log('Save material:', material)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-xs px-2 py-1 rounded border border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900"
                        >
                          Save
                        </button>
                      </div>
                      {material.is_customized && (
                        <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                          Customized
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400">No materials selected. Click "Add Material" to search and select materials.</p>
            </div>
          )}

        </div>

        {/* Bill Section */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleAddBillItem}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
              <button 
                onClick={handleBillItemMaterialSearch}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <Search className="w-3 h-3" />
                <span>Find</span>
              </button>
              <button 
                onClick={() => setBillItems([])}
                disabled={billItems.length === 0}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Clear All</span>
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Calculator className="w-5 h-5" />
              <span>BILL</span>
              {billItems.length > 0 && (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium px-2 py-1 rounded-full">
                  {billItems.length} item{billItems.length !== 1 ? 's' : ''}
                </span>
              )}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">SL</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item Name / No</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Remarks</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fees</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {billItems.length > 0 ? (
                      billItems.map((item) => (
                        <tr key={item.sl} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-gray-900 dark:text-white">{item.sl}</td>
                          <td className="px-4 py-3 text-gray-900 dark:text-white">
                            {item.itemName}
                            {!item.material_id && (
                              <span className="ml-2 text-xs text-red-600 dark:text-red-400">(No material selected)</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-900 dark:text-white">{item.remarks}</td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleBillItemQtyChange(item.sl, parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.fees}
                              onChange={(e) => handleBillItemFeesChange(item.sl, parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">
                            ${formatCurrency(item.amount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              {!item.material_id && (
                                <button
                                  onClick={() => handleBillItemMaterialSearch(item.sl)}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                  title="Link material to this item"
                                >
                                  <Search className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveBillItem(item.sl)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                                title="Remove item"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                          No items in bill. Select materials in the measurement section to auto-populate bill items.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.bill.orderDate}
                    onChange={(e) => handleFormChange('bill', 'orderDate', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.bill.deliveryDate}
                    onChange={(e) => handleFormChange('bill', 'deliveryDate', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Total</label>
                <input
                  type="number"
                  value={formData.bill.total}
                  onChange={(e) => handleFormChange('bill', 'total', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Advance (-)</label>
                <input
                  type="number"
                  value={formData.bill.advance}
                  onChange={(e) => handleFormChange('bill', 'advance', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Balance Amount</label>
                <input
                  type="number"
                  value={formData.bill.balance}
                  onChange={(e) => handleFormChange('bill', 'balance', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
                <select
                  value={formData.bill.paymentMethod}
                  onChange={(e) => handleFormChange('bill', 'paymentMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="cash_card">Cash Card</option>
                </select>
              </div>
              {formData.bill.paymentMethod === 'cash_card' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cash Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.bill.cashAmount}
                      onChange={(e) => handleFormChange('bill', 'cashAmount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.bill.cardAmount}
                      onChange={(e) => handleFormChange('bill', 'cardAmount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-center space-x-4">
          <button 
            onClick={handleSaveAll}
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save'}</span>
          </button>
          <button 
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Modals */}
      <CustomerSearchModal
        isOpen={isCustomerSearchOpen}
        onClose={() => setIsCustomerSearchOpen(false)}
        onSelectCustomer={handleSelectCustomer}
        onEditCustomer={handleEditCustomer}
        onCreateCustomer={handleCreateCustomer}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        onSave={handleSaveCustomer}
        customer={editingCustomer}
        isEdit={isEditCustomer}
      />

      <MaterialSearchModal
        isOpen={isMaterialSearchOpen}
        onClose={() => {
          setIsMaterialSearchOpen(false);
          setLinkingItemSl(null);
        }}
        onSelectMaterial={handleSelectMaterial}
        onEditMaterial={() => {}}
        onCreateMaterial={() => {}}
        filterByMeasurementRequired={materialSearchType === 'measurement' ? true : false}
      />
    </div>
  );
}
