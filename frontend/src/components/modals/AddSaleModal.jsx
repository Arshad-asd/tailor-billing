import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Plus, Trash2, Package } from "lucide-react";
import ItemSearchModal from "./ItemSearchModal";

export default function AddSaleModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    customerName: "Khartoum",
    date: "",
    paymentMethod: "",
    status: "pending",
    notes: "",
  });
  const [saleItems, setSaleItems] = useState([]);
  const [isItemSearchOpen, setIsItemSearchOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAddItem = (item) => {
    const newSaleItem = {
      id: Date.now(), // temporary ID for frontend
      item: item.id,
      item_name: item.name,
      item_sku: item.sku,
      quantity: 1,
      price: 0,
      total_amount: 0
    };
    setSaleItems(prev => [...prev, newSaleItem]);
  };

  const handleRemoveItem = (itemId) => {
    setSaleItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleItemQuantityChange = (itemId, quantity) => {
    setSaleItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newTotal = parseFloat(quantity) * parseFloat(item.price || 0);
        return { ...item, quantity: parseFloat(quantity), total_amount: newTotal };
      }
      return item;
    }));
  };

  const handleItemPriceChange = (itemId, price) => {
    setSaleItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newTotal = parseFloat(item.quantity || 0) * parseFloat(price);
        return { ...item, price: parseFloat(price), total_amount: newTotal };
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
      sale_items: saleItems.map(item => ({
        item: item.item,
        quantity: item.quantity,
        price: item.price,
        total_amount: item.total_amount
      }))
    };
    onSubmit(formData);
    setForm({
      customerName: "Khartoum",
      date: "",
      paymentMethod: "",
      status: "pending",
      notes: "",
    });
    setSaleItems([]);
  };

  const handleClose = () => {
    setForm({
      customerName: "Khartoum",
      date: "",
      paymentMethod: "",
      status: "pending",
      notes: "",
    });
    setSaleItems([]);
    onClose();
  };

  // Set default date to today and default customer name to Khartoum
  React.useEffect(() => {
    if (open) {
      const today = new Date().toISOString().split('T')[0];
      setForm(prev => ({ 
        ...prev, 
        date: prev.date || today,
        customerName: prev.customerName || "Khartoum"
      }));
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full p-0 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <DialogHeader>
            <DialogTitle>Add New Sale</DialogTitle>
            <DialogDescription>
              Create a new sale record. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Enter customer name"
                required
              />
            </div>



            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
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
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium">Sale Items</Label>
              <Button
                type="button"
                onClick={() => setIsItemSearchOpen(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </Button>
            </div>

            {saleItems.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No items added yet</p>
                <p className="text-sm text-gray-400">Click "Add Item" to start adding items to this sale</p>
              </div>
            ) : (
              <div className="space-y-3">
                {saleItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{item.item_name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {item.item_sku}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex flex-col">
                        <Label htmlFor={`quantity-${item.id}`} className="text-xs">Qty</Label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemQuantityChange(item.id, e.target.value)}
                          className="w-20"
                        />
                      </div>
                      
                      <div className="flex flex-col">
                        <Label htmlFor={`price-${item.id}`} className="text-xs">Price</Label>
                        <Input
                          id={`price-${item.id}`}
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.price}
                          onChange={(e) => handleItemPriceChange(item.id, e.target.value)}
                          className="w-24"
                        />
                      </div>
                      
                      <div className="flex flex-col">
                        <Label className="text-xs">Total</Label>
                        <div className="w-24 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-medium">
                          ${parseFloat(item.total_amount || 0).toFixed(2)}
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${calculateTotal().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Sale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      
      {/* Item Search Modal */}
      <ItemSearchModal
        open={isItemSearchOpen}
        onClose={() => setIsItemSearchOpen(false)}
        onSelectItem={handleAddItem}
        selectedItems={saleItems}
      />
    </Dialog>
  );
}
