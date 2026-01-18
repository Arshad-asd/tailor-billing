import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function AddMaterialModal({ open, onClose, onSubmit, loading = false }) {
  const [form, setForm] = useState({
    name: "",
    thool: "",
    kethet: "",
    thool_kum: "",
    ardh_f_kum: "",
    jamba: "",
    ragab: "",
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
      price: parseFloat(form.price) || 0,
      is_measurement_required: form.is_measurement_required,
    };
    
    // Only include measurement fields if is_measurement_required is true
    if (form.is_measurement_required) {
      formData.thool = parseFloat(form.thool) || 0;
      formData.kethet = parseFloat(form.kethet) || 0;
      formData.thool_kum = parseFloat(form.thool_kum) || 0;
      formData.ardh_f_kum = parseFloat(form.ardh_f_kum) || 0;
      formData.jamba = parseFloat(form.jamba) || 0;
      formData.ragab = parseFloat(form.ragab) || 0;
    }
    
    onSubmit(formData);
    setForm({
      name: "",
      thool: "",
      kethet: "",
      thool_kum: "",
      ardh_f_kum: "",
      jamba: "",
      ragab: "",
      price: "",
      is_measurement_required: false,
    });
  };

  const handleClose = () => {
    setForm({
      name: "",
      thool: "",
      kethet: "",
      thool_kum: "",
      ardh_f_kum: "",
      jamba: "",
      ragab: "",
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

            <div className="flex flex-col gap-2 md:col-span-2">
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

            {form.is_measurement_required && (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="thool">Thool</Label>
                  <Input
                    id="thool"
                    name="thool"
                    type="number"
                    step="0.01"
                    value={form.thool}
                    onChange={handleChange}
                    placeholder="Enter thool measurement"
                    required
                    min="0"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="kethet">Kethef</Label>
                  <Input
                    id="kethet"
                    name="kethet"
                    type="number"
                    step="0.01"
                    value={form.kethet}
                    onChange={handleChange}
                    placeholder="Enter kethet measurement"
                    required
                    min="0"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="thool_kum">Thool Kum</Label>
                  <Input
                    id="thool_kum"
                    name="thool_kum"
                    type="number"
                    step="0.01"
                    value={form.thool_kum}
                    onChange={handleChange}
                    placeholder="Enter thool kum measurement"
                    required
                    min="0"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="ardh_f_kum">Ardh F. Kum</Label>
                  <Input
                    id="ardh_f_kum"
                    name="ardh_f_kum"
                    type="number"
                    step="0.01"
                    value={form.ardh_f_kum}
                    onChange={handleChange}
                    placeholder="Enter ardh f. kum measurement"
                    required
                    min="0"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="jamba">Jamba</Label>
                  <Input
                    id="jamba"
                    name="jamba"
                    type="number"
                    step="0.01"
                    value={form.jamba}
                    onChange={handleChange}
                    placeholder="Enter jamba measurement"
                    required
                    min="0"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="ragab">Ragab</Label>
                  <Input
                    id="ragab"
                    name="ragab"
                    type="number"
                    step="0.01"
                    value={form.ragab}
                    onChange={handleChange}
                    placeholder="Enter ragab measurement"
                    required
                    min="0"
                  />
                </div>
              </>
            )}
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
