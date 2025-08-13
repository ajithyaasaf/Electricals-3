# Cart Migration & Preservation Testing Guide

## Overview
This document provides comprehensive testing procedures for the enhanced dual-state cart system, focusing on guest-to-authenticated migration and logout preservation.

## Test Cases

### 1. Guest → Login Migration (No Data Loss)

#### Test Case 1.1: Basic Migration
**Setup:**
1. Start as guest user
2. Add 3 different products to cart with varying quantities
3. Sign in with Google account

**Expected Results:**
- ✅ All guest cart items migrate to authenticated cart
- ✅ No items are lost during migration
- ✅ Guest cart is cleared from localStorage after successful migration
- ✅ Server recalculates prices and discounts
- ✅ Migration logged with detailed information

#### Test Case 1.2: Conflict Resolution (Sum Quantities)
**Setup:**
1. Start as guest, add Product A (qty: 2) and Product B (qty: 1)
2. Sign in to account that already has Product A (qty: 3) in cart
3. Complete migration

**Expected Results:**
- ✅ Product A final quantity: 5 (2 + 3)
- ✅ Product B added as new item (qty: 1)
- ✅ Conflict logged and reported in migration response
- ✅ No duplicate entries for same product

#### Test Case 1.3: Custom Conflict Resolution
**Setup:**
1. Guest cart: Product A with custom engraving "Guest Text"
2. Auth cart: Product A with custom engraving "Auth Text"
3. Migration with merge customizations enabled

**Expected Results:**
- ✅ Quantities summed correctly
- ✅ Customizations merged: both "Guest Text" and "Auth Text" preserved
- ✅ Conflict resolution strategy logged

### 2. Login → Logout Preservation (Cart Continuity)

#### Test Case 2.1: Basic Preservation
**Setup:**
1. Sign in to account
2. Add 4 products to cart with customizations/notes
3. Sign out

**Expected Results:**
- ✅ Cart items immediately converted to guest format
- ✅ UI shows same items after logout (matching authenticated cart)
- ✅ Quantities, customizations, and notes preserved
- ✅ localStorage contains preserved cart data
- ✅ Cart appears identical before and after logout

#### Test Case 2.2: Preservation with Existing Guest Cart
**Setup:**
1. Have guest cart with 2 items
2. Sign in and add 3 more items
3. Sign out

**Expected Results:**
- ✅ Final guest cart contains all 5 items (no duplicates)
- ✅ Recently added authenticated items take precedence
- ✅ Original guest items preserved if no conflicts

### 3. Edge Cases & Error Handling

#### Test Case 3.1: Rapid Account Switching
**Setup:**
1. Sign in to Account A, add items
2. Sign out immediately
3. Sign in to Account B within 5 seconds
4. Check cart state

**Expected Results:**
- ✅ Account A cart preserved as guest cart
- ✅ Account B cart loads correctly
- ✅ No data corruption or infinite loops

#### Test Case 3.2: Network Failure During Migration
**Setup:**
1. Guest cart with 3 items
2. Disconnect network during sign-in
3. Reconnect and complete sign-in

**Expected Results:**
- ✅ Guest cart preserved in localStorage
- ✅ Migration retry on reconnection
- ✅ No data loss even with network issues

#### Test Case 3.3: Large Cart Migration
**Setup:**
1. Guest cart with 25+ items (near limit)
2. Sign in to account with 20+ existing items
3. Complete migration

**Expected Results:**
- ✅ All items migrate successfully
- ✅ Quantity limits enforced (max 99 per item)
- ✅ Cart item limit respected (max 50 items)
- ✅ Atomic operation prevents partial migration

### 4. Cross-Tab Synchronization

#### Test Case 4.1: Multi-Tab Guest Cart Sync
**Setup:**
1. Open 2 browser tabs as guest
2. Add items in Tab 1
3. Check Tab 2 immediately

**Expected Results:**
- ✅ Tab 2 shows new items within 1 second
- ✅ No infinite sync loops
- ✅ Cart state consistent across tabs

#### Test Case 4.2: Login in One Tab
**Setup:**
1. Guest cart with items in 2 tabs
2. Sign in using Tab 1
3. Check Tab 2 after migration

**Expected Results:**
- ✅ Tab 2 detects authentication change
- ✅ Tab 2 loads authenticated cart
- ✅ Guest cart cleared from localStorage

### 5. Schema Versioning & Backward Compatibility

#### Test Case 5.1: Legacy Cart Migration
**Setup:**
1. Manually add legacy cart format to localStorage (v1.0.0)
2. Add new items (creates v2.0.0 schema)
3. Sign in

**Expected Results:**
- ✅ Legacy items automatically migrated to v2.0.0
- ✅ All items preserve during authentication migration
- ✅ Schema validation passes for all items

#### Test Case 5.2: Cart Expiry Handling
**Setup:**
1. Create guest cart items
2. Manually set lastUpdated to 4 days ago (exceeds 72hr expiry)
3. Load guest cart

**Expected Results:**
- ✅ Expired items automatically removed
- ✅ Valid items preserved
- ✅ Schema updated with current timestamp

## API Testing Endpoints

### Migration Test Endpoint
```bash
POST /api/cart/migrate
{
  "guestCart": [
    {
      "id": "guest_123",
      "productId": "product_abc",
      "quantity": 2,
      "addedAt": 1699123456789,
      "lastUpdated": 1699123456789,
      "schemaVersion": "2.0.0"
    }
  ],
  "conflictResolution": {
    "quantityHandling": "sum",
    "customizationHandling": "merge"
  }
}
```

### Preservation Test Endpoint
```bash
POST /api/cart/preserve-on-logout
Authorization: Bearer <firebase-token>
```

## Performance Benchmarks

### Migration Performance
- ✅ 1-5 items: < 500ms
- ✅ 6-20 items: < 1000ms  
- ✅ 21-50 items: < 2000ms
- ✅ Atomic operations prevent partial failures

### Cross-Tab Sync Performance
- ✅ Sync trigger: < 100ms
- ✅ Tab notification: < 500ms
- ✅ No performance degradation with multiple tabs

## Logging & Monitoring

### Key Log Messages
```
[CART MIGRATION] 📦 User has X existing cart items
[CART MIGRATION] 🔄 Merging carts using enhanced merge function
[CART MIGRATION] ✅ Migration completed: X items in final cart
[CART PRESERVATION] 💾 Preserving cart for user on logout
[CART CONTEXT] 📡 Cross-tab sync triggered, reloading guest cart
```

### Error Monitoring
- Migration failures: Alert if > 1% failure rate
- Performance degradation: Alert if migration > 3s
- Data loss incidents: Alert on any cart item disappearance

## Success Criteria

The cart system passes all tests when:

1. **Zero Data Loss**: No cart items ever disappear during any transition
2. **Conflict Resolution**: Duplicate items handled intelligently (sum quantities)
3. **Performance**: All operations complete within performance benchmarks
4. **Consistency**: Cart state identical across tabs and sessions
5. **Reliability**: System handles edge cases gracefully
6. **Backward Compatibility**: Legacy carts migrate seamlessly

## Testing Checklist

- [ ] Guest → Login migration (basic)
- [ ] Guest → Login migration (with conflicts) 
- [ ] Login → Logout preservation
- [ ] Cross-tab synchronization
- [ ] Rapid account switching
- [ ] Network failure recovery
- [ ] Large cart handling
- [ ] Schema version migration
- [ ] Cart expiry cleanup
- [ ] Performance benchmarks
- [ ] Error logging verification

This comprehensive testing ensures the dual-state cart system provides enterprise-grade reliability and user experience.