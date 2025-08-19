import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export default function InventoryItemModal({ open, onClose, onSubmit, editingItem = null, categories = [] }) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: "",
    unit: "",
    minStock: "",
    cost: "",
    supplier: "",
    description: "",
  });

  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name || "",
        sku: editingItem.sku || "",
        category: editingItem.category || "",
        quantity: editingItem.quantity?.toString() || "",
        unit: editingItem.unit || "",
        minStock: editingItem.minStock?.toString() || "",
        cost: editingItem.cost?.toString() || "",
        supplier: editingItem.supplier || "",
        description: editingItem.description || "",
      });
    } else {
      setForm({
        name: "",
        sku: "",
        category: "",
        quantity: "",
        unit: "",
        minStock: "",
        cost: "",
        supplier: "",
        description: "",
      });
    }
  }, [editingItem, open]);

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
      minStock: parseInt(form.minStock) || 0,
      cost: parseFloat(form.cost) || 0,
    };
    onSubmit(formData, editingItem?.id);
    setForm({
      name: "",
      sku: "",
      category: "",
      quantity: "",
      unit: "",
      minStock: "",
      cost: "",
      supplier: "",
      description: "",
    });
  };

  const isEditing = !!editingItem;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Inventory Item" : "Add New Inventory Item"}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the inventory item details below."
                : "Create a new inventory item. Fill in the details below."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Item Name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="e.g. Premium Cotton Fabric" 
                value={form.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input 
                id="sku" 
                name="sku" 
                placeholder="e.g. FAB-001" 
                value={form.sku} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Input 
                id="unit" 
                name="unit" 
                placeholder="e.g. yards, pieces, spools" 
                value={form.unit} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity">Current Quantity</Label>
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
              <Label htmlFor="minStock">Minimum Stock Level</Label>
              <Input 
                id="minStock" 
                name="minStock" 
                type="number"
                placeholder="0" 
                value={form.minStock} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="cost">Unit Cost ($)</Label>
              <Input 
                id="cost" 
                name="cost" 
                type="number"
                step="0.01"
                placeholder="0.00" 
                value={form.cost} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input 
                id="supplier" 
                name="supplier" 
                placeholder="e.g. Textile Corp" 
                value={form.supplier} 
                onChange={handleChange} 
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              name="description" 
              placeholder="Brief description of the item..."
              value={form.description} 
              onChange={handleChange}
            />
          </div>
          
          <DialogFooter className="flex flex-row gap-2 justify-end mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              {isEditing ? "Update Item" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 