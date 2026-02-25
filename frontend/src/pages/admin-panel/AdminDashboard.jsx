"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { jobOrdersApi } from "../../services/jobOrdersApi"
import customerApi from "../../services/customerApi"
import LoadingSpinner from "../../components/LoadingSpinner"
import {
  Scissors,
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  Ruler,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  ShoppingCart,
  FileText,
  Truck,
  BarChart3,
} from "lucide-react"

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState("7d")
  const [loading, setLoading] = useState(true)
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
  const [activeCustomerCount, setActiveCustomerCount] = useState(0)
  const [recentJobOrders, setRecentJobOrders] = useState([])

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch stats, active customer count, and recent job orders in parallel
        const [statsResult, customerCountResult, recentResult] = await Promise.allSettled([
          jobOrdersApi.getJobOrderStats({ time_range: timeRange }),
          customerApi.getActiveCustomerCount(),
          jobOrdersApi.getRecentJobOrders(5)
        ])

        if (statsResult.status === 'fulfilled') setStats(statsResult.value)
        if (recentResult.status === 'fulfilled') setRecentJobOrders(recentResult.value)
        const count = customerCountResult.status === 'fulfilled' && typeof customerCountResult.value === 'number'
          ? customerCountResult.value
          : 0
        setActiveCustomerCount(count)

        if (statsResult.status === 'rejected' || recentResult.status === 'rejected') {
          setError('Failed to load dashboard data')
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [timeRange])

  // Transform stats data for display
  const statsData = [
    {
      title: "Total Job Orders",
      value: stats.total_orders?.toString() || "0",
      change: "+18%", // This would need to be calculated from historical data
      trend: "up",
      icon: Scissors,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Customers",
      value: activeCustomerCount?.toString() ?? "0",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Revenue",
      value: `QAR ${stats.total_revenue?.toFixed(2) || "0.00"}`,
      change: "+25%",
      trend: "up",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Pending Orders",
      value: stats.pending?.toString() || "0",
      change: "-5%",
      trend: "down",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  const getStatusBadge = (status) => {
    const variants = {
      completed: "bg-green-100 text-green-800",
      "in-progress": "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      delivered: "bg-purple-100 text-purple-800",
    }
    return variants[status] || "bg-gray-100 text-gray-800"
  }

  const getPriorityBadge = (priority) => {
    const variants = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800",
    }
    return variants[priority] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'delivered':
        return <Truck className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  }

  // Show error message (only on initial load, not on filter changes)
  if (error && recentJobOrders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Al Kharthoum Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor your tailoring business performance and job orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={loading} className="relative bg-transparent">
                {loading && <div className="absolute inset-0 bg-gray-100 opacity-20 rounded-md" />}
                {timeRange === "all" ? "All time" :
                 timeRange === "1d" ? "Last 24 hours" :
                 timeRange === "7d" ? "Last 7 days" :
                 timeRange === "30d" ? "Last 30 days" :
                 timeRange === "90d" ? "Last 90 days" :
                 timeRange === "180d" ? "Last 6 months" :
                 timeRange === "365d" ? "Last 1 year" : "Last 7 days"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTimeRange("all")}>All time</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("1d")}>Last 24 hours</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("7d")}>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("30d")}>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("90d")}>Last 90 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("180d")}>Last 6 months</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("365d")}>Last 1 year</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/admin/job-orders">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Job Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className={`hover:shadow-lg transition-all ${loading ? "opacity-60" : "opacity-100"}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span
                        className={`text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Job Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle>Recent Job Orders</CardTitle>
                <CardDescription>Latest job orders and their status</CardDescription>
              </div>
              <Link to="/admin/job-orders">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobOrders.length > 0 ? (
                    recentJobOrders.map((jobOrder) => (
                      <TableRow key={jobOrder.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{jobOrder.job_order_number}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">{jobOrder.customer_name}</div>
                          <div className="text-xs text-gray-500">{jobOrder.customer_phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm max-w-xs truncate">
                            {jobOrder.job_order_items?.length > 0 
                              ? jobOrder.job_order_items.map(item => item.material_name).join(', ')
                              : 'No items'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(jobOrder.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(jobOrder.status)}
                              <span className="capitalize text-xs">{jobOrder.status.replace('_', ' ')}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm">QAR {parseFloat(jobOrder.total_amount).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="text-sm">{new Date(jobOrder.delivery_date).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Ruler className="w-4 h-4 mr-2" />
                                View Measurements
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Order
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="w-4 h-4 mr-2" />
                                Print Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-gray-500">
                          <Scissors className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No job orders found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Tablet & Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {recentJobOrders.length > 0 ? (
                recentJobOrders.map((jobOrder) => (
                  <div key={jobOrder.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm">{jobOrder.job_order_number}</p>
                        <p className="text-xs text-gray-600">{jobOrder.customer_name}</p>
                      </div>
                      <Badge className={getStatusBadge(jobOrder.status)}>
                        <span className="text-xs capitalize">{jobOrder.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-600">Services</p>
                        <p className="text-sm line-clamp-2">
                          {jobOrder.job_order_items?.length > 0 
                            ? jobOrder.job_order_items.map(item => item.material_name).join(', ')
                            : 'No items'
                          }
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-600">Price</p>
                          <p className="font-medium">QAR {parseFloat(jobOrder.total_amount).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Delivery</p>
                          <p className="font-medium">{new Date(jobOrder.delivery_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <MoreHorizontal className="w-4 h-4 mr-2" />
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Ruler className="w-4 h-4 mr-2" />
                          View Measurements
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Order
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="w-4 h-4 mr-2" />
                          Print Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    <Scissors className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No job orders found</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Business Overview</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <Scissors className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm font-medium truncate">Total Orders</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800 flex-shrink-0">{stats.total_orders}</Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                <span className="text-sm font-medium truncate">Pending</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 flex-shrink-0">{stats.pending}</Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium truncate">Completed</span>
              </div>
              <Badge className="bg-green-100 text-green-800 flex-shrink-0">{stats.completed}</Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <Truck className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span className="text-sm font-medium truncate">Delivered</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800 flex-shrink-0">{stats.delivered}</Badge>
            </div>
            <div className="flex items-center justify-between gap-2 py-2 border-t">
              <div className="flex items-center space-x-2 min-w-0">
                <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium truncate">Revenue</span>
              </div>
              <span className="text-sm font-medium flex-shrink-0">QAR {stats.total_revenue?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0">
                <CreditCard className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-sm font-medium truncate">Balance</span>
              </div>
              <span className="text-sm font-medium flex-shrink-0">QAR {stats.total_balance?.toFixed(2) || '0.00'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest business activities and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "New job order created",
                details: "JO-006: Custom Suit for John Smith - $450",
                time: "2 minutes ago",
                type: "success",
                icon: Scissors,
              },
              {
                action: "Payment received",
                details: "$150 payment for JO-001 Jalabiya order",
                time: "15 minutes ago",
                type: "info",
                icon: DollarSign,
              },
              {
                action: "Measurements completed",
                details: "All measurements recorded for JO-003 Custom Suit",
                time: "1 hour ago",
                type: "success",
                icon: Ruler,
              },
              {
                action: "Order completed",
                details: "JO-002 Wedding Dress Alterations delivered",
                time: "2 hours ago",
                type: "success",
                icon: CheckCircle,
              },
              {
                action: "Material restocked",
                details: "Received 50 yards of premium fabric",
                time: "3 hours ago",
                type: "info",
                icon: Package,
              },
              {
                action: "Customer consultation",
                details: "New customer Sarah Wilson for wedding dress",
                time: "4 hours ago",
                type: "warning",
                icon: Users,
              },
            ].map((activity, index) => {
              const Icon = activity.icon
              return (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activity.type === "success"
                      ? "bg-green-100 text-green-600"
                      : activity.type === "warning"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-blue-100 text-blue-600"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.details}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card> */}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/job-orders">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">New Job Order</p>
                  <p className="text-sm text-gray-500">Create new order</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/materials">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Measurements</p>
                  <p className="text-sm text-gray-500">Record measurements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/reports">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Reports</p>
                  <p className="text-sm text-gray-500">View reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/inventory">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Inventory</p>
                  <p className="text-sm text-gray-500">Manage materials</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export default AdminDashboard
