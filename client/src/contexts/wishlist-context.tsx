// Global Wishlist Context - Unified state management for guest and authenticated users
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef, useMemo, useReducer } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type {
  WishlistItemWithDetails,
  GuestWishlistItem,
  GuestWishlistData,
  WishlistOperationResult,
  WishlistAnalytics,
  WishlistSyncStatus
} from '@shared/wishlist-types';

// Enhanced guest wishlist item interface with schema versioning
const CURRENT_SCHEMA_VERSION = '1.0.0';
const GUEST_WISHLIST_KEY = 'copperbear_guest_wishlist';
const GUEST_EXPIRY_HOURS = 168; // 7 days

// Wishlist state management
interface WishlistState {
  items: WishlistItemWithDetails[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalValue: number;
  analytics: WishlistAnalytics | null;
  syncStatus: WishlistSyncStatus;
}

// Wishlist reducer actions
type WishlistAction =
  | { type: 'SET_WISHLIST'; payload: WishlistItemWithDetails[] }
  | { type: 'ADD_ITEM'; payload: WishlistItemWithDetails }
  | { type: 'UPDATE_ITEM'; payload: { itemId: string; updates: Partial<WishlistItemWithDetails> } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ANALYTICS'; payload: WishlistAnalytics | null }
  | { type: 'SET_SYNC_STATUS'; payload: Partial<WishlistSyncStatus> };

// Wishlist reducer
function wishlistReducer(state: WishlistState, action: WishlistAction): WishlistState {
  switch (action.type) {
    case 'SET_WISHLIST':
      const items = action.payload;
      return {
        ...state,
        items,
        totalItems: items.length,
        totalValue: items.reduce((sum, item) => sum + (item.currentPrice || 0), 0),
        error: null,
      };

    case 'ADD_ITEM':
      const newItems = [action.payload, ...state.items];
      return {
        ...state,
        items: newItems,
        totalItems: newItems.length,
        totalValue: newItems.reduce((sum, item) => sum + (item.currentPrice || 0), 0),
        error: null,
      };

    case 'UPDATE_ITEM':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, ...action.payload.updates }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.length,
        totalValue: updatedItems.reduce((sum, item) => sum + (item.currentPrice || 0), 0),
        error: null,
      };

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload.itemId);
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.length,
        totalValue: filteredItems.reduce((sum, item) => sum + (item.currentPrice || 0), 0),
        error: null,
      };

    case 'CLEAR_WISHLIST':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalValue: 0,
        analytics: null,
        error: null,
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_ANALYTICS':
      return { ...state, analytics: action.payload };

    case 'SET_SYNC_STATUS':
      return {
        ...state,
        syncStatus: { ...state.syncStatus, ...action.payload },
      };

    default:
      return state;
  }
}

// Initial state
const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
  totalItems: 0,
  totalValue: 0,
  analytics: null,
  syncStatus: {
    lastSync: new Date(),
    pendingChanges: 0,
    conflicts: 0,
    status: 'idle',
    retryCount: 0,
  },
};

