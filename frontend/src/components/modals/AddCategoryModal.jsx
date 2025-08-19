import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function AddCategoryModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    icon: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ name: "", icon: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new category for your menu. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" name="name" placeholder="e.g. Breakfast" value={form.name} onChange={handleChange} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="icon">Icon (Emoji)</Label>
            <Input id="icon" name="icon" placeholder="e.g. 🥐" value={form.icon} onChange={handleChange} maxLength={2} required />
            <span className="text-xs text-gray-400">Pick a relevant emoji for the category.</span>
          </div>
          <DialogFooter className="flex flex-row gap-2 justify-end mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">
              Add Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 