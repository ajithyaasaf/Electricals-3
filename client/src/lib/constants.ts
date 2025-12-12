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

// Business Policies Configuration - Phase 1: Madurai Launch
// Future: Expand to Tamil Nadu → North India → Pan-India
export const BUSINESS_POLICIES = {
  shipping: {
    // Phase 1: Madurai only (weight-based shipping via shared/logistics.ts)
    standardDeliveryDays: {
      min: 1,
      max: 2  // Madurai local delivery
    },
    // Phase 1: Only Madurai (625xxx pincodes) serviceable
    // See shared/delivery-zones.ts for expansion roadmap
    currentPhase: 'madurai-only',
    serviceablePincodePrefix: '625',
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
    // Phase 1: Madurai only
    serviceableArea: 'Madurai (625xxx pincodes)',
    additionalCharges: 0, // No additional charges
    minOrderAmount: 0, // No minimum
    maxOrderAmount: 50000, // ₹50,000 max for COD
  },
  cancellation: {
    enabled: false, // Order cancellation not available as per client requirement
  },
  serviceAreas: {
    current: 'Madurai, Tamil Nadu (625xxx pincodes)',
    // Future expansion phases:
    // Phase 2: Tamil Nadu (Chennai, Coimbatore, Trichy, Salem)
    // Phase 3: North India (Delhi, Jaipur, Lucknow)
    coverage: 'Currently: Madurai | Expanding Soon!'
  }
};

// Formatted policy text for display (Phase 1: Madurai Only)
export const POLICY_TEXT = {
  shipping: `• Currently delivering within Madurai (625xxx pincodes)\n• Delivery in 1-2 business days\n• Shipping fees based on weight and product category (₹30 - ₹150)\n• Expanding to all of Tamil Nadu soon!`,
  returns: `• Return window: 5-7 working days from delivery\n• Return shipping charges: 2.5% of product value\n• Items must be unused, sealed, and in original packaging\n• All accessories must be included`,
  cod: `• Available in Madurai (625xxx pincodes)\n• No additional charges for COD\n• COD limit: ₹50,000 per order\n• Prepaid options: UPI, Cards, Net Banking`,
  cancellation: `Order cancellation is not available once placed. Please review your order carefully before confirming.`
};

export const COMPANY_INFO = {
  name: "CopperBear Electrical Solutions",
  tagline: "Professional Electrical Products & Services",
  description: "Your trusted partner for all electrical needs. Licensed, insured, and committed to excellence.",
};
