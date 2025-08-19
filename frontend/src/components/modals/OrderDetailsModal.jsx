import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  DollarSign,
  Receipt,
  Package,
  Truck,
  Utensils,
  Printer,
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export default function OrderDetailsModal({ 
  open, 
  onClose, 
  orderData,
  selectedCustomer,
  selectedItems,
  orderType,
  totals 
}) {
  const [activeTab, setActiveTab] = useState("details")

  const getOrderTypeIcon = (type) => {
    switch (type) {
      case "dine-in":
        return <Utensils className="h-4 w-4" />
      case "takeaway":
        return <Package className="h-4 w-4" />
      case "delivery":
        return <Truck className="h-4 w-4" />
      default:
        return <Receipt className="h-4 w-4" />
    }
  }

  const getOrderTypeColor = (type) => {
    switch (type) {
      case "dine-in":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "takeaway":
        return "bg-green-100 text-green-800 border-green-200"
      case "delivery":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getItemById = (id) => {
    // This would come from the foodItems prop in a real implementation
    return {
      name: `Item ${id}`,
      description: "Food item description",
      price: 0
    }
  }

  const tabs = [
    { id: "details", label: "Overview", icon: Receipt },
    { id: "customer", label: "Customer", icon: User },
    { id: "items", label: "Items", icon: Package },
    { id: "payment", label: "Payment", icon: DollarSign }
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[1200px] w-full max-h-[95vh] p-0 overflow-x-auto">
        <DialogHeader className="px-8 py-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Receipt className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Order #{orderData?.orderNumber || "NEW"}</DialogTitle>
                <p className="text-base text-gray-500">Created at {new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getOrderTypeColor(orderType)} flex items-center gap-1 text-base py-2 px-4`}>
                {getOrderTypeIcon(orderType)}
                <span className="capitalize">{orderType.replace('-', ' ')}</span>
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col h-full min-w-[700px]">
          {/* Tabs */}
          <div className="px-8 py-4 border-b bg-white">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-fit">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Items</p>
                          <p className="text-2xl font-bold">
                            {Object.values(selectedItems).reduce((sum, item) => sum + item.quantity, 0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold">${totals?.total || "0.00"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Order Time</p>
                          <p className="text-lg font-semibold">{new Date().toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Active
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        Order Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Order Type</p>
                          <p className="font-medium capitalize">{orderType.replace('-', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Order Time</p>
                          <p className="font-medium">{new Date().toLocaleTimeString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Status</p>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Active
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Items Count</p>
                          <p className="font-medium">
                            {Object.values(selectedItems).reduce((sum, item) => sum + item.quantity, 0)} items
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Payment Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">${totals?.subtotal || "0.00"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tax (10%)</span>
                          <span className="font-medium">${totals?.tax || "0.00"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Discount</span>
                          <span className="font-medium text-orange-600">-${totals?.discount || "0.00"}</span>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold">Total</span>
                            <span className="text-2xl font-bold text-green-600">${totals?.total || "0.00"}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Customer Preview */}
                {selectedCustomer && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-purple-600" />
                        Customer Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-full">
                          <User className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{selectedCustomer.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {selectedCustomer.phone}
                            </span>
                            {selectedCustomer.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {selectedCustomer.email}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("customer")}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "customer" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-purple-600" />
                      Customer Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <User className="h-8 w-8 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xl">{selectedCustomer?.name}</h4>
                        <p className="text-sm text-gray-500">Customer ID: {selectedCustomer?.id}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Phone Number</p>
                            <p className="font-medium">{selectedCustomer?.phone}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Email Address</p>
                            <p className="font-medium">{selectedCustomer?.email || "Not provided"}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="font-medium">{selectedCustomer?.address || "Not provided"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Customer Since</p>
                            <p className="font-medium">January 2024</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "items" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Order Items ({Object.values(selectedItems).reduce((sum, item) => sum + item.quantity, 0)} items)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(selectedItems).map(([id, item]) => (
                        <div key={id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-6 w-6 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-lg truncate">Item #{id}</h4>
                              <Badge variant="outline" className="text-sm">
                                Qty: {item.quantity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">Food item description</p>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                ${item.price.toFixed(2)} each
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-lg">${(item.price * item.quantity).toFixed(2)}</p>
                                {item.discount && (
                                  <p className="text-xs text-orange-600">Discount: ${item.discount.toFixed(2)}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No payment method selected</p>
                        <p className="text-sm text-gray-500">Select a payment method to proceed</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        Payment Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-6 w-6 text-yellow-600" />
                          <div>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200 mb-1">
                              Pending
                            </Badge>
                            <p className="text-sm text-yellow-700">Payment not yet processed</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-blue-600" />
                      Payment Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">${totals?.subtotal || "0.00"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Tax (10%)</span>
                        <span className="font-medium">${totals?.tax || "0.00"}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Discount</span>
                        <span className="font-medium text-orange-600">-${totals?.discount || "0.00"}</span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-semibold">Total Due</span>
                          <span className="text-2xl font-bold text-green-600">${totals?.total || "0.00"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="px-8 py-6 border-t bg-gray-50">
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
                <Printer className="h-4 w-4 mr-2" />
                Print Order Details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 