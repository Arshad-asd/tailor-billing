import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Save, X, User, Ruler, Calculator, Calendar, Edit, AlertCircle } from 'lucide-react';
import CustomerSearchModal from '../modals/CustomerSearchModal';
import CustomerModal from '../modals/CustomerModal';
import MaterialSearchModal from '../modals/MaterialSearchModal';
import customerApi from '../../services/customerApi';
import materialsApi from '../../services/materialsApi';
import jobOrdersApi from '../../services/jobOrdersApi';
import { formatCurrency, safeParseFloat } from '../../utils/currencyUtils';

export default function EditJobOrder({ jobOrderId, onClose, onSuccess }) {
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
  // Material measurement cards: when Save is clicked, inputs become read-only until Edit is clicked
  const [lockedMaterialIds, setLockedMaterialIds] = useState([]);
  
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
  
  // State for bill item name search
  const [billItemNameSearchQueries, setBillItemNameSearchQueries] = useState({}); // { itemSl: searchQuery }
  const [billItemNameSearchResults, setBillItemNameSearchResults] = useState({}); // { itemSl: results[] }
  const [showBillItemNameDropdowns, setShowBillItemNameDropdowns] = useState({}); // { itemSl: boolean }
  const [isSearchingBillItemName, setIsSearchingBillItemName] = useState({}); // { itemSl: boolean }
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [sectionLoading, setSectionLoading] = useState({
    customer: false,
    measurement: false,
    bill: false
  });
  const [sectionError, setSectionError] = useState({
    customer: null,
    measurement: null,
    bill: null
  });
  const [measurementLoading, setMeasurementLoading] = useState({}); // Track loading state for individual measurements
  const [measurementError, setMeasurementError] = useState({}); // Track errors for individual measurements

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
      orderDate: '',
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

  // Load job order data on component mount
  useEffect(() => {
    const loadJobOrderData = async () => {
      if (!jobOrderId) return;
      
      setIsLoadingData(true);
      try {
        const jobOrder = await jobOrdersApi.getJobOrder(jobOrderId);
        
        // Set customer data
        if (jobOrder.customer) {
          // Create customer object from available data
          const customerData = {
            id: jobOrder.customer,
            customer_id: jobOrder.customer.toString(),
            name: jobOrder.customer_name || '',
            phone: jobOrder.customer_phone || '',
            balance: 0 // Default balance since it's not in the response
          };
          
          setSelectedCustomer(customerData);
          setFormData(prev => ({
            ...prev,
            customer: {
              customerNo: customerData.customer_id,
              customerName: customerData.name,
              customerReference: customerData.customer_id,
              mobileNo: customerData.phone,
              currentBalance: safeParseFloat(customerData.balance, 0)
            }
          }));
        }

        // Set bill data
        setFormData(prev => ({
          ...prev,
          bill: {
            orderDate: jobOrder.created_at ? jobOrder.created_at.split('T')[0] : '',
            orderReference: jobOrder.job_order_number || '',
            deliveryDate: jobOrder.delivery_date ? jobOrder.delivery_date.split('T')[0] : '',
            total: jobOrder.total_amount || 0,
            advance: jobOrder.advance_amount || 0,
            balance: jobOrder.balance_amount || 0,
            paymentMethod: jobOrder.payment_method || 'cash',
            cashAmount: jobOrder.cash_amount || 0,
            cardAmount: jobOrder.card_amount || 0
          },
          measurement: {
            remarks: jobOrder.remarks || '',
            notes: '',
            extraField1: '',
            extraField2: ''
          }
        }));

        // Set job order items
        if (jobOrder.job_order_items) {
          const items = jobOrder.job_order_items.map((item, index) => {
            const qty = parseInt(item.quantity) || 1;
            const fees = parseFloat(item.fees) || 0;
            const amount = parseFloat(item.total_amount) || (fees * qty);
            return {
              sl: index + 1,
              itemName: item.material_name || 'Item',
              remarks: item.remarks || 'Custom tailoring service',
              qty: qty.toString(), // Convert to string for text input
              fees: fees,
              amount: amount === 0 ? '' : amount.toString(), // Convert to string, empty if 0
              material_id: item.material
            };
          });
          setBillItems(items);
          updateBillTotal(items);
          // Initialize search queries for bill items
          const searchQueries = {};
          items.forEach(item => {
            searchQueries[item.sl] = item.itemName;
          });
          setBillItemNameSearchQueries(searchQueries);
        }

        // Set measurements
        if (jobOrder.job_order_measurements) {
          // First, create materials array with basic data
          const materials = await Promise.all(
            jobOrder.job_order_measurements.map(async (measurement, index) => {
              // Find the corresponding item to get the price
              const correspondingItem = jobOrder.job_order_items?.find(item => item.material === measurement.material);
              const materialPrice = correspondingItem ? parseFloat(correspondingItem.material_price) : 0;
              
              // Handle both cases: material as ID or as object
              let materialId = typeof measurement.material === 'object' ? measurement.material.id : measurement.material;
              
              // Ensure materialId is a valid number, if not try to get it from measurement.id
              if (!materialId || isNaN(parseInt(materialId))) {
                materialId = measurement.id || measurement.material_id;
              }
              
              // If still no valid ID, use a unique identifier (but this should be rare)
              if (!materialId || isNaN(parseInt(materialId))) {
                console.warn(`Warning: Measurement at index ${index} has no valid material ID. Using temporary ID.`);
                materialId = `temp_${index}`;
              }
              
              const materialName = measurement.material_name || (typeof measurement.material === 'object' ? measurement.material.name : 'Material');
              
              // Ensure material_id is always a number (or string that can be parsed)
              const finalMaterialId = typeof materialId === 'number' ? materialId : parseInt(materialId);
              
              // Check if material exists in database
              let materialExists = false;
              let materialError = null;
              if (finalMaterialId && !isNaN(finalMaterialId) && finalMaterialId > 0) {
                try {
                  await materialsApi.getMaterial(finalMaterialId);
                  materialExists = true;
                } catch (error) {
                  if (error.response?.status === 404) {
                    materialExists = false;
                    materialError = `Material (ID: ${finalMaterialId}) no longer exists in database`;
                  } else {
                    // Network error or other issue - assume it might exist
                    materialExists = true;
                    materialError = null;
                  }
                }
              } else {
                materialError = 'Invalid material ID';
              }
              
              return {
                id: finalMaterialId || index + 1,
                measurement_id: measurement.id, // Store the measurement ID from database
                material_id: finalMaterialId,
                material_name: materialName,
                material_price: materialPrice,
                material_exists: materialExists,
                material_error: materialError,
                measurements: {
                  thool: measurement.thool || 0,
                  kethet: measurement.kethet || 0,
                  thool_kum: measurement.thool_kum || 0,
                  ardh_f_kum: measurement.ardh_f_kum || 0,
                  jamba: measurement.jamba || 0,
                  ragab: measurement.ragab || 0
                },
                custom_thool: measurement.thool ? Math.round(parseFloat(measurement.thool)).toString() : '',
                custom_kethet: measurement.kethet ? Math.round(parseFloat(measurement.kethet)).toString() : '',
                custom_thool_kum: measurement.thool_kum ? Math.round(parseFloat(measurement.thool_kum)).toString() : '',
                custom_ardh_f_kum: measurement.ardh_f_kum ? Math.round(parseFloat(measurement.ardh_f_kum)).toString() : '',
                custom_jamba: measurement.jamba ? Math.round(parseFloat(measurement.jamba)).toString() : '',
                custom_ragab: measurement.ragab ? Math.round(parseFloat(measurement.ragab)).toString() : '',
                note1: measurement.note1 || '',
                note2: measurement.note2 || '',
                note3: measurement.note3 || '',
                note4: measurement.note4 || '',
                is_customized: true
              };
            })
          );
          setSelectedMaterials(materials);
          
          // Show warning if any materials don't exist
          const invalidMaterials = materials.filter(m => !m.material_exists);
          if (invalidMaterials.length > 0) {
            const errorMsg = `Warning: ${invalidMaterials.length} material(s) no longer exist in the database and cannot be saved. Please remove them: ${invalidMaterials.map(m => m.material_name || `ID: ${m.material_id}`).join(', ')}`;
            setSectionError(prev => ({ ...prev, measurement: errorMsg }));
            setTimeout(() => {
              setSectionError(prev => ({ ...prev, measurement: null }));
            }, 10000); // Show for 10 seconds
          }
        }

      } catch (error) {
        console.error('Error loading job order:', error);
        setError('Failed to load job order data');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadJobOrderData();
  }, [jobOrderId]);

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
        return { ...item, itemName: value };
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
    const updatedBillItems = billItems.map(item => {
      if (item.sl === itemSl) {
        return {
          ...item,
          itemName: materialName,
          material_id: materialId
        };
      }
      return item;
    });
    setBillItems(updatedBillItems);
    // Set search query to selected material name so it displays in the input
    setBillItemNameSearchQueries(prev => ({ ...prev, [itemSl]: materialName }));
    setShowBillItemNameDropdowns(prev => ({ ...prev, [itemSl]: false }));
    setBillItemNameSearchResults(prev => ({ ...prev, [itemSl]: [] }));
    // Focus on remarks input after dropdown closes
    setTimeout(() => {
      billItemInputRefs.current[itemSl]?.remarks?.focus();
    }, 100);
  };

  // Handle bill item remarks change
  const handleBillItemRemarksChange = (itemSl, value) => {
    const updatedBillItems = billItems.map(item => {
      if (item.sl === itemSl) {
        return { ...item, remarks: value };
      }
      return item;
    });
    setBillItems(updatedBillItems);
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

  const handleCloseCustomerModal = () => {
    setIsCustomerModalOpen(false);
    setEditingCustomer(null);
    setIsEditCustomer(false);
  };

  // When materials are selected/added, focus the first measurement input of the newly added material
  useEffect(() => {
    if (selectedMaterials.length > prevMaterialsLengthRef.current) {
      prevMaterialsLengthRef.current = selectedMaterials.length;
      const lastMaterial = selectedMaterials[selectedMaterials.length - 1];
      if (lastMaterial) {
        setTimeout(() => {
          materialInputRefs.current[lastMaterial.id]?.custom_thool?.focus();
        }, 50);
      }
    } else if (selectedMaterials.length < prevMaterialsLengthRef.current) {
      prevMaterialsLengthRef.current = selectedMaterials.length;
    }
  }, [selectedMaterials]);

  // When a material is removed, remove its id from lockedMaterialIds
  useEffect(() => {
    setLockedMaterialIds(prev => prev.filter(id => selectedMaterials.some(m => m.id === id)));
  }, [selectedMaterials]);

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
            // Keep existing fees and amount - user will enter manually
            return {
              ...item,
              material_id: materialId,
              itemName: item.itemName === 'New Item' ? material.name : item.itemName
            };
          }
          return item;
        });
        setBillItems(updatedBillItems);
        updateBillTotal(updatedBillItems);
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
      setIsMaterialSearchOpen(false);
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

  const handleLockMaterial = (materialId) => {
    setLockedMaterialIds(prev => (prev.includes(materialId) ? prev : [...prev, materialId]));
  };

  const handleUnlockMaterial = (materialId) => {
    setLockedMaterialIds(prev => prev.filter(id => id !== materialId));
  };

  const handleResetMeasurements = (materialId) => {
    setSelectedMaterials(prev => 
      prev.map(material => 
        material.id === materialId 
          ? { 
              ...material, 
              custom_thool: material.measurements.thool,
              custom_kethet: material.measurements.kethet,
              custom_thool_kum: material.measurements.thool_kum,
              custom_ardh_f_kum: material.measurements.ardh_f_kum,
              custom_jamba: material.measurements.jamba,
              custom_ragab: material.measurements.ragab,
              is_customized: false
            }
          : material
      )
    );
  };

  // Handle customer section update
  const handleSaveCustomerSection = async () => {
    setSectionLoading(prev => ({ ...prev, customer: true }));
    setSectionError(prev => ({ ...prev, customer: null }));

    try {
      // Note: Customer assignment (which customer is linked to the job order) is read-only
      // However, we can update the customer's details if they were edited
      if (selectedCustomer) {
        // Update customer details through customer API if they were changed
        const customerUpdateData = {};
        if (formData.customer.customerName !== selectedCustomer.name) {
          customerUpdateData.name = formData.customer.customerName;
        }
        if (formData.customer.mobileNo !== selectedCustomer.phone) {
          customerUpdateData.phone = formData.customer.mobileNo;
        }
        if (formData.customer.customerNo !== selectedCustomer.customer_id) {
          customerUpdateData.customer_id = formData.customer.customerNo;
        }
        
        if (Object.keys(customerUpdateData).length > 0) {
          await customerApi.patchCustomer(selectedCustomer.id, customerUpdateData);
          // Refresh selected customer data
          const updatedCustomer = await customerApi.getCustomer(selectedCustomer.id);
          setSelectedCustomer(updatedCustomer);
        }
      }
      
      // Show success message
      setSectionError(prev => ({ ...prev, customer: 'Customer information updated successfully' }));
      setTimeout(() => {
        setSectionError(prev => ({ ...prev, customer: null }));
      }, 3000);
      
    } catch (error) {
      console.error('Error updating customer:', error);
      setSectionError(prev => ({ 
        ...prev, 
        customer: error.response?.data?.error || error.response?.data?.detail || 'Failed to update customer information' 
      }));
    } finally {
      setSectionLoading(prev => ({ ...prev, customer: false }));
    }
  };

  // Handle measurement section update (all measurements)
  const handleSaveMeasurements = async () => {
    setSectionLoading(prev => ({ ...prev, measurement: true }));
    setSectionError(prev => ({ ...prev, measurement: null }));

    try {
      // Validate all materials exist before attempting to save
      const invalidMaterials = [];
      for (const material of selectedMaterials) {
        const materialId = parseInt(material.material_id);
        if (!materialId || isNaN(materialId)) {
          invalidMaterials.push({ material, reason: 'Invalid material ID' });
          continue;
        }
        
        try {
          await materialsApi.getMaterial(materialId);
        } catch (materialError) {
          if (materialError.response?.status === 404) {
            invalidMaterials.push({ 
              material, 
              reason: `Material "${material.material_name || 'Unknown'}" (ID: ${materialId}) no longer exists` 
            });
          }
        }
      }
      
      if (invalidMaterials.length > 0) {
        const errorMessages = invalidMaterials.map(({ material, reason }) => 
          `${material.material_name || 'Unknown material'}: ${reason}`
        );
        throw new Error(`Cannot save measurements. The following materials are invalid:\n${errorMessages.join('\n')}\n\nPlease remove these materials from the job order.`);
      }

      // Helper function to convert text input to number for backend
      // Allows text input in UI but converts to number when saving
      const parseMeasurement = (value) => {
        if (value === '' || value === null || value === undefined) return 0;
        // Try to extract numeric value from text
        const num = parseFloat(String(value).replace(/[^\d.-]/g, ''));
        if (isNaN(num)) return 0;
        return Math.round(num); // Convert to integer, removing decimal point
      };

      const measurementsPayload = {
        job_order_measurements: selectedMaterials.map(material => {
          const materialId = parseInt(material.material_id);
          if (!materialId || isNaN(materialId)) {
            throw new Error(`Invalid material ID: ${material.material_id}`);
          }
          
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

      const result = await jobOrdersApi.updateMeasurements(jobOrderId, measurementsPayload);
      console.log('Measurements updated successfully:', result);
      
      setSectionError(prev => ({ ...prev, measurement: 'Measurements updated successfully' }));
      setTimeout(() => {
        setSectionError(prev => ({ ...prev, measurement: null }));
      }, 3000);
      
    } catch (error) {
      console.error('Error updating measurements:', error);
      
      // Parse backend error messages to extract material ID
      let errorMessage = error.message || 'Failed to update measurements';
      
      if (error.response?.data?.error) {
        const backendError = error.response.data.error;
        errorMessage = backendError;
        
        // Check if error mentions a material ID that doesn't exist
        const materialIdMatch = backendError.match(/Material with ID (\d+) does not exist/);
        if (materialIdMatch) {
          const missingMaterialId = materialIdMatch[1];
          const missingMaterial = selectedMaterials.find(m => {
            const mId = parseInt(m.material_id);
            return mId === parseInt(missingMaterialId);
          });
          
          if (missingMaterial) {
            errorMessage = `Material "${missingMaterial.material_name || 'Unknown'}" (ID: ${missingMaterialId}) no longer exists in the database. Please remove this measurement from the job order.`;
          } else {
            errorMessage = `Material with ID ${missingMaterialId} does not exist. This material may have been deleted. Please remove this measurement from the job order.`;
          }
        }
      }
      
      setSectionError(prev => ({ 
        ...prev, 
        measurement: errorMessage
      }));
    } finally {
      setSectionLoading(prev => ({ ...prev, measurement: false }));
    }
  };

  // Handle individual measurement update
  const handleSaveSingleMeasurement = async (materialId) => {
    setMeasurementLoading(prev => ({ ...prev, [materialId]: true }));
    setMeasurementError(prev => ({ ...prev, [materialId]: null }));

    try {
      const material = selectedMaterials.find(m => m.id === materialId || m.material_id === materialId);
      if (!material) {
        throw new Error('Material not found in selected materials');
      }

      // Check if we have a measurement_id (for existing measurements)
      if (!material.measurement_id) {
        throw new Error(`Measurement ID is missing for material: ${material.material_name || 'Unknown'}. This measurement may not have been saved yet. Please use "Save All" to create it first.`);
      }

      // Validate material_id exists and is valid
      if (material.material_id === undefined || material.material_id === null) {
        throw new Error(`Material ID is missing for material: ${material.material_name || 'Unknown'}. Please reload the page or re-add this material.`);
      }

      // Handle both number and string material_id
      let materialIdInt;
      if (typeof material.material_id === 'string' && material.material_id.startsWith('temp_')) {
        throw new Error(`Cannot save measurement: Material "${material.material_name || 'Unknown'}" has a temporary ID. Please reload the page or re-add this material.`);
      }
      
      materialIdInt = parseInt(material.material_id);
      if (isNaN(materialIdInt) || materialIdInt <= 0) {
        throw new Error(`Invalid material ID: ${material.material_id} for material: ${material.material_name || 'Unknown'}`);
      }

      // Validate that the material exists in the database before saving
      try {
        await materialsApi.getMaterial(materialIdInt);
      } catch (materialError) {
        if (materialError.response?.status === 404) {
          throw new Error(`Material "${material.material_name || 'Unknown'}" (ID: ${materialIdInt}) no longer exists in the database. Please remove this measurement or contact support.`);
        }
        // If it's not a 404, continue (might be a network error, but material might still exist)
        console.warn('Could not verify material existence:', materialError);
      }

      // Helper function to convert text input to number for backend
      // Allows text input in UI but converts to number when saving
      const parseMeasurement = (value) => {
        if (value === '' || value === null || value === undefined) return 0;
        // Try to extract numeric value from text
        const num = parseFloat(String(value).replace(/[^\d.-]/g, ''));
        if (isNaN(num)) return 0;
        return Math.round(num); // Convert to integer, removing decimal point
      };

      // Prepare payload for single measurement update
      const measurementPayload = {
        material: materialIdInt,
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

      // Update only this single measurement
      const result = await jobOrdersApi.updateSingleMeasurement(jobOrderId, material.measurement_id, measurementPayload);
      console.log('Single measurement updated successfully:', result);
      
      // Mark this measurement as saved (not customized anymore)
      setSelectedMaterials(prev => 
        prev.map(m => 
          (m.id === materialId || m.material_id === materialId)
            ? { ...m, is_customized: false }
            : m
        )
      );
      
      setMeasurementError(prev => ({ ...prev, [materialId]: 'Measurement updated successfully' }));
      setTimeout(() => {
        setMeasurementError(prev => ({ ...prev, [materialId]: null }));
      }, 3000);
      
    } catch (error) {
      console.error('Error updating measurement:', error);
      
      // Parse backend error messages to extract material ID
      let errorMessage = error.message || 'Failed to update measurement';
      
      if (error.response?.data?.error) {
        const backendError = error.response.data.error;
        errorMessage = backendError;
        
        // Check if error mentions a material ID that doesn't exist
        const materialIdMatch = backendError.match(/Material with ID (\d+) does not exist/);
        if (materialIdMatch) {
          const missingMaterialId = materialIdMatch[1];
          const missingMaterial = selectedMaterials.find(m => {
            const mId = parseInt(m.material_id);
            return mId === parseInt(missingMaterialId);
          });
          
          if (missingMaterial) {
            errorMessage = `Material "${missingMaterial.material_name || 'Unknown'}" (ID: ${missingMaterialId}) no longer exists in the database. Please remove this measurement from the job order.`;
          } else {
            errorMessage = `Material with ID ${missingMaterialId} does not exist. This material may have been deleted. Please remove this measurement from the job order.`;
          }
        }
      }
      
      setMeasurementError(prev => ({ 
        ...prev, 
        [materialId]: errorMessage
      }));
    } finally {
      setMeasurementLoading(prev => ({ ...prev, [materialId]: false }));
    }
  };

  // Handle bill section update
  const handleSaveBill = async () => {
    setSectionLoading(prev => ({ ...prev, bill: true }));
    setSectionError(prev => ({ ...prev, bill: null }));

    try {
      // Always send job_order_items (even if empty) so backend can delete removed items
      const billPayload = {
        delivery_date: formData.bill.deliveryDate ? new Date(formData.bill.deliveryDate).toISOString() : null,
        total_amount: formData.bill.total,
        advance_amount: formData.bill.advance,
        payment_method: formData.bill.paymentMethod,
        cash_amount: formData.bill.cashAmount,
        card_amount: formData.bill.cardAmount,
        remarks: formData.measurement.remarks,
        job_order_items: billItems.length > 0 ? billItems.map(item => {
          const materialId = parseInt(item.material_id);
          if (!materialId || isNaN(materialId)) {
            throw new Error(`Invalid material ID for item: ${item.itemName}. Please select a material.`);
          }
          return {
            material: materialId,
            quantity: parseInt(item.qty) || 1,
            fees: parseFloat(item.fees) || 0
          };
        }) : [] // Send empty array to delete all items
      };

      const result = await jobOrdersApi.updateBill(jobOrderId, billPayload);
      console.log('Bill updated successfully:', result);
      
      // Update local state with response data
      if (result) {
        setFormData(prev => ({
          ...prev,
          bill: {
            ...prev.bill,
            total: result.total_amount || prev.bill.total,
            advance: result.advance_amount || prev.bill.advance,
            balance: result.balance_amount || prev.bill.balance,
            paymentMethod: result.payment_method || prev.bill.paymentMethod,
            cashAmount: result.cash_amount || prev.bill.cashAmount,
            cardAmount: result.card_amount || prev.bill.cardAmount
          },
          measurement: {
            ...prev.measurement,
            remarks: result.remarks || prev.measurement.remarks
          }
        }));
      }
      
      setSectionError(prev => ({ ...prev, bill: 'Bill information updated successfully' }));
      setTimeout(() => {
        setSectionError(prev => ({ ...prev, bill: null }));
      }, 3000);
      
    } catch (error) {
      console.error('Error updating bill:', error);
      setSectionError(prev => ({ 
        ...prev, 
        bill: error.response?.data?.error || 'Failed to update bill information' 
      }));
    } finally {
      setSectionLoading(prev => ({ ...prev, bill: false }));
    }
  };

  const handleSaveAll = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare job order payload for update
      const jobOrderPayload = {
        status: 'pending', // You might want to make this editable
        delivery_date: formData.bill.deliveryDate ? new Date(formData.bill.deliveryDate).toISOString() : null,
        total_amount: formData.bill.total,
        advance_amount: formData.bill.advance,
        balance_amount: formData.bill.balance,
        payment_method: formData.bill.paymentMethod,
        cash_amount: formData.bill.cashAmount,
        card_amount: formData.bill.cardAmount,
        remarks: formData.measurement.remarks,
        // Always send job_order_items (even if empty) so backend can delete removed items
        job_order_items: billItems.length > 0 ? billItems.map(item => {
          const materialId = parseInt(item.material_id);
          if (!materialId || isNaN(materialId)) {
            throw new Error(`Invalid material ID for item: ${item.itemName}. Please select a material.`);
          }
          return {
            material: materialId,
            quantity: parseInt(item.qty) || 1,
            fees: parseFloat(item.fees) || 0
          };
        }) : [], // Send empty array to delete all items
        job_order_measurements: selectedMaterials.map(material => {
          const materialId = parseInt(material.material_id || material.id);
          if (!materialId || isNaN(materialId)) {
            throw new Error(`Invalid material ID for measurement: ${material.material_name}`);
          }
          // Helper function to convert text input to number for backend
          // Allows text input in UI but converts to number when saving
          const parseMeasurement = (value) => {
            if (value === '' || value === null || value === undefined) return 0;
            // Try to extract numeric value from text
            const num = parseFloat(String(value).replace(/[^\d.-]/g, ''));
            if (isNaN(num)) return 0;
            return Math.round(num); // Convert to integer, removing decimal point
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

      const result = await jobOrdersApi.updateJobOrder(jobOrderId, jobOrderPayload);
      console.log('Job order updated successfully:', result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
    } catch (error) {
      console.error('Error updating job order:', error);
      setError(error.response?.data?.error || 'Failed to update job order');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading job order data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Form Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Edit Job Order
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Editing: {formData.bill.orderReference}
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

      {/* Form Content - Same as AddJobOrder but with pre-filled data */}
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
                <Edit className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button 
                onClick={handleCustomerSearch}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <Search className="w-3 h-3" />
                <span>Find</span>
              </button>
              <button 
                onClick={handleSaveCustomerSection}
                disabled={sectionLoading.customer}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-3 h-3" />
                <span>{sectionLoading.customer ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Customer</span>
            </h3>
          </div>
          
          {/* Customer Section Error/Success Message */}
          {sectionError.customer && (
            <div className={`mb-4 p-3 rounded-lg ${
              sectionError.customer.includes('successfully') 
                ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700' 
                : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'
            }`}>
              <p className={`text-sm ${
                sectionError.customer.includes('successfully')
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {sectionError.customer}
              </p>
            </div>
          )}
          
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mobile No</label>
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
                readOnly={!!selectedCustomer}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${selectedCustomer ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
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

        {/* Measurement Section - Same as AddJobOrder */}
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
              <button 
                onClick={handleSaveMeasurements}
                disabled={sectionLoading.measurement || selectedMaterials.length === 0}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-3 h-3" />
                <span>{sectionLoading.measurement ? 'Saving...' : 'Save'}</span>
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
          
          {/* Measurement Section Error/Success Message */}
          {sectionError.measurement && (
            <div className={`mb-4 p-3 rounded-lg ${
              sectionError.measurement.includes('successfully') 
                ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700' 
                : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'
            }`}>
              <p className={`text-sm ${
                sectionError.measurement.includes('successfully')
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {sectionError.measurement}
              </p>
            </div>
          )}

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
          
          {/* Selected Materials Display - Card Format with Individual Notes */}
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
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-gray-900 dark:text-white">{material.material_name}</h5>
                            {material.material_exists === false && (
                              <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs font-medium px-2 py-0.5 rounded-full flex items-center space-x-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Material Deleted</span>
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Price: {formatCurrency(material.material_price)}
                            {material.material_id && (
                              <span className="ml-2">(ID: {material.material_id})</span>
                            )}
                          </p>
                          {material.material_error && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              ⚠️ {material.material_error}
                            </p>
                          )}
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
                          ref={(el) => { if (el) { if (!materialInputRefs.current[material.id]) materialInputRefs.current[material.id] = {}; materialInputRefs.current[material.id].custom_thool = el; } }}
                          type="text"
                          value={material.custom_thool || ''}
                          onChange={(e) => handleMeasurementChange(material.id, 'custom_thool', e.target.value)}
                          onKeyDown={(e) => handleMeasurementKeyDown(material.id, 'custom_thool', e)}
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
                          readOnly={isMaterialLocked(material.id)}
                          className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMaterialLocked(material.id) ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Notes section for each material */}
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
                            readOnly={isMaterialLocked(material.id)}
                            className={`w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${isMaterialLocked(material.id) ? 'cursor-default bg-gray-100 dark:bg-gray-600' : ''}`}
                            placeholder="Note 4 (Enter: save material)"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Edit/Save buttons for each material */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUnlockMaterial(material.id)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs px-2 py-1 rounded border border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleLockMaterial(material.id);
                            handleSaveSingleMeasurement(material.id);
                          }}
                          disabled={measurementLoading[material.id] || material.material_exists === false || isMaterialLocked(material.id)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-xs px-2 py-1 rounded border border-green-300 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                          title={material.material_exists === false ? 'Cannot save: Material no longer exists in database' : 'Save this measurement'}
                        >
                          {measurementLoading[material.id] ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></div>
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3 h-3" />
                              <span>Save</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleResetMeasurements(material.id)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs px-2 py-1 rounded border border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900"
                        >
                          Reset
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isMaterialLocked(material.id) && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Saved
                          </span>
                        )}
                        {!isMaterialLocked(material.id) && material.is_customized && (
                          <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                            Customized
                          </span>
                        )}
                        {measurementError[material.id] && (
                          <span className={`text-xs font-medium ${
                            measurementError[material.id].includes('successfully')
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {measurementError[material.id].includes('successfully') ? '✓ Saved' : '✗ Error'}
                          </span>
                        )}
                      </div>
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

        {/* Bill Section - Same as AddJobOrder */}
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
              <button 
                onClick={handleSaveBill}
                disabled={sectionLoading.bill}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-3 h-3" />
                <span>{sectionLoading.bill ? 'Saving...' : 'Save'}</span>
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
          
          {/* Bill Section Error/Success Message */}
          {sectionError.bill && (
            <div className={`mb-4 p-3 rounded-lg ${
              sectionError.bill.includes('successfully') 
                ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700' 
                : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'
            }`}>
              <p className={`text-sm ${
                sectionError.bill.includes('successfully')
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {sectionError.bill}
              </p>
            </div>
          )}
          
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
                                  value={billItemNameSearchQueries[item.sl] !== undefined ? billItemNameSearchQueries[item.sl] : item.itemName}
                                  onChange={(e) => handleBillItemNameChange(item.sl, e.target.value)}
                                  onKeyDown={(e) => handleBillItemKeyDown(item.sl, 'itemName', e)}
                                  onFocus={() => {
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
                              value={item.remarks}
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
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
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
            <span>{isLoading ? 'Updating...' : 'Update'}</span>
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
      />
    </div>
  );
}
