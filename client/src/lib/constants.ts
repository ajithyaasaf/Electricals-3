import { ELECTRICAL_CATEGORIES } from '@shared/data/categories';

export const CATEGORIES = ELECTRICAL_CATEGORIES;

export const ORDER_STATUSES = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const BOOKING_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const CONTACT_INFO = {
  phone: "+91 80987 27452",
  email: "support@copperbear.com",
  address: "Madurai, Tamil Nadu",
};

// Business Policies Configuration - Pan-India Delivery (Madurai Hub → Tamil Nadu → North India)
export const BUSINESS_POLICIES = {
  shipping: {
    freeShippingThreshold: 10000, // ₹10,000
    standardDeliveryDays: { 
      min: 1, 
      max: 7  // Extended for North India delivery
    },
    serviceableStates: [
      // South India (Primary)
      'Tamil Nadu', 'TN',
      'Karnataka', 'KA',
      'Andhra Pradesh', 'AP',
      'Telangana', 'TS',
      'Kerala', 'KL',
      // North India (Expansion)
      'Delhi', 'DL',
      'Uttar Pradesh', 'UP',
      'Rajasthan', 'RJ',
      'Punjab', 'PB',
      'Haryana', 'HR',
      'Uttarakhand', 'UK',
      'Himachal Pradesh', 'HP',
      'Jammu and Kashmir', 'JK',
      // Central India
      'Madhya Pradesh', 'MP',
      'Chhattisgarh', 'CG',
      // East India
      'West Bengal', 'WB',
      'Bihar', 'BR',
      'Jharkhand', 'JH',
      'Odisha', 'OR',
      // West India
      'Maharashtra', 'MH',
      'Gujarat', 'GJ',
      'Goa', 'GA'
    ],
    defaultShippingCost: 100, // ₹100 base shipping for orders below ₹10k
    regionalShipping: {
      tamilNadu: { cost: 100, days: { min: 1, max: 3 } }, // Local hub - fastest
      southIndia: { cost: 150, days: { min: 2, max: 5 } }, // Neighboring states
      northIndia: { cost: 200, days: { min: 3, max: 7 } }, // North expansion
      restOfIndia: { cost: 250, days: { min: 4, max: 7 } } // Other states
    }
  },
  returns: {
    returnWindowDays: 7, // 5-7 working days
    returnShippingChargePercent: 2.5, // 2.5% of return product value
    conditions: [
      'Items must be in original packaging',
      'Products should be unused and sealed',
      'All accessories and documentation must be included'
    ]
  },
  cod: {
    serviceableStates: [
      'Tamil Nadu', 'TN', // Primary COD region
      'Karnataka', 'KA',
      'Andhra Pradesh', 'AP',
      'Kerala', 'KL'
      // North India: Prepaid only initially, can expand COD later
    ],
    additionalCharges: 0, // No additional charges
    minOrderAmount: 0, // No minimum
    maxOrderAmount: 50000, // ₹50,000 max for COD
  },
  cancellation: {
    enabled: false, // Order cancellation not available as per client requirement
  },
  serviceAreas: {
    primary: 'Madurai, Tamil Nadu',
    secondary: 'Chennai, Coimbatore, Trichy, Salem, Tirunelveli, Vellore, Erode',
    northIndia: 'Delhi, Noida, Gurgaon, Jaipur, Lucknow, Chandigarh, Agra, Kanpur',
    coverage: 'All India Delivery Available'
  }
};

// Formatted policy text for display
export const POLICY_TEXT = {
  shipping: `• Free delivery on orders above ₹10,000\n• Tamil Nadu: 1-3 days | South India: 2-5 days | North India: 3-7 days\n• Serving all major cities: Madurai, Chennai, Delhi, Jaipur, Lucknow & more\n• Standard shipping: ₹100 (TN) | ₹200 (North India)`,
  returns: `• Return window: 5-7 working days from delivery\n• Return shipping charges: 2.5% of product value\n• Items must be unused, sealed, and in original packaging\n• All accessories must be included`,
  cod: `• Available in Tamil Nadu, Karnataka, Kerala & Andhra Pradesh\n• North India: Prepaid orders only (UPI, Cards, Net Banking)\n• No additional charges for COD\n• COD limit: ₹50,000 per order`,
  cancellation: `Order cancellation is not available once placed. Please review your order carefully before confirming.`
};

export const COMPANY_INFO = {
  name: "CopperBear Electrical Solutions",
  tagline: "Professional Electrical Products & Services",
  description: "Your trusted partner for all electrical needs. Licensed, insured, and committed to excellence.",
};
