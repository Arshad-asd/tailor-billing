import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { 
  Edit, 
  Plus, 
  Minus, 
  Trash2, 
  Package,
  DollarSign,
  User,
  Clock,
  Save,
  X
} from "lucide-react"

export default function EditOrderModal({ 
  open, 
  onClose, 
  onSave,
  selectedCustomer,
  selectedItems,
  orderType,
  totals,
  foodItems
}) {
  const [editedItems, setEditedItems] = useState({ ...selectedItems })
  const [editedOrderType, setEditedOrderType] = useState(orderType)
  const [isSaving, setIsSaving] = useState(false)

  // Calculate new totals
  const calculateNewTotals = () => {
    let subtotal = 0
    let discount = 0

    Object.entries(editedItems).forEach(([_, item]) => {
      subtotal += item.price * item.quantity
      if (item.discount) {
        discount += item.discount
      }
    })

    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax - discount

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
    }
  }

  const newTotals = calculateNewTotals()

  // Handle quantity changes
  const updateQuantity = (id, change) => {
    setEditedItems((prev) => {
      const current = prev[id] || { quantity: 0, price: foodItems.find((item) => item.id === id)?.price || 0 }
      const newQuantity = Math.max(0, current.quantity + change)

      if (newQuantity === 0) {
        const { [id]: _, ...rest } = prev
        return rest
      }

      return {
        ...prev,
        [id]: { ...current, quantity: newQuantity },
      }
    })
  }

  // Handle discount changes
  const updateDiscount = (id, discount) => {
    setEditedItems((prev) => ({
      ...prev,
      [id]: { ...prev[id], discount: parseFloat(discount) || 0 }
    }))
  }

  // Remove item
  const removeItem = (id) => {
    setEditedItems((prev) => {
      const { [id]: _, ...rest } = prev
      return rest
    })
  }

  // Get food item details by ID
  const getItemById = (id) => {
    return foodItems.find((item) => item.id === id)
  }

  // Handle save changes
  const handleSaveChanges = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      onSave({
        items: editedItems,
        orderType: editedOrderType,
        totals: newTotals
      })
      setIsSaving(false)
      onClose()
    }, 1000)
  }

  // Check if there are changes
  const hasChanges = () => {
    return JSON.stringify(editedItems) !== JSON.stringify(selectedItems) || 
           editedOrderType !== orderType
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[1200px] w-full max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="px-8 py-6 border-b bg-blue-50">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-blue-700">
            <Edit className="h-7 w-7" />
            Edit Order
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-8 p-8">
          {/* Order Info Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <User className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedCustomer?.name}</h3>
                    <p className="text-base text-gray-500">Order #{Math.floor(Math.random() * 1000)}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-200 px-4 py-2 text-base">
                  <Clock className="h-4 w-4 mr-2" />
                  Editing
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Order Type Selection */}
          <Card>
            <CardHeader className="pb-2">
              <Label className="text-lg font-semibold">Order Type</Label>
            </CardHeader>
            <CardContent className="pb-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: "dine-in", label: "Dine In", icon: "🍽️" },
                  { id: "takeaway", label: "Takeaway", icon: "📦" },
                  { id: "delivery", label: "Delivery", icon: "🚚" }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setEditedOrderType(type.id)}
                    className={`flex flex-col items-center justify-center p-6 rounded-lg border text-center transition-colors w-full h-full text-lg font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      editedOrderType === type.id
                        ? "border-blue-500 bg-blue-100 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader className="pb-2">
              <h4 className="text-lg font-semibold">Order Items</h4>
            </CardHeader>
            <CardContent className="pb-6 pt-2">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="outline" className="text-base px-4 py-2">
                  {Object.values(editedItems).reduce((sum, item) => sum + item.quantity, 0)} items
                </Badge>
              </div>
              <div className="space-y-4">
                {Object.entries(editedItems).map(([id, item]) => {
                  const foodItem = getItemById(id)
                  if (!foodItem) return null

                  return (
                    <Card key={id} className="border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package className="h-8 w-8 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-lg truncate">{foodItem.name}</h5>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                onClick={() => removeItem(id)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>
                            <p className="text-base text-gray-500 mb-3">{foodItem.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* Quantity */}
                              <div>
                                <Label className="text-sm text-gray-600">Quantity</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQuantity(id, -1)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-10 text-center font-medium text-lg">{item.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQuantity(id, 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {/* Price */}
                              <div>
                                <Label className="text-sm text-gray-600">Price</Label>
                                <p className="font-medium mt-1 text-lg">${item.price.toFixed(2)}</p>
                              </div>
                              {/* Discount */}
                              <div>
                                <Label className="text-sm text-gray-600">Discount</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max={item.price * item.quantity}
                                  value={item.discount || 0}
                                  onChange={(e) => updateDiscount(id, e.target.value)}
                                  className="h-10 text-base"
                                />
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                              <span className="text-base text-gray-600">Item Total:</span>
                              <span className="font-semibold text-lg">
                                ${((item.price * item.quantity) - (item.discount || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              {Object.keys(editedItems).length === 0 && (
                <Card className="border-dashed border-gray-300">
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-lg">No items in order</p>
                    <p className="text-base text-gray-400">Add items from the menu</p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Updated Totals */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <h4 className="font-semibold text-blue-800 text-lg">Updated Order Summary</h4>
            </CardHeader>
            <CardContent className="pb-6 pt-2">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 text-base">Subtotal:</span>
                  <span className="text-lg">${newTotals.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-base">Tax:</span>
                  <span className="text-lg">${newTotals.tax}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 text-base">Discount:</span>
                  <span className="text-blue-600 text-lg">-${newTotals.discount}</span>
                </div>
                <div className="flex justify-between font-semibold text-xl border-t pt-4">
                  <span>Total:</span>
                  <span>${newTotals.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 text-lg py-4 border-2 border-gray-300"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveChanges}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg py-4 border-2 border-blue-500"
              disabled={!hasChanges() || isSaving}
            >
              {isSaving ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 