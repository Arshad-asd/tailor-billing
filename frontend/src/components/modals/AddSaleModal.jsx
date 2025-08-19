import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

export default function AddSaleModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    customerName: "",
    service: "",
    amount: "",
    date: "",
    paymentMethod: "",
    status: "",
    jobOrderId: "",
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
      amount: parseFloat(form.amount) || 0,
    };
    onSubmit(formData);
    setForm({
      customerName: "",
      service: "",
      amount: "",
      date: "",
      paymentMethod: "",
      status: "",
      jobOrderId: "",
      notes: "",
    });
  };

  const handleClose = () => {
    setForm({
      customerName: "",
      service: "",
      amount: "",
      date: "",
      paymentMethod: "",
      status: "",
      jobOrderId: "",
      notes: "",
    });
    onClose();
  };

  // Set default date to today
  React.useEffect(() => {
    if (open && !form.date) {
      const today = new Date().toISOString().split('T')[0];
      setForm(prev => ({ ...prev, date: today }));
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full p-0 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <DialogHeader>
            <DialogTitle>Add New Sale</DialogTitle>
            <DialogDescription>
              Create a new sale record. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="service">Service</Label>
              <Select value={form.service} onValueChange={(value) => handleSelectChange("service", value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectItem value="Wedding Dress Alterations" className="hover:bg-gray-100 dark:hover:bg-gray-700">Wedding Dress Alterations</SelectItem>
                  <SelectItem value="Custom Suit" className="hover:bg-gray-100 dark:hover:bg-gray-700">Custom Suit</SelectItem>
                  <SelectItem value="Pants Alterations" className="hover:bg-gray-100 dark:hover:bg-gray-700">Pants Alterations</SelectItem>
                  <SelectItem value="Jacket Repairs" className="hover:bg-gray-100 dark:hover:bg-gray-700">Jacket Repairs</SelectItem>
                  <SelectItem value="Dress Alterations" className="hover:bg-gray-100 dark:hover:bg-gray-700">Dress Alterations</SelectItem>
                  <SelectItem value="Shirt Alterations" className="hover:bg-gray-100 dark:hover:bg-gray-700">Shirt Alterations</SelectItem>
                  <SelectItem value="Skirt Alterations" className="hover:bg-gray-100 dark:hover:bg-gray-700">Skirt Alterations</SelectItem>
                  <SelectItem value="Blouse Alterations" className="hover:bg-gray-100 dark:hover:bg-gray-700">Blouse Alterations</SelectItem>
                  <SelectItem value="Coat Alterations" className="hover:bg-gray-100 dark:hover:bg-gray-700">Coat Alterations</SelectItem>
                  <SelectItem value="Uniform Alterations" className="hover:bg-gray-100 dark:hover:bg-gray-700">Uniform Alterations</SelectItem>
                  <SelectItem value="Hemming" className="hover:bg-gray-100 dark:hover:bg-gray-700">Hemming</SelectItem>
                  <SelectItem value="Zipper Replacement" className="hover:bg-gray-100 dark:hover:bg-gray-700">Zipper Replacement</SelectItem>
                  <SelectItem value="Button Replacement" className="hover:bg-gray-100 dark:hover:bg-gray-700">Button Replacement</SelectItem>
                  <SelectItem value="Patch Work" className="hover:bg-gray-100 dark:hover:bg-gray-700">Patch Work</SelectItem>
                  <SelectItem value="Other" className="hover:bg-gray-100 dark:hover:bg-gray-700">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                required
                min="0"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={form.paymentMethod} onValueChange={(value) => handleSelectChange("paymentMethod", value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectItem value="Cash" className="hover:bg-gray-100 dark:hover:bg-gray-700">Cash</SelectItem>
                  <SelectItem value="Credit Card" className="hover:bg-gray-100 dark:hover:bg-gray-700">Credit Card</SelectItem>
                  <SelectItem value="Debit Card" className="hover:bg-gray-100 dark:hover:bg-gray-700">Debit Card</SelectItem>
                  <SelectItem value="Bank Transfer" className="hover:bg-gray-100 dark:hover:bg-gray-700">Bank Transfer</SelectItem>
                  <SelectItem value="Check" className="hover:bg-gray-100 dark:hover:bg-gray-700">Check</SelectItem>
                  <SelectItem value="Digital Payment" className="hover:bg-gray-100 dark:hover:bg-gray-700">Digital Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(value) => handleSelectChange("status", value)}>
                <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                  <SelectItem value="completed" className="hover:bg-gray-100 dark:hover:bg-gray-700">Completed</SelectItem>
                  <SelectItem value="pending" className="hover:bg-gray-100 dark:hover:bg-gray-700">Pending</SelectItem>
                  <SelectItem value="cancelled" className="hover:bg-gray-100 dark:hover:bg-gray-700">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="jobOrderId">Job Order ID</Label>
              <Input
                id="jobOrderId"
                name="jobOrderId"
                value={form.jobOrderId}
                onChange={handleChange}
                placeholder="Enter job order ID"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Sale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
