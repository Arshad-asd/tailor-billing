"use client"

import { useState, useEffect } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Scissors, Package, Package2, Truck, DollarSign, BarChart3, Settings, Users, Bell, Search, User, Menu, X, ChevronLeft, ChevronRight, LogOut, ClipboardList, Receipt, ShoppingCart, Ruler, ChevronDown, UserCircle, Shield, HelpCircle, FileText, Building2 } from 'lucide-react'
import useTokenExpiry from "../hooks/useTokenExpiry"
import LogoutModal from "../components/modals/LogoutModal"
import { useSettings } from "../contexts/SettingsContext"

const AdminLayout = ({ children }) => {
  const { settings } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(!settings.sidebarCollapsed)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const location = useLocation()

  // Token expiry hook
  const {
    showLogoutModal,
    isExpired,
    handleCloseLogoutModal,
    handleManualLogout
  } = useTokenExpiry()

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Job Orders",
      href: "/admin/job-orders",
      icon: ClipboardList,
      badge: "12",
    },
    // {
    //   name: "Measurements",
    //   href: "/admin/measurements",
    //   icon: Ruler,
    //   badge: "3",
    // },
    {
      name: "Materials",
      href: "/admin/materials",
      icon: Package,
      badge: "8",
    },
    {
      name: "Delivery",
      href: "/admin/delivery",
      icon: Truck,
      badge: "5",
    },
    {
      name: "Sales",
      href: "/admin/sales",
      icon: DollarSign,
    },
    {
      name: "Receipt",
      href: "/admin/receipt",
      icon: Receipt,
    },
    {
      name: "Daily Report",
      href: "/admin/daily-report",
      icon: BarChart3,
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: FileText,
    },
    // {
    //   name: "Purchase",
    //   href: "/admin/purchase",
    //   icon: ShoppingCart,
    // },

    {
      name: "Inventory",
      href: "/admin/inventory",
      icon: Package2,
      badge: "5",
    },
    // {
    //   name: "Services",
    //   href: "/admin/services",
    //   icon: Scissors,
    // },
    {
      name: "Customers",
      href: "/admin/customers",
      icon: Users,
    },
    {
      name: "Company Details",
      href: "/admin/company-details",
      icon: Building2,
    },
    // {
    //   name: "Settings",
    //   href: "/admin/settings",
    //   icon: Settings,
    // },
  ]

  const isActiveRoute = (href, exact = false) => {
    if (exact) {
      return location.pathname === href
    }
    return location.pathname.startsWith(href)
  }

  // Update sidebar state when settings change
  useEffect(() => {
    setSidebarOpen(!settings.sidebarCollapsed);
  }, [settings.sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen)
  }

  const getCurrentPageTitle = () => {
    const currentItem = navigationItems.find(item => isActiveRoute(item.href, item.exact))
    return currentItem ? currentItem.name : "Dashboard"
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className={`
          hidden lg:flex flex-col
          ${sidebarOpen ? "w-64" : "w-16"} 
          min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          shadow-lg
        `}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">Tailor Pro</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Management System</p>
                </div>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveRoute(item.href, item.exact)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-gradient-primary text-white shadow-md"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                    ${!sidebarOpen ? "justify-center" : ""}
                  `}
                  title={!sidebarOpen ? item.name : ""}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {item.badge && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  {sidebarOpen && <span className="font-medium truncate">{item.name}</span>}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMobileMenu} />
            <aside className="relative w-64 bg-white dark:bg-gray-800 shadow-xl">
              {/* Mobile Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">Tailor Pro</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Management System</p>
                  </div>
                </div>
                <button onClick={toggleMobileMenu} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="p-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isActiveRoute(item.href, item.exact)
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={toggleMobileMenu}
                      className={`
                        flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                        ${
                          isActive
                            ? "bg-gradient-primary text-white shadow-md"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }
                      `}
                    >
                      <div className="relative">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {item.badge && (
                          <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile Logout Button */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <button
                  onClick={() => {
                    toggleMobileMenu()
                    handleManualLogout()
                  }}
                  className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Enhanced Top Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 lg:px-6 py-3">
              {/* Left Section */}
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={toggleMobileMenu}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Breadcrumb */}
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {getCurrentPageTitle()}
                  </h2>
                  {settings.showBreadcrumbs && (
                    <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>•</span>
                      <span>
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Center Section - Enhanced Search */}
              {settings.showSearchBar && (
                <div className="hidden md:flex flex-1 max-w-lg mx-8">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search job orders, customers, materials..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Right Section - Enhanced */}
              <div className="flex items-center space-x-2">
                {/* Quick Actions */}
                <div className="hidden lg:flex items-center space-x-1">
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                    <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </button>
                </div>

                {/* Notifications */}
                {settings.showNotifications && (
                  <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  </button>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Tailor Manager</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </p>
                    </div>
                    <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Tailor Manager</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">admin@tailorpro.com</p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/admin/profile"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <UserCircle className="w-4 h-4" />
                          <span>Profile Settings</span>
                        </Link>
                        
                        <Link
                          to="/admin/settings"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>System Settings</span>
                        </Link>
                        
                        <button
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-full"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Help & Support</span>
                        </button>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false)
                            handleManualLogout()
                          }}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Search Bar */}
            {settings.showSearchBar && (
              <div className="md:hidden px-4 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </header>

          {/* Page Content */}
          <main className={`flex-1 bg-gray-50 dark:bg-gray-900 ${settings.compactMode ? 'p-2 lg:p-4' : 'p-4 lg:p-6'}`}>
            <div className="max-w-7xl mx-auto">{children || <Outlet />}</div>
          </main>
        </div>
      </div>

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={handleCloseLogoutModal}
        isExpired={isExpired}
      />

      {/* Click outside to close dropdown */}
      {profileDropdownOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setProfileDropdownOpen(false)}
        />
      )}
    </div>
  )
}

export default AdminLayout
