import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

export default function InventoryStockMovementModal({ open, onClose, onSubmit, editingMovement = null, inventoryItems = [] }) {
  const [form, setForm] = useState({
    itemId: "",
    type: "",
    quantity: "",
    reason: "",
    notes: "",
    date: "",
  });

  useEffect(() => {
    if (editingMovement) {
      setForm({
        itemId: editingMovement.itemId?.toString() || "",
        type: editingMovement.type || "",
        quantity: editingMovement.quantity?.toString() || "",
        reason: editingMovement.reason || "",
        notes: editingMovement.notes || "",
        date: editingMovement.date || new Date().toISOString().split('T')[0],
      });
    } else {
      setForm({
        itemId: "",
        type: "",
        quantity: "",
        reason: "",
        notes: "",
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [editingMovement, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      ...form,
      quantity: parseInt(form.quantity) || 0,
    };
    onSubmit(formData, editingMovement?.id);
    setForm({
      itemId: "",
      type: "",
      quantity: "",
      reason: "",
      notes: "",
      date: new Date().toISOString().split('T')[0],
    });
  };

  const isEditing = !!editingMovement;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full p-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Stock Movement" : "Add Stock Movement"}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the stock movement details below."
                : "Record a new stock movement (in or out). Fill in the details below."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="itemId">Item</Label>
              <Select value={form.itemId} onValueChange={(value) => handleSelectChange("itemId", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {inventoryItems.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name} ({item.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="type">Movement Type</Label>
              <Select value={form.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="In">Stock In</SelectItem>
                  <SelectItem value="Out">Stock Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                name="quantity" 
                type="number"
                placeholder="0" 
                value={form.quantity} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Select value={form.reason} onValueChange={(value) => handleSelectChange("reason", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="Purchase">Purchase</SelectItem>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Return">Return</SelectItem>
                  <SelectItem value="Adjustment">Adjustment</SelectItem>
                  <SelectItem value="Damage">Damage</SelectItem>
                  <SelectItem value="Transfer">Transfer</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
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
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Additional notes about this movement..."
              value={form.notes} 
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          <DialogFooter className="flex flex-row gap-2 justify-end mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              {isEditing ? "Update Movement" : "Add Movement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 