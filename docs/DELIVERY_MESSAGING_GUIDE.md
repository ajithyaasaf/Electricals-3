# Delivery & Shipping Messaging - Update Guide

**Last Updated**: December 12, 2025  
**Current Phase**: Madurai Launch (Phase 1)  
**Document Purpose**: Quick reference for updating delivery area and shipping messaging across the application

---

## 🎯 Quick Start: Changing Banner/Delivery Messaging

When expanding delivery areas or updating shipping policies, start here:

> [!IMPORTANT]
> **Shipping Thresholds are now Centralized!**
> You no longer need to manually update shipping amounts in banners/footers.
> Update `shared/logistics.ts` and the UI will reflect changes automatically.

### **1. Updating Shipping Thresholds**
**File**: `shared/logistics.ts`
**Action**: Change `FREE_STANDARD` or `FREE_HEAVY` in `SHIPPING_THRESHOLDS`.

### **2. Expanding Delivery Areas** (Manual Update Required)
When expanding to new cities/states, update text in these files:

---

## 📍 **CRITICAL UPDATES** (Service Areas Only)

### **A. Header Banner** ⭐ MOST VISIBLE
**File**: `client/src/components/layout/header.tsx`
**Current**:
```tsx
🚀 Madurai Launch! | 1-2 Day Delivery | Premium Products | Free Shipping {formatPrice(SHIPPING_THRESHOLDS.FREE_STANDARD)}+*
```
**Update When**: Expanding to new cities. (Shipping amount updates automatically).

### **B. Footer Delivery Section**
**File**: `client/src/components/layout/footer.tsx`
**Update When**: Adding new service areas text.
**Note**: The disclaimer at the bottom updates automatically based on `shared/logistics.ts`.

### **C. Service Areas Component** (Homepage)
**File**: `client/src/components/seo/ServiceAreasSection.tsx`
**Note**: Shipping costs in cards update automatically. Update city names/statuses manually.

**File**: `client/src/components/seo/ServiceAreasSection.tsx`  
**Entire File** - Shows delivery roadmap

**Current**: 3-card layout
1. ✓ Madurai (Green - Active)
2. ⏳ Tamil Nadu (Yellow - Coming Soon)
3. 🚀 All India (Blue - Future)

**When Expanding**: Update card statuses and details

---

### **D. Homepage Hero**
**File**: `client/src/components/common/hero-section.tsx`  
**Lines**: ~42-50

**Current**:
```tsx
Currently delivering within Madurai (625xxx) • Expanding across Tamil Nadu soon!
```

**Update For**: Service area changes

---

### **E. Cart Components** (3 Files)

#### **Cart Page**
**File**: `client/src/pages/cart.tsx`  
**Line**: ~290
```tsx
<span>Fast 1-2 day delivery in Madurai</span>
```

#### **Cart Sidebar**
**File**: `client/src/components/cart/cart-sidebar.tsx`  
**Line**: ~281
```tsx
🚀 Madurai Launch | Free Shipping ₹2,999+*
```

#### **Empty Cart**
**File**: `client/src/components/cart/empty-cart.tsx`  
**Line**: ~72
```tsx
Fast 1-2 day delivery in Madurai | Weight-based shipping from ₹30
```

---

### **F. Cart Summary**
**File**: `client/src/components/cart/cart-summary.tsx`  
**Lines**: ~202-210 (Policy section)

**Current**:
```tsx
• Currently delivering within Madurai (625xxx pincodes)
• Delivery in 1-2 business days
• Shipping fees based on weight and product category
• Returns: 5-7 days
• COD available (Madurai, no extra charges)
```

---

## 📍 **2. CONFIGURATION FILES** (Backend Logic)

### **A. Business Policies** ⭐ SINGLE SOURCE OF TRUTH
**File**: `client/src/lib/constants.ts`  
**Lines**: ~27-110

**Key Sections**:

```typescript
export const BUSINESS_POLICIES = {
  shipping: {
    currentPhase: 'madurai-only', // ← Update this
    serviceablePincodePrefix: '625', // ← Update for expansion
    standardDeliveryDays: { min: 1, max: 2 }
  },
  cod: {
    serviceableArea: 'Madurai (625xxx pincodes)', // ← Update this
  },
  serviceAreas: {
    current: 'Madurai, Tamil Nadu (625xxx pincodes)', // ← Update this
    coverage: 'Currently: Madurai | Expanding Soon!' // ← Update this
  }
};

export const POLICY_TEXT = {
  shipping: `...`, // ← Update shipping policy text
  cod: `...`, // ← Update COD availability text
};
```

**⚠️ IMPORTANT**: This file feeds into multiple components. Update here FIRST!

