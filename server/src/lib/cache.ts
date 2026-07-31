/**
 * In-Memory TTL Cache
 *
 * Lightweight, zero-dependency server-side cache to shield Firestore from
 * repeated identical reads.  Uses a plain Map with expiry timestamps so there
 * is no external package dependency.
 *
 * Features
 * --------
 * - Generic typed get/set with per-entry TTL
 * - Automatic eviction of the oldest stale entry when the store is full
 * - Bulk invalidation by key prefix (handy for "products/*")
 * - Debug stats helper (hits / misses / size)
 * - Thread-safe: Node.js is single-threaded so no locks required
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;  // epoch ms
  createdAt: number;  // epoch ms — used for LRU eviction ordering
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: string;
}

class TTLCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private hits = 0;
  private misses = 0;

  /** Maximum number of keys in the store before LRU eviction kicks in */
  private readonly maxSize: number;

  constructor(maxSize = 500) {
    this.maxSize = maxSize;
  }

  // ---------------------------------------------------------------------------
  // Core API
  // ---------------------------------------------------------------------------

  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    // Evict LRU (oldest createdAt) when at capacity
    if (this.store.size >= this.maxSize) {
      this.evictOldest();
    }

    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now(),
    });
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Invalidate all keys that start with the given prefix.
   * Example:  invalidateByPrefix("products") removes "products", "products:id:abc", etc.
   */
  invalidateByPrefix(prefix: string): number {
    let count = 0;
    Array.from(this.store.keys()).forEach(key => {
      if (key === prefix || key.startsWith(`${prefix}:`)) {
        this.store.delete(key);
        count++;
      }
    });
    return count;
  }

  /** Remove all entries regardless of TTL */
  clear(): void {
    this.store.clear();
  }

  /** Human-readable cache statistics for debugging */
  stats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total === 0 ? '0%' : `${((this.hits / total) * 100).toFixed(1)}%`,
    };
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    Array.from(this.store.entries()).forEach(([key, entry]) => {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.store.delete(oldestKey);
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton instance — one cache shared across all route modules
// ---------------------------------------------------------------------------

export const cache = new TTLCache(500);

// ---------------------------------------------------------------------------
// TTL constants — centralised so they are easy to tune
// ---------------------------------------------------------------------------

export const CacheTTL = {
  /** Public product listings — safe to serve stale for 30 s */
  PRODUCTS_LIST: 30_000,
  /** Individual product detail page */
  PRODUCT_DETAIL: 60_000,
  /** Category list (rarely changes) */
  CATEGORIES: 120_000,
  /** Dashboard analytics (heavy aggregation — 20 s is acceptable lag) */
  ANALYTICS: 20_000,
} as const;

// ---------------------------------------------------------------------------
// Typed cache-key builder — prevents key string typos across files
// ---------------------------------------------------------------------------

export const CacheKeys = {
  products: {
    all: (query: string) => `products:all:${query}`,
    byId: (id: string) => `products:id:${id}`,
    bySlug: (slug: string) => `products:slug:${slug}`,
    featured: () => `products:featured`,
    byCategory: (cat: string) => `products:category:${cat}`,
    search: (q: string) => `products:search:${q}`,
  },
  analytics: {
    dashboard: () => `analytics:dashboard`,
  },
} as const;
