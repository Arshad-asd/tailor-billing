import { Mail, Phone, Clock, MessageSquare, Headphones, Users } from "lucide-react"

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Consultation",
      description: "Get a quote via email",
      contact: "info@tailorpro.com",
      availability: "Response within 24 hours",
    },
    {
      icon: Phone,
      title: "Phone Consultation",
      description: "Speak with our tailors",
      contact: "(555) 123-4567",
      availability: "Mon-Fri 9AM-6PM EST",
    },
    {
      icon: MessageSquare,
      title: "In-Person Visit",
      description: "Visit our studio for fittings",
      contact: "By appointment only",
      availability: "Mon-Sat 10AM-7PM",
    },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground mb-4">
            ✂️ Free Consultation Available
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Ready for the perfect fit? Need alterations? Want a custom design? We'd love to help you achieve your style goals.
            Our expert tailors are ready to assist you.
          </p>
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">Flexible Hours</span>
            </div>
            <div className="flex items-center space-x-2">
              <Headphones className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">Expert Tailors</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-500" />
              <span className="text-sm text-muted-foreground">Personal Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">How Can We Help?</h2>
            <p className="text-xl text-muted-foreground">Choose the best way to reach us</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-card text-card-foreground rounded-lg p-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-6 group-hover:scale-110 transition-transform">
                  <method.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{method.title}</h3>
                <p className="text-muted-foreground mb-4">{method.description}</p>
                <p className="font-semibold text-lg mb-2">{method.contact}</p>
                <p className="text-sm text-muted-foreground">{method.availability}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-4xl font-bold mb-6">Send Us a Message</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Fill out the form and we'll get back to you within 24 hours. For urgent alterations, please call us
                  directly or visit our studio.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-muted-foreground">Free consultation for new customers</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-muted-foreground">Quick turnaround on alterations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-sm text-muted-foreground">Quality guaranteed on all work</span>
                  </div>
                </div>
              </div>
              <div className="bg-card text-card-foreground rounded-lg shadow-xl p-8">
                <h3 className="text-2xl font-bold mb-6">Contact Form</h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">First Name</label>
                      <input
                        type="text"
                        placeholder="John"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Last Name</label>
                      <input
                        type="text"
                        placeholder="Doe"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Service Type</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option value="">Select a service</option>
                      <option value="alterations">Alterations</option>
                      <option value="custom-design">Custom Design</option>
                      <option value="repairs">Repairs</option>
                      <option value="consultation">Consultation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tell us about your needs</label>
                    <textarea
                      placeholder="Describe what you're looking for, any specific requirements, or questions you have..."
                      rows={4}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 text-lg font-semibold rounded-md transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Don't wait - transform your wardrobe today. Our expert tailors are standing by to help you look your best.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-500 px-8 py-4 text-lg font-semibold rounded-full hover:bg-gray-100 transition-colors">
              Get Free Quote
            </button>
            <button className="border-2 border-white text-white px-8 py-4 text-lg font-semibold rounded-full hover:bg-white hover:text-blue-500 transition-colors">
              Schedule Consultation
            </button>
          </div>
          <p className="text-sm mt-6 opacity-75">Questions? Call us at (555) 123-4567 or visit our studio</p>
        </div>
      </section>
    </div>
  )
}
