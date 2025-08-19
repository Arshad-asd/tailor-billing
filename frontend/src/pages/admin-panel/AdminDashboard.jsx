"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
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

  // Mock data for tailoring business
  const stats = [
    {
      title: "Total Job Orders",
      value: "156",
      change: "+18%",
      trend: "up",
      icon: Scissors,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Customers",
      value: "89",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Monthly Revenue",
      value: "$12,450",
      change: "+25%",
      trend: "up",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Pending Orders",
      value: "23",
      change: "-5%",
      trend: "down",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  const recentJobOrders = [
    {
      id: "JO-001",
      customerName: "AYMAN HASHIM MOHAMED",
      service: "Jalabiya",
      status: "in-progress",
      price: 150.00,
      dueDate: "2025-07-05",
      priority: "high",
      measurements: "Complete",
    },
    {
      id: "JO-002",
      customerName: "Sarah Johnson",
      service: "Wedding Dress Alterations",
      status: "completed",
      price: 300.00,
      dueDate: "2025-07-01",
      priority: "medium",
      measurements: "Complete",
    },
    {
      id: "JO-003",
      customerName: "Mike Chen",
      service: "Custom Suit",
      status: "pending",
      price: 800.00,
      dueDate: "2025-07-10",
      priority: "high",
      measurements: "Pending",
    },
    {
      id: "JO-004",
      customerName: "Lisa Rodriguez",
      service: "Pants Alterations",
      status: "completed",
      price: 25.00,
      dueDate: "2025-06-28",
      priority: "low",
      measurements: "Complete",
    },
    {
      id: "JO-005",
      customerName: "David Wilson",
      service: "Jacket Repairs",
      status: "in-progress",
      price: 45.00,
      dueDate: "2025-07-03",
      priority: "medium",
      measurements: "Complete",
    },
  ]

  const getStatusBadge = (status) => {
    const variants = {
      completed: "bg-green-100 text-green-800",
      "in-progress": "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
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
      default:
        return <Clock className="w-4 h-4" />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tailor Pro Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor your tailoring business performance and job orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Last 7 days</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setTimeRange("1d")}>Last 24 hours</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("7d")}>Last 7 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("30d")}>Last 30 days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("90d")}>Last 90 days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Job Order
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Job Orders</CardTitle>
                <CardDescription>Latest job orders and their status</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentJobOrders.map((jobOrder) => (
                    <TableRow key={jobOrder.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{jobOrder.id}</div>
                          <div className="text-sm text-gray-500">Due {jobOrder.dueDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{jobOrder.customerName}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{jobOrder.service}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(jobOrder.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(jobOrder.status)}
                            <span className="capitalize">{jobOrder.status.replace('-', ' ')}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityBadge(jobOrder.priority)}>
                          {jobOrder.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">${jobOrder.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="text-sm">{jobOrder.dueDate}</div>
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Business Overview</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Scissors className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Today's Orders</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">12</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Pending Orders</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">23</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Completed Today</span>
              </div>
              <Badge className="bg-green-100 text-green-800">8</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Today's Revenue</span>
              </div>
              <span className="text-sm font-medium">$1,250</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium">New Customers</span>
              </div>
              <Badge className="bg-indigo-100 text-indigo-800">5</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Materials Used</span>
              </div>
              <span className="text-sm font-medium">15 units</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
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
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
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
      </div>
    </div>
  )
}

export default AdminDashboard



