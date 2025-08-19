"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Progress } from "../../components/ui/progress"
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  MapPin,
  Mail,
  DollarSign,
  Phone,
  Calendar,
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  RefreshCw,
  Settings,
  BarChart3,
  Activity,
  CreditCard,
  Store,
} from "lucide-react"

const Restaurants = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")
  const [viewMode, setViewMode] = useState("table") // table or grid
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)

  const restaurants = [
    {
      id: 1,
      name: "Bella Vista Restaurant",
      logo: "/placeholder.svg?height=40&width=40",
      owner: "John Smith",
      email: "john@bellavista.com",
      phone: "+1 (555) 123-4567",
      address: "123 Main St, New York, NY 10001",
      plan: "Premium",
      status: "Active",
      revenue: 12450,
      monthlyRevenue: 4150,
      joinDate: "2024-01-15",
      lastActive: "2 hours ago",
      orders: 1247,
      rating: 4.8,
      reviews: 234,
      employees: 12,
      tables: 24,
      avgOrderValue: 45.6,
      completionRate: 98.5,
      responseTime: "2.3 min",
      cuisineType: "Italian",
      deliveryPartners: ["UberEats", "DoorDash", "Grubhub"],
      features: ["Online Ordering", "Table Reservations", "Loyalty Program"],
      growth: 12.5,
      lastPayment: "2024-01-01",
      nextBilling: "2024-02-01",
      subscription: {
        plan: "Premium",
        price: 99,
        features: ["Unlimited Orders", "Advanced Analytics", "Priority Support"],
        status: "Active",
      },
    },
    {
      id: 2,
      name: "Ocean Breeze Cafe",
      logo: "/placeholder.svg?height=40&width=40",
      owner: "Sarah Johnson",
      email: "sarah@oceanbreeze.com",
      phone: "+1 (555) 234-5678",
      address: "456 Beach Ave, Miami, FL 33139",
      plan: "Standard",
      status: "Active",
      revenue: 8230,
      monthlyRevenue: 2743,
      joinDate: "2024-01-12",
      lastActive: "1 day ago",
      orders: 892,
      rating: 4.6,
      reviews: 156,
      employees: 8,
      tables: 16,
      avgOrderValue: 32.4,
      completionRate: 95.2,
      responseTime: "3.1 min",
      cuisineType: "American",
      deliveryPartners: ["UberEats", "DoorDash"],
      features: ["Online Ordering", "Table Reservations"],
      growth: 8.3,
      lastPayment: "2024-01-01",
      nextBilling: "2024-02-01",
      subscription: {
        plan: "Standard",
        price: 49,
        features: ["Up to 500 Orders", "Basic Analytics", "Email Support"],
        status: "Active",
      },
    },
    {
      id: 3,
      name: "Mountain View Bistro",
      logo: "/placeholder.svg?height=40&width=40",
      owner: "Mike Wilson",
      email: "mike@mountainview.com",
      phone: "+1 (555) 345-6789",
      address: "789 Hill Rd, Denver, CO 80202",
      plan: "Basic",
      status: "Pending",
      revenue: 0,
      monthlyRevenue: 0,
      joinDate: "2024-01-10",
      lastActive: "Never",
      orders: 0,
      rating: 0,
      reviews: 0,
      employees: 5,
      tables: 12,
      avgOrderValue: 0,
      completionRate: 0,
      responseTime: "N/A",
      cuisineType: "Continental",
      deliveryPartners: [],
      features: ["Online Ordering"],
      growth: 0,
      lastPayment: "N/A",
      nextBilling: "2024-02-10",
      subscription: {
        plan: "Basic",
        price: 19,
        features: ["Up to 100 Orders", "Basic Features", "Community Support"],
        status: "Pending",
      },
    },
    {
      id: 4,
      name: "City Lights Diner",
      logo: "/placeholder.svg?height=40&width=40",
      owner: "Emily Davis",
      email: "emily@citylights.com",
      phone: "+1 (555) 456-7890",
      address: "321 Downtown St, Chicago, IL 60601",
      plan: "Premium",
      status: "Active",
      revenue: 15670,
      monthlyRevenue: 5223,
      joinDate: "2024-01-08",
      lastActive: "30 minutes ago",
      orders: 1856,
      rating: 4.9,
      reviews: 312,
      employees: 18,
      tables: 32,
      avgOrderValue: 52.3,
      completionRate: 99.1,
      responseTime: "1.8 min",
      cuisineType: "American",
      deliveryPartners: ["UberEats", "DoorDash", "Grubhub", "Postmates"],
      features: ["Online Ordering", "Table Reservations", "Loyalty Program", "Catering"],
      growth: 18.7,
      lastPayment: "2024-01-01",
      nextBilling: "2024-02-01",
      subscription: {
        plan: "Premium",
        price: 99,
        features: ["Unlimited Orders", "Advanced Analytics", "Priority Support"],
        status: "Active",
      },
    },
    {
      id: 5,
      name: "Garden Fresh Kitchen",
      logo: "/placeholder.svg?height=40&width=40",
      owner: "David Brown",
      email: "david@gardenfresh.com",
      phone: "+1 (555) 567-8901",
      address: "654 Green St, Portland, OR 97205",
      plan: "Standard",
      status: "Suspended",
      revenue: 5890,
      monthlyRevenue: 0,
      joinDate: "2024-01-05",
      lastActive: "1 week ago",
      orders: 543,
      rating: 4.2,
      reviews: 89,
      employees: 6,
      tables: 14,
      avgOrderValue: 38.9,
      completionRate: 87.3,
      responseTime: "4.2 min",
      cuisineType: "Healthy",
      deliveryPartners: ["UberEats"],
      features: ["Online Ordering"],
      growth: -5.2,
      lastPayment: "2023-12-01",
      nextBilling: "Suspended",
      subscription: {
        plan: "Standard",
        price: 49,
        features: ["Up to 500 Orders", "Basic Analytics", "Email Support"],
        status: "Suspended",
      },
    },
  ]

  const getStatusBadge = (status) => {
    const variants = {
      Active: "bg-green-100 text-green-800 border-green-200",
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Suspended: "bg-red-100 text-red-800 border-red-200",
    }
    return variants[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getPlanBadge = (plan) => {
    const variants = {
      Basic: "bg-gray-100 text-gray-800 border-gray-200",
      Standard: "bg-blue-100 text-blue-800 border-blue-200",
      Premium: "bg-purple-100 text-purple-800 border-purple-200",
    }
    return variants[plan] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "Pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case "Suspended":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.cuisineType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || restaurant.status.toLowerCase() === statusFilter
    const matchesPlan = planFilter === "all" || restaurant.plan.toLowerCase() === planFilter

    return matchesSearch && matchesStatus && matchesPlan
  })

  const RestaurantDetailModal = ({ restaurant, isOpen, onClose }) => {
    if (!restaurant) return null

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={restaurant.logo || "/placeholder.svg"} alt={restaurant.name} />
                <AvatarFallback>{restaurant.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{restaurant.name}</h2>
                <p className="text-sm text-gray-500">{restaurant.cuisineType} Restaurant</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Restaurant Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span>Restaurant Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(restaurant.status)}
                        <Badge className={getStatusBadge(restaurant.status)}>{restaurant.status}</Badge>
                      </div>
                      <Badge className={getPlanBadge(restaurant.plan)}>{restaurant.plan}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>Owner: {restaurant.owner}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{restaurant.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{restaurant.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{restaurant.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Joined: {restaurant.joinDate}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>Last Active: {restaurant.lastActive}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      <span>Key Metrics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">${restaurant.revenue.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Total Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{restaurant.orders.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Total Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-2xl font-bold">{restaurant.rating}</span>
                        </div>
                        <div className="text-sm text-gray-500">{restaurant.reviews} Reviews</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">${restaurant.avgOrderValue}</div>
                        <div className="text-sm text-gray-500">Avg Order</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion Rate</span>
                        <span>{restaurant.completionRate}%</span>
                      </div>
                      <Progress value={restaurant.completionRate} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Response Time</span>
                      <span className="font-medium">{restaurant.responseTime}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Features & Integrations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Partners</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {restaurant.deliveryPartners.length > 0 ? (
                        restaurant.deliveryPartners.map((partner, index) => (
                          <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {partner}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No delivery partners configured</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${restaurant.monthlyRevenue.toLocaleString()}</div>
                    <div className="flex items-center space-x-1 text-sm">
                      {restaurant.growth > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={restaurant.growth > 0 ? "text-green-600" : "text-red-600"}>
                        {Math.abs(restaurant.growth)}%
                      </span>
                      <span className="text-gray-500">vs last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Staff & Tables</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Employees</span>
                        <span className="font-medium">{restaurant.employees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Tables</span>
                        <span className="font-medium">{restaurant.tables}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Completion Rate</span>
                        <span className="font-medium">{restaurant.completionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Response Time</span>
                        <span className="font-medium">{restaurant.responseTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Subscription Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{restaurant.subscription.plan} Plan</h3>
                      <p className="text-sm text-gray-500">${restaurant.subscription.price}/month</p>
                    </div>
                    <Badge className={getStatusBadge(restaurant.subscription.status)}>
                      {restaurant.subscription.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Features Included:</h4>
                    <ul className="space-y-1">
                      {restaurant.subscription.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <span className="text-sm text-gray-500">Last Payment</span>
                      <p className="font-medium">{restaurant.lastPayment}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Next Billing</span>
                      <p className="font-medium">{restaurant.nextBilling}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Restaurant Details
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset Password
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      <XCircle className="w-4 h-4 mr-2" />
                      Suspend Account
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Support & Logs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="w-4 h-4 mr-2" />
                      View Activity Logs
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Restaurant
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Restaurant Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all registered restaurants, subscriptions, and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Restaurant
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Restaurants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{restaurants.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Restaurants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {restaurants.filter((r) => r.status === "Active").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${restaurants.reduce((sum, r) => sum + r.revenue, 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+15%</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(
                    restaurants.reduce((sum, r) => sum + r.rating, 0) / restaurants.filter((r) => r.rating > 0).length
                  ).toFixed(1)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600">+0.2</span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search restaurants, owners, emails, or cuisine types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restaurants Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Restaurants ({filteredRestaurants.length})</CardTitle>
              <CardDescription>Complete list of registered restaurants with detailed information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Owner & Contact</TableHead>
                  <TableHead>Plan & Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Growth</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={restaurant.logo || "/placeholder.svg"} alt={restaurant.name} />
                          <AvatarFallback>{restaurant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{restaurant.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {restaurant.address.split(",")[1]?.trim()}
                          </div>
                          <div className="text-xs text-gray-400">{restaurant.cuisineType}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{restaurant.owner}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {restaurant.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {restaurant.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge className={getPlanBadge(restaurant.plan)}>{restaurant.plan}</Badge>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(restaurant.status)}
                          <Badge className={getStatusBadge(restaurant.status)}>{restaurant.status}</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="text-sm font-medium">{restaurant.rating}</span>
                          <span className="text-xs text-gray-500">({restaurant.reviews})</span>
                        </div>
                        <div className="text-xs text-gray-500">{restaurant.orders.toLocaleString()} orders</div>
                        <div className="text-xs text-gray-500">{restaurant.completionRate}% completion</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">${restaurant.revenue.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">${restaurant.monthlyRevenue.toLocaleString()}/mo</div>
                        <div className="text-xs text-gray-500">${restaurant.avgOrderValue} avg</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {restaurant.growth > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : restaurant.growth < 0 ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : (
                          <Activity className="w-4 h-4 text-gray-400" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            restaurant.growth > 0
                              ? "text-green-600"
                              : restaurant.growth < 0
                                ? "text-red-600"
                                : "text-gray-500"
                          }`}
                        >
                          {restaurant.growth > 0 ? "+" : ""}
                          {restaurant.growth}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{restaurant.lastActive}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedRestaurant(restaurant)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedRestaurant(restaurant)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Restaurant
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="w-4 h-4 mr-2" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CreditCard className="w-4 h-4 mr-2" />
                              Manage Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Contact Owner
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <XCircle className="w-4 h-4 mr-2" />
                              Suspend Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Detail Modal */}
      <RestaurantDetailModal
        restaurant={selectedRestaurant}
        isOpen={!!selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
      />
    </div>
  )
}

export default Restaurants  
