import { doc, onSnapshot, DocumentData, FirestoreError } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { db } from '../../../shared/firestore';

/**
 * Firebase Real-time Data Hook for Why Choose Section
 * 
 * This utility provides real-time Firestore listening capabilities
 * for the Why Choose CopperBear section component.
 * 
 * Admin Integration Steps:
 * 1. Create Firestore collection: 'siteContent'
 * 2. Document ID: 'whyChooseSection'
 * 3. Data structure should match WhyChooseData interface
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

/**
 * Admin Helper: Create Why Choose Section Document
 * 
 * This function helps admins create the initial Firestore document
 * for the Why Choose section with proper structure.
 */
export async function createWhyChooseSectionDocument(data: any) {
  try {
    const { setDoc, doc } = await import('firebase/firestore');
    await setDoc(doc(db, 'siteContent', 'whyChooseSection'), {
      ...data,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin', // Can be replaced with actual user ID
    });
    console.log('Why Choose section document created successfully');
  } catch (error) {
    console.error('Error creating Why Choose section document:', error);
    throw error;
  }
}

/**
 * Admin Helper: Update Feature in Real-time
 * 
 * Allows admins to update individual features or the entire section
 */
export async function updateWhyChooseSection(updates: Partial<any>) {
  try {
    const { updateDoc, doc } = await import('firebase/firestore');
    await updateDoc(doc(db, 'siteContent', 'whyChooseSection'), {
      ...updates,
      lastUpdated: new Date().toISOString(),
    });
    console.log('Why Choose section updated successfully');
  } catch (error) {
    console.error('Error updating Why Choose section:', error);
    throw error;
  }
}

