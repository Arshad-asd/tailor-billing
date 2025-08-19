import { Scissors, Ruler, Palette, Wrench, Users, Clock, Star, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function ServicesPage() {
  const serviceCategories = [
    {
      title: "Alterations & Fittings",
      description: "Professional alterations to make your clothes fit perfectly",
      services: [
        {
          icon: Scissors,
          title: "Hemming & Length Adjustments",
          description: "Perfect hem lengths for pants, skirts, and dresses",
          price: "From $15",
        },
        {
          icon: Ruler,
          title: "Waist & Sleeve Adjustments",
          description: "Custom fitting for jackets, shirts, and pants",
          price: "From $25",
        },
        {
          icon: Users,
          title: "Wedding Dress Alterations",
          description: "Specialized alterations for your special day",
          price: "From $75",
        },
      ],
    },
    {
      title: "Custom Design & Creation",
      description: "Bespoke clothing designed and crafted just for you",
      services: [
        {
          icon: Palette,
          title: "Custom Suits & Jackets",
          description: "Handcrafted suits tailored to your measurements",
          price: "From $300",
        },
        {
          icon: Scissors,
          title: "Bespoke Dresses",
          description: "Unique designs created from your vision",
          price: "From $200",
        },
        {
          icon: Ruler,
          title: "Formal Wear",
          description: "Elegant formal attire for special occasions",
          price: "From $150",
        },
      ],
    },
    {
      title: "Repairs & Maintenance",
      description: "Expert repairs to extend the life of your favorite garments",
      services: [
        {
          icon: Wrench,
          title: "Zipper Repairs",
          description: "Fix broken or stuck zippers on any garment",
          price: "From $10",
        },
        {
          icon: Scissors,
          title: "Tear & Hole Repairs",
          description: "Invisible mending for damaged clothing",
          price: "From $15",
        },
        {
          icon: Clock,
          title: "Button Replacement",
          description: "Professional button sewing and replacement",
          price: "From $5",
        },
      ],
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Wedding Client",
      content: "The wedding dress alterations were perfect! I felt beautiful on my special day. The attention to detail was incredible.",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Business Professional",
      content: "My custom suit fits like a dream. The quality of workmanship is outstanding and the fit is perfect for my body type.",
      rating: 5,
    },
    {
      name: "Lisa Rodriguez",
      role: "Regular Customer",
      content: "I've been coming here for years. The alterations are always perfect and the staff is so professional and friendly.",
      rating: 5,
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground mb-4">
            ✂️ Professional Tailoring Services
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Expert Tailoring Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            From simple alterations to custom designs, we provide professional tailoring services with precision craftsmanship and attention to detail.
          </p>
          <Link to="/contact">
            <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold rounded-full">
              Get Free Quote
            </button>
          </Link>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          {serviceCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-20 last:mb-0">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">{category.title}</h2>
                <p className="text-xl text-muted-foreground">{category.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {category.services.map((service, index) => (
                  <div
                    key={index}
                    className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-8 text-center"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-6 group-hover:scale-110 transition-transform">
                      <service.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{service.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{service.description}</p>
                    <div className="text-lg font-semibold text-blue-600 mb-4">{service.price}</div>
                    <Link to="/contact">
                      <button className="border border-input bg-background px-6 py-3 rounded-lg font-medium hover:bg-accent transition-colors group flex items-center mx-auto">
                        Get Quote
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose Tailor Pro?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We combine traditional craftsmanship with modern techniques to deliver exceptional results
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "👨‍🎨",
                title: "Expert Craftsmanship",
                description: "Over 20 years of experience in professional tailoring and alterations",
              },
              {
                icon: "⚡",
                title: "Fast Turnaround",
                description: "Quick service without compromising on quality. Most alterations completed within 24-48 hours",
              },
              {
                icon: "💎",
                title: "Premium Quality",
                description: "Using only the finest materials and techniques for lasting results",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 hover:-translate-y-2 rounded-lg p-8"
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground">Don't just take our word for it</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
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
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Wardrobe?</h2>
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