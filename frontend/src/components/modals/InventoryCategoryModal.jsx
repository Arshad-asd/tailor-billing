import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export default function InventoryCategoryModal({ open, onClose, onSubmit, editingCategory = null }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (editingCategory) {
      setForm({
        name: editingCategory.name || "",
        description: editingCategory.description || "",
      });
    } else {
      setForm({
        name: "",
        description: "",
      });
    }
  }, [editingCategory, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, editingCategory?.id);
    setForm({ name: "", description: "" });
  };

  const isEditing = !!editingCategory;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the category details below."
                : "Create a new inventory category. Fill in the details below."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Category Name</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="e.g. Fabric, Hardware, Tools" 
              value={form.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Brief description of the category..."
              value={form.description} 
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          <DialogFooter className="flex flex-row gap-2 justify-end mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              {isEditing ? "Update Category" : "Add Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 