// Wishlist context interface
interface WishlistContextType {
  // State
  items: WishlistItemWithDetails[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalValue: number;
  analytics: WishlistAnalytics | null;
  syncStatus: WishlistSyncStatus;

  // Actions
  addToWishlist: (productId?: string, serviceId?: string, options?: {
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    addedFrom?: 'product_page' | 'listing_page' | 'search' | 'recommendation' | 'other';
  }) => Promise<boolean>;
  removeFromWishlist: (itemId: string) => Promise<boolean>;
  updateWishlistItem: (itemId: string, updates: Partial<WishlistItemWithDetails>) => Promise<boolean>;
  clearWishlist: () => Promise<boolean>;
  moveToCart: (itemId: string, quantity?: number, removeFromWishlist?: boolean) => Promise<boolean>;
  isInWishlist: (productId?: string, serviceId?: string) => boolean;
  refreshWishlist: () => Promise<void>;
  loadAnalytics: () => Promise<void>;

  // Guest specific
  getGuestWishlistData: () => GuestWishlistItem[];
  migrateGuestWishlist: () => Promise<boolean>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Guest wishlist management utilities
class GuestWishlistManager {
  private static getStorageKey(): string {
    return GUEST_WISHLIST_KEY;
  }

  static load(): GuestWishlistData {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (!stored) {
        return {
          items: [],
          schemaVersion: CURRENT_SCHEMA_VERSION,
          lastUpdated: Date.now(),
          expiryHours: GUEST_EXPIRY_HOURS,
          syncAttempts: 0,
        };
      }

      const data = JSON.parse(stored) as GuestWishlistData;

      // Check for expiry
      const expiryTime = data.lastUpdated + (data.expiryHours * 60 * 60 * 1000);
      if (Date.now() > expiryTime) {
        console.log('[WISHLIST CONTEXT] 🗑️ Guest wishlist expired, clearing...');
        this.clear();
        return {
          items: [],
          schemaVersion: CURRENT_SCHEMA_VERSION,
          lastUpdated: Date.now(),
          expiryHours: GUEST_EXPIRY_HOURS,
          syncAttempts: 0,
        };
      }

      // Schema migration if needed
      if (data.schemaVersion !== CURRENT_SCHEMA_VERSION) {
        console.log('[WISHLIST CONTEXT] 🔄 Migrating guest wishlist schema...');
        const migratedData = this.migrateSchema(data);
        this.save(migratedData);
        return migratedData;
      }

      console.log('[WISHLIST CONTEXT] 📖 Loading guest wishlist from localStorage:', data.items.length, 'items');
      return data;
    } catch (error) {
      console.error('[WISHLIST CONTEXT] ❌ Error loading guest wishlist:', error);
      this.clear();
      return {
        items: [],
        schemaVersion: CURRENT_SCHEMA_VERSION,
        lastUpdated: Date.now(),
        expiryHours: GUEST_EXPIRY_HOURS,
        syncAttempts: 0,
      };
    }
  }

  static save(data: GuestWishlistData): void {
    try {
      data.lastUpdated = Date.now();
      localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
      console.log('[WISHLIST CONTEXT] 💾 Guest wishlist saved:', data.items.length, 'items');
    } catch (error) {
      console.error('[WISHLIST CONTEXT] ❌ Error saving guest wishlist:', error);
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.getStorageKey());
      console.log('[WISHLIST CONTEXT] 🗑️ Guest wishlist cleared');
    } catch (error) {
      console.error('[WISHLIST CONTEXT] ❌ Error clearing guest wishlist:', error);
    }
  }

  static addItem(productId?: string, serviceId?: string, options?: {
    notes?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    addedFrom?: 'product_page' | 'listing_page' | 'search' | 'recommendation' | 'other';
  }): boolean {
    try {
      const data = this.load();

      // Check if item already exists
      const itemExists = data.items.some(item =>
        (item.productId === productId && productId) ||
        (item.serviceId === serviceId && serviceId)
      );

      if (itemExists) {
        console.log('[WISHLIST CONTEXT] ⚠️ Item already in guest wishlist');
        return false;
      }

      // Check limits
      if (data.items.length >= 50) { // Max guest items
        console.log('[WISHLIST CONTEXT] ⚠️ Guest wishlist limit reached');
        return false;
      }

      const newItem: GuestWishlistItem = {
        id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId,
        serviceId,
        notes: options?.notes,
        priority: options?.priority || 'medium',
        tags: options?.tags || [],
        addedFrom: options?.addedFrom || 'other',
        addedAt: Date.now(),
        lastUpdated: Date.now(),
        schemaVersion: CURRENT_SCHEMA_VERSION,
      };

      data.items.unshift(newItem);
      this.save(data);

      console.log('[WISHLIST CONTEXT] ✅ Item added to guest wishlist:', newItem.id);
      return true;
    } catch (error) {
      console.error('[WISHLIST CONTEXT] ❌ Error adding to guest wishlist:', error);
      return false;
    }
  }