---

### **B. Delivery Zones Module** ⭐ EXPANSION CONTROL
**File**: `shared/delivery-zones.ts`  
**Lines**: ~20-100

**To Expand Service Area**:
1. Uncomment desired zone (e.g., `ZONE_TAMIL_NADU`)
2. Add to `ACTIVE_ZONES` array:
```typescript
export const ACTIVE_ZONES: DeliveryZone[] = [
  ZONE_MADURAI,
  ZONE_TAMIL_NADU, // ← Uncomment this line
];
```

**That's it!** Backend validation updates automatically.

---

### **C. Backend Order Gatekeeper**
**File**: `server/src/routes/orders.ts`  
**Lines**: ~141-150

**Current**:
```typescript
const pincode = shippingAddress.zipCode;
if (!isServiceable(pincode)) {
  return res.status(400).json({
    message: "Delivery not available in your area",
    details: getServiceabilityMessage(pincode),
    code: "DELIVERY_NOT_SERVICEABLE",
  });
}
```

**Note**: Uses `shared/delivery-zones.ts` - updates automatically when you expand zones.

---

## 📍 **3. SEO & META TAGS**

### **A. index.html**
**File**: `client/index.html`  
**Lines**: 8-10

**Current**:
```html
<title>CopperBear Electrical - Premium Electrical Products | Madurai Launch</title>
<meta name="description" content="🚀 Now launching in Madurai! Premium electrical products with fast 1-2 day delivery..." />
<meta name="keywords" content="electrical products Madurai, electrical store Madurai 625001..." />
```

**Update**: When changing service areas or main messaging

---

### **B. SEO Configuration** (Dynamic)
**File**: `client/src/lib/seo.ts`  
**Entire File**

**⚠️ STRATEGIC DECISION**: 
- Currently contains pan-India references for SEO ranking
- Update when actually expanding to those areas
- OR add disclaimers to pages saying "Expanding soon"

---

## 🔄 **EXPANSION WORKFLOW**

### **Scenario: Expanding to Tamil Nadu**

**Step-by-Step**:

1. **Update Delivery Zones** (3 minutes)
   ```typescript
   // shared/delivery-zones.ts
   export const ACTIVE_ZONES = [
     ZONE_MADURAI,
     ZONE_TAMIL_NADU, // ← ADD THIS
   ];
   ```

2. **Update Business Policies**
   ```typescript
   // client/src/lib/constants.ts
   serviceAreas: {
     current: 'Tamil Nadu (All major cities)', // ← CHANGE
     coverage: 'Now Serving All of Tamil Nadu!' // ← CHANGE
   }
   ```

3. **Update Header Banner**
   ```tsx
   // client/src/components/layout/header.tsx
   🎉 Now Across Tamil Nadu! | Chennai • Madurai • Coimbatore | Free Shipping ₹3,000+*
   ```

4. **Update Footer**
   ```tsx
   // client/src/components/layout/footer.tsx
   ✓ Now Serving: Tamil Nadu (All major cities) - 1-4 Days
   ⏳ Coming Soon: Karnataka & Andhra Pradesh
   ```

5. **Update Service Areas Component**
   ```tsx
   // client/src/components/seo/ServiceAreasSection.tsx
   // Move Tamil Nadu card to "NOW SERVING" section
   // Update Green badge and active styling
   ```

6. **Update Cart Messages** (3 files)
   - Cart page: "Fast delivery across Tamil Nadu"
   - Cart sidebar: "TN Launch | Free Shipping ₹3,000+"
   - Empty cart: "1-4 day delivery in Tamil Nadu"

7. **Update index.html**
   ```html
   <title>... | Tamil Nadu Delivery</title>
   <meta name="description" content="Now serving all of Tamil Nadu! ..." />
   ```

8. **Test!**
   - Try Madurai pincode (625xxx): ✓ Should work
   - Try Chennai pincode (600xxx): ✓ Should work
   - Try Delhi pincode (110xxx): ✗ Should reject

---

## 📋 **COMPLETE CHECKLIST**

When updating delivery messaging, check ALL these files:

### **Must Update** ✅
- [ ] `client/src/components/layout/header.tsx` (Banner)
- [ ] `client/src/components/layout/footer.tsx` (Footer delivery section)
- [ ] `client/src/lib/constants.ts` (BUSINESS_POLICIES)
- [ ] `shared/delivery-zones.ts` (ACTIVE_ZONES)
- [ ] `client/index.html` (Meta tags)

