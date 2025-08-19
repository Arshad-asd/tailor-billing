import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ChevronDown, ImageIcon } from "lucide-react";
import { Switch } from "../ui/switch";

export default function AddDishModal({ open, onClose, onSubmit, categories }) {
  const [form, setForm] = useState({
    name: "",
    category: categories?.[0]?.name || "",
    price: "",
    cost: "",
    description: "",
    image: null,
    active: true,
  });
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
    } else if (type === "file") {
      const file = files[0];
      setForm((f) => ({ ...f, image: file }));
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target.result);
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleCategorySelect = (cat) => {
    setForm((f) => ({ ...f, category: cat }));
    setCategoryMenuOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({
      name: "",
      category: categories?.[0]?.name || "",
      price: "",
      cost: "",
      description: "",
      image: null,
      active: true,
    });
    setImagePreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full p-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <DialogHeader>
            <DialogTitle>Add New Dish</DialogTitle>
            <DialogDescription>
              Create a new dish for your menu. Fill in all the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Dish Name</Label>
              <Input id="name" name="name" placeholder="e.g. Belgian Waffles" value={form.name} onChange={handleChange} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="category">Category</Label>
              <DropdownMenu open={categoryMenuOpen} onOpenChange={setCategoryMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" className="w-full flex justify-between items-center">
                    {form.category || "Select Category"}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  {categories?.map((cat) => (
                    <DropdownMenuItem key={cat.id} onClick={() => handleCategorySelect(cat.name)}>
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={handleChange} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cost">Cost ($)</Label>
              <Input id="cost" name="cost" type="number" step="0.01" min="0" placeholder="0.00" value={form.cost} onChange={handleChange} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              className="min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              placeholder="Describe the dish..."
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Dish Image</Label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 w-full sm:w-1/2 min-h-[120px]">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="object-cover rounded-md w-full h-24" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-gray-400" />
                )}
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/gif"
                  className="hidden"
                  id="dish-image-upload"
                  name="image"
                  onChange={handleChange}
                />
                <label htmlFor="dish-image-upload">
                  <Button asChild variant="outline" size="sm" className="mt-2 cursor-pointer">
                    <span>Select Image</span>
                  </Button>
                </label>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 2MB</span>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <Switch id="active" name="active" checked={form.active} onCheckedChange={(checked) => setForm(f => ({ ...f, active: checked }))} />
                <Label htmlFor="active">Active (available for ordering)</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-row gap-2 justify-end mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
              Add Dish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 