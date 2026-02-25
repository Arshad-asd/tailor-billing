'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Search, Save, X, User, Ruler, Calculator, Calendar } from 'lucide-react';
import CustomerSearchModal from '../modals/CustomerSearchModal';
import CustomerModal from '../modals/CustomerModal';
import MaterialSearchModal from '../modals/MaterialSearchModal';
import customerApi from '../../services/customerApi';
import materialsApi from '../../services/materialsApi';
import jobOrdersApi from '../../services/jobOrdersApi';
import { formatCurrency, safeParseFloat } from '../../utils/currencyUtils';
import { formatDateStr } from '../../utils/dateUtils';

export default function AddJobOrder({ onClose, onSuccess, onSwitchToEdit }) {
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
  
  // Memoize excludeMaterialIds to prevent unnecessary re-renders
  const excludeMaterialIds = useMemo(() => {
    if (materialSearchType === 'measurement') {
      return selectedMaterials.map(m => m.id || m.material_id).filter(Boolean);
    } else {
      return billItems.map(item => item.material_id).filter(Boolean);
    }
  }, [materialSearchType, selectedMaterials, billItems]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);
  const [advanceError, setAdvanceError] = useState(null);
  // Material measurement cards: when Save is clicked, inputs become read-only until Edit is clicked
  const [lockedMaterialIds, setLockedMaterialIds] = useState([]);
  // Index of the material currently shown in the single card (for editing); chips at top for selection
  const [activeMaterialIndex, setActiveMaterialIndex] = useState(0);
  
  // Refs for customer input fields
  const customerNameInputRef = useRef(null);
  const customerReferenceInputRef = useRef(null);
  const customerMobileInputRef = useRef(null);

  // Refs for material measurement inputs (focus flow: first input on select, Enter jumps to next, Enter on last opens add material modal)
  const materialInputRefs = useRef({});
  const prevMaterialsLengthRef = useRef(0);
  const MEASUREMENT_FIELD_ORDER = ['custom_thool', 'custom_kethet', 'custom_thool_kum', 'custom_ardh_f_kum', 'custom_jamba', 'custom_ragab', 'note1', 'note2', 'note3', 'note4'];

  // Refs for bill item inputs (itemName, remarks, qty, amount)
  const billItemInputRefs = useRef({});
  
  // Ref for order date field (to move focus after last item)
  const orderDateInputRef = useRef(null);
  // Ref for advance amount field
  const advanceInputRef = useRef(null);
  // Ref for delivery date field
  const deliveryDateInputRef = useRef(null);

  // State for bill item name search
  const [billItemNameSearchQueries, setBillItemNameSearchQueries] = useState({}); // { itemSl: searchQuery }
  const [billItemNameSearchResults, setBillItemNameSearchResults] = useState({}); // { itemSl: results[] }
  const [showBillItemNameDropdowns, setShowBillItemNameDropdowns] = useState({}); // { itemSl: boolean }
  const [isSearchingBillItemName, setIsSearchingBillItemName] = useState({}); // { itemSl: boolean }

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
      orderDate: formatDateStr(new Date()),
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

  // Function to update materials (no longer auto-creates bill items)
  const handleMaterialsChange = (newMaterials) => {
    setSelectedMaterials(newMaterials);
    // Bill items are now optional and must be added manually by the user
  };

  // Function to update bill item quantity
  const handleBillItemQtyChange = (itemSl, newQty) => {
    const updatedBillItems = billItems.map(item => {
      if (item.sl === itemSl) {
        // Keep qty as text input - user can enter any value
        return { ...item, qty: newQty };
      }
      return item;
    });
    
    setBillItems(updatedBillItems);
    updateBillTotal(updatedBillItems);
  };

  // Function to update bill item fees (kept for backward compatibility, but fees are hidden)
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

  // Function to update bill item amount (user enters amount directly as text)
  const handleBillItemAmountChange = (itemSl, newAmount) => {
    const updatedBillItems = billItems.map(item => {
      if (item.sl === itemSl) {
        // Store as string to allow text input, will be parsed for calculations
        return { ...item, amount: newAmount === '' ? '' : newAmount };
      }
      return item;
    });
    
    setBillItems(updatedBillItems);
    updateBillTotal(updatedBillItems);
  };

  // Function to update total amount when bill items change
  const updateBillTotal = (items) => {
    const totalAmount = items.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || 0;
      const amount = parseFloat(item.amount) || 0;
      const subtotal = qty * amount;
      return sum + subtotal;
    }, 0);
    setFormData(prev => {
      // Handle advance value - it might be a string, number, or empty
      let advance = 0;
      if (prev.bill.advance !== '' && prev.bill.advance !== null && prev.bill.advance !== undefined) {
        advance = parseFloat(String(prev.bill.advance));
        if (isNaN(advance)) {
          advance = 0;
        }
      }
      
      // Clear error if advance is now valid
      if (advance <= totalAmount) {
        setAdvanceError(null);
      } else {
        setAdvanceError('Advance amount cannot be greater than total amount');
      }
      
      const balance = totalAmount - advance;
      return {
        ...prev,
        bill: {
          ...prev.bill,
          total: totalAmount,
          balance: balance
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
    // Clean up search state for removed item
    setBillItemNameSearchQueries(prev => {
      const newQueries = { ...prev };
      delete newQueries[itemSl];
      return newQueries;
    });
    setBillItemNameSearchResults(prev => {
      const newResults = { ...prev };
      delete newResults[itemSl];
      return newResults;
    });
    setShowBillItemNameDropdowns(prev => {
      const newDropdowns = { ...prev };
      delete newDropdowns[itemSl];
      return newDropdowns;
    });
    setIsSearchingBillItemName(prev => {
      const newSearching = { ...prev };
      delete newSearching[itemSl];
      return newSearching;
    });
  };

  // Function to add a new bill item
  const handleAddBillItem = () => {
    const newItem = {
      sl: billItems.length + 1,
      itemName: '',
      remarks: '',
      qty: '', // Empty string for text input
      fees: 0,
      amount: '' // Empty string for text input, no default 0
    };
    const updatedBillItems = [...billItems, newItem];
    setBillItems(updatedBillItems);
    updateBillTotal(updatedBillItems);
    // Initialize search query for new item
    setBillItemNameSearchQueries(prev => ({ ...prev, [newItem.sl]: '' }));
    // Focus on itemName input of the new item
    setTimeout(() => {
      billItemInputRefs.current[newItem.sl]?.itemName?.focus();
    }, 50);
  };

  // Handle bill item name search query change
  useEffect(() => {
    const timeouts = {};
    Object.keys(billItemNameSearchQueries).forEach(itemSl => {
      const query = billItemNameSearchQueries[itemSl];
      timeouts[itemSl] = setTimeout(async () => {
        if (query.trim() === '') {
          setBillItemNameSearchResults(prev => ({ ...prev, [itemSl]: [] }));
          setShowBillItemNameDropdowns(prev => ({ ...prev, [itemSl]: false }));
          return;
        }

        setIsSearchingBillItemName(prev => ({ ...prev, [itemSl]: true }));
        try {
          const results = await materialsApi.searchMaterials(query);
          setBillItemNameSearchResults(prev => ({ ...prev, [itemSl]: results || [] }));
          setShowBillItemNameDropdowns(prev => ({ ...prev, [itemSl]: true }));
        } catch (error) {
          console.error('Error searching materials for bill item:', error);
          setBillItemNameSearchResults(prev => ({ ...prev, [itemSl]: [] }));
        } finally {
          setIsSearchingBillItemName(prev => ({ ...prev, [itemSl]: false }));
        }
      }, 300);
    });

    return () => {
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [billItemNameSearchQueries]);

  // Handle bill item name change
  const handleBillItemNameChange = (itemSl, value) => {
    const updatedBillItems = billItems.map(item => {
      if (item.sl === itemSl) {
        // Clear material_id when user starts typing to allow new search
        return { ...item, itemName: value, material_id: undefined };
      }
      return item;
    });
    setBillItems(updatedBillItems);
    setBillItemNameSearchQueries(prev => ({ ...prev, [itemSl]: value }));
  };

  // Handle bill item name select from dropdown
  const handleBillItemNameSelect = (itemSl, material) => {
    const materialId = material.id || material.material_id;
    const materialName = material.name;
    setBillItems(prevItems => {
      return prevItems.map(item => {
        if (item.sl === itemSl) {
          // Preserve existing remarks, don't auto-fill default
          const currentRemarks = item.remarks || '';
          return {
            ...item,
            itemName: materialName,
            material_id: materialId,
            remarks: currentRemarks
          };
        }
        return item;
      });
    });
    // Clear search query to prevent dropdown from showing again
    setBillItemNameSearchQueries(prev => ({ ...prev, [itemSl]: '' }));
    setShowBillItemNameDropdowns(prev => ({ ...prev, [itemSl]: false }));
    setBillItemNameSearchResults(prev => ({ ...prev, [itemSl]: [] }));
    // Focus on remarks input after dropdown closes
    setTimeout(() => {
      billItemInputRefs.current[itemSl]?.remarks?.focus();
    }, 100);
  };

  // Handle bill item remarks change
  const handleBillItemRemarksChange = (itemSl, value) => {
    setBillItems(prevItems => {
      return prevItems.map(item => {
        if (item.sl === itemSl) {
          return { ...item, remarks: value || '' };
        }
        return item;
      });
    });
  };

  // Handle Enter key navigation in bill items
  const handleBillItemKeyDown = (itemSl, field, e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    
    if (field === 'itemName') {
      // If dropdown is open and has results, select the first result
      if (showBillItemNameDropdowns[itemSl] && billItemNameSearchResults[itemSl]?.length > 0) {
        const firstResult = billItemNameSearchResults[itemSl][0];
        handleBillItemNameSelect(itemSl, firstResult);
        return;
      }
      // Move to remarks
      billItemInputRefs.current[itemSl]?.remarks?.focus();
    } else if (field === 'remarks') {
      // Move to qty
      billItemInputRefs.current[itemSl]?.qty?.focus();
    } else if (field === 'qty') {
      // Move to amount
      billItemInputRefs.current[itemSl]?.amount?.focus();
    } else if (field === 'amount') {
      // Move to next item's itemName if it exists, otherwise move to order date
      const currentItemIndex = billItems.findIndex(item => item.sl === itemSl);
      const nextItem = billItems[currentItemIndex + 1];
      if (nextItem) {
        // Focus on next item's itemName
        setTimeout(() => {
          billItemInputRefs.current[nextItem.sl]?.itemName?.focus();
        }, 100);
      } else {
        // Last item: move focus to order date field
        setTimeout(() => {
          orderDateInputRef.current?.focus();
        }, 100);
      }
    }
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
      
      // Handle order date change - set delivery date to 1 week later if not already set
      if (section === 'bill' && field === 'orderDate') {
        // Only set delivery date if it's empty
        if (!prev.bill.deliveryDate || prev.bill.deliveryDate === '') {
          const orderDate = new Date(value);
          const deliveryDate = new Date(orderDate);
          deliveryDate.setDate(deliveryDate.getDate() + 7); // Add 7 days (1 week)
          newFormData.bill.deliveryDate = formatDateStr(deliveryDate);
        }
      }
      
      if (section === 'bill' && field === 'advance') {
        // Store as text, but parse for calculations
        let advance = 0;
        if (value !== '' && value !== null && value !== undefined) {
          advance = parseFloat(String(value));
          if (isNaN(advance)) {
            advance = 0;
          }
        }
        const total = prev.bill.total;
        
        // Validate: advance cannot be greater than total
        if (advance > total) {
          setAdvanceError('Advance amount cannot be greater than total amount');
          // Don't update the advance value if it exceeds total
          return prev;
        } else {
          setAdvanceError(null);
          newFormData.bill.balance = total - advance;
        }
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

  // Track materials length for ref
  useEffect(() => {
    if (selectedMaterials.length !== prevMaterialsLengthRef.current) {
      prevMaterialsLengthRef.current = selectedMaterials.length;
    }
  }, [selectedMaterials]);

  // When a material is removed, remove its id from lockedMaterialIds
  useEffect(() => {
    setLockedMaterialIds(prev => prev.filter(id => selectedMaterials.some(m => m.id === id)));
  }, [selectedMaterials]);

  // Keep activeMaterialIndex in valid range when selectedMaterials changes
  useEffect(() => {
    const len = selectedMaterials.length;
    setActiveMaterialIndex(prev => {
      if (len === 0) return 0;
      if (prev >= len) return len - 1;
      return prev;
    });
  }, [selectedMaterials.length]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.customer-no-search-container')) {
        setShowCustomerNoDropdown(false);
      }
      if (!event.target.closest('.material-name-search-container')) {
        setShowMaterialNameDropdown(false);
      }
      // Close all bill item name dropdowns if clicking outside any of them
      const billItemNameContainer = event.target.closest('.bill-item-name-search-container');
      if (!billItemNameContainer) {
        setShowBillItemNameDropdowns({});
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

  // Set default delivery date to 1 week after order date on initial load
  useEffect(() => {
    setFormData(prev => {
      // Only set delivery date if it's empty and order date exists
      if ((!prev.bill.deliveryDate || prev.bill.deliveryDate === '') && prev.bill.orderDate) {
        const orderDate = new Date(prev.bill.orderDate);
        const deliveryDate = new Date(orderDate);
        deliveryDate.setDate(deliveryDate.getDate() + 7); // Add 7 days (1 week)
        return {
          ...prev,
          bill: {
            ...prev.bill,
            deliveryDate: formatDateStr(deliveryDate)
          }
        };
      }
      return prev;
    });
  }, []); // Only run on mount

  const handleSelectCustomer = async (customer) => {
    // If balance is not in the customer object, fetch full customer details
    let customerWithBalance = customer;
    if (customer.id && (customer.balance === undefined || customer.balance === null)) {
      try {
        const fullCustomerDetails = await customerApi.getCustomer(customer.id);
        customerWithBalance = { ...customer, balance: fullCustomerDetails.balance || 0 };
      } catch (error) {
        console.error('Error fetching customer balance:', error);
        // Use customer as-is if fetch fails
        customerWithBalance = { ...customer, balance: 0 };
      }
    }
    
    setSelectedCustomer(customerWithBalance);
    setFormData(prev => ({
      ...prev,
      customer: {
        customerNo: customerWithBalance.customer_id || '',
        customerName: customerWithBalance.name || '',
        customerReference: customerWithBalance.customer_id || '',
        mobileNo: customerWithBalance.phone || '',
        currentBalance: safeParseFloat(customerWithBalance.balance, 0)
      }
    }));

    // Fetch customer measurements and auto-populate materials
    if (customer.id) {
      try {
        const measurements = await customerApi.getCustomerMeasurements(customer.id);
        if (measurements && measurements.length > 0) {
          // Fetch material details for each measurement to get price and other info
          const materialsFromMeasurements = await Promise.all(
            measurements.map(async (measurement) => {
              const materialId = measurement.material_id || measurement.material;
              let materialPrice = 0;
              let materialName = measurement.material_name;
              
              // Try to fetch material details to get price
              try {
                const materialDetails = await materialsApi.getMaterial(materialId);
                materialPrice = materialDetails.price || 0;
                materialName = materialDetails.name || materialName;
              } catch (error) {
                console.warn(`Could not fetch material details for ID ${materialId}:`, error);
                // Use the material_name from measurement if material fetch fails
              }
              
              return {
                id: materialId,
                material_id: materialId,
                material_name: materialName,
                material_price: materialPrice,
                measurements: {
                  thool: measurement.thool != null && measurement.thool !== '' ? String(measurement.thool) : '',
                  kethet: measurement.kethet != null && measurement.kethet !== '' ? String(measurement.kethet) : '',
                  thool_kum: measurement.thool_kum != null && measurement.thool_kum !== '' ? String(measurement.thool_kum) : '',
                  ardh_f_kum: measurement.ardh_f_kum != null && measurement.ardh_f_kum !== '' ? String(measurement.ardh_f_kum) : '',
                  jamba: measurement.jamba != null && measurement.jamba !== '' ? String(measurement.jamba) : '',
                  ragab: measurement.ragab != null && measurement.ragab !== '' ? String(measurement.ragab) : ''
                },
                custom_thool: measurement.thool != null && measurement.thool !== '' ? String(measurement.thool) : '',
                custom_kethet: measurement.kethet != null && measurement.kethet !== '' ? String(measurement.kethet) : '',
                custom_thool_kum: measurement.thool_kum != null && measurement.thool_kum !== '' ? String(measurement.thool_kum) : '',
                custom_ardh_f_kum: measurement.ardh_f_kum != null && measurement.ardh_f_kum !== '' ? String(measurement.ardh_f_kum) : '',
                custom_jamba: measurement.jamba != null && measurement.jamba !== '' ? String(measurement.jamba) : '',
                custom_ragab: measurement.ragab != null && measurement.ragab !== '' ? String(measurement.ragab) : '',
                note1: measurement.note1 || '',
                note2: measurement.note2 || '',
                note3: measurement.note3 || '',
                note4: measurement.note4 || '',
                is_customized: false
              };
            })
          );
          
          // Set the materials
          handleMaterialsChange(materialsFromMeasurements);
          
          // Automatically lock all auto-selected materials (make them read-only)
          const autoSelectedMaterialIds = materialsFromMeasurements.map(m => m.id);
          setLockedMaterialIds(prev => {
            // Combine existing locked IDs with new auto-selected ones, avoiding duplicates
            const combined = [...prev, ...autoSelectedMaterialIds];
            return [...new Set(combined)]; // Remove duplicates
          });
        }
      } catch (error) {
        console.error('Error fetching customer measurements:', error);
        // Don't show error to user, just log it - it's okay if measurements don't exist
      }
    }
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

  // Handle Enter key press on order date field
  const handleOrderDateKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Move to advance amount field
      setTimeout(() => {
        advanceInputRef.current?.focus();
      }, 100);
    }
  };

  // Handle Enter key press on advance amount field
  const handleAdvanceKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Move to delivery date field and open calendar
      setTimeout(() => {
        deliveryDateInputRef.current?.focus();
        // Open the date picker if supported
        if (deliveryDateInputRef.current && typeof deliveryDateInputRef.current.showPicker === 'function') {
          try {
            deliveryDateInputRef.current.showPicker();
          } catch (error) {
            // If showPicker is not supported, just focus the field
            console.log('Date picker showPicker not supported');
          }
        }
      }, 100);
    }
  };

  // Handle Enter key press on delivery date field
  const handleDeliveryDateKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Open the date picker if supported
      if (deliveryDateInputRef.current && typeof deliveryDateInputRef.current.showPicker === 'function') {
        try {
          deliveryDateInputRef.current.showPicker();
        } catch (error) {
          // If showPicker is not supported, just keep focus
          console.log('Date picker showPicker not supported');
        }
      }
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
          thool: material.thool != null && material.thool !== '' ? String(material.thool) : '',
          kethet: material.kethet != null && material.kethet !== '' ? String(material.kethet) : '',
          thool_kum: material.thool_kum != null && material.thool_kum !== '' ? String(material.thool_kum) : '',
          ardh_f_kum: material.ardh_f_kum != null && material.ardh_f_kum !== '' ? String(material.ardh_f_kum) : '',
          jamba: material.jamba != null && material.jamba !== '' ? String(material.jamba) : '',
          ragab: material.ragab != null && material.ragab !== '' ? String(material.ragab) : ''
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
      setActiveMaterialIndex(newMaterials.length - 1);
      
      // Focus the first input after the new material card is rendered
      setTimeout(() => {
        materialInputRefs.current[material.id]?.custom_thool?.focus();
      }, 150);
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
        setBillItems(prevItems => {
          const updatedBillItems = prevItems.map(item => {
            if (item.sl === linkingItemSl) {
              // Keep existing fees and amount - user will enter manually
              // Preserve existing remarks, don't auto-fill default
              const currentRemarks = item.remarks || '';
              return {
                ...item,
                material_id: materialId,
                itemName: item.itemName === 'New Item' ? material.name : item.itemName,
                remarks: currentRemarks
              };
            }
            return item;
          });
          updateBillTotal(updatedBillItems);
          return updatedBillItems;
        });
        setLinkingItemSl(null);
        setIsMaterialSearchOpen(false);
        
        // Focus on remarks field after linking material
        setTimeout(() => {
          billItemInputRefs.current[linkingItemSl]?.remarks?.focus();
        }, 100);
        
        return;
      }
      
      // Handle new bill item material selection
      const qty = 1;
      const fees = 0; // User will enter fees manually
      const amount = ''; // User will enter amount manually as text
      const materialId = material.id || material.material_id;
      
      const newBillItem = {
        sl: billItems.length + 1,
        itemName: material.name,
        remarks: '', // Empty by default, user will enter manually
        qty: qty,
        fees: fees,
        amount: amount,
        material_id: materialId
      };
      const updatedBillItems = [...billItems, newBillItem];
      setBillItems(updatedBillItems);
      updateBillTotal(updatedBillItems);
      setIsMaterialSearchOpen(false);
      
      // Focus on remarks field after adding item
      setTimeout(() => {
        billItemInputRefs.current[newBillItem.sl]?.remarks?.focus();
      }, 100);
      
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
          thool: material.thool != null && material.thool !== '' ? String(material.thool) : '',
          kethet: material.kethet != null && material.kethet !== '' ? String(material.kethet) : '',
          thool_kum: material.thool_kum != null && material.thool_kum !== '' ? String(material.thool_kum) : '',
          ardh_f_kum: material.ardh_f_kum != null && material.ardh_f_kum !== '' ? String(material.ardh_f_kum) : '',
          jamba: material.jamba != null && material.jamba !== '' ? String(material.jamba) : '',
          ragab: material.ragab != null && material.ragab !== '' ? String(material.ragab) : ''
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
      setActiveMaterialIndex(newMaterials.length - 1);
      setIsMaterialSearchOpen(false);
      
      // Focus the first input after modal closes and the new material card is rendered
      setTimeout(() => {
        materialInputRefs.current[material.id]?.custom_thool?.focus();
      }, 200);
    }
  };

  const handleRemoveMaterial = (materialId) => {
    const removedIndex = selectedMaterials.findIndex(m => m.id === materialId);
    const newMaterials = selectedMaterials.filter(m => m.id !== materialId);
    handleMaterialsChange(newMaterials);
    if (newMaterials.length === 0) {
      setActiveMaterialIndex(0);
    } else if (removedIndex === activeMaterialIndex) {
      setActiveMaterialIndex(0);
    } else if (removedIndex < activeMaterialIndex) {
      setActiveMaterialIndex(prev => Math.max(0, prev - 1));
    }
  };

  const handleMeasurementChange = (materialId, field, value) => {
    setSelectedMaterials(prev => 
      prev.map(material => 
        material.id === materialId 
          ? { 
              ...material, 
              // Allow text input for all fields
              [field]: value,
              is_customized: true
            }
          : material
      )
    );
  };

  // On Enter: jump to next measurement input; on last input (note4) save material
  const handleMeasurementKeyDown = (materialId, field, e) => {
    if (e.key !== 'Enter') return;
    if (lockedMaterialIds.includes(materialId)) return;
    e.preventDefault();
    const idx = MEASUREMENT_FIELD_ORDER.indexOf(field);
    const nextField = MEASUREMENT_FIELD_ORDER[idx + 1];
    if (nextField) {
      materialInputRefs.current[materialId]?.[nextField]?.focus();
    } else {
      // On last input (Note4): save the current material
      handleLockMaterial(materialId);
    }
  };

  const isMaterialLocked = (materialId) => lockedMaterialIds.includes(materialId);
  const [isSavingMeasurement, setIsSavingMeasurement] = useState(false);

  const handleLockMaterial = async (materialId) => {
    setLockedMaterialIds(prev => (prev.includes(materialId) ? prev : [...prev, materialId]));

    if (!selectedCustomer) {
      setError('Please select or create a customer before saving a measurement.');
      return;
    }

    setIsSavingMeasurement(true);
    setError(null);

    try {
      const toMeasurementStr = (value) => (value === '' || value === null || value === undefined ? '' : String(value).trim());

      const jobOrderPayload = {
        customer_id: selectedCustomer.id,
        status: 'pending',
        order_date: (formData.bill.orderDate && String(formData.bill.orderDate).trim())
          ? new Date(formData.bill.orderDate.trim() + 'T12:00:00').toISOString()
          : new Date(formatDateStr(new Date()) + 'T12:00:00').toISOString(),
        delivery_date: formData.bill.deliveryDate ? new Date(formData.bill.deliveryDate + 'T12:00:00').toISOString() : null,
        total_amount: formData.bill.total || 0,
        advance_amount: parseFloat(formData.bill.advance) || 0,
        balance_amount: formData.bill.balance || 0,
        payment_method: formData.bill.paymentMethod || 'cash',
        cash_amount: formData.bill.cashAmount || 0,
        card_amount: formData.bill.cardAmount || 0,
        remarks: formData.measurement.remarks || '',
        ...(billItems.length > 0 && {
          job_order_items: billItems.filter(item => item.material_id).map(item => {
            const quantity = parseInt(item.qty) || 1;
            const amount = parseFloat(item.amount) || 0;
            return {
              material: parseInt(item.material_id),
              quantity,
              amount,
              sub_total: quantity * amount,
              remarks: item.remarks || ''
            };
          })
        }),
        job_order_measurements: selectedMaterials.map(material => {
          const matId = parseInt(material.material_id || material.id);
          return {
            material: matId,
            thool: toMeasurementStr(material.custom_thool),
            kethet: toMeasurementStr(material.custom_kethet),
            thool_kum: toMeasurementStr(material.custom_thool_kum),
            ardh_f_kum: toMeasurementStr(material.custom_ardh_f_kum),
            jamba: toMeasurementStr(material.custom_jamba),
            ragab: toMeasurementStr(material.custom_ragab),
            note1: material.note1 || '',
            note2: material.note2 || '',
            note3: material.note3 || '',
            note4: material.note4 || ''
          };
        })
      };

      const result = await jobOrdersApi.createJobOrder(jobOrderPayload);
      console.log('Job order created on measurement save:', result);

      if (onSwitchToEdit && result?.id) {
        onSwitchToEdit(result.id);
      } else if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error('Error creating job order on measurement save:', err);
      setError(err.response?.data?.error || 'Failed to save. Please try again.');
      setLockedMaterialIds(prev => prev.filter(id => id !== materialId));
    } finally {
      setIsSavingMeasurement(false);
    }
  };

  const handleUnlockMaterial = (materialId) => {
    setLockedMaterialIds(prev => prev.filter(id => id !== materialId));
    // Focus the first input field after unlocking
    setTimeout(() => {
      const firstInput = materialInputRefs.current[materialId]?.custom_thool;
      if (firstInput) {
        firstInput.focus();
        // Select text if any exists for better UX
        if (firstInput.value) {
          firstInput.select();
        }
      }
    }, 50);
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
      // Validate bill items only if they exist - bill items are optional
      if (billItems.length > 0) {
        // Validate bill items have material_id only if bill items are provided
        const itemsWithoutMaterial = billItems.filter(item => !item.material_id);
        if (itemsWithoutMaterial.length > 0) {
          setError(`Please select materials for all bill items. ${itemsWithoutMaterial.length} item(s) missing material.`);
          setIsLoading(false);
          return;
        }
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
        // Always send order_date (user-selected order date); fallback to today so it is never omitted from payload
        order_date: (formData.bill.orderDate && String(formData.bill.orderDate).trim())
          ? new Date(formData.bill.orderDate.trim() + 'T12:00:00').toISOString()
          : new Date(formatDateStr(new Date()) + 'T12:00:00').toISOString(),
        delivery_date: formData.bill.deliveryDate ? new Date(formData.bill.deliveryDate + 'T12:00:00').toISOString() : null,
        total_amount: formData.bill.total,
        advance_amount: parseFloat(formData.bill.advance) || 0,
        balance_amount: formData.bill.balance,
        payment_method: formData.bill.paymentMethod,
        cash_amount: formData.bill.cashAmount,
        card_amount: formData.bill.cardAmount,
        remarks: formData.measurement.remarks,
        // Only include job_order_items if bill items exist (optional)
        ...(billItems.length > 0 && {
          job_order_items: billItems.map(item => {
            const materialId = parseInt(item.material_id);
            if (!materialId || isNaN(materialId)) {
              throw new Error(`Invalid material ID for item: ${item.itemName}. Please select a material.`);
            }
            const quantity = parseInt(item.qty) || 1;
            const amount = parseFloat(item.amount) || 0;
            // Calculate sub_total: sub_total = quantity * amount
            const sub_total = quantity * amount;
            return {
              material: materialId,
              quantity: quantity,
              amount: amount,
              sub_total: sub_total,
              remarks: item.remarks || ''
            };
          })
        }),
        job_order_measurements: selectedMaterials.map(material => {
          const materialId = parseInt(material.material_id || material.id);
          if (!materialId || isNaN(materialId)) {
            throw new Error(`Invalid material ID for measurement: ${material.material_name}`);
          }
          // Helper function to convert text input to number for backend
          // Measurement fields are stored as strings (char fields)
          const toMeasurementStr = (value) => (value === '' || value === null || value === undefined ? '' : String(value).trim());
          return {
            material: materialId,
            thool: toMeasurementStr(material.custom_thool),
            kethet: toMeasurementStr(material.custom_kethet),
            thool_kum: toMeasurementStr(material.custom_thool_kum),
            ardh_f_kum: toMeasurementStr(material.custom_ardh_f_kum),
            jamba: toMeasurementStr(material.custom_jamba),
            ragab: toMeasurementStr(material.custom_ragab),
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
          orderDate: formatDateStr(new Date()),
          orderReference: '',
          deliveryDate: '',
          total: 0,
          advance: '',
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
                    if (!selectedCustomer && customerNoSearchQuery.trim() && customerNoSearchResults.length > 0) {
                      setShowCustomerNoDropdown(true);
                    }
                  }}
                  readOnly={!!selectedCustomer}
                  placeholder="Search customer number..."
                  className={`w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${selectedCustomer ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
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
                readOnly={!!selectedCustomer}
                placeholder="Customer name"
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${selectedCustomer ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
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
                readOnly={!!selectedCustomer}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${selectedCustomer ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
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
                readOnly={!!selectedCustomer}
                disabled={isSavingCustomer}
                placeholder="Press Enter to save customer"
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${selectedCustomer ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Balance</label>
              <div className="w-full px-3 py-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg flex items-center justify-between">
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">QAR {formatCurrency(formData.customer.currentBalance)}</span>
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
              Search Material (Name or Number)
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
                placeholder="Search by material name or number..."
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
                              {material.material_number && (
                                <span>Number: {material.material_number} | </span>
                              )}
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
          
          {/* Selected Materials: top chips (8 per row) + single card below */}
          {selectedMaterials.length > 0 ? (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Materials (click to edit):</h4>
              {/* Material name chips - 8 per row, wraps to next row dynamically */}
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 mb-4">
                {selectedMaterials.map((material, index) => {
                  const isActive = index === activeMaterialIndex;
                  return (
                    <button
                      key={material.id}
                      type="button"
                      onClick={() => setActiveMaterialIndex(index)}
                      className={`min-w-0 px-2 py-1.5 rounded-lg border text-xs font-medium truncate text-left transition-colors ${
                        isActive
                          ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500'
                          : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      title={material.material_name}
                    >
                      {material.material_name}
                    </button>
                  );
                })}
              </div>
              {/* Single material card - shows active material only */}
              {(() => {
                const material = selectedMaterials[activeMaterialIndex];
                if (!material) return null;
                const index = activeMaterialIndex;
                return (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
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
                    <div className="grid grid-cols-6 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Thool</label>
                        <input
                          ref={(el) => { if (el) { if (!materialInputRefs.current[material.id]) materialInputRefs.current[material.id] = {}; materialInputRefs.current[material.id].custom_thool = el; } }}
                          type="text"
                          value={material.custom_thool || ''}
                          onChange={(e) => handleMeasurementChange(material.id, 'custom_thool', e.target.value)}
                          onKeyDown={(e) => handleMeasurementKeyDown(material.id, 'custom_thool', e)}
                          onClick={(e) => { if (!isMaterialLocked(material.id)) e.target.focus(); }}
                          readOnly={isMaterialLocked(material.id)}
                          className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMaterialLocked(material.id) ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Kethef</label>
                        <input
                          ref={(el) => { if (el) { if (!materialInputRefs.current[material.id]) materialInputRefs.current[material.id] = {}; materialInputRefs.current[material.id].custom_kethet = el; } }}
                          type="text"
                          value={material.custom_kethet || ''}
                          onChange={(e) => handleMeasurementChange(material.id, 'custom_kethet', e.target.value)}
                          onKeyDown={(e) => handleMeasurementKeyDown(material.id, 'custom_kethet', e)}
                          onClick={(e) => { if (!isMaterialLocked(material.id)) e.target.focus(); }}
                          readOnly={isMaterialLocked(material.id)}
                          className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMaterialLocked(material.id) ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Thool Kum</label>
                        <input
                          ref={(el) => { if (el) { if (!materialInputRefs.current[material.id]) materialInputRefs.current[material.id] = {}; materialInputRefs.current[material.id].custom_thool_kum = el; } }}
                          type="text"
                          value={material.custom_thool_kum || ''}
                          onChange={(e) => handleMeasurementChange(material.id, 'custom_thool_kum', e.target.value)}
                          onKeyDown={(e) => handleMeasurementKeyDown(material.id, 'custom_thool_kum', e)}
                          onClick={(e) => { if (!isMaterialLocked(material.id)) e.target.focus(); }}
                          readOnly={isMaterialLocked(material.id)}
                          className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMaterialLocked(material.id) ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Ardh F Kum</label>
                        <input
                          ref={(el) => { if (el) { if (!materialInputRefs.current[material.id]) materialInputRefs.current[material.id] = {}; materialInputRefs.current[material.id].custom_ardh_f_kum = el; } }}
                          type="text"
                          value={material.custom_ardh_f_kum || ''}
                          onChange={(e) => handleMeasurementChange(material.id, 'custom_ardh_f_kum', e.target.value)}
                          onKeyDown={(e) => handleMeasurementKeyDown(material.id, 'custom_ardh_f_kum', e)}
                          onClick={(e) => { if (!isMaterialLocked(material.id)) e.target.focus(); }}
                          readOnly={isMaterialLocked(material.id)}
                          className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMaterialLocked(material.id) ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Jamba</label>
                        <input
                          ref={(el) => { if (el) { if (!materialInputRefs.current[material.id]) materialInputRefs.current[material.id] = {}; materialInputRefs.current[material.id].custom_jamba = el; } }}
                          type="text"
                          value={material.custom_jamba || ''}
                          onChange={(e) => handleMeasurementChange(material.id, 'custom_jamba', e.target.value)}
                          onKeyDown={(e) => handleMeasurementKeyDown(material.id, 'custom_jamba', e)}
                          onClick={(e) => { if (!isMaterialLocked(material.id)) e.target.focus(); }}
                          readOnly={isMaterialLocked(material.id)}
                          className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMaterialLocked(material.id) ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Ragab</label>
                        <input
                          ref={(el) => { if (el) { if (!materialInputRefs.current[material.id]) materialInputRefs.current[material.id] = {}; materialInputRefs.current[material.id].custom_ragab = el; } }}
                          type="text"
                          value={material.custom_ragab || ''}
                          onChange={(e) => handleMeasurementChange(material.id, 'custom_ragab', e.target.value)}
                          onKeyDown={(e) => handleMeasurementKeyDown(material.id, 'custom_ragab', e)}
                          onClick={(e) => { if (!isMaterialLocked(material.id)) e.target.focus(); }}
                          readOnly={isMaterialLocked(material.id)}
                          className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMaterialLocked(material.id) ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Note1</label>
                          <input
                            ref={(el) => { if (el) { if (!materialInputRefs.current[material.id]) materialInputRefs.current[material.id] = {}; materialInputRefs.current[material.id].note1 = el; } }}
                            type="text"
                            value={material.note1 || ''}
                            onChange={(e) => handleMeasurementChange(material.id, 'note1', e.target.value)}
                            onKeyDown={(e) => handleMeasurementKeyDown(material.id, 'note1', e)}
                            onClick={(e) => { if (!isMaterialLocked(material.id)) e.target.focus(); }}
                            readOnly={isMaterialLocked(material.id)}
                            className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMaterialLocked(material.id) ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
                            placeholder="Note 1"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Note2</label>
                          <input
                            ref={(el) => { if (el) { if (!materialInputRefs.current[material.id]) materialInputRefs.current[material.id] = {}; materialInputRefs.current[material.id].note2 = el; } }}
                            type="text"
                            value={material.note2 || ''}
                            onChange={(e) => handleMeasurementChange(material.id, 'note2', e.target.value)}
                            onKeyDown={(e) => handleMeasurementKeyDown(material.id, 'note2', e)}
                            onClick={(e) => { if (!isMaterialLocked(material.id)) e.target.focus(); }}
                            readOnly={isMaterialLocked(material.id)}
                            className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMaterialLocked(material.id) ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
                            placeholder="Note 2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Note3</label>
                          <input
                            ref={(el) => { if (el) { if (!materialInputRefs.current[material.id]) materialInputRefs.current[material.id] = {}; materialInputRefs.current[material.id].note3 = el; } }}
                            type="text"
                            value={material.note3 || ''}
                            onChange={(e) => handleMeasurementChange(material.id, 'note3', e.target.value)}
                            onKeyDown={(e) => handleMeasurementKeyDown(material.id, 'note3', e)}
                            onClick={(e) => { if (!isMaterialLocked(material.id)) e.target.focus(); }}
                            readOnly={isMaterialLocked(material.id)}
                            className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMaterialLocked(material.id) ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
                            placeholder="Note 3"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Note4</label>
                          <input
                            ref={(el) => { if (el) { if (!materialInputRefs.current[material.id]) materialInputRefs.current[material.id] = {}; materialInputRefs.current[material.id].note4 = el; } }}
                            type="text"
                            value={material.note4 || ''}
                            onChange={(e) => handleMeasurementChange(material.id, 'note4', e.target.value)}
                            onKeyDown={(e) => handleMeasurementKeyDown(material.id, 'note4', e)}
                            onClick={(e) => { if (!isMaterialLocked(material.id)) e.target.focus(); }}
                            readOnly={isMaterialLocked(material.id)}
                            className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMaterialLocked(material.id) ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
                            placeholder="Note 4 (Enter: save material)"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlockMaterial(material.id);
                          }}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs px-2 py-1 rounded border border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleLockMaterial(material.id)}
                          disabled={isMaterialLocked(material.id) || isSavingMeasurement}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-xs px-2 py-1 rounded border border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSavingMeasurement ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                      {isMaterialLocked(material.id) && (
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Saved</span>
                      )}
                      {!isMaterialLocked(material.id) && material.is_customized && (
                        <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">Customized</span>
                      )}
                    </div>
                  </div>
                );
              })()}
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
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Subtotal</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {billItems.length > 0 ? (
                      billItems.map((item) => (
                        <tr key={item.sl} className="hover:bg-gray-50 dark:hover:bg-gray-700 align-top">
                          <td className="px-4 py-4 text-gray-900 dark:text-white">{item.sl}</td>
                          <td className="px-4 py-4" style={{ position: 'relative', verticalAlign: 'top' }}>
                            <div className="relative bill-item-name-search-container">
                              <div className="relative w-full">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                  ref={(el) => { if (el) { if (!billItemInputRefs.current[item.sl]) billItemInputRefs.current[item.sl] = {}; billItemInputRefs.current[item.sl].itemName = el; } }}
                                  type="text"
                                  value={
                                    // If material is selected, show itemName; otherwise show search query or itemName
                                    item.material_id && !billItemNameSearchQueries[item.sl] 
                                      ? item.itemName 
                                      : (billItemNameSearchQueries[item.sl] !== undefined ? billItemNameSearchQueries[item.sl] : item.itemName)
                                  }
                                  onChange={(e) => handleBillItemNameChange(item.sl, e.target.value)}
                                  onKeyDown={(e) => handleBillItemKeyDown(item.sl, 'itemName', e)}
                                  onFocus={() => {
                                    // Only show dropdown if there's an active search query with results
                                    if (billItemNameSearchQueries[item.sl]?.trim() && billItemNameSearchResults[item.sl]?.length > 0) {
                                      setShowBillItemNameDropdowns(prev => ({ ...prev, [item.sl]: true }));
                                    }
                                  }}
                                  placeholder="Search item name..."
                                  className="w-full pl-8 pr-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                {isSearchingBillItemName[item.sl] && (
                                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                  </div>
                                )}
                              </div>
                              {/* Item Name Dropdown */}
                              {showBillItemNameDropdowns[item.sl] && billItemNameSearchResults[item.sl]?.length > 0 && (
                                <div 
                                  className="absolute w-full bg-white dark:bg-gray-800 border-2 border-blue-300 dark:border-blue-600 rounded-lg shadow-2xl overflow-y-auto" 
                                  style={{ 
                                    maxHeight: '300px',
                                    zIndex: 9999,
                                    position: 'fixed',
                                    top: 'auto',
                                    left: 'auto',
                                    right: 'auto',
                                    marginTop: '0'
                                  }}
                                  ref={(el) => {
                                    if (el && !el.dataset.positioned) {
                                      const inputRect = el.previousElementSibling?.getBoundingClientRect();
                                      if (inputRect) {
                                        el.style.top = `${inputRect.bottom + 4}px`;
                                        el.style.left = `${inputRect.left}px`;
                                        el.style.width = `${inputRect.width}px`;
                                        el.dataset.positioned = 'true';
                                      }
                                    }
                                  }}
                                >
                                  {billItemNameSearchResults[item.sl].map((material) => (
                                    <div
                                      key={material.id}
                                      onClick={() => handleBillItemNameSelect(item.sl, material)}
                                      className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors"
                                    >
                                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                                        {material.name}
                                      </div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {material.material_number && (
                                          <span>Number: {material.material_number} | </span>
                                        )}
                                        Price: {formatCurrency(material.price || 0)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <input
                              ref={(el) => { if (el) { if (!billItemInputRefs.current[item.sl]) billItemInputRefs.current[item.sl] = {}; billItemInputRefs.current[item.sl].remarks = el; } }}
                              type="text"
                              value={item.remarks || ''}
                              onChange={(e) => handleBillItemRemarksChange(item.sl, e.target.value)}
                              onKeyDown={(e) => handleBillItemKeyDown(item.sl, 'remarks', e)}
                              placeholder="Remarks..."
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <input
                              ref={(el) => { if (el) { if (!billItemInputRefs.current[item.sl]) billItemInputRefs.current[item.sl] = {}; billItemInputRefs.current[item.sl].qty = el; } }}
                              type="text"
                              value={item.qty}
                              onChange={(e) => handleBillItemQtyChange(item.sl, e.target.value)}
                              onKeyDown={(e) => handleBillItemKeyDown(item.sl, 'qty', e)}
                              className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-4 text-right">
                            <input
                              ref={(el) => { if (el) { if (!billItemInputRefs.current[item.sl]) billItemInputRefs.current[item.sl] = {}; billItemInputRefs.current[item.sl].amount = el; } }}
                              type="text"
                              value={item.amount === 0 || item.amount === '' ? '' : String(item.amount)}
                              onChange={(e) => handleBillItemAmountChange(item.sl, e.target.value)}
                              onKeyDown={(e) => handleBillItemKeyDown(item.sl, 'amount', e)}
                              className="w-24 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Enter amount"
                            />
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="w-24 px-2 py-1 text-right font-medium text-gray-900 dark:text-white">
                              {formatCurrency((parseFloat(item.qty) || 0) * (parseFloat(item.amount) || 0))}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
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
                          No items in bill. Click "Add Item" to manually add bill items (optional).
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
                    ref={orderDateInputRef}
                    type="date"
                    value={formData.bill.orderDate}
                    onChange={(e) => handleFormChange('bill', 'orderDate', e.target.value)}
                    onKeyDown={handleOrderDateKeyDown}
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
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-default focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Advance (-)</label>
                <input
                  ref={advanceInputRef}
                  type="text"
                  value={formData.bill.advance === 0 || formData.bill.advance === '' ? '' : String(formData.bill.advance)}
                  onChange={(e) => handleFormChange('bill', 'advance', e.target.value)}
                  onKeyDown={handleAdvanceKeyDown}
                  className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    advanceError 
                      ? 'border-red-500 dark:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {advanceError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{advanceError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Balance Amount</label>
                <input
                  type="number"
                  value={formData.bill.balance}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-default focus:outline-none"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Date</label>
                <div className="relative">
                  <input
                    ref={deliveryDateInputRef}
                    type="date"
                    value={formData.bill.deliveryDate}
                    onChange={(e) => handleFormChange('bill', 'deliveryDate', e.target.value)}
                    onKeyDown={handleDeliveryDateKeyDown}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
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
        filterByMeasurementRequired={materialSearchType === 'measurement' ? true : null}
        excludeMaterialIds={excludeMaterialIds}
      />
    </div>
  );
}
