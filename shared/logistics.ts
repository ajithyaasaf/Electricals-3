import { Product } from './types';

// Centralized Shipping Fees (in Paise: ₹1 = 100 Paise)
export const SHIPPING_FEES = {
    STANDARD: 4000,    // ₹40 Flat Standard Delivery
    HEAVY: 15000,      // ₹150 Flat Heavy Item Delivery
    STANDARD_LOW: 4000, // Kept for backward compatibility
    STANDARD_MID: 4000, // Kept for backward compatibility
    HEAVY_FLAT: 15000,  // Kept for backward compatibility
    FREE: 0,
};

// Centralized Shipping Thresholds (in Paise)
export const SHIPPING_THRESHOLDS = {
    FREE_STANDARD: 299900, // FREE Delivery on all orders above ₹2,999
    SUBSIDIZED: 50000,     // ₹500
    FREE_HEAVY: 299900,    // FREE Delivery on heavy items above ₹2,999
};

export interface LogisticsInfo {
    weight: number;   // in kg (optional fallback)
    isBulky: boolean;  // True if flagged as Heavy Item
}

// Category Default Map (Used when isBulky isn't explicitly set)
export const CATEGORY_DEFAULTS: Record<string, LogisticsInfo> = {
    'Wires and Cables': { weight: 2, isBulky: false },
    'Switch and Sockets': { weight: 0.1, isBulky: false },
    'Electric Accessories': { weight: 0.2, isBulky: false },
    'Electrical Pipes and Fittings': { weight: 1, isBulky: true },
    'Distribution Box': { weight: 5, isBulky: true },
    'Led Bulb and Fittings': { weight: 0.2, isBulky: false },
};

/**
 * Get product logistics metadata (isBulky flag & fallback weight)
 */
export function getProductLogistics(product: Partial<Product> | undefined): LogisticsInfo {
    if (!product) {
        return { weight: 0.5, isBulky: false };
    }

    if (typeof product.isBulky === 'boolean') {
        return {
            weight: product.weightInKg || 0,
            isBulky: product.isBulky,
        };
    }

    if (product.category && CATEGORY_DEFAULTS[product.category]) {
        return CATEGORY_DEFAULTS[product.category];
    }

    return { weight: 0.5, isBulky: false };
}

/**
 * Centralized Shipping Fee Calculator
 * - Order Subtotal >= ₹2,999 ➔ FREE Delivery (₹0)
 * - Cart has any Heavy Item (isBulky = true) ➔ Flat ₹150 Delivery
 * - Standard Order ➔ Flat ₹40 Delivery
 */
export function calculateShippingFee(items: Array<any>, subtotalInPaise: number): number {
    if (subtotalInPaise >= SHIPPING_THRESHOLDS.FREE_STANDARD) {
        return SHIPPING_FEES.FREE;
    }

    const hasHeavyItem = items.some(item => {
        if (!item) return false;
        const p = item.product || item;
        const logistics = getProductLogistics(p);
        return logistics.isBulky;
    });

    return hasHeavyItem ? SHIPPING_FEES.HEAVY : SHIPPING_FEES.STANDARD;
}
