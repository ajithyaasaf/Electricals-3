/**
 * Currency formatting utilities for CopperBear platform
 * All prices are displayed in Indian Rupees (INR)
 */

export const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatPriceCompact = (amount: number): string => {
  if (amount >= 100000) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(amount);
  }
  return formatPrice(amount);
};

export const formatPriceRange = (min: number, max?: number): string => {
  if (!max || min === max) {
    return formatPrice(min);
  }
  return `${formatPrice(min)} - ${formatPrice(max)}`;
};

export const calculateDiscount = (originalPrice: number, currentPrice: number): number => {
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

export const formatDiscount = (originalPrice: number, currentPrice: number): string => {
  const discount = calculateDiscount(originalPrice, currentPrice);
  return `${discount}% OFF`;
};

export const formatSavings = (originalPrice: number, currentPrice: number): string => {
  const savings = originalPrice - currentPrice;
  return `Save ${formatPrice(savings)}`;
};