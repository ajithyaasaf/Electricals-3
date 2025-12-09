import { doc, onSnapshot, DocumentData, FirestoreError } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { db } from '../../../shared/firestore';

/**
 * Firebase Real-time Data Hook (READ-ONLY)
 * 
 * ARCHITECTURE NOTE: This utility provides READ-ONLY real-time Firestore 
 * listening capabilities. All WRITE operations must go through the backend API.
 * 
 * @see docs/ARCHITECTURE_DECISION.md - Backend-Only Data Mutations
 * @see /api/admin/site-content - Use this API for CMS updates
 * 
 * Usage in component:
 * import { useFirestoreRealtime } from '@/lib/firebase-realtime';
 * 
 * const { data, loading, error } = useFirestoreRealtime<WhyChooseData>(
 *   'siteContent/whyChooseSection',
 *   defaultData
 * );
 */

export interface FirestoreRealtimeResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

/**
 * Real-time Firestore subscription hook (READ-ONLY)
 * 
 * This hook subscribes to a Firestore document and provides real-time updates.
 * It does NOT perform any write operations - all writes must go through
 * the backend API to ensure proper validation and audit logging.
 * 
 * @param documentPath - Path in format 'collection/documentId'
 * @param defaultData - Default data to use before fetch completes or on error
 * @returns Object with data, loading state, and error message
 */
export function useFirestoreRealtime<T extends DocumentData>(
  documentPath: string,
  defaultData: T
): FirestoreRealtimeResult<T> {
  const [data, setData] = useState<T>(defaultData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentPath || typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Parse the document path (e.g., 'siteContent/whyChooseSection')
    const pathParts = documentPath.split('/');
    if (pathParts.length !== 2) {
      setError('Invalid document path format. Use: collection/document');
      setLoading(false);
      return;
    }

    const [collection, documentId] = pathParts;

    try {
      const unsubscribe = onSnapshot(
        doc(db, collection, documentId),
        (docSnap) => {
          if (docSnap.exists()) {
            const firestoreData = docSnap.data() as T;
            setData({ ...defaultData, ...firestoreData });
            setError(null);
          } else {
            // Document doesn't exist, use default data
            console.warn(`Document ${documentPath} not found, using default data`);
            setData(defaultData);
          }
          setLoading(false);
        },
        (err: FirestoreError) => {
          console.error('Firestore listening error:', err);
          setError(err.message);
          setLoading(false);
          // Fallback to default data on error
          setData(defaultData);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up Firestore listener:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      setData(defaultData);
    }
  }, [documentPath, defaultData]);

  return { data, loading, error };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPRECATED: Direct Firestore Write Functions
// ═══════════════════════════════════════════════════════════════════════════
// 
// The following functions have been REMOVED as part of architecture hardening:
// 
// - createWhyChooseSectionDocument() - REMOVED
// - updateWhyChooseSection() - REMOVED
// 
// Use the backend API instead:
//   POST /api/admin/site-content/:docId - Create content
//   PUT  /api/admin/site-content/:docId - Update content
//   GET  /api/admin/site-content/:docId - Get content
// 
// This ensures:
// - Server-side validation with Zod
// - Admin role enforcement
// - Audit trail (lastUpdated, updatedBy)
// - Single source of truth
// 
// @see docs/ARCHITECTURE_DECISION.md
// ═══════════════════════════════════════════════════════════════════════════
