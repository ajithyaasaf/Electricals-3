import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/common/hero-section";
import { Testimonials } from "@/components/common/testimonials";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Zap, Shield, Clock, Star, ArrowRight, Users, MapPin, 
  Wrench, Home, Building, Factory, CheckCircle, 
  Phone, Mail, Award, TrendingUp, DollarSign
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-copper-600" />,
      title: "Licensed & Insured",
      description: "All our electricians are fully licensed, insured, and background-checked professionals."
    },
    {
      icon: <Clock className="w-8 h-8 text-electric-blue-600" />,
      title: "Fast Service",
      description: "Same-day service available for most electrical repairs and installations."
    },
    {
      icon: <Star className="w-8 h-8 text-green-600" />,
      title: "Quality Guaranteed",
      description: "Premium electrical products with manufacturer warranties and professional installation."
    }
  ];

  const productHighlights = [
    {
      name: "Circuit Breakers",
      description: "Professional-grade circuit breakers from top manufacturers",
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
    },
    {
      name: "Electrical Tools", 
      description: "High-quality tools for electrical professionals and DIY enthusiasts",
      image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
    },
    {
      name: "Wiring & Cables",
      description: "Complete selection of electrical wiring and cables for all applications",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
    }
  ];

  const companyStats = [
    { number: "50,000+", label: "Products Available", icon: <Star className="w-6 h-6 text-copper-600" /> },
    { number: "15,000+", label: "Happy Customers", icon: <Users className="w-6 h-6 text-electric-blue-600" /> },
    { number: "25+", label: "Years Experience", icon: <Award className="w-6 h-6 text-green-600" /> },
    { number: "500+", label: "Licensed Electricians", icon: <Shield className="w-6 h-6 text-purple-600" /> }
  ];

  const services = [
    {
      icon: <Home className="w-8 h-8 text-copper-600" />,
      title: "Residential Services",
      description: "Complete electrical solutions for homes including wiring, panel upgrades, and lighting installations.",
      features: ["Panel Upgrades", "Home Rewiring", "Smart Home Setup", "Safety Inspections"]
    },
    {
      icon: <Building className="w-8 h-8 text-electric-blue-600" />,
      title: "Commercial Services", 
      description: "Professional electrical services for businesses, offices, and commercial properties.",
      features: ["Commercial Wiring", "Emergency Repairs", "Maintenance Plans", "Code Compliance"]
    },
    {
      icon: <Factory className="w-8 h-8 text-green-600" />,
      title: "Industrial Solutions",
      description: "Heavy-duty electrical solutions for manufacturing and industrial facilities.",
      features: ["Motor Control", "Power Distribution", "Industrial Automation", "24/7 Support"]
    }
  ];

  const pricingTiers = [
    {
      name: "Basic Plan",
      price: "₹2,500",
      period: "per visit",
      description: "Perfect for small electrical repairs and maintenance",
      features: [
        "Basic electrical repairs",
        "Outlet installation",
        "Switch replacement", 
        "Basic troubleshooting",
        "1-year warranty"
      ],
      popular: false
    },
    {
      name: "Professional Plan",
      price: "₹8,300",
      period: "per project",
      description: "Comprehensive electrical services for medium projects",
      features: [
        "Panel upgrades",
        "Circuit installation",
        "Lighting design",
        "Smart home integration",
        "2-year warranty",
        "Free consultation"
      ],
      popular: true
    },
    {
      name: "Enterprise Plan",
      price: "Custom",
      period: "quote",
      description: "Large-scale electrical solutions for commercial projects",
      features: [
        "Complete electrical systems",
        "Industrial automation",
        "24/7 emergency support",
        "Dedicated project manager",
        "5-year warranty",
        "Priority service"
      ],
      popular: false
    }
  ];

  const industries = [
    { name: "Healthcare", icon: "🏥", description: "Hospitals and medical facilities" },
    { name: "Education", icon: "🏫", description: "Schools and universities" },
    { name: "Retail", icon: "🏪", description: "Stores and shopping centers" },
    { name: "Manufacturing", icon: "🏭", description: "Factories and production facilities" },
    { name: "Hospitality", icon: "🏨", description: "Hotels and restaurants" },
    { name: "Residential", icon: "🏠", description: "Homes and apartments" }
  ];

  const faqs = [
    {
      question: "Do you provide emergency electrical services?",
      answer: "Yes! We offer 24/7 emergency electrical services for urgent repairs. Our licensed electricians are available around the clock to handle electrical emergencies safely and efficiently."
    },
    {
      question: "Are your electricians licensed and insured?",
      answer: "Absolutely! All our electricians are fully licensed, bonded, and insured. We maintain comprehensive liability insurance and ensure all our technicians meet state certification requirements."
    },
    {
      question: "What areas do you serve?",
      answer: "We currently serve Los Angeles and San Francisco areas in California. We're expanding our service areas regularly - contact us to check if we serve your location."
    },
    {
      question: "Do you offer warranties on your work?",
      answer: "Yes, we provide comprehensive warranties on all our electrical work. Residential services come with a 1-2 year warranty, while commercial projects include up to 5 years warranty depending on the scope."
    },
    {
      question: "Can I get a free estimate?",
      answer: "Yes! We provide free estimates for most electrical projects. Simply contact us with your requirements, and we'll schedule a consultation to assess your needs and provide a detailed quote."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose CopperBear Electrical?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional electrical solutions backed by expertise, quality products, and exceptional service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <section className="py-16 bg-copper-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Thousands Across India
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Leading the electrical industry with excellence, innovation, and customer satisfaction
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {companyStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Highlights */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Premium Electrical Products
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive selection of electrical products from trusted manufacturers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {productHighlights.map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <Link href="/products" className="text-copper-600 hover:text-copper-700 font-medium inline-flex items-center">
                    Shop Now <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-copper-600 hover:bg-copper-700 text-white">
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Electrical Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From residential repairs to industrial installations, we provide complete electrical solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-8 hover:bg-gray-100 transition-colors">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-6 shadow-sm">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-electric-blue-600 hover:bg-electric-blue-700 text-white">
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Transparent Pricing Plans
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your electrical needs with upfront, honest pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, index) => (
              <div key={index} className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-8 relative ${tier.popular ? 'ring-2 ring-copper-600' : ''}`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-copper-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {tier.price}
                    <span className="text-lg font-normal text-gray-600">/{tier.period}</span>
                  </div>
                  <p className="text-gray-600">{tier.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  asChild 
                  className={`w-full ${tier.popular ? 'bg-copper-600 hover:bg-copper-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                >
                  <Link href="/services">Get Started</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Industries We Serve
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Specialized electrical solutions across multiple industries and sectors
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {industries.map((industry, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-4xl mb-4">{industry.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{industry.name}</h3>
                <p className="text-sm text-gray-600">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600">
              Get answers to common questions about our electrical services and products
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-copper-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-copper-100 mb-8">
                Contact our team of electrical experts for a free consultation and quote
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-copper-100">
                  <Phone className="w-5 h-5 mr-3" />
                  <span>24/7 Emergency: +91-9876543210</span>
                </div>
                <div className="flex items-center text-copper-100">
                  <Mail className="w-5 h-5 mr-3" />
                  <span>info@copperbear.com</span>
                </div>
                <div className="flex items-center text-copper-100">
                  <MapPin className="w-5 h-5 mr-3" />
                  <span>Mumbai, Delhi, Bangalore & 25+ Cities</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Free Consultation</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-copper-600 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-copper-600 focus:border-transparent"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-copper-600 focus:border-transparent"
                />
                <textarea
                  placeholder="Describe your electrical needs..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-copper-600 focus:border-transparent"
                ></textarea>
                <Button className="w-full bg-copper-600 hover:bg-copper-700 text-white py-3">
                  Request Free Quote
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      <Footer />
    </div>
  );
}
