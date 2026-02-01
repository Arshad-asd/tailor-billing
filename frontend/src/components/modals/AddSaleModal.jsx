import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Trash2, Search, X } from "lucide-react";
import { inventoryAPI } from "../../services/inventoryApi";

export default function AddSaleModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    customerName: "Al-Kharthoum Shop",
    date: "",
    paymentMethod: "cash",
    status: "completed",
    notes: "",
  });
  const [saleItems, setSaleItems] = useState([{ id: Date.now(), item: null, item_name: "", item_number: "", item_sku: "", quantity: 1, price: 0, total_amount: 0, searchTerm: "", isSearching: false }]);
  const [allItems, setAllItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const itemSearchInputRef = useRef(null);
  const qtyRefs = useRef({});
  const priceRefs = useRef({});
  const notesRef = useRef(null);
  const saveButtonRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Load items when modal opens
  useEffect(() => {
    if (open) {
      loadItems();
    }
  }, [open]);

  // Focus item search input when modal opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => itemSearchInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const loadItems = async () => {
    try {
      setLoadingItems(true);
      const response = await inventoryAPI.getItems();
      setAllItems(response || []);
    } catch (err) {
      console.error('Error loading items:', err);
      setAllItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleItemSelect = (itemId, selectedItem) => {
    setSaleItems(prev => {
      const currentIndex = prev.findIndex(item => item.id === itemId);
      const updatedItem = {
        ...prev[currentIndex],
        item: selectedItem.id,
        item_name: selectedItem.name,
        item_number: selectedItem.item_number || "",
        item_sku: selectedItem.sku || "",
        searchTerm: selectedItem.name,
        isSearching: false
      };
      const newRow = {
        id: Date.now() + Math.random(),
        item: null,
        item_name: "",
        item_number: "",
        item_sku: "",
        quantity: 1,
        price: 0,
        total_amount: 0,
        searchTerm: "",
        isSearching: false
      };
      const rest = prev.filter((_, i) => i !== currentIndex);
      // Keep only one empty row: drop other empty rows to avoid duplicates
      const restWithoutEmpty = rest.filter((row) => row.item != null);
      return [updatedItem, newRow, ...restWithoutEmpty];
    });
  };

  const handleItemSearchChange = (itemId, searchTerm) => {
    setSaleItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, searchTerm, isSearching: searchTerm.length > 0 };
      }
      return item;
    }));
  };

  const handleItemSearchKeyDown = (e, saleItem) => {
    if (e.key !== "Enter") return;
    const filtered = getFilteredItems(saleItem.id);
    if (filtered.length > 0) {
      e.preventDefault();
      handleItemSelect(saleItem.id, filtered[0]);
      setTimeout(() => qtyRefs.current[saleItem.id]?.focus(), 0);
    }
  };

  const getFilteredItems = (itemId) => {
    const saleItem = saleItems.find(item => item.id === itemId);
    if (!saleItem || !saleItem.searchTerm) return [];
    const term = saleItem.searchTerm.toLowerCase();
    return allItems.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(term) ||
                           item.sku?.toLowerCase().includes(term) ||
                           (item.item_number || "").toLowerCase().includes(term);
      const notAlreadySelected = !saleItems.some(si => si.item === item.id && si.id !== itemId);
      return matchesSearch && notAlreadySelected;
    }).slice(0, 10); // Limit to 10 results
  };

  const handleRemoveItem = (itemId) => {
    setSaleItems(prev => {
      const filtered = prev.filter(item => item.id !== itemId);
      // Always keep at least one empty row
      if (filtered.length === 0) {
        return [{ id: Date.now(), item: null, item_name: "", item_number: "", item_sku: "", quantity: 1, price: 0, total_amount: 0, searchTerm: "", isSearching: false }];
      }
      return filtered;
    });
  };

  const handleItemQuantityChange = (itemId, quantity) => {
    setSaleItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const qty = quantity === "" ? "" : (isNaN(parseFloat(quantity)) ? 0 : parseFloat(quantity));
        const price = parseFloat(item.price) || 0;
        const newTotal = (qty === "" || qty === 0) ? 0 : qty * price;
        return { ...item, quantity: qty, total_amount: newTotal };
      }
      return item;
    }));
  };

  const handleItemPriceChange = (itemId, price) => {
    setSaleItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const prc = price === "" ? "" : (isNaN(parseFloat(price)) ? 0 : parseFloat(price));
        const qty = parseFloat(item.quantity) || 0;
        const newTotal = (prc === "" || prc === 0) ? 0 : qty * prc;
        return { ...item, price: prc, total_amount: newTotal };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return saleItems.reduce((sum, item) => sum + parseFloat(item.total_amount || 0), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalAmount = calculateTotal();
    const formData = {
      ...form,
      amount: totalAmount,
      total_amount: totalAmount,
      sale_items: saleItems
        .filter(item => item.item !== null) // Only include items that have been selected
        .map(item => ({
          item: item.item,
          quantity: item.quantity === "" ? 0 : (parseFloat(item.quantity) || 0),
          price: item.price === "" ? 0 : (parseFloat(item.price) || 0),
          total_amount: item.total_amount || 0
        }))
    };
    onSubmit(formData);
    setForm({
      customerName: "Khartoum",
      date: "",
      paymentMethod: "cash",
      status: "completed",
      notes: "",
    });
    setSaleItems([{ id: Date.now(), item: null, item_name: "", item_number: "", item_sku: "", quantity: 1, price: 0, total_amount: 0, searchTerm: "", isSearching: false }]);
  };

  const handleClose = () => {
    setForm({
      customerName: "Khartoum",
      date: "",
      paymentMethod: "cash",
      status: "completed",
      notes: "",
    });
    setSaleItems([{ id: Date.now(), item: null, item_name: "", item_number: "", item_sku: "", quantity: 1, price: 0, total_amount: 0, searchTerm: "", isSearching: false }]);
    onClose();
  };

  // Set default date, customer name, status, and payment method when modal opens
  React.useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split('T')[0];
      setForm(prev => ({ 
        ...prev, 
        date: prev.date || today,
        customerName: prev.customerName || "Al-Kharthoum Shop",
        paymentMethod: prev.paymentMethod || "cash",
        status: prev.status || "completed"
      }));
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!w-[90vh] !h-[90vh] !max-w-[90vh] !max-h-[90vh] p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full gap-3 p-4 overflow-hidden">
          <DialogHeader className="pb-2 flex-shrink-0">
            <DialogTitle className="text-xl">Add New Sale</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Create a new sale record. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customerName" className="text-sm">Customer Name</Label>
              <Input
                id="customerName"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Enter customer name"
                required
              />
            </div>



            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date" className="text-sm">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="paymentMethod" className="text-sm">Payment Method</Label>
              <Select value={form.paymentMethod} onValueChange={(value) => handleSelectChange("paymentMethod", value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectItem value="cash" className="hover:bg-gray-100 dark:hover:bg-gray-700">Cash</SelectItem>
                  <SelectItem value="bank" className="hover:bg-gray-100 dark:hover:bg-gray-700">Bank</SelectItem>
                  <SelectItem value="cash_bank" className="hover:bg-gray-100 dark:hover:bg-gray-700">Cash Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status" className="text-sm">Status</Label>
              <Select value={form.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectItem value="completed" className="hover:bg-gray-100 dark:hover:bg-gray-700">Completed</SelectItem>
                  <SelectItem value="pending" className="hover:bg-gray-100 dark:hover:bg-gray-700">Pending</SelectItem>
                  <SelectItem value="cancelled" className="hover:bg-gray-100 dark:hover:bg-gray-700">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* Sale Items Section */}
          <div className="flex flex-col gap-3">
            <Label className="text-base font-semibold text-gray-900 dark:text-white">Sale Items</Label>
            
            <div className="flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide pb-2 border-b border-gray-300 dark:border-gray-600 flex-shrink-0 mb-2">
                <div className="col-span-4">Item Name</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-2"></div>
              </div>

              {/* Scrollable Items Container - Fixed height for exactly 3 items */}
              <div className="overflow-y-auto space-y-2 pr-2 h-[180px] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {/* Item Rows */}
                {saleItems.map((saleItem, index) => {
                const filteredItems = getFilteredItems(saleItem.id);
                const isFirstRow = index === 0;
                return (
                  <div key={saleItem.id} className="grid grid-cols-12 gap-2 items-start p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                    {/* Item Name - Search/Select */}
                    <div className="col-span-4 relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <Input
                          ref={isFirstRow ? itemSearchInputRef : undefined}
                          type="text"
                          placeholder="Search item..."
                          value={saleItem.searchTerm || ""}
                          onChange={(e) => handleItemSearchChange(saleItem.id, e.target.value)}
                          onFocus={() => handleItemSearchChange(saleItem.id, saleItem.searchTerm || "")}
                          onKeyDown={(e) => handleItemSearchKeyDown(e, saleItem)}
                          className="pl-9 pr-9 h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {saleItem.item_name && (
                          <button
                            type="button"
                            onClick={() => handleItemSearchChange(saleItem.id, "")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                          </button>
                        )}
                      </div>
                      {/* Dropdown Results */}
                      {saleItem.isSearching && filteredItems.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                          {filteredItems.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleItemSelect(saleItem.id, item)}
                              className="p-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {item.item_number ? `Item #: ${item.item_number}` : ""}
                                {item.item_number && item.sku ? " · " : ""}
                                SKU: {item.sku || "N/A"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {(saleItem.item_number || saleItem.item_sku) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 ml-1">
                          {saleItem.item_number ? `Item #: ${saleItem.item_number}` : ""}
                          {saleItem.item_number && saleItem.item_sku ? " · " : ""}
                          {saleItem.item_sku ? `SKU: ${saleItem.item_sku}` : ""}
                        </p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2">
                      <Input
                        ref={(el) => { if (el) qtyRefs.current[saleItem.id] = el; }}
                        type="text"
                        value={saleItem.quantity === "" || (saleItem.quantity === 1 && !saleItem.item) ? "" : String(saleItem.quantity || "")}
                        onChange={(e) => handleItemQuantityChange(saleItem.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            priceRefs.current[saleItem.id]?.focus();
                          }
                        }}
                        placeholder="Qty"
                        className="w-full h-10 text-center bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Price */}
                    <div className="col-span-2">
                      <Input
                        ref={(el) => { if (el) priceRefs.current[saleItem.id] = el; }}
                        type="text"
                        value={saleItem.price === "" || (saleItem.price === 0 && !saleItem.item) ? "" : String(saleItem.price || "")}
                        onChange={(e) => handleItemPriceChange(saleItem.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            notesRef.current?.focus();
                          }
                        }}
                        placeholder="Price"
                        className="w-full h-10 text-center bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Total */}
                    <div className="col-span-2 flex items-center justify-end">
                      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-semibold text-gray-900 dark:text-white min-w-[80px] text-right">
                        {parseFloat(saleItem.total_amount || 0).toFixed(2)}
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="col-span-2 flex items-center justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(saleItem.id)}
                        className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              </div>
              
              {/* Total Amount - Fixed at bottom */}
              <div className="flex justify-end pt-3 mt-2 border-t-2 border-gray-300 dark:border-gray-600 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-0.5">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            <Label htmlFor="notes" className="text-sm">Notes</Label>
            <Textarea
              ref={notesRef}
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  saveButtonRef.current?.focus();
                }
              }}
              placeholder="Enter any additional notes (Shift+Enter for new line)"
              rows={2}
              className="text-sm"
            />
          </div>

          <DialogFooter className="flex-shrink-0 pt-2 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button ref={saveButtonRef} type="submit">
              Add Sale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
