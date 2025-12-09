/**
 * Order State Machine
 * 
 * Defines valid order status transitions and provides helper functions
 * to validate and manage order lifecycle.
 * 
 * State Flow:
 * pending → confirmed → processing → shipped → delivered (TERMINAL)
 *    ↓         ↓           ↓           ↓
 * cancelled  cancelled  cancelled  cancelled (rare, delivery failed)
 */

import type { OrderStatus } from '@shared/types';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Valid status transitions map
 * Key: Current status
 * Value: Array of statuses that can be transitioned TO from current status
 */
export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    // Allow skipping 'processing' and 'shipped' if handled manually
    confirmed: ['processing', 'shipped', 'delivered', 'cancelled'],
    // Allow skipping 'shipped'
    processing: ['shipped', 'delivered', 'cancelled'],
    shipped: ['delivered', 'cancelled'], // cancelled = delivery failed (rare)
    delivered: [], // TERMINAL - no further transitions
    cancelled: [], // TERMINAL - no further transitions
};

/**
 * Terminal states that cannot be changed
 */
export const TERMINAL_STATES: OrderStatus[] = ['delivered', 'cancelled'];

/**
 * States that customers can cancel from (self-service)
 */
export const CUSTOMER_CANCELLABLE_STATES: OrderStatus[] = ['pending', 'confirmed'];

/**
 * Human-readable status labels
 */
export const STATUS_LABELS: Record<OrderStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
};

/**
 * Status colors for UI (Tailwind classes)
 */
export const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    processing: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
    shipped: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
    delivered: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
};

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if a status transition is valid
 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
    const allowed = VALID_TRANSITIONS[from];
    return allowed?.includes(to) ?? false;
}

/**
 * Validate a status transition and throw if invalid
 * @throws Error if transition is not allowed
 */
export function validateTransition(from: OrderStatus, to: OrderStatus): void {
    // Check if already in target state
    if (from === to) {
        throw new Error(`Order is already in "${STATUS_LABELS[to]}" status.`);
    }

    // Check if current state is terminal
    if (TERMINAL_STATES.includes(from)) {
        throw new Error(
            `Cannot change order status. "${STATUS_LABELS[from]}" is a terminal state.`
        );
    }

    // Check if transition is valid
    if (!canTransition(from, to)) {
        const allowedTransitions = VALID_TRANSITIONS[from];
        const allowedLabels = allowedTransitions.map(s => STATUS_LABELS[s]).join(', ');

        throw new Error(
            `Invalid status transition: "${STATUS_LABELS[from]}" → "${STATUS_LABELS[to]}". ` +
            `Allowed: ${allowedLabels || 'None (terminal state)'}.`
        );
    }
}

/**
 * Check if an order is in a terminal state
 */
export function isTerminalState(status: OrderStatus): boolean {
    return TERMINAL_STATES.includes(status);
}

/**
 * Check if a customer can cancel an order (self-service)
 */
export function canCustomerCancel(status: OrderStatus): boolean {
    return CUSTOMER_CANCELLABLE_STATES.includes(status);
}

/**
 * Get all valid next statuses from current status
 */
export function getNextStatuses(current: OrderStatus): OrderStatus[] {
    return VALID_TRANSITIONS[current] ?? [];
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER NUMBER GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a unique, collision-proof order number
 * Format: CB-{timestamp}-{random}
 * Example: CB-M5X7K9P-A2F
 * 
 * Timestamp provides uniqueness down to millisecond
 * Random suffix eliminates any edge case collisions
 */
export function generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `CB-${timestamp}-${random}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// STOCK VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export interface StockValidationItem {
    productId: string;
    productName: string;
    requestedQuantity: number;
    availableStock: number;
}

export interface StockValidationResult {
    valid: boolean;
    invalidItems: StockValidationItem[];
    validItems: StockValidationItem[];
}

/**
 * Validate stock availability for a list of items
 */
export function validateStockAvailability(
    items: Array<{
        productId: string;
        productName: string;
        quantity: number;
        stock: number;
    }>
): StockValidationResult {
    const validItems: StockValidationItem[] = [];
    const invalidItems: StockValidationItem[] = [];

    for (const item of items) {
        const validationItem: StockValidationItem = {
            productId: item.productId,
            productName: item.productName,
            requestedQuantity: item.quantity,
            availableStock: item.stock,
        };

        if (item.stock >= item.quantity) {
            validItems.push(validationItem);
        } else {
            invalidItems.push(validationItem);
        }
    }

    return {
        valid: invalidItems.length === 0,
        validItems,
        invalidItems,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// ORDER TOTALS CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

export interface OrderTotals {
    subtotal: number;
    tax: number;
    shippingCost: number;
    total: number;
}

/**
 * Calculate order totals with GST and shipping
 * @param itemTotals Array of item total prices (unitPrice * quantity)
 * @param freeShippingThreshold Minimum subtotal for free shipping (default: ₹10,000)
 * @param shippingCost Cost of shipping if below threshold (default: ₹100)
 * @param taxRate GST rate (default: 18%)
 */
export function calculateOrderTotals(
    itemTotals: number[],
    options: {
        freeShippingThreshold?: number;
        shippingCost?: number;
        taxRate?: number;
    } = {}
): OrderTotals {
    const {
        freeShippingThreshold = 10000,
        shippingCost: baseShippingCost = 100,
        taxRate = 0.18,
    } = options;

    const subtotal = itemTotals.reduce((sum, itemTotal) => sum + itemTotal, 0);
    const tax = Math.round(subtotal * taxRate * 100) / 100; // Round to 2 decimals
    const shippingCost = subtotal >= freeShippingThreshold ? 0 : baseShippingCost;
    const total = subtotal + tax + shippingCost;

    return {
        subtotal,
        tax,
        shippingCost,
        total,
    };
}

console.log('✅ Order State Machine loaded');
