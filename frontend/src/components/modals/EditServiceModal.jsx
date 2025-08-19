import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

export default function EditServiceModal({ open, onClose, onSubmit, editingService = null }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    duration: "",
    status: "",
    popularity: "",
    materials: "",
    requirements: "",
    notes: "",
  });

  useEffect(() => {
    if (editingService) {
      setForm({
        name: editingService.name || "",
        category: editingService.category || "",
        description: editingService.description || "",
        price: editingService.price?.toString() || "",
        duration: editingService.duration || "",
        status: editingService.status || "",
        popularity: editingService.popularity || "",
        materials: Array.isArray(editingService.materials) ? editingService.materials.join(', ') : editingService.materials || "",
        requirements: editingService.requirements || "",
        notes: editingService.notes || "",
      });
    }
  }, [editingService, open]);

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
      price: parseFloat(form.price) || 0,
      materials: form.materials.split(',').map(item => item.trim()).filter(item => item),
    };
    onSubmit(formData, editingService?.id);
  };

  const handleClose = () => {
    onClose();
  };

  if (!editingService) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full p-0 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update the service details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter service name"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectItem value="Alterations" className="hover:bg-gray-100 dark:hover:bg-gray-700">Alterations</SelectItem>
                  <SelectItem value="Custom" className="hover:bg-gray-100 dark:hover:bg-gray-700">Custom</SelectItem>
                  <SelectItem value="Repairs" className="hover:bg-gray-100 dark:hover:bg-gray-700">Repairs</SelectItem>
                  <SelectItem value="Consultation" className="hover:bg-gray-100 dark:hover:bg-gray-700">Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="Enter price"
                required
                min="0"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g., 3-5 days"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectItem value="active" className="hover:bg-gray-100 dark:hover:bg-gray-700">Active</SelectItem>
                  <SelectItem value="inactive" className="hover:bg-gray-100 dark:hover:bg-gray-700">Inactive</SelectItem>
                  <SelectItem value="featured" className="hover:bg-gray-100 dark:hover:bg-gray-700">Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="popularity">Popularity</Label>
              <Select value={form.popularity} onValueChange={(value) => handleSelectChange("popularity", value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select popularity" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectItem value="high" className="hover:bg-gray-100 dark:hover:bg-gray-700">High</SelectItem>
                  <SelectItem value="medium" className="hover:bg-gray-100 dark:hover:bg-gray-700">Medium</SelectItem>
                  <SelectItem value="low" className="hover:bg-gray-100 dark:hover:bg-gray-700">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter detailed service description"
                rows={3}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="materials">Materials (comma-separated)</Label>
              <Textarea
                id="materials"
                name="materials"
                value={form.materials}
                onChange={handleChange}
                placeholder="e.g., Premium Fabric, Lace, Beading, Thread"
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Input
                id="requirements"
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                placeholder="e.g., Initial consultation required"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Enter any additional notes or special instructions"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Service
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
