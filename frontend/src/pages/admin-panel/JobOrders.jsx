"use client"

import { useState, useEffect } from "react"
import { Plus, Eye, Edit, Trash2, Clock, CheckCircle, AlertCircle, DollarSign, Printer } from "lucide-react"
import AddJobOrder from "../../components/forms/AddJobOrder"
import EditJobOrder from "../../components/forms/EditJobOrder"
import jobOrdersApi from "../../services/jobOrdersApi"
import { formatCurrency, safeParseFloat } from "../../utils/currencyUtils"
import JobOrderA5 from "../../components/print/joborder-a5"

export default function JobOrders() {
  const [jobOrders, setJobOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total_orders: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    delivered: 0,
    total_revenue: 0,
    total_balance: 0,
  })

  // Form states
  const [isAddFormOpen, setIsAddFormOpen] = useState(false)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [editingJobOrderId, setEditingJobOrderId] = useState(null)

  // Detail modal state
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Print state and helpers
  const [printOrder, setPrintOrder] = useState(null)

  // Date filter states
  const [dateFilter, setDateFilter] = useState({
    from: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    to: new Date().toISOString().split('T')[0]   // Today's date in YYYY-MM-DD format
  })

  // Search state
  const [searchTerm, setSearchTerm] = useState("")

  const toIsoDate = (d) => {
    if (!d) return ""
    try {
      return new Date(d).toLocaleDateString("en-CA")
    } catch {
      return ""
    }
  }

  const toDMY = (d) => {
    if (!d) return ""
    try {
      const dt = new Date(d)
      const dd = String(dt.getDate()).padStart(2, "0")
      const mm = String(dt.getMonth() + 1).padStart(2, "0")
      const yyyy = dt.getFullYear()
      return `${dd}-${mm}-${yyyy}`
    } catch {
      return ""
    }
  }

  const mapToA5 = (order) => {
    const amount = safeParseFloat(order?.total_amount ?? 0)
    return {
      invoiceNumber: order?.job_order_number || "",
      date: toIsoDate(order?.created_at),
      customerNumber: order?.customer_id || order?.id || "",
      customerName: order?.customer_name || "",
      customerPhone: order?.customer_phone || "",
      items: [
        {
          description: order?.remarks || "خدمة خياطة",
          qty: 1,
          unitPrice: amount || 0,
        },
      ],
      totals: { total: amount || 0, advance: 0, balance: amount || 0 },
      deliveryDate: toDMY(order?.delivery_date),
    }
  }

  const handlePrintOrder = (order) => {
    const a5 = mapToA5(order)
    setPrintOrder(a5)
    // Print directly without confirmation
    setTimeout(() => {
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Job Order</title>
            <style>
              @page { size: A5 portrait; margin: 8mm; }
              body { margin: 0; padding: 0; font-family: "Noto Naskh Arabic", "Tahoma", "Segoe UI", Arial, sans-serif; }
              .a5-sheet { width: 148mm; height: 210mm; background: #fff; color: #111827; padding: 8mm; }
              .hdr { border-bottom: 1px solid #d1d5db; padding-bottom: 4mm; margin-bottom: 4mm; }
              .hdr-top { display: grid; grid-template-columns: 1fr 2fr 1fr; align-items: center; margin-bottom: 2mm; }
              .brand { font-weight: 700; text-align: center; font-size: 14pt; }
              .small { font-size: 9pt; color: #4b5563; }
              .left { text-align: left; }
              .right { text-align: right; }
              .row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4mm; align-items: center; margin-top: 2mm; font-size: 10.5pt; }
              .row .cell { text-align: right; }
              .row .cell.left { text-align: left; }
              .row .cell.center { text-align: center; }
              .title { font-weight: 700; font-size: 12pt; }
              .submeta { grid-template-columns: 2fr 1fr; }
              table.items { width: 100%; border: 1px solid #9ca3af; border-collapse: collapse; font-size: 10.5pt; table-layout: fixed; }
              table.items th, table.items td { border: 1px solid #9ca3af; padding: 6px 8px; vertical-align: middle; }
              table.items thead th { background: #f3f4f6; font-weight: 700; text-align: right; }
              .col-details { width: 55%; }
              .col-qty { width: 15%; text-align: center; }
              .col-unit { width: 15%; text-align: right; }
              .col-amt { width: 15%; text-align: right; }
              .totals { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; margin-top: 6mm; }
              .delivery { align-self: end; font-size: 11pt; }
              .sum { justify-self: end; min-width: 45mm; font-size: 11pt; }
              .sum .row { grid-template-columns: auto 1fr; gap: 6mm; margin: 0; }
              .sum .label { text-align: right; }
              .sum .value { text-align: right; min-width: 30mm; }
              .ftr { border-top: 1px solid #d1d5db; margin-top: 6mm; padding-top: 3mm; font-size: 9.5pt; color: #374151; }
              .hours { text-align: center; }
            </style>
          </head>
          <body>
            <div class="a5-sheet">
              <div class="hdr" dir="rtl">
                <div class="hdr-top">
                  <div class="left small">SINCE 1987</div>
                  <div class="center brand">أم درمان للخياطة والأقمشة السودانية - الدوحة</div>
                  <div class="right small"><span>جوال:</span> 5071516122</div>
                </div>
                <div class="row meta">
                  <div class="cell">
                    <span>الرقم فاتورة:</span> <strong>${a5.invoiceNumber}</strong>
                  </div>
                  <div class="cell center title">فاتورة الخياطة</div>
                  <div class="cell left">
                    <span>التاريخ:</span> <strong>${a5.date}</strong>
                  </div>
                </div>
                <div class="row submeta">
                  <div class="cell">
                    <span>اسم الزبون:</span> <strong>${a5.customerName}</strong>
                    ${a5.customerPhone ? ` - ${a5.customerPhone}` : ''}
                  </div>
                  <div class="cell right">
                    <span>رقم العميل:</span> <strong>${a5.customerNumber}</strong>
                  </div>
                </div>
              </div>
              <div class="tbl" dir="rtl">
                <table class="items">
                  <thead>
                    <tr>
                      <th class="col-details">التفاصيل</th>
                      <th class="col-qty">كمية</th>
                      <th class="col-unit">سعر الوحدة</th>
                      <th class="col-amt">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${a5.items.map(item => `
                      <tr>
                        <td class="col-details">${item.description}</td>
                        <td class="col-qty">${item.qty}</td>
                        <td class="col-unit">${item.unitPrice.toFixed(2)}</td>
                        <td class="col-amt">${(item.qty * item.unitPrice).toFixed(2)}</td>
                      </tr>
                    `).join('')}
                    ${Array.from({ length: Math.max(6 - a5.items.length, 0) }).map(() => `
                      <tr>
                        <td class="col-details">&nbsp;</td>
                        <td class="col-qty">&nbsp;</td>
                        <td class="col-unit">&nbsp;</td>
                        <td class="col-amt">&nbsp;</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                <div class="totals">
                  <div class="delivery">
                    <span>تاريخ تسليم:</span> <strong>${a5.deliveryDate}</strong>
                  </div>
                  <div class="sum">
                    <div class="row">
                      <div class="label">المجموع:</div>
                      <div class="value">${a5.totals.total.toFixed(2)}</div>
                    </div>
                    <div class="row">
                      <div class="label">مقدماً:</div>
                      <div class="value">${a5.totals.advance.toFixed(2)}</div>
                    </div>
                    <div class="row">
                      <div class="label">الباقي:</div>
                      <div class="value">${a5.totals.balance.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="ftr" dir="rtl">
                <div class="hours">
                  <span>ساعات العمل:</span> صباحاً من 08:30 الى 01:00 مساءً من 04:00 الى 10:00 / الجمعة من 04:00 الى 10:00
                </div>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
      setPrintOrder(null)
    }, 100)
  }

  // Load job orders and stats on component mount and when date filter or search changes
  useEffect(() => {
    loadJobOrders()
    loadStats()
  }, [dateFilter.from, dateFilter.to, searchTerm])

  useEffect(() => {
    const onAfter = () => setPrintOrder(null)
    window.addEventListener("afterprint", onAfter)
    return () => window.removeEventListener("afterprint", onAfter)
  }, [])

  const loadJobOrders = async () => {
    try {
      setIsLoading(true)
      setError(null) // Clear previous errors

      // Pass parameters to the API
      const params = {}

      // If there's a search term, search across all job orders (ignore date filter)
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      } else {
        // Only apply date filter when not searching
        params.from_date = dateFilter.from
        params.to_date = dateFilter.to
      }

      const response = await jobOrdersApi.getJobOrders(params)
      console.log("API Response:", response) // Debug log

      // Handle different response structures
      let jobOrdersData = []
      if (Array.isArray(response)) {
        jobOrdersData = response
      } else if (response && Array.isArray(response.results)) {
        jobOrdersData = response.results
      } else if (response && Array.isArray(response.data)) {
        jobOrdersData = response.data
      } else {
        console.warn("Unexpected response structure:", response)
        jobOrdersData = []
      }

      setJobOrders(jobOrdersData)
    } catch (error) {
      console.error("Error loading job orders:", error)
      const errorMessage = error.response?.data?.error || error.message || "Failed to load job orders"
      setError(errorMessage)
      setJobOrders([]) // Ensure it's always an array
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await jobOrdersApi.getJobOrderStats()
      setStats(
        statsData || {
          total_orders: 0,
          pending: 0,
          in_progress: 0,
          completed: 0,
          delivered: 0,
          total_revenue: 0,
          total_balance: 0,
        },
      )
    } catch (error) {
      console.error("Error loading stats:", error)
      // Set default stats on error
      setStats({
        total_orders: 0,
        pending: 0,
        in_progress: 0,
        completed: 0,
        delivered: 0,
        total_revenue: 0,
        total_balance: 0,
      })
    }
  }

  // Handle form operations
  const handleNewJobOrder = () => {
    setIsAddFormOpen(true)
  }

  const handleEditJobOrder = (order) => {
    setEditingJobOrderId(order.id)
    setIsEditFormOpen(true)
  }

  const handleDeleteJobOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this job order?")) {
      try {
        await jobOrdersApi.deleteJobOrder(orderId)
        loadJobOrders() // Refresh the list
        loadStats() // Refresh stats
      } catch (error) {
        console.error("Error deleting job order:", error)
        setError("Failed to delete job order")
      }
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await jobOrdersApi.updateJobOrderStatus(orderId, newStatus)
      loadJobOrders() // Refresh the list
      loadStats() // Refresh stats
    } catch (error) {
      console.error("Error updating status:", error)
      setError("Failed to update job order status")
    }
  }

  const handleFormSuccess = () => {
    loadJobOrders() // Refresh the list
    loadStats() // Refresh stats
    setIsAddFormOpen(false)
    setIsEditFormOpen(false)
    setEditingJobOrderId(null)
  }

  const handleFormClose = () => {
    setIsAddFormOpen(false)
    setIsEditFormOpen(false)
    setEditingJobOrderId(null)
  }

  const openOrderDetail = (order) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }

  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSearchChange = (value) => {
    setSearchTerm(value)
  }

  const handleClearSearch = () => {
    setSearchTerm("")
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "delivered":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "in_progress":
        return <Clock className="w-4 h-4" />
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      case "delivered":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage tailoring job orders and customer measurements</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => (Array.isArray(jobOrders) && jobOrders.length ? handlePrintOrder(jobOrders[0]) : null)}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-60"
            disabled={!Array.isArray(jobOrders) || jobOrders.length === 0}
          >
            <Printer className="w-4 h-4" />
            <span>Print Slip</span>
          </button>
          <button
            onClick={handleNewJobOrder}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Job Order</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar - Only show when forms are not open */}
      {!isAddFormOpen && !isEditFormOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Search and Filter Job Orders</h3>
          
          {/* Search Bar */}
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search by Job Order Number, Customer Name, Phone, or Customer ID
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Enter job order number, customer name, phone, or customer ID..."
                className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            {searchTerm && (
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Searching for: <span className="font-medium">"{searchTerm}"</span>
              </div>
            )}
          </div>

          {/* Date Filter and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 sm:flex-none sm:w-48">
              <label htmlFor="from-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                id="from-date"
                value={dateFilter.from}
                onChange={(e) => handleDateFilterChange('from', e.target.value)}
                disabled={searchTerm.trim() !== ""}
                className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  searchTerm.trim() !== "" ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div className="flex-1 sm:flex-none sm:w-48">
              <label htmlFor="to-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                id="to-date"
                value={dateFilter.to}
                onChange={(e) => handleDateFilterChange('to', e.target.value)}
                disabled={searchTerm.trim() !== ""}
                className={`w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  searchTerm.trim() !== "" ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0]
                  setDateFilter({ from: today, to: today })
                }}
                disabled={searchTerm.trim() !== ""}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  searchTerm.trim() !== "" 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-500 hover:bg-gray-600 text-white'
                }`}
              >
                Today
              </button>
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 text-sm rounded-md transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
          
          {/* Status indicator */}
          {searchTerm.trim() !== "" && (
            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md">
              <strong>Search Mode:</strong> Searching across all job orders (date filter disabled)
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Add Job Order Form */}
      {isAddFormOpen && <AddJobOrder onClose={handleFormClose} onSuccess={handleFormSuccess} />}

      {/* Edit Job Order Form */}
      {isEditFormOpen && editingJobOrderId && (
        <EditJobOrder jobOrderId={editingJobOrderId} onClose={handleFormClose} onSuccess={handleFormSuccess} />
      )}

      {/* Job Orders List */}
      {!isAddFormOpen && !isEditFormOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Job Orders</h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading job orders...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Job Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {Array.isArray(jobOrders) && jobOrders.length > 0 ? (
                    jobOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {order.job_order_number}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{order.customer_name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer_phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.remarks || "Custom tailoring"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {order.remarks}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                          >
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status.replace("-", " ")}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            ${formatCurrency(order.total_amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor("medium")}`}
                          >
                            Medium
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openOrderDetail(order)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditJobOrder(order)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteJobOrder(order.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handlePrintOrder(order)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              title="Print A5 slip"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        {isLoading ? "Loading job orders..." : "No job orders found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.in_progress}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${formatCurrency(stats.total_revenue)}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
