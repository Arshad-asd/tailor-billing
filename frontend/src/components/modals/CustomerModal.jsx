import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";

export default function CustomerModal({ open, onClose, onSubmit, editingCustomer = null }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
    preferences: [],
    notes: "",
  });

  const [newPreference, setNewPreference] = useState("");

  const preferenceOptions = [
    "Wedding Dresses",
    "Custom Suits", 
    "Business Attire",
    "Alterations",
    "Repairs",
    "Custom Dresses",
    "Formal Wear",
    "Casual Wear",
    "Accessories",
    "Bridal",
    "Prom Dresses",
    "Uniforms"
  ];

  useEffect(() => {
    if (editingCustomer) {
      setForm({
        name: editingCustomer.name || "",
        email: editingCustomer.email || "",
        phone: editingCustomer.phone || "",
        address: editingCustomer.address || "",
        status: editingCustomer.status || "active",
        preferences: editingCustomer.preferences || [],
        notes: editingCustomer.notes || "",
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        status: "active",
        preferences: [],
        notes: "",
      });
    }
    setNewPreference("");
  }, [editingCustomer, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAddPreference = () => {
    if (newPreference.trim() && !form.preferences.includes(newPreference.trim())) {
      setForm((f) => ({
        ...f,
        preferences: [...f.preferences, newPreference.trim()]
      }));
      setNewPreference("");
    }
  };

  const handleRemovePreference = (preferenceToRemove) => {
    setForm((f) => ({
      ...f,
      preferences: f.preferences.filter(pref => pref !== preferenceToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      ...form,
      id: editingCustomer?.id || `CUST-${Date.now()}`,
      joinDate: editingCustomer?.joinDate || new Date().toISOString().split('T')[0],
      totalOrders: editingCustomer?.totalOrders || 0,
      totalSpent: editingCustomer?.totalSpent || 0,
      lastOrder: editingCustomer?.lastOrder || null,
    };
    onSubmit(formData, editingCustomer?.id);
    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      status: "active",
      preferences: [],
      notes: "",
    });
    setNewPreference("");
  };

  const isEditing = !!editingCustomer;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[600px] h-[600px] p-0 max-h-[90vh] overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>
              {isEditing ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the customer information below."
                : "Add a new customer to your database. Fill in the details below."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="e.g. Sarah Johnson" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  placeholder="e.g. sarah.johnson@email.com" 
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  placeholder="e.g. (555) 123-4567" 
                  value={form.phone} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea 
                id="address" 
                name="address" 
                placeholder="e.g. 123 Main St, City, State 12345"
                value={form.address} 
                onChange={handleChange}
                rows={2}
              />
            </div>
            
            <div className="flex flex-col gap-3">
              <Label>Preferences</Label>
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                {form.preferences.map((pref, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {pref}
                    <button
                      type="button"
                      onClick={() => handleRemovePreference(pref)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Select value={newPreference} onValueChange={setNewPreference}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Add preference" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {preferenceOptions
                      .filter(option => !form.preferences.includes(option))
                      .map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddPreference}
                  disabled={!newPreference.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder="Additional notes about the customer..."
                value={form.notes} 
                onChange={handleChange}
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter className="flex flex-row gap-2 justify-end p-6 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              {isEditing ? "Update Customer" : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 