  static removeItem(itemId: string): boolean {
    try {
      const data = this.load();
      const originalLength = data.items.length;
      data.items = data.items.filter(item => item.id !== itemId);

      if (data.items.length < originalLength) {
        this.save(data);
        console.log('[WISHLIST CONTEXT] ✅ Item removed from guest wishlist:', itemId);
        return true;
      }

      console.log('[WISHLIST CONTEXT] ⚠️ Item not found in guest wishlist:', itemId);
      return false;
    } catch (error) {
      console.error('[WISHLIST CONTEXT] ❌ Error removing from guest wishlist:', error);
      return false;
    }
  }

  static removeItemByContext(productId?: string, serviceId?: string): boolean {
    try {
      const data = this.load();
      const itemToRemove = data.items.find(item =>
        (productId && item.productId === productId) ||
        (serviceId && item.serviceId === serviceId)
      );

      if (itemToRemove) {
        return this.removeItem(itemToRemove.id);
      }
      return false;
    } catch (error) {
      console.error('[WISHLIST CONTEXT] ❌ Error removing item by context:', error);
      return false;
    }
  }

  static isInWishlist(productId?: string, serviceId?: string): boolean {
    try {
      const data = this.load();
      return data.items.some(item =>
        (item.productId === productId && productId) ||
        (item.serviceId === serviceId && serviceId)
      );
    } catch (error) {
      console.error('[WISHLIST CONTEXT] ❌ Error checking guest wishlist:', error);
      return false;
    }
  }

  private static migrateSchema(data: GuestWishlistData): GuestWishlistData {
    // Handle schema migrations here
    return {
      ...data,
      schemaVersion: CURRENT_SCHEMA_VERSION,
    };
  }
}

