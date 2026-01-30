import { MapPin, Truck, Package, Clock } from 'lucide-react';
import { BUSINESS_POLICIES } from '@/lib/constants';
import { SHIPPING_THRESHOLDS } from '@shared/logistics';
import { formatPrice } from '@/lib/currency';

/**
 * SEO-optimized Service Areas Section
 * Phase 1: Madurai Launch with Future Expansion Roadmap
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
            Now Serving Madurai - Expanding Across Tamil Nadu Soon!
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Based in <strong>Madurai, Tamil Nadu</strong>, we're launching with fast local delivery.
            Stay tuned for expansion across Tamil Nadu and beyond!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Phase 1 - NOW SERVING: Madurai */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-lg relative overflow-hidden">
            {/* NOW SERVING badge */}
            <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
              ✓ NOW SERVING
            </div>

            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mr-4">
                <MapPin className="text-green-700 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Madurai</h3>
                <p className="text-sm text-green-700">625xxx Pincodes</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center bg-white/50 p-2 rounded-lg">
                <Truck className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Super Fast Delivery</div>
                  <div className="text-xs text-gray-600">1-2 business days</div>
                </div>
              </div>
              <div className="flex items-center bg-white/50 p-2 rounded-lg">
                <Package className="w-4 h-4 mr-3 text-green-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold">Weight-Based Shipping</div>
                  <div className="text-xs text-gray-600">From ₹30 | Free {formatPrice(SHIPPING_THRESHOLDS.FREE_STANDARD)}+*</div>
                </div>
              </div>
            </div>
          </div>

          {/* Phase 2 - COMING SOON: Tamil Nadu */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-6 shadow-lg relative overflow-hidden opacity-90">
            {/* COMING SOON badge */}
            <div className="absolute top-4 right-4 bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold">
              ⏳ COMING SOON
            </div>

            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mr-4">
                <MapPin className="text-yellow-700 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Tamil Nadu</h3>
                <p className="text-sm text-yellow-700">Expanding Q1 2025</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p className="font-medium">Cities Coming Soon:</p>
              <p className="text-xs leading-relaxed">Chennai, Coimbatore, Trichy, Salem, Tirunelveli, Vellore, Erode & more</p>
              <div className="flex items-center mt-3 bg-white/50 p-2 rounded-lg">
                <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                <span className="text-xs font-semibold">2-4 days delivery (estimated)</span>
              </div>
            </div>
          </div>

          {/* Phase 3 - FUTURE: Pan-India */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 shadow-lg relative overflow-hidden opacity-80">
            {/* FUTURE badge */}
            <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
              🚀 FUTURE
            </div>

            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mr-4">
                <MapPin className="text-blue-700 w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">All India</h3>
                <p className="text-sm text-blue-700">Coming in 2025</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p className="font-medium">Expansion Plans:</p>
              <p className="text-xs leading-relaxed">South India → North India → Pan-India coverage</p>
              <p className="text-xs text-gray-600 mt-3">Stay tuned for updates!</p>
            </div>
          </div>
        </div>

        {/* Current Coverage Detail */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-200">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <h3 className="font-semibold text-gray-900 text-lg">
              Current Service Area (Active)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-700 mb-3">
                <strong className="text-gray-900">Madurai District:</strong> All 625xxx pincodes
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Madurai City
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Anna Nagar
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  K.Pudur
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Palanganatham
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Thiruparankundram
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Villapuram
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-700 mb-3">
                <strong className="text-gray-900">Delivery Promise:</strong>
              </p>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex items-start">
                  <Package className="w-4 h-4 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Orders placed before 6 PM delivered next day</span>
                </li>
                <li className="flex items-start">
                  <Truck className="w-4 h-4 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Weight-based shipping: ₹30 (light), ₹60 (standard), ₹150 (heavy)</span>
                </li>
                <li className="flex items-start">
                  <Clock className="w-4 h-4 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Free shipping on standard items {formatPrice(SHIPPING_THRESHOLDS.FREE_STANDARD)}+, heavy items {formatPrice(SHIPPING_THRESHOLDS.FREE_HEAVY)}+</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center mt-6 text-sm text-gray-600 bg-white/70 p-4 rounded-lg">
          <strong className="text-gray-900">Launch Phase:</strong> We're starting strong in Madurai!
          <span className="block mt-1">Want us in your city? Join our waitlist for expansion updates.</span>
        </p>
      </div>
    </section>
  );
}
