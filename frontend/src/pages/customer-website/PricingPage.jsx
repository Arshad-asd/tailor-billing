import { Check, Star, Zap, Crown } from "lucide-react"

export default function PricingPage() {
  const plans = [
    {
      name: "Basic Alterations",
      icon: Zap,
      price: 15,
      description: "Perfect for simple alterations and quick fixes",
      features: [
        "Hemming pants & skirts",
        "Basic sleeve adjustments",
        "Button replacement",
        "Simple zipper repairs",
        "Waist adjustments",
        "Basic consultations",
      ],
      popular: false,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Premium Alterations",
      icon: Star,
      price: 35,
      description: "Most popular choice for comprehensive alterations",
      features: [
        "All Basic Alterations",
        "Wedding dress alterations",
        "Complex fitting adjustments",
        "Premium fabric handling",
        "Multiple fittings included",
        "Rush service available",
        "Expert consultation",
        "Quality guarantee",
      ],
      popular: true,
      color: "from-blue-500 to-purple-500",
    },
    {
      name: "Custom Design",
      icon: Crown,
      price: null,
      description: "Bespoke clothing designed and crafted just for you",
      features: [
        "Custom suit creation",
        "Bespoke dress design",
        "Personal consultation",
        "Multiple fittings",
        "Premium materials",
        "Lifetime alterations",
        "Design consultation",
        "Exclusive service",
      ],
      popular: false,
      color: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground mb-4">
            💰 Free consultation for new customers
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Fair and competitive pricing for all your tailoring needs. Get a free consultation to discuss your requirements.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 rounded-lg border bg-card text-card-foreground shadow-sm ${
                  plan.popular ? "ring-2 ring-blue-500 scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <div className={`text-center ${plan.popular ? "pt-12" : "pt-8"} p-6`}>
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${plan.color} text-white mb-4 mx-auto`}
                  >
                    <plan.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="py-4">
                    {plan.price ? (
                      <div>
                        <span className="text-5xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/service</span>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold">Custom Pricing</div>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                        : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    {plan.price ? "Get Quote" : "Contact for Pricing"}
                  </button>
                </div>
              </div>
            ))}
          </div>    
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Additional Services</h2>
            <p className="text-xl text-muted-foreground">Specialized services for your unique needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { service: "Wedding Dress Alterations", price: "From $75" },
              { service: "Custom Suit Creation", price: "From $300" },
              { service: "Bespoke Dress Design", price: "From $200" },
              { service: "Rush Service (24hr)", price: "+50% fee" },
              { service: "Home Visit Fittings", price: "From $50" },
              { service: "Fabric Consultation", price: "From $25" },
              { service: "Pattern Making", price: "From $100" },
              { service: "Lifetime Alterations", price: "Included with Custom" },
            ].map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <h3 className="font-semibold mb-2">{item.service}</h3>
                <p className="text-blue-600 font-medium">{item.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Contact us for a free consultation and get a personalized quote for your tailoring needs.
          </p>
          <button className="bg-white text-blue-500 px-8 py-4 text-lg font-semibold rounded-full hover:bg-gray-100 transition-colors">
            Get Free Consultation
          </button>
          <p className="text-sm mt-6 opacity-75">Free consultation • No obligation • Quality guaranteed</p>
        </div>
      </section>
    </div>
  )
}
