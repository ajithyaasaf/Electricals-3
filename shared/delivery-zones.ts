/**
 * Delivery Zone Management System
 * 
 * Purpose: Centralized delivery serviceability validation
 * 
 * Current: Madurai-only delivery (Phase 1 launch)
 * Future: Pan-India zonal delivery (A/B/C zones with different rates)
 * 
 * Architecture:
 * - Modular zone definitions
 * - Easy to extend for new zones
 * - Supports pincode validation, zone detection, and messaging
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface DeliveryZone {
    id: string;
    name: string;
    displayName: string;
    pincodeRanges: string[]; // Prefixes like '625', '624', or full ranges
    isServiceable: (pincode: string) => boolean;
    estimatedDays: { min: number; max: number };
    message: {
        available: string;
        unavailable: string;
    };
    // Future: Add shipping multipliers, special handling, etc.
    priority?: number; // For overlapping zones
}

export interface ServiceabilityResult {
    isServiceable: boolean;
    zone?: DeliveryZone;
    message: string;
    estimatedDelivery?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ZONE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Phase 1: Madurai Only
 * Pincode ranges:
 * - 625xxx: Main Madurai city and suburbs (625001-625022, etc.)
 * - Additional ranges can be added as needed
 */
export const ZONE_MADURAI: DeliveryZone = {
    id: 'madurai',
    name: 'Madurai',
    displayName: 'Madurai, Tamil Nadu',
    pincodeRanges: ['625'], // Can expand: ['625', '624'] for rural areas
    isServiceable: (pincode: string) => {
        const cleaned = pincode.trim().replace(/\s/g, '');
        // Accept 625xxx pincodes
        return cleaned.startsWith('625');
    },
    estimatedDays: { min: 1, max: 2 },
    message: {
        available: '✓ Delivery available in Madurai (1-2 days)',
        unavailable: 'Sorry, we currently only deliver within Madurai (Pincode 625xxx). Expanding soon!',
    },
    priority: 1,
};

/**
 * Future Phase 2: Tamil Nadu Zone
 * (Commented out - activate when ready to expand)
 */
/*
export const ZONE_TAMIL_NADU: DeliveryZone = {
  id: 'tamil_nadu',
  name: 'Tamil Nadu',
  displayName: 'Tamil Nadu',
  pincodeRanges: ['60', '61', '62', '63', '64'], // TN pincode prefixes
  isServiceable: (pincode: string) => {
    const cleaned = pincode.trim().replace(/\s/g, '');
    const prefix = cleaned.substring(0, 2);
    return ['60', '61', '62', '63', '64'].includes(prefix);
  },
  estimatedDays: { min: 2, max: 5 },
  message: {
    available: '✓ Delivery available across Tamil Nadu (2-5 days)',
    unavailable: 'Delivery not available in your area yet.',
  },
  priority: 2,
};
*/

/**
 * Future Phase 3: Pan-India Zones
 */
/*
export const ZONE_A_METROS: DeliveryZone = { ... }; // Delhi, Mumbai, etc.
export const ZONE_B_TIER1: DeliveryZone = { ... }; // Major cities
export const ZONE_C_REST: DeliveryZone = { ... }; // Rest of India
*/

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVE ZONES (Central Configuration)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Currently active delivery zones
 * Phase 1: Only Madurai
 * 
 * To expand: Uncomment additional zones and add to this array
 */
export const ACTIVE_ZONES: DeliveryZone[] = [
    ZONE_MADURAI,
    // ZONE_TAMIL_NADU, // Activate for Phase 2
    // ZONE_A_METROS,   // Activate for Phase 3
    // ZONE_B_TIER1,
    // ZONE_C_REST,
];

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if a pincode is serviceable in any active zone
 * 
 * @param pincode - 6-digit Indian pincode
 * @returns ServiceabilityResult with zone info and messaging
 */
export function checkServiceability(pincode: string): ServiceabilityResult {
    // Validate pincode format
    const cleaned = pincode.trim().replace(/\s/g, '');

    if (!cleaned) {
        return {
            isServiceable: false,
            message: 'Please enter a valid 6-digit pincode',
        };
    }

    if (!/^\d{6}$/.test(cleaned)) {
        return {
            isServiceable: false,
            message: 'Pincode must be exactly 6 digits',
        };
    }

    // Check against active zones (priority order)
    const sortedZones = [...ACTIVE_ZONES].sort((a, b) =>
        (a.priority || 999) - (b.priority || 999)
    );

    for (const zone of sortedZones) {
        if (zone.isServiceable(cleaned)) {
            return {
                isServiceable: true,
                zone,
                message: zone.message.available,
                estimatedDelivery: `${zone.estimatedDays.min}-${zone.estimatedDays.max} days`,
            };
        }
    }

    // Not serviceable in any zone
    return {
        isServiceable: false,
        message: ZONE_MADURAI.message.unavailable, // Use primary zone's message
    };
}

/**
 * Get the delivery zone for a serviceable pincode
 * 
 * @param pincode - 6-digit Indian pincode
 * @returns DeliveryZone or null if not serviceable
 */
export function getDeliveryZone(pincode: string): DeliveryZone | null {
    const result = checkServiceability(pincode);
    return result.zone || null;
}

/**
 * Simple boolean check for backend validation
 * 
 * @param pincode - 6-digit Indian pincode
 * @returns true if serviceable, false otherwise
 */
export function isServiceable(pincode: string): boolean {
    return checkServiceability(pincode).isServiceable;
}

/**
 * Get user-friendly message for pincode
 * 
 * @param pincode - 6-digit Indian pincode
 * @returns Formatted message for UI display
 */
export function getServiceabilityMessage(pincode: string): string {
    return checkServiceability(pincode).message;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all serviceable pincode prefixes (for autocomplete, etc.)
 */
export function getServiceablePrefixes(): string[] {
    return ACTIVE_ZONES.flatMap(zone => zone.pincodeRanges);
}

/**
 * Get display names of all active zones (for marketing, etc.)
 */
export function getActiveZoneNames(): string[] {
    return ACTIVE_ZONES.map(zone => zone.displayName);
}

/**
 * Check if we have nationwide coverage (for UI conditionals)
 */
export function hasNationwideCoverage(): boolean {
    return ACTIVE_ZONES.length > 1; // More than just Madurai
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS FOR UI
// ═══════════════════════════════════════════════════════════════════════════

export const DELIVERY_CONFIG = {
    currentPhase: 1,
    phaseName: 'Madurai Launch',
    primaryZone: ZONE_MADURAI,
    expansionMessage: 'Expanding to all of Tamil Nadu soon! Stay tuned.',
    supportContact: '+91 80987 27452',
};

console.log('✅ Delivery Zone System loaded - Current Coverage:', getActiveZoneNames().join(', '));
