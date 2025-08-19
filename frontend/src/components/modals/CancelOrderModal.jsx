import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Badge } from "../ui/badge"
import { Textarea } from "../ui/textarea"
import { Label } from "../ui/label"
import { 
  AlertTriangle, 
  XCircle, 
  Clock, 
  DollarSign,
  User,
  Package,
  Receipt
} from "lucide-react"

export default function CancelOrderModal({ 
  open, 
  onClose, 
  onCancel,
  selectedCustomer,
  selectedItems,
  orderType,
  totals 
}) {
  const [cancelReason, setCancelReason] = useState("")
  const [selectedReason, setSelectedReason] = useState("")
  const [isConfirming, setIsConfirming] = useState(false)

  const cancelReasons = [
    { id: "customer_request", label: "Customer Request", icon: User },
    { id: "out_of_stock", label: "Out of Stock", icon: Package },
    { id: "kitchen_issue", label: "Kitchen Issue", icon: Clock },
    { id: "payment_issue", label: "Payment Issue", icon: DollarSign },
    { id: "system_error", label: "System Error", icon: Receipt },
    { id: "other", label: "Other", icon: XCircle }
  ]

  const handleCancelOrder = () => {
    setIsConfirming(true)
    // Simulate API call
    setTimeout(() => {
      onCancel({
        reason: selectedReason,
        notes: cancelReason,
        cancelledAt: new Date().toISOString()
      })
      setIsConfirming(false)
      onClose()
    }, 1000)
  }

  const getReasonIcon = (reasonId) => {
    const reason = cancelReasons.find(r => r.id === reasonId)
    return reason ? reason.icon : XCircle
  }

  const getReasonLabel = (reasonId) => {
    const reason = cancelReasons.find(r => r.id === reasonId)
    return reason ? reason.label : "Unknown"
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[1200px] w-full max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="px-8 py-6 border-b bg-red-50">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-red-700">
            <AlertTriangle className="h-7 w-7" />
            Cancel Order
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-8 p-8">
          {/* Warning Message */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1 text-lg">Are you sure you want to cancel this order?</h4>
                  <p className="text-base text-red-700">
                    This action cannot be undone. The order will be marked as cancelled and removed from active orders.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-2">
              <h4 className="font-semibold text-lg">Order Summary</h4>
            </CardHeader>
            <CardContent className="pb-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                <div>
                  <span className="text-gray-600">Customer:</span>
                  <p className="font-medium">{selectedCustomer?.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Order Type:</span>
                  <p className="font-medium capitalize">{orderType.replace('-', ' ')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Items:</span>
                  <p className="font-medium">
                    {Object.values(selectedItems).reduce((sum, item) => sum + item.quantity, 0)} items
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Total:</span>
                  <p className="font-medium">${totals?.total || "0.00"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancel Reason Selection */}
          <Card>
            <CardHeader className="pb-2">
              <Label className="text-lg font-semibold">Select Cancellation Reason <span className="text-red-500">*</span></Label>
            </CardHeader>
            <CardContent className="pb-6 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cancelReasons.map((reason) => {
                  const Icon = reason.icon
                  return (
                    <button
                      key={reason.id}
                      onClick={() => setSelectedReason(reason.id)}
                      className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-colors w-full h-full text-base font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 ${
                        selectedReason === reason.id
                          ? "border-red-500 bg-red-100 text-red-700"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {reason.label}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader className="pb-2">
              <Label htmlFor="cancel-notes" className="text-lg font-semibold">Additional Notes <span className="text-gray-400">(Optional)</span></Label>
            </CardHeader>
            <CardContent className="pb-6 pt-2">
              <Textarea
                id="cancel-notes"
                placeholder="Provide additional details about the cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="text-base"
              />
            </CardContent>
          </Card>

          {/* Cancellation Impact */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="pb-2">
              <h4 className="font-semibold text-orange-800 text-lg">Cancellation Impact</h4>
            </CardHeader>
            <CardContent className="pb-6 pt-2">
              <ul className="text-base text-orange-700 space-y-1 pl-4 list-disc">
                <li>Order will be removed from active orders</li>
                <li>Customer will be notified of cancellation</li>
                <li>Order history will be updated</li>
                <li>Any payments will be refunded if applicable</li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 text-lg py-4 border-2 border-gray-300"
              disabled={isConfirming}
            >
              Keep Order
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelOrder}
              className="flex-1 text-lg py-4 border-2 border-red-500 bg-red-600 hover:bg-red-700"
              disabled={!selectedReason || isConfirming}
            >
              {isConfirming ? (
                <>
                  <Clock className="h-5 w-5 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 mr-2" />
                  Cancel Order
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 