### **Should Update** ⚠️
- [ ] `client/src/components/seo/ServiceAreasSection.tsx`
- [ ] `client/src/components/common/hero-section.tsx`
- [ ] `client/src/pages/cart.tsx`
- [ ] `client/src/components/cart/cart-sidebar.tsx`
- [ ] `client/src/components/cart/empty-cart.tsx`
- [ ] `client/src/components/cart/cart-summary.tsx`

### **May Update** 📝
- [ ] `client/src/lib/seo.ts` (SEO metadata - strategic decision)

---

## 🎯 **COMMON SCENARIOS**

### **Changing Free Shipping Threshold**

**Example**: ₹3,000 → ₹5,000

1. **Update `shared/logistics.ts`**:
   ```typescript
   FREE_STANDARD: 500000, // ₹5,000 (was 299900)
   ```
2. **Done!** The Header, Footer, Cart Sidebar, and Service Cards will update automatically.

---

### **Adding New Delivery Zone**

**Example**: Adding Bangalore

1. Create zone in `shared/delivery-zones.ts`:
   ```typescript
   export const ZONE_BANGALORE: DeliveryZone = {
     id: 'bangalore',
     name: 'Bangalore',
     pincodeRanges: ['560'],
     isServiceable: (pincode) => pincode.startsWith('560'),
     // ... rest of config
   };
   ```

2. Add to `ACTIVE_ZONES`

3. Update all messaging to include "Bangalore"

---

### **Temporary Promotion**

**Example**: "Free shipping this week!"

1. Change header banner only:
   ```tsx
   🎉 WEEK SPECIAL! | FREE Shipping on ALL Orders | Madurai 625xxx
   ```

2. Leave other files unchanged

3. Revert banner after promotion ends

---

## 🔍 **SEARCH & REPLACE TIPS**

### **Finding All Shipping Mentions**
```bash
# Search for shipping mentions
grep -r "shipping" client/src --include="*.tsx" --include="*.ts"

# Search for specific amounts
grep -r "3,000" client/src
grep -r "10,000" client/src

# Search for delivery mentions
grep -r "delivery" client/src --include="*.tsx"
```

### **Common Text to Find/Replace**

| Current | Scenario | Replace With |
|---------|----------|--------------|
| `Madurai` | TN expansion | `Tamil Nadu` |
| `625xxx` | TN expansion | `All TN pincodes` |
| `1-2 days` | TN expansion | `1-4 days` |
| `₹3,000+` | Threshold change | `₹5,000+` |
| `Madurai Launch` | TN expansion | `Tamil Nadu Wide` |

---

## 📞 **TROUBLESHOOTING**

### **Issue**: Customer sees old banner after update
**Solution**: Clear browser cache, check file saved correctly

### **Issue**: Pincode validation not working for new area
**Solution**: Check `shared/delivery-zones.ts` → `ACTIVE_ZONES` array

### **Issue**: Checkout shows different shipping than cart
**Solution**: Server must be restarted after `shared/` folder changes

### **Issue**: SEO showing old city names
**Solution**: `client/src/lib/seo.ts` needs manual update (strategic file)

---

## 🎓 **BEST PRACTICES**

1. **Always update `constants.ts` FIRST** - it's the single source of truth
2. **Test with real pincodes** after expansion
3. **Keep footer disclaimer updated** - legal protection
4. **Document the change date** in comments
5. **Update meta tags last** - after confirming all UI is correct

---

## 📚 **RELATED FILES**

- **Shipping Logic**: `shared/logistics.ts` (weight-based tiers)
- **Checkout Display**: `client/src/pages/checkout.tsx` (uses server totals)
- **Order Creation**: `server/src/routes/orders.ts` (backend gatekeeper)
- **Cart Calculations**: `server/src/routes/cart.ts` (server-authoritative)

---

## 🔗 **QUICK LINKS**

**Current Phase Documentation**:
- Implementation Plan: `.gemini/antigravity/brain/.../implementation_plan.md`
- Walkthrough: `.gemini/antigravity/brain/.../walkthrough.md`
- Final Checklist: `.gemini/antigravity/brain/.../final_checklist.md`

**Code Reference**:
- Delivery Zones: `shared/delivery-zones.ts`
- Business Policies: `client/src/lib/constants.ts`
- Shipping Rates: `shared/logistics.ts`

---

## 📝 **VERSION HISTORY**

| Date | Change | Files Updated |
|------|--------|---------------|
| 2025-12-12 | Madurai Launch (Phase 1) | All 13 files |
| TBD | Tamil Nadu Expansion | TBD |
| TBD | Pan-India Launch | TBD |

---

**Need Help?** Reference this document whenever updating delivery/shipping messaging.

**Pro Tip**: Use the "Expansion Workflow" section for step-by-step guidance! 🚀
