import { MapPin, Truck, Package } from 'lucide-react';
import { BUSINESS_POLICIES } from '@/lib/constants';

/**
 * SEO-optimized Service Areas Section
 * Displays pan-India delivery coverage for better local SEO
 */
export function ServiceAreasSection() {
  return (
    <section 
      className="bg-gradient-to-br from-copper-50 to-amber-50 py-12"
      aria-labelledby="service-areas-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 
            id="service-areas-heading" 
            className="text-3xl font-bold text-gray-900 mb-3"
          >
            Delivering Premium Electrical Products Across India
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Based in <strong>Madurai, Tamil Nadu</strong>, we deliver to all major cities across India. 
            Fast, reliable shipping from South to North India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Primary Hub - Madurai */}
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-copper-100 rounded-full flex items-center justify-center mr-4">
                <MapPin className="text-copper-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Primary Hub</h3>
                <p className="text-sm text-gray-600">Madurai, Tamil Nadu</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center">
                <Truck className="w-4 h-4 mr-2 text-green-600" />
                <span>1-3 days delivery</span>
              </div>
              <div className="flex items-center">
                <Package className="w-4 h-4 mr-2 text-green-600" />
                <span>Free shipping on ₹10,000+</span>
              </div>
            </div>
          </div>

          {/* Tamil Nadu & South India */}
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <MapPin className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">South India</h3>
                <p className="text-sm text-gray-600">Tamil Nadu & Nearby States</p>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-medium">Major Cities Served:</p>
              <p>Chennai, Coimbatore, Trichy, Salem, Bangalore, Hyderabad, Kochi, Mysore</p>
              <div className="flex items-center mt-3">
                <Truck className="w-4 h-4 mr-2 text-blue-600" />
                <span className="font-medium">2-5 days delivery</span>
              </div>
            </div>
          </div>

          {/* North India */}
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <MapPin className="text-purple-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">North India</h3>
                <p className="text-sm text-gray-600">Delhi, UP, Rajasthan & More</p>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-medium">Major Cities Served:</p>
              <p>Delhi, Noida, Gurgaon, Jaipur, Lucknow, Chandigarh, Agra, Kanpur, Udaipur</p>
              <div className="flex items-center mt-3">
                <Truck className="w-4 h-4 mr-2 text-purple-600" />
                <span className="font-medium">3-7 days delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* All States Keyword-Rich List for SEO */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">
            We Ship to All Major States
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm text-gray-700">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Tamil Nadu
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Karnataka
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Andhra Pradesh
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Kerala
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Delhi
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Uttar Pradesh
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Rajasthan
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Punjab
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Haryana
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Maharashtra
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Gujarat
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              West Bengal
            </div>
          </div>
          
          <p className="text-center mt-6 text-sm text-gray-600">
            <strong>All India Delivery Available</strong> - Express shipping to 500+ cities across India
          </p>
        </div>
      </div>
    </section>
  );
}
