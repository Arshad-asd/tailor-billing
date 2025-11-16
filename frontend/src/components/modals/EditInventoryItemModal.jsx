import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";

export default function EditInventoryItemModal({ open, onClose, onSubmit, editingItem, categories = [] }) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    category: "none",
    unit: "meter",  
    is_active: true,
    is_raw_material: true,
  });

  // Debug categories prop
  useEffect(() => {
    console.log('EditInventoryItemModal - Categories prop:', categories);
  }, [categories]);

  // Debug open prop
  useEffect(() => {
    console.log('EditInventoryItemModal - Open prop changed:', open);
  }, [open]);

  // Debug editingItem prop
  useEffect(() => {
    console.log('EditInventoryItemModal - EditingItem prop changed:', editingItem);
  }, [editingItem]);

  // Handle form initialization when editingItem changes
  useEffect(() => {
    if (editingItem && open) {
      console.log('EditInventoryItemModal - Initializing form with editingItem:', editingItem);
      
      // Handle category - it might be an object with id or just the id
      let categoryId = "none";
      if (editingItem.category !== null && editingItem.category !== undefined) {
        if (typeof editingItem.category === 'object' && editingItem.category.id) {
          categoryId = editingItem.category.id.toString();
        } else if (typeof editingItem.category === 'number' || typeof editingItem.category === 'string') {
          categoryId = editingItem.category.toString();
        }
      }
      
      console.log('EditInventoryItemModal - Setting form with:', {
        editingItem,
        categoryId,
        unit: editingItem.unit
      });
      
      setForm({
        name: editingItem.name || "",
        sku: editingItem.sku || "",
        description: editingItem.description || "",
        category: categoryId,
        unit: editingItem.unit || "meter",
        is_active: editingItem.is_active !== undefined ? editingItem.is_active : true,
        is_raw_material: editingItem.is_raw_material !== undefined ? editingItem.is_raw_material : true,
      });
    }
  }, [editingItem, open]);

  // Handle form reset when modal closes
  useEffect(() => {
    if (!open && !editingItem) {
      console.log('EditInventoryItemModal - Modal closed and no editing item, resetting form');
      setForm({
        name: "",
        sku: "",
        description: "",
        category: "none",
        unit: "meter",
        is_active: true,
        is_raw_material: true,
      });
    }
  }, [open, editingItem]);

  // Debug form state changes
  useEffect(() => {
    console.log('EditInventoryItemModal - Form state changed:', form);
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleCheckboxChange = (name, event) => {
    setForm((f) => ({ ...f, [name]: event.target.checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      ...form,
      category: form.category && form.category !== "none" ? parseInt(form.category) : null,
    };
    onSubmit(formData, editingItem?.id);
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setForm({
      name: "",
      sku: "",
      description: "",
      category: "none",
      unit: "meter",
      is_active: true,
      is_raw_material: true,
    });
    onClose();
  };

  if (!editingItem) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full p-0 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update the inventory item details below.
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
              <p className="text-xs text-gray-500 dark:text-gray-400">
                SKU cannot be changed after creation
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Selected category ID: {form.category === "none" ? "None" : form.category}
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={form.unit} onValueChange={(value) => handleSelectChange("unit", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="meter">Meter</SelectItem>
                  <SelectItem value="piece">Piece</SelectItem>
                  <SelectItem value="roll">Roll</SelectItem>
                  <SelectItem value="yard">Yard</SelectItem>
                  <SelectItem value="spool">Spool</SelectItem>
                  <SelectItem value="packet">Packet</SelectItem>
                  <SelectItem value="kg">Kilogram</SelectItem>
                  <SelectItem value="gram">Gram</SelectItem>
                  <SelectItem value="liter">Liter</SelectItem>
                  <SelectItem value="ml">Milliliter</SelectItem>
                </SelectContent>
              </Select>
              {form.unit && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Selected unit: {form.unit}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Brief description of the item..."
              value={form.description} 
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_active" 
                checked={form.is_active}
                onChange={(event) => handleCheckboxChange("is_active", event)}
              />
              <Label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Active Item
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_raw_material" 
                checked={form.is_raw_material}
                onChange={(event) => handleCheckboxChange("is_raw_material", event)}
              />
              <Label htmlFor="is_raw_material" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Raw Material
              </Label>
            </div>
          </div>
          
          <DialogFooter className="flex flex-row gap-2 justify-end mt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              Update Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

