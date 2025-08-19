import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

export default function AddPurchaseModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    supplier: "",
    items: "",
    totalAmount: "",
    orderDate: "",
    expectedDelivery: "",
    status: "",
    paymentStatus: "",
    notes: "",
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
      totalAmount: parseFloat(form.totalAmount) || 0,
    };
    onSubmit(formData);
    setForm({
      supplier: "",
      items: "",
      totalAmount: "",
      orderDate: "",
      expectedDelivery: "",
      status: "",
      paymentStatus: "",
      notes: "",
    });
  };

  const handleClose = () => {
    setForm({
      supplier: "",
      items: "",
      totalAmount: "",
      orderDate: "",
      expectedDelivery: "",
      status: "",
      paymentStatus: "",
      notes: "",
    });
    onClose();
  };

  // Set default date to today
  React.useEffect(() => {
    if (open && !form.orderDate) {
      const today = new Date().toISOString().split('T')[0];
      setForm(prev => ({ ...prev, orderDate: today }));
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full p-0 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <DialogHeader>
            <DialogTitle>Add New Purchase Order</DialogTitle>
            <DialogDescription>
              Create a new purchase order. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={form.supplier} onValueChange={(value) => handleSelectChange("supplier", value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectItem value="Fabric World" className="hover:bg-gray-100 dark:hover:bg-gray-700">Fabric World</SelectItem>
                  <SelectItem value="Hardware Plus" className="hover:bg-gray-100 dark:hover:bg-gray-700">Hardware Plus</SelectItem>
                  <SelectItem value="Luxury Fabrics" className="hover:bg-gray-100 dark:hover:bg-gray-700">Luxury Fabrics</SelectItem>
                  <SelectItem value="Button Co." className="hover:bg-gray-100 dark:hover:bg-gray-700">Button Co.</SelectItem>
                  <SelectItem value="Thread Master" className="hover:bg-gray-100 dark:hover:bg-gray-700">Thread Master</SelectItem>
                  <SelectItem value="Zipper Supply" className="hover:bg-gray-100 dark:hover:bg-gray-700">Zipper Supply</SelectItem>
                  <SelectItem value="Textile Traders" className="hover:bg-gray-100 dark:hover:bg-gray-700">Textile Traders</SelectItem>
                  <SelectItem value="Other" className="hover:bg-gray-100 dark:hover:bg-gray-700">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="totalAmount">Total Amount</Label>
              <Input
                id="totalAmount"
                name="totalAmount"
                type="number"
                step="0.01"
                value={form.totalAmount}
                onChange={handleChange}
                placeholder="Enter total amount"
                required
                min="0"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="orderDate">Order Date</Label>
              <Input
                id="orderDate"
                name="orderDate"
                type="date"
                value={form.orderDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="expectedDelivery">Expected Delivery</Label>
              <Input
                id="expectedDelivery"
                name="expectedDelivery"
                type="date"
                value={form.expectedDelivery}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Order Status</Label>
              <Select value={form.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectItem value="ordered" className="hover:bg-gray-100 dark:hover:bg-gray-700">Ordered</SelectItem>
                  <SelectItem value="in-transit" className="hover:bg-gray-100 dark:hover:bg-gray-700">In Transit</SelectItem>
                  <SelectItem value="delivered" className="hover:bg-gray-100 dark:hover:bg-gray-700">Delivered</SelectItem>
                  <SelectItem value="cancelled" className="hover:bg-gray-100 dark:hover:bg-gray-700">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Select value={form.paymentStatus} onValueChange={(value) => handleSelectChange("paymentStatus", value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectItem value="pending" className="hover:bg-gray-100 dark:hover:bg-gray-700">Pending</SelectItem>
                  <SelectItem value="paid" className="hover:bg-gray-100 dark:hover:bg-gray-700">Paid</SelectItem>
                  <SelectItem value="partial" className="hover:bg-gray-100 dark:hover:bg-gray-700">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="items">Items Description</Label>
            <Textarea
              id="items"
              name="items"
              value={form.items}
              onChange={handleChange}
              placeholder="Enter items description (e.g., Cotton Fabric, Silk Fabric, Zippers, Buttons, Thread)"
              rows={3}
              required
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Purchase Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
