import { ArrowRight, Star, Users, TrendingUp, Shield, Clock } from "lucide-react"
import { Link } from "react-router-dom"

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground mb-4">
              ✂️ Professional Tailoring Services
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Perfect Fit, Every Time
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Professional tailoring services for all your clothing needs. From alterations to custom designs, we deliver quality craftsmanship with precision and style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/contact">
                <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group flex items-center">
                  Get Free Quote
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/services">
                <button className="border-2 border-input bg-background px-8 py-4 text-lg font-semibold rounded-full hover:bg-accent transition-colors">
                  View Services
                </button>
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-8 pt-8">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-2 border-white"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">500+ satisfied customers</span>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-muted-foreground ml-2">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: "500+", label: "Happy Customers" },
              { icon: TrendingUp, value: "20+", label: "Years Experience" },
              { icon: Clock, value: "24hrs", label: "Fast Turnaround" },
              { icon: Shield, value: "100%", label: "Satisfaction Guarantee" },
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Professional Services</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tailoring services designed to make you look and feel your best
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "✂️",
                title: "Alterations & Fittings",
                description: "Professional alterations to make your clothes fit perfectly. From hemming to waist adjustments, we ensure the perfect fit.",
                features: ["Hemming & length adjustments", "Waist & sleeve fitting", "Wedding dress alterations"],
              },
              {
                icon: "👔",
                title: "Custom Design & Creation",
                description: "Bespoke clothing designed and crafted just for you. From custom suits to unique dresses, we bring your vision to life.",
                features: ["Custom suits & jackets", "Bespoke dresses", "Formal wear creation"],
              },
              {
                icon: "🔧",
                title: "Repairs & Maintenance",
                description: "Expert repairs to extend the life of your favorite garments. Professional mending and maintenance services.",
                features: ["Zipper repairs", "Tear & hole mending", "Button replacement"],
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 hover:-translate-y-2 rounded-lg p-8"
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/services">
              <button className="border border-input bg-background px-6 py-3 rounded-lg font-medium hover:bg-accent transition-colors group flex items-center mx-auto">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Trusted by Customers for Quality Work</h2>
            <p className="text-xl text-muted-foreground">See what our customers have to say</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Wedding Client",
                content:
                  "The wedding dress alterations were perfect! I felt beautiful on my special day. The attention to detail was incredible.",
                rating: 5,
              },
              {
                name: "Mike Chen",
                role: "Business Professional",
                content:
                  "My custom suit fits like a dream. The quality of workmanship is outstanding and the fit is perfect for my body type.",
                rating: 5,
              },
              {
                name: "Lisa Rodriguez",
                role: "Regular Customer",
                content:
                  "I've been coming here for years. The alterations are always perfect and the staff is so professional and friendly.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-0 rounded-lg p-8"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Wardrobe?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Get a free consultation and quote for your tailoring needs. Our experts are ready to help you look your best.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <button className="bg-white text-blue-500 px-8 py-4 text-lg font-semibold rounded-full hover:bg-gray-100 transition-colors">
                Get Free Quote
              </button>
            </Link>
            <Link to="/contact">
              <button className="border-2 border-white text-white px-8 py-4 text-lg font-semibold rounded-full hover:bg-white hover:text-blue-500 transition-colors">
                Schedule Consultation
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
