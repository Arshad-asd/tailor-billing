import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function AddMaterialModal({ open, onClose, onSubmit, loading = false }) {
  const [form, setForm] = useState({
    name: "",
    arabic_name: "",
    material_number: "",
    price: "",
    is_measurement_required: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      name: form.name,
      arabic_name: form.arabic_name || null,
      material_number: form.material_number || null,
      price: parseFloat(form.price) || 0,
      is_measurement_required: form.is_measurement_required,
    };
    
    onSubmit(formData);
    setForm({
      name: "",
      arabic_name: "",
      material_number: "",
      price: "",
      is_measurement_required: false,
    });
  };

  const handleClose = () => {
    setForm({
      name: "",
      arabic_name: "",
      material_number: "",
      price: "",
      is_measurement_required: false,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full p-0 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
            <DialogDescription>
              Create a new material. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Material Name</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter material name"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="arabic_name">Arabic Name</Label>
              <Input
                id="arabic_name"
                name="arabic_name"
                value={form.arabic_name}
                onChange={handleChange}
                placeholder="Enter Arabic name (optional)"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="material_number">Material Number</Label>
              <Input
                id="material_number"
                name="material_number"
                value={form.material_number}
                onChange={handleChange}
                placeholder="Enter material number (optional)"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Price</Label>
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
              <Label htmlFor="is_measurement_required">Is Measurement Required?</Label>
              <select
                id="is_measurement_required"
                name="is_measurement_required"
                value={form.is_measurement_required ? "true" : "false"}
                onChange={(e) => setForm((f) => ({ ...f, is_measurement_required: e.target.value === "true" }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Material'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
