"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { Ruler, User, Calendar, Phone, Save, X, Plus, Edit, DollarSign, FileText, Scissors } from "lucide-react"

export default function MeasurementModal({ open, onClose, onSubmit, editingMeasurement = null }) {
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    service: "",
    startDate: "",
    dueDate: "",
    price: "",
    priority: "medium",
    description: "",
    orderReference: "",
    advance: "",
    balance: "",
    // Traditional Measurements
    thool: "",
    kethet: "",
    thoolKum: "",
    ardhFKum: "",
    jamba: "",
    ragab: "",
    // Body Measurements
    chest: "",
    waist: "",
    hips: "",
    shoulder: "",
    neck: "",
    // Sleeve & Length Measurements
    sleeveLength: "",
    sleeveWidth: "",
    inseam: "",
    outseam: "",
  })

  const serviceOptions = [
    "Jalabiya",
    "Wedding Dress Alterations",
    "Custom Suit",
    "Business Attire",
    "Alterations",
    "Repairs",
    "Custom Dresses",
    "Formal Wear",
    "Casual Wear",
    "Bridal",
    "Prom Dresses",
    "Uniforms",
  ]

  const priorityOptions = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High", color: "bg-red-100 text-red-800" },
  ]

  useEffect(() => {
    if (editingMeasurement) {
      setForm({
        customerName: editingMeasurement.customerName || "",
        phone: editingMeasurement.phone || "",
        service: editingMeasurement.service || "",
        startDate: editingMeasurement.startDate || "",
        dueDate: editingMeasurement.dueDate || "",
        price: editingMeasurement.price || "",
        priority: editingMeasurement.priority || "medium",
        description: editingMeasurement.description || "",
        orderReference: editingMeasurement.orderReference || "",
        advance: editingMeasurement.advance || "",
        balance: editingMeasurement.balance || "",
        // Traditional Measurements
        thool: editingMeasurement.measurements?.thool || "",
        kethet: editingMeasurement.measurements?.kethet || "",
        thoolKum: editingMeasurement.measurements?.thoolKum || "",
        ardhFKum: editingMeasurement.measurements?.ardhFKum || "",
        jamba: editingMeasurement.measurements?.jamba || "",
        ragab: editingMeasurement.measurements?.ragab || "",
        // Body Measurements
        chest: editingMeasurement.measurements?.chest || "",
        waist: editingMeasurement.measurements?.waist || "",
        hips: editingMeasurement.measurements?.hips || "",
        shoulder: editingMeasurement.measurements?.shoulder || "",
        neck: editingMeasurement.measurements?.neck || "",
        // Sleeve & Length Measurements
        sleeveLength: editingMeasurement.measurements?.sleeveLength || "",
        sleeveWidth: editingMeasurement.measurements?.sleeveWidth || "",
        inseam: editingMeasurement.measurements?.inseam || "",
        outseam: editingMeasurement.measurements?.outseam || "",
      })
    } else {
      setForm({
        customerName: "",
        phone: "",
        service: "",
        startDate: "",
        dueDate: "",
        price: "",
        priority: "medium",
        description: "",
        orderReference: "",
        advance: "",
        balance: "",
        // Traditional Measurements
        thool: "",
        kethet: "",
        thoolKum: "",
        ardhFKum: "",
        jamba: "",
        ragab: "",
        // Body Measurements
        chest: "",
        waist: "",
        hips: "",
        shoulder: "",
        neck: "",
        // Sleeve & Length Measurements
        sleeveLength: "",
        sleeveWidth: "",
        inseam: "",
        outseam: "",
      })
    }
  }, [editingMeasurement, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = {
      ...form,
      id: editingMeasurement?.id || `JO-${Date.now()}`,
      status: editingMeasurement?.status || "pending",
      measurements: {
        thool: Number.parseFloat(form.thool) || 0,
        kethet: Number.parseFloat(form.kethet) || 0,
        thoolKum: Number.parseFloat(form.thoolKum) || 0,
        ardhFKum: Number.parseFloat(form.ardhFKum) || 0,
        jamba: form.jamba,
        ragab: form.ragab,
        chest: Number.parseFloat(form.chest) || 0,
        waist: Number.parseFloat(form.waist) || 0,
        hips: Number.parseFloat(form.hips) || 0,
        shoulder: Number.parseFloat(form.shoulder) || 0,
        neck: Number.parseFloat(form.neck) || 0,
        sleeveLength: Number.parseFloat(form.sleeveLength) || 0,
        sleeveWidth: Number.parseFloat(form.sleeveWidth) || 0,
        inseam: Number.parseFloat(form.inseam) || 0,
        outseam: Number.parseFloat(form.outseam) || 0,
      },
    }
    onSubmit(formData, editingMeasurement?.id)
    resetForm()
  }

  const resetForm = () => {
    setForm({
      customerName: "",
      phone: "",
      service: "",
      startDate: "",
      dueDate: "",
      price: "",
      priority: "medium",
      description: "",
      orderReference: "",
      advance: "",
      balance: "",
      thool: "",
      kethet: "",
      thoolKum: "",
      ardhFKum: "",
      jamba: "",
      ragab: "",
      chest: "",
      waist: "",
      hips: "",
      shoulder: "",
      neck: "",
      sleeveLength: "",
      sleeveWidth: "",
      inseam: "",
      outseam: "",
    })
  }

  const handleCancel = () => {
    onClose()
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[min(95vw,900px)] h-[min(95vh,900px)] max-w-none max-h-none p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <DialogTitle className="flex items-center space-x-3 text-xl">
              {editingMeasurement ? (
                <>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Edit Measurement</span>
                </>
              ) : (
                <>
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span>New Measurement</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-base">
              {editingMeasurement
                ? "Update customer measurements and order details"
                : "Add new customer measurements and order details"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer & Order Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Information Card */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <User className="w-5 h-5 text-blue-600" />
                      <span>Customer Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="customerName" className="text-sm font-medium">
                          Customer Name *
                        </Label>
                        <Input
                          id="customerName"
                          name="customerName"
                          value={form.customerName}
                          onChange={handleChange}
                          placeholder="Enter customer name"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium">
                          Phone Number *
                        </Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="phone"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="service" className="text-sm font-medium">
                          Service Type *
                        </Label>
                        <Select
                          name="service"
                          value={form.service}
                          onValueChange={(value) => handleSelectChange("service", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceOptions.map((service) => (
                              <SelectItem key={service} value={service}>
                                <div className="flex items-center space-x-2">
                                  <Scissors className="w-4 h-4" />
                                  <span>{service}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="description" className="text-sm font-medium">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          placeholder="Enter order description"
                          rows={3}
                          className="mt-1 resize-none"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Information Card */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <span>Order Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate" className="text-sm font-medium">
                          Start Date *
                        </Label>
                        <Input
                          id="startDate"
                          name="startDate"
                          type="date"
                          value={form.startDate}
                          onChange={handleChange}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="dueDate" className="text-sm font-medium">
                          Due Date *
                        </Label>
                        <Input
                          id="dueDate"
                          name="dueDate"
                          type="date"
                          value={form.dueDate}
                          onChange={handleChange}
                          className="mt-1"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price" className="text-sm font-medium">
                          Total Price *
                        </Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="priority" className="text-sm font-medium">
                          Priority
                        </Label>
                        <Select
                          name="priority"
                          value={form.priority}
                          onValueChange={(value) => handleSelectChange("priority", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center space-x-2">
                                  <Badge className={`${option.color} text-xs`}>{option.label}</Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="advance" className="text-sm font-medium">
                          Advance Payment
                        </Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="advance"
                            name="advance"
                            type="number"
                            value={form.advance}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="balance" className="text-sm font-medium">
                          Balance
                        </Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="balance"
                            name="balance"
                            type="number"
                            value={form.balance}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="orderReference" className="text-sm font-medium">
                        Order Reference
                      </Label>
                      <div className="relative mt-1">
                        <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="orderReference"
                          name="orderReference"
                          value={form.orderReference}
                          onChange={handleChange}
                          placeholder="Enter order reference"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Measurements Section */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <Ruler className="w-5 h-5 text-purple-600" />
                    <span>Measurements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Traditional Measurements */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 pb-2 border-b">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300">Traditional Measurements</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { name: "thool", label: "Thool (cm)" },
                          { name: "kethet", label: "Kethet (cm)" },
                          { name: "thoolKum", label: "Thool Kum (cm)" },
                          { name: "ardhFKum", label: "Ardh F. Kum (cm)" },
                          { name: "jamba", label: "Jamba", type: "text", placeholder: "e.g., 9...19" },
                          { name: "ragab", label: "Ragab", type: "text", placeholder: "e.g., 12 56 5" },
                        ].map((field) => (
                          <div key={field.name}>
                            <Label
                              htmlFor={field.name}
                              className="text-xs font-medium text-gray-600 dark:text-gray-300"
                            >
                              {field.label}
                            </Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              type={field.type || "number"}
                              value={form[field.name]}
                              onChange={handleChange}
                              placeholder={field.placeholder || "0"}
                              className="h-9 mt-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Body Measurements */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 pb-2 border-b">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h4 className="font-semibold text-green-700 dark:text-green-300">Body Measurements</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { name: "chest", label: "Chest (cm)" },
                          { name: "waist", label: "Waist (cm)" },
                          { name: "hips", label: "Hips (cm)" },
                          { name: "shoulder", label: "Shoulder (cm)" },
                          { name: "neck", label: "Neck (cm)" },
                        ].map((field) => (
                          <div key={field.name}>
                            <Label
                              htmlFor={field.name}
                              className="text-xs font-medium text-gray-600 dark:text-gray-300"
                            >
                              {field.label}
                            </Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              type="number"
                              value={form[field.name]}
                              onChange={handleChange}
                              placeholder="0"
                              className="h-9 mt-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sleeve & Length Measurements */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 pb-2 border-b">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <h4 className="font-semibold text-purple-700 dark:text-purple-300">Sleeve & Length</h4>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { name: "sleeveLength", label: "Sleeve Length (cm)" },
                          { name: "sleeveWidth", label: "Sleeve Width (cm)" },
                          { name: "inseam", label: "Inseam (cm)" },
                          { name: "outseam", label: "Outseam (cm)" },
                        ].map((field) => (
                          <div key={field.name}>
                            <Label
                              htmlFor={field.name}
                              className="text-xs font-medium text-gray-600 dark:text-gray-300"
                            >
                              {field.label}
                            </Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              type="number"
                              value={form[field.name]}
                              onChange={handleChange}
                              placeholder="0"
                              className="h-9 mt-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          <Separator />

          <DialogFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-end space-x-3 w-full">
              <Button type="button" variant="outline" onClick={handleCancel} className="min-w-[100px] bg-transparent">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                className="min-w-[120px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingMeasurement ? "Update" : "Save"} Measurement
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
