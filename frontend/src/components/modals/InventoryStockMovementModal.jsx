import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

export default function InventoryStockMovementModal({ open, onClose, onSubmit, editingMovement = null, inventoryItems = [] }) {
  const [form, setForm] = useState({
    item: "",
    quantity: "",
    movement_type: "",
    reference: "",
    remarks: "",
  });

  useEffect(() => {
    if (editingMovement) {
      setForm({
        item: editingMovement.item?.toString() || "",
        quantity: editingMovement.quantity?.toString() || "",
        movement_type: editingMovement.movement_type || "",
        reference: editingMovement.reference || "",
        remarks: editingMovement.remarks || "",
      });
    } else {
      setForm({
        item: "",
        quantity: "",
        movement_type: "",
        reference: "",
        remarks: "",
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
      item: parseInt(form.item) || null,
      quantity: parseFloat(form.quantity) || 0,
    };
    onSubmit(formData, editingMovement?.id);
    setForm({
      item: "",
      quantity: "",
      movement_type: "",
      reference: "",
      remarks: "",
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
              <Label htmlFor="item">Item</Label>
              <Select value={form.item} onValueChange={(value) => handleSelectChange("item", value)}>
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
              <Label htmlFor="movement_type">Movement Type</Label>
              <Select value={form.movement_type} onValueChange={(value) => handleSelectChange("movement_type", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="IN">Stock In</SelectItem>
                  <SelectItem value="OUT">Stock Out</SelectItem>
                  <SelectItem value="ADJUST">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                name="quantity" 
                type="number"
                step="0.01"
                placeholder="0.00" 
                value={form.quantity} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="reference">Reference</Label>
              <Input 
                id="reference" 
                name="reference" 
                placeholder="e.g. PO-001, Job-123, Manual Adjustment"
                value={form.reference} 
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea 
              id="remarks" 
              name="remarks" 
              placeholder="Additional remarks about this movement..."
              value={form.remarks} 
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