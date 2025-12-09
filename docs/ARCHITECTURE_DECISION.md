# Architecture Decision Record: Backend-Only Data Mutations

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2024-12-09 |
| **Decision Makers** | Development Team |
| **Relates To** | Firestore, Express API, Security |

## Summary

All data mutations in the CopperBear Electrical platform must flow through the Express backend API. The frontend client SDK may only read data (for real-time subscriptions via `onSnapshot`) and authenticate (via Firebase Auth).

## Context

### The Problem

The original codebase had the Firestore Client SDK initialized and exported for use in frontend code. While the current implementation correctly routes most operations through the backend API, the architecture **afforded** the possibility of future developers accidentally writing directly to Firestore from the frontend.

This architectural risk includes:

1. **Price Tampering**: Frontend could calculate and submit manipulated prices
2. **Stock Race Conditions**: Multiple clients writing simultaneously without transactions
3. **Business Rule Bypass**: Validation logic duplicated or missing on frontend
4. **Ghost Orders**: Orders created in DB without backend processing (no emails, no stock deduction)
5. **Role Escalation**: Users potentially injecting admin flags
6. **Audit Trail Gaps**: No logging of who changed what

### Why This Matters

Even if current code is correct, **architectural affordances** determine how a codebase evolves over time. If it's easy to bypass the backend, someone eventually will—especially under deadline pressure or by developers unfamiliar with the original design intent.

## Decision

### Enforcement Layers

1. **Firestore Security Rules** (`firestore.rules`)
   - Deny ALL client-side writes (`allow write: if false`)
   - Only Firebase Admin SDK (used by backend) can write
   - Reads allowed for authenticated users or public catalog

2. **Backend API** (`/api/admin/site-content`)
   - All CMS operations go through Express endpoints
   - Zod validation on all inputs
   - Admin role enforcement via middleware
   - Audit fields (lastUpdated, updatedBy) automatically added

3. **Frontend Refactoring**
   - Removed `setDoc`, `updateDoc`, `deleteDoc` helper functions
   - Kept only `onSnapshot` for real-time read subscriptions
   - CMS editor updated to use `apiRequest()` instead of direct Firestore

4. **ESLint Rules** (`.eslintrc.js`)
   - Ban imports of Firestore write functions in `client/` directory
   - Fail CI builds if someone adds direct writes

5. **Documentation** (this document)
   - Record the decision and rationale
   - Guide future developers

## Consequences

### Positive

| Benefit | Description |
|---------|-------------|
| **Single Source of Truth** | All validation in Zod schemas on backend |
| **No Race Conditions** | Backend uses Firestore transactions for atomic operations |
| **Price Security** | Backend calculates totals from DB prices, not client input |
| **Audit Trail** | Every mutation logged with user ID and timestamp |
| **Role Enforcement** | `isAdmin` check in one place |
| **Future-Proof** | New developers can't accidentally bypass the pattern |

### Negative

| Trade-off | Mitigation |
|-----------|------------|
| Slightly more latency for CMS updates | Negligible (< 100ms) for admin-only operations |
| More code for new features | Provides template; copy-paste from existing routes |
| Real-time updates require API polling or WebSocket | Keep `onSnapshot` for reads; backend triggers UI refresh via query invalidation |

## Compliance Checklist

When adding new features, verify:

- [ ] All data writes go through `/api/*` endpoints
- [ ] Zod schema validates the input
- [ ] `isAuthenticated` middleware protects the route
- [ ] Admin-only routes check `user.isAdmin`
- [ ] No `setDoc`, `addDoc`, `updateDoc`, `deleteDoc` in `client/` directory
- [ ] ESLint passes
- [ ] Firestore rules tested in emulator

## Related Files

| File | Purpose |
|------|---------|
| `firestore.rules` | Security rules denying client writes |
| `server/src/routes/site-content.ts` | Backend API for CMS operations |
| `client/src/lib/firebase-realtime.ts` | Read-only Firestore hook |
| `client/src/components/admin/why-choose-editor.tsx` | CMS editor using backend API |
| `.eslintrc.js` | ESLint rule banning write imports |

## References

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [Zod Documentation](https://zod.dev/)

---

*This ADR follows the format recommended by Michael Nygard in "Documenting Architecture Decisions".*
