"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { jobOrdersApi } from "../../services/jobOrdersApi"
import { salesAPI } from "../../services/salesApi"
import { customerApi } from "../../services/customerApi.js"
import { inventoryAPI } from "../../services/inventoryApi"
import LoadingSpinner from "../../components/LoadingSpinner"
import { printJobOrderReport, printSalesReport, printCustomerReport, printSummaryReport } from "../../utils/printUtils"
import {
  FileText,
  Download,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  DollarSign,
  Users,
  ClipboardList,
  TrendingUp,
  Calendar,
  CreditCard,
  Banknote,
  Wallet,
  Printer,
} from "lucide-react"

const Reports = () => {
  const [activeTab, setActiveTab] = useState("job-orders")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Job Order Report State
  const [jobOrderData, setJobOrderData] = useState([])
  const [jobOrderFilters, setJobOrderFilters] = useState({
    payment_method: "all",
    start_date: new Date().toISOString().split('T')[0], // Today's date
    end_date: new Date().toISOString().split('T')[0], // Today's date
  })
  const [jobOrderPagination, setJobOrderPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    page_size: 10,
  })
  const [jobOrderPageSize, setJobOrderPageSize] = useState(10)
  const [jobOrderTotals, setJobOrderTotals] = useState({
    total_advance: 0,
    total_balance: 0,
    total_cash: 0,
    total_card: 0,
    grand_total: 0,
  })

  // Sales Report State
  const [salesData, setSalesData] = useState([])
  const [salesFilters, setSalesFilters] = useState({
    payment_method: "all",
    item_filter: "all",
    start_date: new Date().toISOString().split('T')[0], // Today's date
    end_date: new Date().toISOString().split('T')[0], // Today's date
  })
  const [items, setItems] = useState([])
  const [salesPagination, setSalesPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    page_size: 10,
  })
  const [salesPageSize, setSalesPageSize] = useState(10)
  const [salesTotals, setSalesTotals] = useState({
    total_amount: 0,
    total_cash: 0,
    total_bank: 0,
    total_cash_bank: 0,
  })

  // Customer Report State
  const [customerData, setCustomerData] = useState([])
  const [customerFilters, setCustomerFilters] = useState({
    start_date: new Date().toISOString().split('T')[0], // Today's date
    end_date: new Date().toISOString().split('T')[0], // Today's date
  })
  const [customerPagination, setCustomerPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    page_size: 10,
  })
  const [customerPageSize, setCustomerPageSize] = useState(10)
  const [customerTotals, setCustomerTotals] = useState({
    total_customers: 0,
    total_orders: 0,
    total_amount: 0,
    total_balance: 0,
  })

  // Tab navigation
  const tabs = [
    {
      id: "job-orders",
      name: "Job Order Report",
      icon: ClipboardList,
      description: "Payment method wise job order analysis",
    },
    {
      id: "sales",
      name: "Sales Report",
      icon: DollarSign,
      description: "Sales analysis with item and payment filters",
    },
    {
      id: "customers",
      name: "Customer Report",
      icon: Users,
      description: "Customer-wise job order analysis",
    },
    {
      id: "summary",
      name: "Summary Report",
      icon: BarChart3,
      description: "Overall business performance summary",
    },
  ]

  // Fetch Job Order Report
  const fetchJobOrderReport = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page,
        page_size: jobOrderPageSize,
      }
      
      // Add payment method filter if not 'all'
      if (jobOrderFilters.payment_method && jobOrderFilters.payment_method !== 'all') {
        params.payment_method = jobOrderFilters.payment_method
      }
      
      // Add date filters if provided (backend expects from_date and to_date)
      if (jobOrderFilters.start_date) {
        params.from_date = jobOrderFilters.start_date
      }
      if (jobOrderFilters.end_date) {
        params.to_date = jobOrderFilters.end_date
      }
      
      console.log('Job Order API Params:', params)
      
      const response = await jobOrdersApi.getJobOrders(params)
      
      console.log('Job Order API Response:', response)
      
      // Handle both array response and paginated response
      let data = Array.isArray(response) ? response : (response.results || [])
      
      console.log('Processed Job Order Data:', data)
      
      setJobOrderData(data)
      setJobOrderPagination({
        current_page: response.current_page || 1,
        total_pages: response.total_pages || 1,
        total_count: response.total_count || data.length,
        page_size: jobOrderPageSize,
      })
      
      // Calculate totals
      const totals = data.reduce((acc, order) => {
        acc.total_advance += parseFloat(order.advance_amount || 0)
        acc.total_balance += parseFloat(order.balance_amount || 0)
        acc.total_cash += parseFloat(order.cash_amount || 0)
        acc.total_card += parseFloat(order.card_amount || 0)
        acc.grand_total += parseFloat(order.total_amount || 0)
        return acc
      }, {
        total_advance: 0,
        total_balance: 0,
        total_cash: 0,
        total_card: 0,
        grand_total: 0,
      })
      
      setJobOrderTotals(totals)
    } catch (err) {
      console.error('Error fetching job order report:', err)
      setError('Failed to load job order report')
    } finally {
      setLoading(false)
    }
  }

  // Fetch Sales Report
  const fetchSalesReport = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page,
        page_size: salesPageSize,
      }
      
      // Add payment method filter if not 'all'
      if (salesFilters.payment_method && salesFilters.payment_method !== 'all') {
        params.payment_method = salesFilters.payment_method
      }
      
      // Add item filter if not 'all'
      if (salesFilters.item_filter && salesFilters.item_filter !== 'all') {
        params.item_id = salesFilters.item_filter
      }
      
      // Add date filters if provided
      if (salesFilters.start_date) {
        params.start_date = salesFilters.start_date
      }
      if (salesFilters.end_date) {
        params.end_date = salesFilters.end_date
      }
      
      const response = await salesAPI.getSales(params)
      
      console.log('Sales API Response:', response)
      
      // Handle both array response and paginated response
      let data = Array.isArray(response) ? response : (response.results || [])
      
      console.log('Processed Sales Data:', data)
      
      setSalesData(data)
      setSalesPagination({
        current_page: response.current_page || 1,
        total_pages: response.total_pages || 1,
        total_count: response.total_count || data.length,
        page_size: salesPageSize,
      })
      
      // Calculate totals
      const totals = data.reduce((acc, sale) => {
        acc.total_amount += parseFloat(sale.amount || 0)
        if (sale.payment_method === 'cash') acc.total_cash += parseFloat(sale.amount || 0)
        if (sale.payment_method === 'bank') acc.total_bank += parseFloat(sale.amount || 0)
        if (sale.payment_method === 'cash_bank') acc.total_cash_bank += parseFloat(sale.amount || 0)
        return acc
      }, {
        total_amount: 0,
        total_cash: 0,
        total_bank: 0,
        total_cash_bank: 0,
      })
      
      setSalesTotals(totals)
    } catch (err) {
      console.error('Error fetching sales report:', err)
      setError('Failed to load sales report')
    } finally {
      setLoading(false)
    }
  }

  // Fetch Customer Report
  const fetchCustomerReport = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page,
        page_size: customerPageSize,
      }
      
      // Add date filters if provided
      if (customerFilters.start_date) {
        params.start_date = customerFilters.start_date
      }
      if (customerFilters.end_date) {
        params.end_date = customerFilters.end_date
      }
      
      const response = await customerApi.getCustomerReport(params)
      
      // Handle both array response and paginated response
      const data = Array.isArray(response) ? response : (response.results || [])
      
      setCustomerData(data)
      setCustomerPagination({
        current_page: response.current_page || 1,
        total_pages: response.total_pages || 1,
        total_count: response.total_count || data.length,
        page_size: customerPageSize,
      })
      
      // Calculate totals
      const totals = data.reduce((acc, customer) => {
        acc.total_customers += 1
        acc.total_orders += customer.total_orders || 0
        acc.total_amount += parseFloat(customer.total_amount || 0)
        acc.total_balance += parseFloat(customer.balance_amount || 0)
        return acc
      }, {
        total_customers: 0,
        total_orders: 0,
        total_amount: 0,
        total_balance: 0,
      })
      
      setCustomerTotals(totals)
    } catch (err) {
      console.error('Error fetching customer report:', err)
      setError('Failed to load customer report')
    } finally {
      setLoading(false)
    }
  }

  // Fetch items for sales report filtering
  const fetchItems = async () => {
    try {
      const response = await inventoryAPI.getItems({ is_active: true })
      setItems(Array.isArray(response) ? response : (response.results || []))
    } catch (err) {
      console.error('Error fetching items:', err)
    }
  }

  // Load data when tab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab)
    if (activeTab === "job-orders") {
      fetchJobOrderReport()
    } else if (activeTab === "sales") {
      fetchItems() // Fetch items when sales tab is selected
      fetchSalesReport()
    } else if (activeTab === "customers") {
      fetchCustomerReport()
    }
  }, [activeTab])

  // Handle filter changes
  const handleJobOrderFilterChange = (key, value) => {
    setJobOrderFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSalesFilterChange = (key, value) => {
    setSalesFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleCustomerFilterChange = (key, value) => {
    setCustomerFilters(prev => ({ ...prev, [key]: value }))
  }

  // Apply filters
  const applyJobOrderFilters = () => {
    fetchJobOrderReport(1)
  }

  // Reset filters to today
  const resetJobOrderFiltersToToday = () => {
    const today = new Date().toISOString().split('T')[0]
    setJobOrderFilters(prev => ({
      ...prev,
      start_date: today,
      end_date: today
    }))
  }

  const applySalesFilters = () => {
    fetchSalesReport(1)
  }

  const applyCustomerFilters = () => {
    fetchCustomerReport(1)
  }

  // Pagination handlers
  const handleJobOrderPageChange = (page) => {
    fetchJobOrderReport(page)
  }

  const handleSalesPageChange = (page) => {
    fetchSalesReport(page)
  }

  const handleCustomerPageChange = (page) => {
    fetchCustomerReport(page)
  }

  // Page size change handlers
  const handleJobOrderPageSizeChange = (newSize) => {
    setJobOrderPageSize(newSize)
    fetchJobOrderReport(1) // Reset to first page
  }

  const handleSalesPageSizeChange = (newSize) => {
    setSalesPageSize(newSize)
    fetchSalesReport(1) // Reset to first page
  }

  const handleCustomerPageSizeChange = (newSize) => {
    setCustomerPageSize(newSize)
    fetchCustomerReport(1) // Reset to first page
  }

  // Print handlers
  const handleJobOrderPrint = () => {
    printJobOrderReport(jobOrderData, jobOrderFilters, jobOrderTotals)
  }

  const handleSalesPrint = () => {
    printSalesReport(salesData, salesFilters, salesTotals)
  }

  const handleCustomerPrint = () => {
    printCustomerReport(customerData, customerFilters)
  }

  const handleSummaryPrint = () => {
    const stats = {
      total_orders: jobOrderData.length,
      total_revenue: jobOrderTotals?.grand_total || 0,
      active_customers: customerData.length,
      growth_rate: 0, // This would need to be calculated from historical data
      pending: jobOrderData.filter(order => order.status === 'pending').length,
      completed: jobOrderData.filter(order => order.status === 'completed').length,
      delivered: jobOrderData.filter(order => order.status === 'delivered').length,
      total_balance: jobOrderTotals?.total_balance || 0,
    }
    printSummaryReport(stats)
  }

  const handleCurrentReportPrint = () => {
    if (activeTab === "job-orders") handleJobOrderPrint()
    else if (activeTab === "sales") handleSalesPrint()
    else if (activeTab === "customers") handleCustomerPrint()
    else if (activeTab === "summary") handleSummaryPrint()
  }

  // Render Job Order Report
  const renderJobOrderReport = () => {
    console.log('Rendering Job Order Report, jobOrderData:', jobOrderData)
    console.log('jobOrderData length:', jobOrderData.length)
    return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Job Order Report Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={jobOrderFilters.payment_method}
                onValueChange={(value) => handleJobOrderFilterChange("payment_method", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="cash_card">Cash & Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                type="date"
                value={jobOrderFilters.start_date}
                onChange={(e) => handleJobOrderFilterChange("start_date", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                type="date"
                value={jobOrderFilters.end_date}
                onChange={(e) => handleJobOrderFilterChange("end_date", e.target.value)}
              />
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={resetJobOrderFiltersToToday} variant="outline" className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                Today
              </Button>
              <Button onClick={applyJobOrderFilters} className="flex-1">
                <Search className="w-4 h-4 mr-2" />
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Job Order Report</CardTitle>
              <CardDescription>
                Showing {jobOrderData.length} of {jobOrderPagination.total_count} records
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="job-order-page-size">Records per page:</Label>
              <Select
                value={jobOrderPageSize.toString()}
                onValueChange={(value) => handleJobOrderPageSizeChange(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                  <SelectItem value="10000">10,000</SelectItem>
                  <SelectItem value="100000">100,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleJobOrderPrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Order #</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Advance Amount</TableHead>
                  <TableHead>Balance Amount</TableHead>
                  <TableHead>Cash Amount</TableHead>
                  <TableHead>Card Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <LoadingSpinner />
                    </TableCell>
                  </TableRow>
                ) : jobOrderData.length > 0 ? (
                  jobOrderData.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.job_order_number}</TableCell>
                      <TableCell>{order.customer_name || order.customer?.name}</TableCell>
                      <TableCell>${parseFloat(order.advance_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>${parseFloat(order.balance_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>${parseFloat(order.cash_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>${parseFloat(order.card_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {order.payment_method?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {jobOrderFilters.payment_method && jobOrderFilters.payment_method !== 'all' 
                        ? `No job orders found with payment method: ${jobOrderFilters.payment_method.replace('_', ' ')}`
                        : 'No job orders found'
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {jobOrderPagination.total_pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {jobOrderPagination.current_page} of {jobOrderPagination.total_pages} 
                ({jobOrderPageSize} records per page)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleJobOrderPageChange(jobOrderPagination.current_page - 1)}
                  disabled={jobOrderPagination.current_page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleJobOrderPageChange(jobOrderPagination.current_page + 1)}
                  disabled={jobOrderPagination.current_page >= jobOrderPagination.total_pages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Total Advance</div>
                <div className="text-lg font-semibold">${(jobOrderTotals?.total_advance || 0).toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Total Balance</div>
                <div className="text-lg font-semibold">${(jobOrderTotals?.total_balance || 0).toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Total Cash</div>
                <div className="text-lg font-semibold">${(jobOrderTotals?.total_cash || 0).toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Total Card</div>
                <div className="text-lg font-semibold">${(jobOrderTotals?.total_card || 0).toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Grand Total</div>
                <div className="text-lg font-semibold text-green-600">${(jobOrderTotals?.grand_total || 0).toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
    )
  }

  // Render Sales Report
  const renderSalesReport = () => {
    console.log('Rendering Sales Report, salesData:', salesData)
    console.log('salesData length:', salesData.length)
    return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Sales Report Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={salesFilters.payment_method}
                onValueChange={(value) => handleSalesFilterChange("payment_method", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="cash_bank">Cash & Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="item_filter">Item Filter</Label>
              <Select
                value={salesFilters.item_filter}
                onValueChange={(value) => handleSalesFilterChange("item_filter", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name} ({item.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                type="date"
                value={salesFilters.start_date}
                onChange={(e) => handleSalesFilterChange("start_date", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                type="date"
                value={salesFilters.end_date}
                onChange={(e) => handleSalesFilterChange("end_date", e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={applySalesFilters} className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales Report</CardTitle>
              <CardDescription>
                Showing {salesData.length} of {salesPagination.total_count} records
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="sales-page-size">Records per page:</Label>
              <Select
                value={salesPageSize.toString()}
                onValueChange={(value) => handleSalesPageSizeChange(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                  <SelectItem value="10000">10,000</SelectItem>
                  <SelectItem value="100000">100,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleSalesPrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale #</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <LoadingSpinner />
                    </TableCell>
                  </TableRow>
                ) : salesData.length > 0 ? (
                  salesData.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.sale_number}</TableCell>
                      <TableCell>{sale.customer_name}</TableCell>
                      <TableCell>${parseFloat(sale.amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {sale.payment_method?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {sale.items_count || 0} item(s)
                        </div>
                      </TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge className={sale.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {sale.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {salesFilters.payment_method && salesFilters.payment_method !== 'all' 
                        ? `No sales found with payment method: ${salesFilters.payment_method.replace('_', ' ')}`
                        : 'No sales found'
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {salesPagination.total_pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {salesPagination.current_page} of {salesPagination.total_pages}
                ({salesPageSize} records per page)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSalesPageChange(salesPagination.current_page - 1)}
                  disabled={salesPagination.current_page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSalesPageChange(salesPagination.current_page + 1)}
                  disabled={salesPagination.current_page >= salesPagination.total_pages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="text-lg font-semibold">${(salesTotals?.total_amount || 0).toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Cash Sales</div>
                <div className="text-lg font-semibold">${(salesTotals?.total_cash || 0).toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Bank Sales</div>
                <div className="text-lg font-semibold">${(salesTotals?.total_bank || 0).toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Mixed Sales</div>
                <div className="text-lg font-semibold">${(salesTotals?.total_cash_bank || 0).toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
    )
  }

  // Render Customer Report
  const renderCustomerReport = () => (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Customer Report Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                type="date"
                value={customerFilters.start_date}
                onChange={(e) => handleCustomerFilterChange("start_date", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                type="date"
                value={customerFilters.end_date}
                onChange={(e) => handleCustomerFilterChange("end_date", e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={applyCustomerFilters} className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Report Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Total Customers</div>
                <div className="text-lg font-semibold">{customerTotals?.total_customers || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Total Orders</div>
                <div className="text-lg font-semibold">{customerTotals?.total_orders || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="text-lg font-semibold">${(customerTotals?.total_amount || 0).toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-500">Total Balance</div>
                <div className="text-lg font-semibold">${(customerTotals?.total_balance || 0).toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Report</CardTitle>
              <CardDescription>
                Showing {customerData.length} of {customerPagination.total_count} customers
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="customer-page-size">Records per page:</Label>
              <Select
                value={customerPageSize.toString()}
                onValueChange={(value) => handleCustomerPageSizeChange(parseInt(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                  <SelectItem value="10000">10,000</SelectItem>
                  <SelectItem value="100000">100,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCustomerPrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Balance Amount</TableHead>
                  <TableHead>Last Order Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <LoadingSpinner />
                    </TableCell>
                  </TableRow>
                ) : customerData.length > 0 ? (
                  customerData.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.total_orders || 0}</TableCell>
                      <TableCell>${parseFloat(customer.total_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>${parseFloat(customer.balance_amount || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'No orders'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No customers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {customerPagination.total_pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Page {customerPagination.current_page} of {customerPagination.total_pages}
                ({customerPageSize} records per page)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCustomerPageChange(customerPagination.current_page - 1)}
                  disabled={customerPagination.current_page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCustomerPageChange(customerPagination.current_page + 1)}
                  disabled={customerPagination.current_page >= customerPagination.total_pages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Render Summary Report
  const renderSummaryReport = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Summary Report</CardTitle>
          <CardDescription>Overall business performance and key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Job Orders</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold">$0.00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Customers</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Growth Rate</p>
                    <p className="text-2xl font-bold">0%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive business reports and analysis</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleCurrentReportPrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Current
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Card
              key={tab.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                activeTab === tab.id
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeTab === tab.id
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{tab.name}</h3>
                    <p className="text-sm text-gray-500">{tab.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Report Content */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Error Loading Report</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Render Active Tab Content */}
      {activeTab === "job-orders" && renderJobOrderReport()}
      {activeTab === "sales" && renderSalesReport()}
      {activeTab === "customers" && renderCustomerReport()}
      {activeTab === "summary" && renderSummaryReport()}
    </div>
  )
}

export default Reports