// Wishlist Provider Component
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { isAuthenticated, user } = useFirebaseAuth();
  const { toast } = useToast();
  const hasInitialized = useRef(false);
  const migrationInProgress = useRef(false);

  // Load wishlist on mount and auth changes
  useEffect(() => {
    if (!hasInitialized.current) {
      loadWishlist();
      hasInitialized.current = true;
    }
  }, []);

  // Handle authentication changes
  useEffect(() => {
    if (hasInitialized.current && isAuthenticated && user && !migrationInProgress.current) {
      handleAuthenticatedUserWishlist();
    } else if (hasInitialized.current && !isAuthenticated && !migrationInProgress.current) {
      handleGuestUserWishlist();
    }
  }, [isAuthenticated, user]);

  // Load wishlist from appropriate source
  const loadWishlist = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      if (isAuthenticated && user) {
        // Load authenticated user's wishlist
        const response = await apiRequest('GET', '/api/wishlist');
        const result = await response.json() as WishlistOperationResult;

        if (result.success && result.items) {
          dispatch({ type: 'SET_WISHLIST', payload: result.items });
          dispatch({
            type: 'SET_SYNC_STATUS',
            payload: {
              status: 'idle',
              lastSync: new Date(),
              pendingChanges: 0
            }
          });
        } else {
          dispatch({ type: 'SET_ERROR', payload: result.message || 'Failed to load wishlist' });
        }
      } else {
        // Load guest wishlist from localStorage
        const guestData = GuestWishlistManager.load();

        if (guestData.items.length > 0) {
          // Enrich guest items with current product/service data
          const response = await apiRequest('POST', '/api/wishlist/unified', { guestWishlist: guestData.items });
          const result = await response.json() as WishlistOperationResult;

          if (result.success && result.items) {
            dispatch({ type: 'SET_WISHLIST', payload: result.items });
          }
        } else {
          dispatch({ type: 'SET_WISHLIST', payload: [] });
        }

        dispatch({
          type: 'SET_SYNC_STATUS',
          payload: {
            status: 'pending',
            pendingChanges: guestData.items.length
          }
        });
      }
    } catch (error) {
      console.error('[WISHLIST CONTEXT] ❌ Error loading wishlist:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load wishlist' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, user]);

  // Handle authenticated user wishlist
  const handleAuthenticatedUserWishlist = useCallback(async () => {
    console.log('[WISHLIST CONTEXT] 👤 User authenticated, loading wishlist...');

    // Check if there's a guest wishlist to migrate
    const guestData = GuestWishlistManager.load();
    if (guestData.items.length > 0 && !migrationInProgress.current) {
      console.log('[WISHLIST CONTEXT] 🔄 Guest wishlist found, migrating...', guestData.items.length, 'items');
      await migrateGuestWishlist();
    } else {
      await loadWishlist();
    }
  }, [loadWishlist]);

  // Handle guest user wishlist - load guest data instead of clearing
  const handleGuestUserWishlist = useCallback(async () => {
    console.log('[WISHLIST CONTEXT] 🗑️ User logged out, clearing wishlist data...');
    dispatch({ type: 'CLEAR_WISHLIST' });

    // Load guest wishlist from localStorage after logout
    try {
      const guestData = GuestWishlistManager.load();
      if (guestData.items.length > 0) {
        console.log('[WISHLIST CONTEXT] 📦 Loading guest wishlist from localStorage:', guestData.items.length, 'items');
        // Enrich guest items with current product/service data
        const response = await apiRequest('POST', '/api/wishlist/unified', { guestWishlist: guestData.items });
        const result = await response.json() as WishlistOperationResult;

        if (result.success && result.items) {
          dispatch({ type: 'SET_WISHLIST', payload: result.items });
        }
      }
    } catch (error) {
      console.error('[WISHLIST CONTEXT] ❌ Error loading guest wishlist after logout:', error);
    }

    dispatch({
      type: 'SET_SYNC_STATUS',
      payload: {
        status: 'pending',
        pendingChanges: 0,
        lastSync: new Date()
      }
    });
    console.log('[WISHLIST CONTEXT] ✅ Wishlist cleared successfully on logout');
  }, []);

  // Add item to wishlist
  const addToWishlist = useCallback(async (
    productId?: string,
    serviceId?: string,
    options?: {
      notes?: string;
      priority?: 'low' | 'medium' | 'high';
      tags?: string[];
      addedFrom?: 'product_page' | 'listing_page' | 'search' | 'recommendation' | 'other';
    }
  ): Promise<boolean> => {
    try {
      if (isAuthenticated && user) {
        // Add to authenticated user's wishlist
        const response = await apiRequest('POST', '/api/wishlist', {
          productId,
          serviceId,
          notes: options?.notes,
          priority: options?.priority || 'medium',
          tags: options?.tags || [],
          addedFrom: options?.addedFrom || 'other',
        });
        const result = await response.json() as WishlistOperationResult;

        if (result.success && result.item) {
          dispatch({ type: 'ADD_ITEM', payload: result.item });
          toast({
            title: "Added to Wishlist",
            description: "Item successfully added to your wishlist.",
          });
          return true;
        } else {
          if (result.message?.includes('already in wishlist')) {
            toast({
              title: "Already in Wishlist",
              description: "This item is already in your wishlist.",
              variant: "default",
            });
          } else {
            toast({
              title: "Error",
              description: result.message || "Failed to add item to wishlist.",
              variant: "destructive",
            });
          }
          return false;
        }
      } else {
        // Add to guest wishlist
        const success = GuestWishlistManager.addItem(productId, serviceId, options);

        if (success) {
          // Reload wishlist to get enriched data
          await loadWishlist();
          toast({
            title: "Added to Wishlist",
            description: "Item added to your wishlist. Sign in to save permanently.",
          });
          return true;
        } else {
          toast({
            title: "Error",
            description: "Failed to add item to wishlist.",
            variant: "destructive",
          });
          return false;
        }
      }
    } catch (error: any) {
      // Senior Dev "Plan B": Robust handling for state desynchronization
      // If server says 409 Conflict, it means the item exists but our client state is stale.
      // We should verify this, notify the user gently, and AUTO-HEAL the state.
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isDuplicate = errorMessage.includes('409') ||
        errorMessage.toLowerCase().includes('already in wishlist');

      if (isDuplicate) {
        console.log('[WISHLIST CONTEXT] ℹ️ Item already in wishlist (caught via error), syncing state...');

        toast({
          title: "Already in Wishlist",
          description: "This item is already saved to your wishlist.",
          variant: "default",
        });

        // Critical Fix: Sync local state with server to reflect reality (turn heart red)
        loadWishlist().catch(e => console.error("Failed to sync wishlist after duplicate error", e));

        return true; // Treat as success since the goal (item in wishlist) is met
      }

      console.error('[WISHLIST CONTEXT] ❌ Error adding to wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist.",
        variant: "destructive",
      });
      return false;
    }
  }, [isAuthenticated, user, toast, loadWishlist]);

  // Remove item from wishlist
  const removeFromWishlist = useCallback(async (itemIdOrProductId?: string, serviceId?: string): Promise<boolean> => {
    // Support both itemId (for authenticated) and productId/serviceId (for guest)
    const productId = itemIdOrProductId;
    if (!isAuthenticated) {
      // Guest mode - remove from localStorage
      try {
        const success = GuestWishlistManager.removeItemByContext(productId, serviceId);
        if (success) {
          // Reload wishlist to get updated data
          await loadWishlist();
          return true;
        }
        return false;
      } catch (error) {
      }
    }

    // Find the item by productId or serviceId (Before try block for scope access)
    const item = state.items.find(item =>
      (productId && item.productId === productId) ||
      (serviceId && item.serviceId === serviceId)
    );

    if (!item) {
      return false;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Fix: Correct API URL (removed /items/ segment)
      await apiRequest('DELETE', `/api/wishlist/${item.id}`);

      // Update local state
      dispatch({ type: 'REMOVE_ITEM', payload: { itemId: item.id } });

      return true;
    } catch (error: any) {
      // Senior Dev Fix: Idempotent deletion
      // If 404 (Not Found), it means the item is already gone from the server.
      // We should treat this as success and ensure our local state is clean.
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('404')) {
        console.log('[WISHLIST CONTEXT] ℹ️ Item already removed on server (404), cleaning up local state...');
        dispatch({ type: 'REMOVE_ITEM', payload: { itemId: item.id } });
        return true;
      }

      console.error('Error removing from wishlist:', error);
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [isAuthenticated, state.items, loadWishlist]);

  // Update wishlist item
  const updateWishlistItem = useCallback(async (
    itemId: string,
    updates: Partial<WishlistItemWithDetails>
  ): Promise<boolean> => {
    try {
      if (isAuthenticated && user) {
        const response = await apiRequest('PATCH', `/api/wishlist/${itemId}`, updates);
        const result = await response.json() as WishlistOperationResult;

        if (result.success && result.item) {
          dispatch({ type: 'UPDATE_ITEM', payload: { itemId, updates: result.item } });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('[WISHLIST CONTEXT] ❌ Error updating wishlist item:', error);
      return false;
    }
  }, [isAuthenticated, user]);

  // Clear wishlist
  const clearWishlist = useCallback(async (): Promise<boolean> => {
    try {
      if (isAuthenticated && user) {
        // Clear authenticated user's wishlist
        for (const item of state.items) {
          await apiRequest('DELETE', `/api/wishlist/${item.id}`);
        }
      } else {
        // Clear guest wishlist
        GuestWishlistManager.clear();
      }

      dispatch({ type: 'CLEAR_WISHLIST' });
      toast({
        title: "Wishlist Cleared",
        description: "All items removed from your wishlist.",
      });
      return true;
    } catch (error) {
      console.error('[WISHLIST CONTEXT] ❌ Error clearing wishlist:', error);
      return false;
    }
  }, [isAuthenticated, user, state.items, toast]);

  // Move item to cart
  const moveToCart = useCallback(async (
    itemId: string,
    quantity: number = 1,
    removeFromWishlist: boolean = true
  ): Promise<boolean> => {
    try {
      if (isAuthenticated && user) {
        const response = await apiRequest('POST', `/api/wishlist/${itemId}/move-to-cart`, { quantity, removeFromWishlist });
        const result = await response.json() as WishlistOperationResult;

        if (result.success) {
          if (removeFromWishlist) {
            dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
          }
          toast({
            title: "Added to Cart",
            description: removeFromWishlist
              ? "Item moved to cart successfully."
              : "Item added to cart successfully.",
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('[WISHLIST CONTEXT] ❌ Error moving to cart:', error);
      return false;
    }
  }, [isAuthenticated, user, toast]);

  // Check if item is in wishlist
  const isInWishlist = useCallback((productId?: string, serviceId?: string): boolean => {
    if (isAuthenticated && user) {
      return state.items.some(item =>
        (item.productId === productId && productId) ||
        (item.serviceId === serviceId && serviceId)
      );
    } else {
      return GuestWishlistManager.isInWishlist(productId, serviceId);
    }
  }, [isAuthenticated, user, state.items]);

  // Refresh wishlist
  const refreshWishlist = useCallback(async (): Promise<void> => {
    await loadWishlist();
  }, [loadWishlist]);

  // Load analytics
  const loadAnalytics = useCallback(async (): Promise<void> => {
    try {
      if (isAuthenticated && user) {
        const response = await apiRequest('GET', '/api/wishlist/analytics');
        const result = await response.json() as { success: boolean; analytics: WishlistAnalytics };

        if (result.success && result.analytics) {
          dispatch({ type: 'SET_ANALYTICS', payload: result.analytics });
        }
      }
    } catch (error) {
      console.error('[WISHLIST CONTEXT] ❌ Error loading analytics:', error);
    }
  }, [isAuthenticated, user]);

  // Get guest wishlist data
  const getGuestWishlistData = useCallback((): GuestWishlistItem[] => {
    return GuestWishlistManager.load().items;
  }, []);

  // Migrate guest wishlist to authenticated user
  const migrateGuestWishlist = useCallback(async (): Promise<boolean> => {
    if (migrationInProgress.current) return false;

    try {
      migrationInProgress.current = true;
      dispatch({ type: 'SET_SYNC_STATUS', payload: { status: 'syncing' } });

      const guestData = GuestWishlistManager.load();

      if (guestData.items.length === 0) {
        migrationInProgress.current = false;
        await loadWishlist();
        return true;
      }

      console.log('[WISHLIST CONTEXT] 🔄 Migrating', guestData.items.length, 'guest items...');

      const response = await apiRequest('POST', '/api/wishlist/bulk', { items: guestData.items });
      const result = await response.json() as WishlistOperationResult;

      if (result.success) {
        // Clear guest wishlist after successful migration
        GuestWishlistManager.clear();

        // Load the updated wishlist
        await loadWishlist();

        const migratedCount = result.items?.length || 0;
        toast({
          title: "Wishlist Synced",
          description: `Successfully synced ${migratedCount} items to your account.`,
        });

        console.log('[WISHLIST CONTEXT] ✅ Migration completed:', migratedCount, 'items synced');
        return true;
      } else {
        console.error('[WISHLIST CONTEXT] ❌ Migration failed:', result.message);
        dispatch({ type: 'SET_SYNC_STATUS', payload: { status: 'failed' } });
        return false;
      }
    } catch (error) {
      console.error('[WISHLIST CONTEXT] ❌ Migration error:', error);
      dispatch({ type: 'SET_SYNC_STATUS', payload: { status: 'failed' } });
      return false;
    } finally {
      migrationInProgress.current = false;
    }
  }, [loadWishlist, toast]);

  // Context value
  const contextValue: WishlistContextType = useMemo(() => ({
    // State
    items: state.items,
    loading: state.loading,
    error: state.error,
    totalItems: state.totalItems,
    totalValue: state.totalValue,
    analytics: state.analytics,
    syncStatus: state.syncStatus,

    // Actions
    addToWishlist,
    removeFromWishlist,
    updateWishlistItem,
    clearWishlist,
    moveToCart,
    isInWishlist,
    refreshWishlist,
    loadAnalytics,

    // Guest specific
    getGuestWishlistData,
    migrateGuestWishlist,
  }), [
    state,
    addToWishlist,
    removeFromWishlist,
    updateWishlistItem,
    clearWishlist,
    moveToCart,
    isInWishlist,
    refreshWishlist,
    loadAnalytics,
    getGuestWishlistData,
    migrateGuestWishlist,
  ]);

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

// Hook to use wishlist context
export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}