/**
 * Currency formatting utilities for CopperBear platform
 * All prices are displayed in Indian Rupees (INR)
 * 
 * IMPORTANT: Prices are stored in PAISE in the database (1 rupee = 100 paise)
 * This module handles conversion from paise → rupees for display
 */

export const formatPrice = (amountInPaise: number): string => {
  // Convert paise to rupees (divide by 100)
  const amountInRupees = amountInPaise / 100;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountInRupees);
};

export const formatIntegerPrice = (amountInPaise: number): string => {
  const amountInRupees = Math.round(amountInPaise / 100);

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInRupees);
};

export const formatPriceCompact = (amountInPaise: number): string => {
  const amountInRupees = amountInPaise / 100;

  if (amountInRupees >= 100000) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(amountInRupees);
  }
  return formatPrice(amountInPaise);
};

export const formatPriceRange = (minInPaise: number, maxInPaise?: number): string => {
  if (!maxInPaise || minInPaise === maxInPaise) {
    return formatPrice(minInPaise);
  }
  return `${formatPrice(minInPaise)} - ${formatPrice(maxInPaise)}`;
};

export const calculateDiscount = (originalPriceInPaise: number, currentPriceInPaise: number): number => {
  return Math.round(((originalPriceInPaise - currentPriceInPaise) / originalPriceInPaise) * 100);
};

export const formatDiscount = (originalPriceInPaise: number, currentPriceInPaise: number): string => {
  const discount = calculateDiscount(originalPriceInPaise, currentPriceInPaise);
  return `${discount}% OFF`;
};

export const formatSavings = (originalPriceInPaise: number, currentPriceInPaise: number): string => {
  const savings = originalPriceInPaise - currentPriceInPaise;
  return `Save ${formatPrice(savings)}`;
};

/**
 * Normalizes order financial amounts to guarantee exact display in Paise,
 * auto-correcting legacy orders where shipping cost was stored in Rupees.
 */
export const normalizeOrderFinancials = (order: {
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  total?: number;
}) => {
  const subtotal = order.subtotal || 0;
  const tax = order.tax || 0;
  let shippingCost = order.shippingCost || 0;

  // Backward compatibility: If shippingCost was saved in Rupees (e.g. 40 or 150) instead of Paise (4000 or 15000), convert to Paise
  if (shippingCost > 0 && shippingCost < 500) {
    shippingCost = shippingCost * 100;
  }

  const total = subtotal + tax + shippingCost;

  return {
    subtotal,
    tax,
    shippingCost,
    total,
  };
};