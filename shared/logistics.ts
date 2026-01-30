import { Product } from './types';

// Constants for Fees (in Paise)
export const SHIPPING_FEES = {
    STANDARD_LOW: 6000,   // ₹60
    STANDARD_MID: 3000,   // ₹30
    HEAVY_FLAT: 15000,    // ₹150 for Auto/Truck
    FREE: 0,
};

// Constants for Thresholds (in Paise)
export const SHIPPING_THRESHOLDS = {
    FREE_STANDARD: 299900, // ₹2999
    SUBSIDIZED: 50000,     // ₹500
    FREE_HEAVY: 1000000,   // ₹10,000
};

export interface LogisticsInfo {
    weight: number; // in kg
    isBulky: boolean;
}

// Category Default Map
export const CATEGORY_DEFAULTS: Record<string, LogisticsInfo> = {
    'Wires and Cables': { weight: 2, isBulky: false },
    'Switch and Sockets': { weight: 0.1, isBulky: false },
    'Electric Accessories': { weight: 0.2, isBulky: false },
    'Electrical Pipes and Fittings': { weight: 1, isBulky: true },
    'Distribution Box': { weight: 5, isBulky: true },
    'Led Bulb and Fittings': { weight: 0.2, isBulky: false },
};

// Helper Function
export function getProductLogistics(product: Partial<Product> | undefined): LogisticsInfo {
    if (!product) {
        return { weight: 0.5, isBulky: false }; // Safe default
    }

    // If product has explicit weight, use it
    if (product.weightInKg && product.weightInKg > 0) {
        return {
            weight: product.weightInKg,
            isBulky: product.isBulky || false,
        };
    }

    // Fallback to category defaults
    if (product.category && CATEGORY_DEFAULTS[product.category]) {
        return CATEGORY_DEFAULTS[product.category];
    }

    // Safe default
    return { weight: 0.5, isBulky: false };
}
