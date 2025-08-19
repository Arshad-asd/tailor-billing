import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

export default function AddMaterialModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    color: "",
    quantity: "",
    unit: "",
    minStock: "",
    price: "",
    supplier: "",
    description: "",
  });

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
      price: parseFloat(form.price) || 0,
    };
    onSubmit(formData);
    setForm({
      name: "",
      category: "",
      color: "",
      quantity: "",
      unit: "",
      minStock: "",
      price: "",
      supplier: "",
      description: "",
    });
  };

  const handleClose = () => {
    setForm({
      name: "",
      category: "",
      color: "",
      quantity: "",
      unit: "",
      minStock: "",
      price: "",
      supplier: "",
      description: "",
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
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectItem value="Fabric" className="hover:bg-gray-100 dark:hover:bg-gray-700">Fabric</SelectItem>
                  <SelectItem value="Hardware" className="hover:bg-gray-100 dark:hover:bg-gray-700">Hardware</SelectItem>
                  <SelectItem value="Sewing" className="hover:bg-gray-100 dark:hover:bg-gray-700">Sewing</SelectItem>
                  <SelectItem value="Accessories" className="hover:bg-gray-100 dark:hover:bg-gray-700">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="Enter color"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                required
                min="0"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={form.unit} onValueChange={(value) => handleSelectChange("unit", value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectItem value="yards" className="hover:bg-gray-100 dark:hover:bg-gray-700">Yards</SelectItem>
                  <SelectItem value="meters" className="hover:bg-gray-100 dark:hover:bg-gray-700">Meters</SelectItem>
                  <SelectItem value="pieces" className="hover:bg-gray-100 dark:hover:bg-gray-700">Pieces</SelectItem>
                  <SelectItem value="spools" className="hover:bg-gray-100 dark:hover:bg-gray-700">Spools</SelectItem>
                  <SelectItem value="packs" className="hover:bg-gray-100 dark:hover:bg-gray-700">Packs</SelectItem>
                  <SelectItem value="boxes" className="hover:bg-gray-100 dark:hover:bg-gray-700">Boxes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="minStock">Minimum Stock</Label>
              <Input
                id="minStock"
                name="minStock"
                type="number"
                value={form.minStock}
                onChange={handleChange}
                placeholder="Enter minimum stock"
                required
                min="0"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Price per Unit</Label>
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
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
                placeholder="Enter supplier name"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter material description"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Material
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
