"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Printer, Edit, Trash2, DollarSign, TrendingUp, Users, Clock } from "lucide-react"
import AddSaleModal from "../../components/modals/AddSaleModal"
import EditSaleModal from "../../components/modals/EditSaleModal"
import { salesAPI } from "../../services/salesApi"
import { useNotification } from "../../hooks/useNotification"
import { buildA5TailorInvoiceHTML } from "../../components/print/a5-tailor-invoice"
import { printHTMLInNewWindow } from "../../components/print/print"

export default function Sales() {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSale, setEditingSale] = useState(null)
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showNotification } = useNotification()

  // Load sales data on component mount and when filters change
  useEffect(() => {
    loadSales()
  }, [startDate, endDate])

  const loadSales = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const params = {}
      if (startDate) {
        params.start_date = startDate
      }
      if (endDate) {
        params.end_date = endDate
      }
      
      const response = await salesAPI.getSales(params)
      // Handle both array response and object with data/results property
      let salesData = []
      if (Array.isArray(response)) {
        salesData = response
      } else if (response?.data && Array.isArray(response.data)) {
        salesData = response.data
      } else if (response?.results && Array.isArray(response.results)) {
        salesData = response.results
      }
      setSales(salesData)
    } catch (err) {
      console.error("Error loading sales:", err)
      setError("Failed to load sales data")
      setSales([]) // Set empty array on error
      showNotification("Failed to load sales data", "error")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredSales = (sales || []).filter((sale) => {
    const matchesSearch =
      sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.sale_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const totalRevenue = (sales || [])
    .filter((s) => s.status === "completed")
    .reduce((sum, sale) => sum + Number.parseFloat(sale.total_amount || sale.amount || 0), 0)
  const pendingRevenue = (sales || [])
    .filter((s) => s.status === "pending")
    .reduce((sum, sale) => sum + Number.parseFloat(sale.total_amount || sale.amount || 0), 0)
  const totalSales = (sales || []).filter((s) => s.status === "completed").length

  const handleAddSale = async (formData) => {
    try {
      // Transform form data to match API structure
      const saleData = {
        customer_name: formData.customerName,
        amount: Number.parseFloat(formData.amount),
        total_amount: Number.parseFloat(formData.amount),
        date: formData.date,
        payment_method: formData.paymentMethod.toLowerCase().replace(" ", "_"),
        status: formData.status || "pending",
        notes: formData.notes,
        sale_items: formData.sale_items || [], // Include sale items in the payload
      }

      const response = await salesAPI.createSale(saleData)
      setSales((prev) => [response.data, ...(Array.isArray(prev) ? prev : [])])
      showNotification("Sale created successfully", "success")
      setIsAddModalOpen(false)
    } catch (err) {
      console.error("Error creating sale:", err)
      showNotification("Failed to create sale", "error")
    }
  }

  const handleEditSale = async (formData, saleId) => {
    try {
      // Transform form data to match API structure
      const saleData = {
        customer_name: formData.customerName,
        amount: Number.parseFloat(formData.amount),
        total_amount: Number.parseFloat(formData.amount),
        date: formData.date,
        payment_method: formData.paymentMethod.toLowerCase().replace(" ", "_"),
        status: formData.status,
        notes: formData.notes,
        sale_items: formData.sale_items || [], // Include sale items in the payload
      }

      const response = await salesAPI.updateSale(saleId, saleData)
      setSales((prev) => (Array.isArray(prev) ? prev : []).map((sale) => (sale.id === saleId ? response.data : sale)))
      showNotification("Sale updated successfully", "success")
      setIsEditModalOpen(false)
      setEditingSale(null)
    } catch (err) {
      console.error("Error updating sale:", err)
      showNotification("Failed to update sale", "error")
    }
  }

  const handleEditClick = async (sale) => {
    try {
      // Fetch complete sale details with sale_items
      const response = await salesAPI.getSale(sale.id)
      setEditingSale(response.data)
      setIsEditModalOpen(true)
    } catch (err) {
      console.error("Error fetching sale details:", err)
      showNotification("Failed to load sale details", "error")
    }
  }

  const handleDeleteSale = async (saleId) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        await salesAPI.deleteSale(saleId)
        setSales((prev) => (Array.isArray(prev) ? prev : []).filter((sale) => sale.id !== saleId))
        showNotification("Sale deleted successfully", "success")
      } catch (err) {
        console.error("Error deleting sale:", err)
        showNotification("Failed to delete sale", "error")
      }
    }
  }

  const handlePrintClick = async (sale) => {
    try {
      // Fetch complete sale details with sale_items
      const response = await salesAPI.getSale(sale.id)
      const saleData = response.data

      const items = Array.isArray(saleData.sale_items)
        ? saleData.sale_items.map((it) => ({
            description: it.description || saleData.notes || "خدمة خياطة",
            qty: Number(it.quantity ?? it.qty ?? 1),
            unitPrice: Number(
              it.unit_price ?? it.unitPrice ?? it.price ?? saleData.total_amount ?? saleData.amount ?? 0,
            ),
          }))
        : undefined

      const total = Number(saleData.total_amount ?? saleData.amount ?? 0)
      const deposit = Number(saleData.deposit ?? 0)
      const mapped = {
        sale_number: saleData.sale_number || saleData.id,
        id: saleData.id,
        date: saleData.date,
        customer_name: saleData.customer_name,
        customer_phone: saleData.customer_phone,
        notes: saleData.notes,
        items,
        total,
        deposit,
        balance: Number(saleData.balance ?? total - deposit),
        deliveryDate: saleData.delivery_date || saleData.deliveryDate || saleData.date,
      }

      const html = buildA5TailorInvoiceHTML(mapped)
      printHTMLInNewWindow(html)
    } catch (err) {
      console.error("Error fetching sale details:", err)
      showNotification("Failed to load sale details", "error")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales</h1>
          <p className="text-gray-600 dark:text-gray-400">Track sales and revenue</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Sale</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Sales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSales}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${pendingRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {new Set(sales.map((s) => s.customerName)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("")
                  setEndDate("")
                }}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading sales...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 dark:text-red-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sales Table */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sale ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{sale.sale_number}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">ID: {sale.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{sale.customer_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{sale.notes || "No description"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${Number.parseFloat(sale.total_amount || sale.amount || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {sale.date ? new Date(sale.date).toLocaleDateString() : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {sale.payment_method?.replace("_", " ").toUpperCase() || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handlePrintClick(sale)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(sale)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredSales.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No sales found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || startDate || endDate
                ? "No sales match your current filters."
                : "Get started by creating a new sale."}
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddSaleModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddSale} />

      <EditSaleModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingSale(null)
        }}
        onSubmit={handleEditSale}
        editingSale={editingSale}
      />
    </div>
  )
}
