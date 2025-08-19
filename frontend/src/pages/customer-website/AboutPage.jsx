import { Users, Target, Heart, Lightbulb, Globe } from "lucide-react"

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Quality Craftsmanship",
      description: "Every stitch is made with care and attention to detail, ensuring the perfect fit",
    },
    {
      icon: Lightbulb,
      title: "Expert Consultation",
      description: "We provide personalized advice to help you achieve the perfect look",
    },
    {
      icon: Users,
      title: "Customer Satisfaction",
      description: "Your satisfaction is our priority - we're not happy until you're happy",
    },
    {
      icon: Globe,
      title: "Timeless Style",
      description: "Creating garments that stand the test of time with classic and modern techniques",
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground mb-4">
              ✂️ Founded in 2003
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Crafting Perfect Fits for 20+ Years
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              We started as passionate tailors with a vision to provide exceptional craftsmanship. Today, we're proud to have served
              over 500 customers with the perfect fit and style they deserve.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-500 mb-2">500+</div>
                <div className="text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-500 mb-2">20+</div>
                <div className="text-muted-foreground">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-500 mb-2">100%</div>
                <div className="text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                To provide exceptional tailoring services that enhance your confidence and style. We believe that well-fitted clothing
                is not just about appearance, but about how it makes you feel.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From simple alterations to custom designs, we combine traditional craftsmanship with modern techniques to deliver
                garments that fit perfectly and look stunning.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center">
                <div className="text-8xl opacity-20">✂️</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our craftsmanship
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-card text-card-foreground rounded-lg p-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-6 group-hover:scale-110 transition-transform">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Experience Perfect Fit</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Let us help you look and feel your best. Schedule a consultation and discover the difference quality tailoring makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-500 px-8 py-4 text-lg font-semibold rounded-full hover:bg-gray-100 transition-colors">
              Get Free Consultation
            </button>
            <button className="border-2 border-white text-white px-8 py-4 text-lg font-semibold rounded-full hover:bg-white hover:text-blue-500 transition-colors">
              View Our Work
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
