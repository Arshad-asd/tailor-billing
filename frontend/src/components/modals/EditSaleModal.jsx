import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Trash2, Search, X } from "lucide-react";
import { inventoryAPI } from "../../services/inventoryApi";
import { formatDateStr } from "../../utils/dateUtils";

export default function EditSaleModal({ open, onClose, onSubmit, editingSale = null }) {
  const [form, setForm] = useState({
    customerName: "",
    date: "",
    paymentMethod: "",
    status: "pending",
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

  // Load items when modal opens
  useEffect(() => {
    if (open) {
      loadItems();
    }
  }, [open]);

  // Focus item search input when modal opens
  useEffect(() => {
    if (open && editingSale) {
      const timer = setTimeout(() => itemSearchInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open, editingSale]);

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


  useEffect(() => {
    if (editingSale) {
      // Normalize payment_method from API to Select value (cash | bank | cash_bank)
      const rawPayment = editingSale.payment_method != null ? String(editingSale.payment_method).trim().toLowerCase().replace(/\s+/g, " ") : "";
      let paymentMethod = "cash";
      if (rawPayment === "cash_bank" || rawPayment === "cash bank") paymentMethod = "cash_bank";
      else if (rawPayment === "bank") paymentMethod = "bank";
      else if (rawPayment === "cash") paymentMethod = "cash";

      const formData = {
        customerName: editingSale.customer_name || "",
        date: editingSale.date ? formatDateStr(editingSale.date) : "",
        paymentMethod,
        status: (editingSale.status || "pending").toLowerCase(),
        notes: editingSale.notes || "",
      };
      // Ensure status matches Select values (completed, pending, cancelled)
      const statusMap = { completed: "completed", pending: "pending", cancelled: "cancelled" };
      formData.status = statusMap[formData.status] || "pending";
      setForm(formData);
      
      // Load existing sale items
      if (editingSale.sale_items && Array.isArray(editingSale.sale_items) && editingSale.sale_items.length > 0) {
        const loadedItems = editingSale.sale_items.map((item, index) => ({
          id: item.id || Date.now() + index,
          item: item.item,
          item_name: item.item_name || item.item?.name || 'Unknown Item',
          item_number: item.item_number || item.item?.item_number || '',
          item_sku: item.item_sku || item.item?.sku || '',
          quantity: item.quantity || 1,
          price: item.price || 0,
          total_amount: item.total_amount || 0,
          searchTerm: item.item_name || item.item?.name || '',
          isSearching: false
        }));
        // Add an empty row at the end
        loadedItems.push({
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
        });
        setSaleItems(loadedItems);
      } else {
        setSaleItems([{ id: Date.now(), item: null, item_name: "", item_number: "", item_sku: "", quantity: 1, price: 0, total_amount: 0, searchTerm: "", isSearching: false }]);
      }
    }
  }, [editingSale, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
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
      return [newRow, updatedItem, ...restWithoutEmpty];
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
    onSubmit(formData, editingSale?.id);
  };

  const handleClose = () => {
    // Reset form when closing
    setForm({
      customerName: "",
      date: "",
      paymentMethod: "",
      status: "pending",
      notes: "",
    });
    setSaleItems([{ id: Date.now(), item: null, item_name: "", item_number: "", item_sku: "", quantity: 1, price: 0, total_amount: 0, searchTerm: "", isSearching: false }]);
    onClose();
  };

  if (!editingSale) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!w-[90vh] !h-[90vh] !max-w-[90vh] !max-h-[90vh] p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full gap-3 p-4 overflow-hidden">
          <DialogHeader className="pb-2 flex-shrink-0">
            <DialogTitle className="text-xl">Edit Sale</DialogTitle>
            <DialogDescription className="text-sm mt-1">
              Update the sale details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-4 gap-3 flex-shrink-0">
            <div className="flex flex-col gap-1.5 min-w-0">
              <Label htmlFor="customerName" className="text-sm">Customer Name</Label>
              <Input
                id="customerName"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Enter customer name"
                required
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <Label htmlFor="date" className="text-sm">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <Label htmlFor="paymentMethod" className="text-sm">Payment Method</Label>
              <Select
                key={`payment-${editingSale?.id ?? "new"}-${form.paymentMethod || "cash"}`}
                value={form.paymentMethod || "cash"}
                onValueChange={(value) => handleSelectChange("paymentMethod", value)}
              >
                <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectItem value="cash" className="hover:bg-gray-100 dark:hover:bg-gray-700">Cash</SelectItem>
                  <SelectItem value="bank" className="hover:bg-gray-100 dark:hover:bg-gray-700">Bank</SelectItem>
                  <SelectItem value="cash_bank" className="hover:bg-gray-100 dark:hover:bg-gray-700">Cash Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">
              <Label htmlFor="status" className="text-sm">Status</Label>
              <Select
                key={`status-${editingSale?.id ?? "new"}-${form.status || "pending"}`}
                value={form.status || "pending"}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
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

          {/* Sale Items Section - takes remaining space so 6 rows visible by default */}
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            <Label className="text-base font-semibold text-gray-900 dark:text-white flex-shrink-0">Sale Items</Label>
            
            <div className="flex flex-col flex-1 min-h-0 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide pb-2 border-b border-gray-300 dark:border-gray-600 flex-shrink-0 mb-2">
                <div className="col-span-4">Item Name</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-2"></div>
              </div>

              {/* Scrollable Items Container - fills remaining space (6 rows visible by default) */}
              <div className="flex-1 min-h-[294px] overflow-y-auto space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {/* Item Rows */}
                {saleItems.map((saleItem, index) => {
                const filteredItems = getFilteredItems(saleItem.id);
                const isFirstRow = index === 0;
                return (
                  <div key={saleItem.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors min-h-[44px]">
                    {/* Item Name - Search/Select */}
                    <div className="col-span-4 relative flex items-center gap-2 min-w-0">
                      <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <Input
                          ref={isFirstRow ? itemSearchInputRef : undefined}
                          type="text"
                          placeholder="Search item..."
                          value={saleItem.searchTerm || ""}
                          onChange={(e) => handleItemSearchChange(saleItem.id, e.target.value)}
                          onFocus={() => handleItemSearchChange(saleItem.id, saleItem.searchTerm || "")}
                          onBlur={() => {
                            setTimeout(() => {
                              setSaleItems(prev => prev.map(i => i.id === saleItem.id ? { ...i, isSearching: false } : i));
                            }, 150);
                          }}
                          onKeyDown={(e) => handleItemSearchKeyDown(e, saleItem)}
                          className="pl-9 pr-9 h-9 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      {(saleItem.item_number || saleItem.item_sku) && (
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap truncate max-w-[100px]" title={saleItem.item_number ? `Item #: ${saleItem.item_number}` : "" + (saleItem.item_sku ? ` SKU: ${saleItem.item_sku}` : "")}>
                          {saleItem.item_number ? `#${saleItem.item_number}` : ""}
                          {saleItem.item_number && saleItem.item_sku ? " · " : ""}
                          {saleItem.item_sku ? saleItem.item_sku : ""}
                        </span>
                      )}
                      {/* Dropdown Results */}
                      {saleItem.isSearching && filteredItems.length > 0 && (
                        <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                          {filteredItems.map((item) => (
                            <div
                              key={item.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleItemSelect(saleItem.id, item);
                              }}
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
                        className="w-full h-9 text-center bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full h-9 text-center bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Total */}
                    <div className="col-span-2 flex items-center justify-end">
                      <div className="px-2 py-1.5 bg-gray-100 dark:bg-gray-700 rounded text-sm font-semibold text-gray-900 dark:text-white min-w-[70px] text-right">
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
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              </div>
              
              {/* Total Amount - compact so more space for item rows */}
              <div className="flex justify-end items-center gap-3 pt-1.5 mt-1 border-t border-gray-300 dark:border-gray-600 flex-shrink-0">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Amount</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                  {calculateTotal().toFixed(2)}
                </span>
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
              rows={1}
              className="text-sm min-h-[32px] py-2 resize-none"
            />
          </div>

          <DialogFooter className="flex-shrink-0 pt-2 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button ref={saveButtonRef} type="submit">
              Update Sale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
