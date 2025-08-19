import { Smartphone, BarChart3, Package, Users, Calendar, CreditCard, Wifi, Clock, TrendingUp } from "lucide-react"

export default function FeaturesPage() {
  const featureCategories = [
    {
      title: "Point of Sale",
      description: "Modern, intuitive POS system designed for speed",
      features: [
        {
          icon: Smartphone,
          title: "Touch-Friendly Interface",
          description: "Intuitive design that your staff will love using",
        },
        {
          icon: Wifi,
          title: "Offline Mode",
          description: "Keep serving customers even without internet",
        },
        {
          icon: CreditCard,
          title: "Multiple Payment Options",
          description: "Accept cash, cards, mobile payments, and more",
        },
      ],
    },
    {
      title: "Analytics & Reporting",
      description: "Data-driven insights to grow your business",
      features: [
        {
          icon: BarChart3,
          title: "Real-Time Dashboard",
          description: "Monitor your restaurant's performance in real-time",
        },
        {
          icon: TrendingUp,
          title: "Predictive Analytics",
          description: "AI-powered forecasting for better planning",
        },
        {
          icon: Clock,
          title: "Custom Reports",
          description: "Generate detailed reports for any time period",
        },
      ],
    },
    {
      title: "Operations Management",
      description: "Streamline your daily operations",
      features: [
        {
          icon: Package,
          title: "Inventory Tracking",
          description: "Real-time inventory with automated alerts",
        },
        {
          icon: Users,
          title: "Staff Management",
          description: "Schedule staff and track performance",
        },
        {
          icon: Calendar,
          title: "Table Reservations",
          description: "Manage bookings and optimize seating",
        },
      ],
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950/20 dark:via-red-950/20 dark:to-pink-950/20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground mb-4">
            🚀 50+ Powerful Features
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Everything You Need to Succeed
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover all the powerful features that make Restaurant SaaS the complete solution for modern restaurants.
          </p>
          <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg font-semibold rounded-full">
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          {featureCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-20 last:mb-0">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">{category.title}</h2>
                <p className="text-xl text-muted-foreground">{category.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {category.features.map((feature, index) => (
                  <div
                    key={index}
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-8 text-center"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white mb-6 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Experience All Features?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Start your free trial today and discover how our features can transform your restaurant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-orange-500 px-8 py-4 text-lg font-semibold rounded-full hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-4 text-lg font-semibold rounded-full hover:bg-white hover:text-orange-500 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
