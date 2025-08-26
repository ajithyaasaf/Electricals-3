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
  phone: "(555) 123-4567",
  email: "support@copperbear.com",
  address: "123 Electric Avenue, Power City, PC 12345",
};

// Business Policies Configuration - As per client requirements
export const BUSINESS_POLICIES = {
  shipping: {
    freeShippingThreshold: 10000, // ₹10,000
    standardDeliveryDays: { min: 1, max: 3 },
    serviceableStates: ['Tamil Nadu', 'TN'],
    defaultShippingCost: 100, // ₹100 for orders below ₹10k
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
    serviceableStates: ['Tamil Nadu', 'TN'],
    additionalCharges: 0, // No additional charges
    minOrderAmount: 0, // No minimum
    maxOrderAmount: null, // No maximum
  },
  cancellation: {
    enabled: false, // Order cancellation not available as per client requirement
  }
};

// Formatted policy text for display
export const POLICY_TEXT = {
  shipping: `• Free delivery on orders above ₹10,000\n• Delivery in 1-3 business days\n• Currently delivering only to Tamil Nadu\n• Standard shipping: ₹100`,
  returns: `• Return window: 5-7 working days from delivery\n• Return shipping charges: 2.5% of product value\n• Items must be unused, sealed, and in original packaging\n• All accessories must be included`,
  cod: `• Available for Tamil Nadu only\n• No additional charges for COD\n• No minimum or maximum order limits\n• Pay cash on delivery`,
  cancellation: `Order cancellation is not available once placed. Please review your order carefully before confirming.`
};

export const COMPANY_INFO = {
  name: "CopperBear Electrical Solutions",
  tagline: "Professional Electrical Products & Services",
  description: "Your trusted partner for all electrical needs. Licensed, insured, and committed to excellence.",
};
