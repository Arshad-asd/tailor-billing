"use client"

import { useState } from "react"
import {
  Search,
  Download,
  RefreshCw,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  Star,
  Zap,
  Mail,
  Phone,
  MapPin,
  Building,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Progress } from "../../components/ui/progress"

const Subscriptions = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Mock subscription data
  const subscriptions = [
    {
      id: "SUB-001",
      restaurant: {
        name: "Bella Vista Restaurant",
        logo: "/placeholder.svg?height=40&width=40",
        owner: "Marco Rodriguez",
        email: "marco@bellavista.com",
        phone: "+1 (555) 123-4567",
        address: "123 Main St, New York, NY 10001",
      },
      plan: {
        name: "Premium",
        price: 199,
        features: ["Unlimited Orders", "Advanced Analytics", "Priority Support", "Custom Branding"],
        color: "purple",
        icon: Crown,
      },
      status: "active",
      billingCycle: "monthly",
      startDate: "2024-01-15",
      nextBilling: "2024-02-15",
      totalRevenue: 2388,
      monthsActive: 12,
      paymentMethod: "Visa ****4532",
      lastPayment: "2024-01-15",
      usage: {
        orders: 1250,
        ordersLimit: 2000,
        users: 8,
        usersLimit: 15,
        storage: 2.4,
        storageLimit: 10,
      },
      metrics: {
        avgOrderValue: 45.5,
        totalOrders: 15000,
        customerSatisfaction: 4.8,
        uptime: 99.9,
      },
    },
    {
      id: "SUB-002",
      restaurant: {
        name: "Tokyo Sushi Bar",
        logo: "/placeholder.svg?height=40&width=40",
        owner: "Yuki Tanaka",
        email: "yuki@tokyosushi.com",
        phone: "+1 (555) 987-6543",
        address: "456 Oak Ave, Los Angeles, CA 90210",
      },
      plan: {
        name: "Standard",
        price: 99,
        features: ["500 Orders/month", "Basic Analytics", "Email Support", "Standard Templates"],
        color: "blue",
        icon: Star,
      },
      status: "active",
      billingCycle: "monthly",
      startDate: "2024-02-01",
      nextBilling: "2024-03-01",
      totalRevenue: 891,
      monthsActive: 9,
      paymentMethod: "Mastercard ****8765",
      lastPayment: "2024-02-01",
      usage: {
        orders: 420,
        ordersLimit: 500,
        users: 3,
        usersLimit: 5,
        storage: 1.2,
        storageLimit: 5,
      },
      metrics: {
        avgOrderValue: 32.75,
        totalOrders: 3780,
        customerSatisfaction: 4.6,
        uptime: 99.5,
      },
    },
    {
      id: "SUB-003",
      restaurant: {
        name: "Green Garden Cafe",
        logo: "/placeholder.svg?height=40&width=40",
        owner: "Sarah Johnson",
        email: "sarah@greengarden.com",
        phone: "+1 (555) 456-7890",
        address: "789 Pine St, Seattle, WA 98101",
      },
      plan: {
        name: "Basic",
        price: 49,
        features: ["100 Orders/month", "Basic Reports", "Community Support", "Basic Templates"],
        color: "green",
        icon: Zap,
      },
      status: "trial",
      billingCycle: "monthly",
      startDate: "2024-01-20",
      nextBilling: "2024-02-20",
      totalRevenue: 147,
      monthsActive: 3,
      paymentMethod: "Trial - No Payment",
      lastPayment: "N/A",
      usage: {
        orders: 85,
        ordersLimit: 100,
        users: 2,
        usersLimit: 3,
        storage: 0.5,
        storageLimit: 2,
      },
      metrics: {
        avgOrderValue: 28.9,
        totalOrders: 255,
        customerSatisfaction: 4.3,
        uptime: 98.8,
      },
    },
    {
      id: "SUB-004",
      restaurant: {
        name: "Pizza Palace",
        logo: "/placeholder.svg?height=40&width=40",
        owner: "Tony Marinelli",
        email: "tony@pizzapalace.com",
        phone: "+1 (555) 321-0987",
        address: "321 Elm St, Chicago, IL 60601",
      },
      plan: {
        name: "Premium",
        price: 199,
        features: ["Unlimited Orders", "Advanced Analytics", "Priority Support", "Custom Branding"],
        color: "purple",
        icon: Crown,
      },
      status: "past_due",
      billingCycle: "monthly",
      startDate: "2023-06-10",
      nextBilling: "2024-01-10",
      totalRevenue: 3582,
      monthsActive: 18,
      paymentMethod: "Visa ****1234",
      lastPayment: "2023-12-10",
      usage: {
        orders: 1800,
        ordersLimit: 2000,
        users: 12,
        usersLimit: 15,
        storage: 4.8,
        storageLimit: 10,
      },
      metrics: {
        avgOrderValue: 38.25,
        totalOrders: 22500,
        customerSatisfaction: 4.7,
        uptime: 99.2,
      },
    },
    {
      id: "SUB-005",
      restaurant: {
        name: "Spice Route Indian",
        logo: "/placeholder.svg?height=40&width=40",
        owner: "Raj Patel",
        email: "raj@spiceroute.com",
        phone: "+1 (555) 654-3210",
        address: "654 Maple Dr, Austin, TX 78701",
      },
      plan: {
        name: "Standard",
        price: 99,
        features: ["500 Orders/month", "Basic Analytics", "Email Support", "Standard Templates"],
        color: "blue",
        icon: Star,
      },
      status: "cancelled",
      billingCycle: "monthly",
      startDate: "2023-08-15",
      nextBilling: "N/A",
      totalRevenue: 1485,
      monthsActive: 15,
      paymentMethod: "PayPal",
      lastPayment: "2023-11-15",
      usage: {
        orders: 0,
        ordersLimit: 500,
        users: 0,
        usersLimit: 5,
        storage: 0,
        storageLimit: 5,
      },
      metrics: {
        avgOrderValue: 41.2,
        totalOrders: 6750,
        customerSatisfaction: 4.4,
        uptime: 99.1,
      },
    },
  ]

  // Statistics calculations
  const stats = {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter((sub) => sub.status === "active").length,
    totalRevenue: subscriptions.reduce((sum, sub) => sum + sub.totalRevenue, 0),
    avgRevenue: subscriptions.reduce((sum, sub) => sum + sub.totalRevenue, 0) / subscriptions.length,
    churnRate: 8.5,
    growthRate: 12.3,
  }

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      subscription.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.restaurant.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.restaurant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || subscription.status === statusFilter
    const matchesPlan = planFilter === "all" || subscription.plan.name.toLowerCase() === planFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPlan
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: "Active", variant: "default", icon: CheckCircle, color: "text-green-600" },
      trial: { label: "Trial", variant: "secondary", icon: Clock, color: "text-blue-600" },
      past_due: { label: "Past Due", variant: "destructive", icon: AlertTriangle, color: "text-red-600" },
      cancelled: { label: "Cancelled", variant: "outline", icon: XCircle, color: "text-gray-600" },
    }

    const config = statusConfig[status] || statusConfig.active
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getPlanBadge = (plan) => {
    const Icon = plan.icon
    const colorClasses = {
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
    }

    return (
      <Badge className={`flex items-center gap-1 ${colorClasses[plan.color]}`}>
        <Icon className="w-3 h-3" />
        {plan.name}
      </Badge>
    )
  }

  const openDetailModal = (subscription) => {
    setSelectedSubscription(subscription)
    setIsDetailModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage customer subscriptions and billing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />+{stats.growthRate}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              {((stats.activeSubscriptions / stats.totalSubscriptions) * 100).toFixed(1)}% active rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15.2% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.churnRate}%</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              +2.1% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search subscriptions, restaurants, or owners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Next Billing</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={subscription.restaurant.logo || "/placeholder.svg"}
                          alt={subscription.restaurant.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {subscription.restaurant.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {subscription.restaurant.owner}
                          </div>
                          <div className="text-xs text-gray-400">ID: {subscription.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getPlanBadge(subscription.plan)}
                        <div className="text-sm font-medium">
                          ${subscription.plan.price}/{subscription.billingCycle}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">${subscription.totalRevenue.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{subscription.monthsActive} months</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {subscription.nextBilling !== "N/A"
                            ? new Date(subscription.nextBilling).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">{subscription.paymentMethod}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Orders</span>
                          <span>
                            {subscription.usage.orders}/{subscription.usage.ordersLimit}
                          </span>
                        </div>
                        <Progress
                          value={(subscription.usage.orders / subscription.usage.ordersLimit) * 100}
                          className="h-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openDetailModal(subscription)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Subscription
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Billing History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Cancel Subscription
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

      {/* Subscription Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSubscription && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <img
                    src={selectedSubscription.restaurant.logo || "/placeholder.svg"}
                    alt={selectedSubscription.restaurant.name}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <div>{selectedSubscription.restaurant.name}</div>
                    <div className="text-sm font-normal text-gray-500">Subscription ID: {selectedSubscription.id}</div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="usage">Usage</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Restaurant Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Restaurant Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Owner:</span>
                            <span>{selectedSubscription.restaurant.owner}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Email:</span>
                            <span>{selectedSubscription.restaurant.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Phone:</span>
                            <span>{selectedSubscription.restaurant.phone}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Address:</span>
                            <span>{selectedSubscription.restaurant.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Start Date:</span>
                            <span>{new Date(selectedSubscription.startDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">${selectedSubscription.metrics.avgOrderValue}</div>
                        <div className="text-sm text-gray-500">Avg Order Value</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {selectedSubscription.metrics.totalOrders.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">Total Orders</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{selectedSubscription.metrics.customerSatisfaction}</div>
                        <div className="text-sm text-gray-500">Customer Rating</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{selectedSubscription.metrics.uptime}%</div>
                        <div className="text-sm text-gray-500">System Uptime</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Plan Features */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Plan Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-4">
                        {getPlanBadge(selectedSubscription.plan)}
                        <span className="text-lg font-semibold">
                          ${selectedSubscription.plan.price}/{selectedSubscription.billingCycle}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedSubscription.plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="billing" className="space-y-6">
                  {/* Billing Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">${selectedSubscription.totalRevenue}</div>
                        <div className="text-sm text-gray-500">Total Revenue</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{selectedSubscription.monthsActive}</div>
                        <div className="text-sm text-gray-500">Months Active</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                          {selectedSubscription.nextBilling !== "N/A"
                            ? new Date(selectedSubscription.nextBilling).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">Next Billing</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payment Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Payment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="font-medium">{selectedSubscription.paymentMethod}</div>
                            <div className="text-sm text-gray-500">
                              Last payment: {selectedSubscription.lastPayment}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Update Payment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="usage" className="space-y-6">
                  {/* Usage Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Orders</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">{selectedSubscription.usage.orders}</span>
                          <span className="text-sm text-gray-500">/ {selectedSubscription.usage.ordersLimit}</span>
                        </div>
                        <Progress
                          value={(selectedSubscription.usage.orders / selectedSubscription.usage.ordersLimit) * 100}
                          className="h-2"
                        />
                        <div className="text-sm text-gray-500">
                          {((selectedSubscription.usage.orders / selectedSubscription.usage.ordersLimit) * 100).toFixed(
                            1,
                          )}
                          % used
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Users</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">{selectedSubscription.usage.users}</span>
                          <span className="text-sm text-gray-500">/ {selectedSubscription.usage.usersLimit}</span>
                        </div>
                        <Progress
                          value={(selectedSubscription.usage.users / selectedSubscription.usage.usersLimit) * 100}
                          className="h-2"
                        />
                        <div className="text-sm text-gray-500">
                          {((selectedSubscription.usage.users / selectedSubscription.usage.usersLimit) * 100).toFixed(
                            1,
                          )}
                          % used
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Storage</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">{selectedSubscription.usage.storage}GB</span>
                          <span className="text-sm text-gray-500">/ {selectedSubscription.usage.storageLimit}GB</span>
                        </div>
                        <Progress
                          value={(selectedSubscription.usage.storage / selectedSubscription.usage.storageLimit) * 100}
                          className="h-2"
                        />
                        <div className="text-sm text-gray-500">
                          {(
                            (selectedSubscription.usage.storage / selectedSubscription.usage.storageLimit) *
                            100
                          ).toFixed(1)}
                          % used
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  {/* Account Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Account Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Upgrade Plan</div>
                          <div className="text-sm text-gray-500">Change to a higher tier plan</div>
                        </div>
                        <Button variant="outline">Upgrade</Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">Pause Subscription</div>
                          <div className="text-sm text-gray-500">Temporarily pause billing</div>
                        </div>
                        <Button variant="outline">Pause</Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
                        <div>
                          <div className="font-medium text-red-600">Cancel Subscription</div>
                          <div className="text-sm text-gray-500">Permanently cancel this subscription</div>
                        </div>
                        <Button variant="destructive">Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default  Subscriptions
