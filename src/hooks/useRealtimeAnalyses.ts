/**
 * BiasBreaker Real-Time Analyses Hook
 * Custom React hook for listening to Firestore analyses collection in real-time
 * 
 * Features:
 * - Real-time updates via onSnapshot
 * - Optional filtering by college
 * - Debounced updates for performance
 * - New analysis detection with count
 * - Automatic cleanup on unmount
 */

'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy as firestoreOrderBy,
  limit as firestoreLimit,
  onSnapshot,
  Unsubscribe,
  DocumentChange,
  QuerySnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { debounceUpdates, createVisibilityManager } from '@/lib/realtimeOptimization';
import type { Analysis, BiasType, BiasSeverity } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface UseRealtimeAnalysesOptions {
  /** Filter by specific college ID */
  collegeId?: string;
  /** Maximum number of analyses to fetch (default: 50) */
  limit?: number;
  /** Field to order by (default: 'timestamp') */
  orderByField?: 'timestamp';
  /** Enable real-time updates (default: true) */
  realtime?: boolean;
  /** Callback when new analysis is added */
  onNewAnalysis?: (analysis: Analysis) => void;
  /** Debounce delay in ms (default: 500) */
  debounceMs?: number;
}

export interface UseRealtimeAnalysesReturn {
  /** Array of analysis documents */
  analyses: Analysis[];
  /** True during initial data load */
  loading: boolean;
  /** Error object if query fails */
  error: Error | null;
  /** Count of new analyses since initial load */
  newAnalysesCount: number;
  /** Timestamp of last snapshot update */
  lastUpdated: Date | null;
  /** Whether real-time connection is active */
  isConnected: boolean;
  /** Reset new analyses count to 0 */
  resetNewCount: () => void;
  /** Manually refresh data */
  refresh: () => void;
}

// ============================================================================
// Firestore Document Converter
// ============================================================================

/**
 * Converts Firestore document to Analysis type
 */
function convertToAnalysis(id: string, data: Record<string, unknown>): Analysis {
  // Handle Firestore Timestamp conversion
  const timestamp = data.timestamp instanceof Timestamp
    ? data.timestamp.toDate()
    : data.timestamp instanceof Date
      ? data.timestamp
      : new Date(data.timestamp as string);

  return {
    id,
    userId: data.userId as string,
    userEmail: data.userEmail as string,
    collegeName: data.collegeName as string,
    collegeId: data.collegeId as string,
    title: data.title as string,
    text: data.text as string,
    biasScore: data.biasScore as number,
    biasTypes: data.biasTypes as BiasType[],
    detectedPatterns: data.detectedPatterns as Analysis['detectedPatterns'],
    suggestions: data.suggestions as string[],
    timestamp,
    severity: data.severity as BiasSeverity,
    department: data.department as string | undefined,
  };
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useRealtimeAnalyses(
  options: UseRealtimeAnalysesOptions = {}
): UseRealtimeAnalysesReturn {
  const {
    collegeId,
    limit = 50,
    orderByField = 'timestamp',
    realtime = true,
    onNewAnalysis,
    debounceMs = 500,
  } = options;

  // State
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [newAnalysesCount, setNewAnalysesCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Refs to track state across renders
  const isInitialLoadRef = useRef(true);
  const analysesMapRef = useRef<Map<string, Analysis>>(new Map());
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const visibilityManagerRef = useRef<ReturnType<typeof createVisibilityManager> | null>(null);
  const isPausedRef = useRef(false);
  const pendingUpdatesRef = useRef<Analysis[]>([]);

  // ============================================================================
  // Debounced State Update
  // ============================================================================

  const debouncedSetAnalyses = useMemo(
    () =>
      debounceUpdates((newAnalyses: Analysis[]) => {
        setAnalyses(newAnalyses);
        setLastUpdated(new Date());
      }, debounceMs),
    [debounceMs]
  );

  // ============================================================================
  // Process Snapshot Changes
  // ============================================================================

  const processChanges = useCallback(
    (snapshot: QuerySnapshot) => {
      const changes = snapshot.docChanges();
      let hasChanges = false;

      changes.forEach((change: DocumentChange) => {
        const docId = change.doc.id;
        const docData = change.doc.data();

        switch (change.type) {
          case 'added': {
            const analysis = convertToAnalysis(docId, docData);
            analysesMapRef.current.set(docId, analysis);
            hasChanges = true;

            // Track new analyses (not on initial load)
            if (!isInitialLoadRef.current) {
              setNewAnalysesCount((prev) => prev + 1);
              
              // Trigger callback for notifications
              if (onNewAnalysis) {
                onNewAnalysis(analysis);
              }
            }
            break;
          }
          case 'modified': {
            const analysis = convertToAnalysis(docId, docData);
            analysesMapRef.current.set(docId, analysis);
            hasChanges = true;
            break;
          }
          case 'removed': {
            analysesMapRef.current.delete(docId);
            hasChanges = true;
            break;
          }
        }
      });

      // Update state if there were changes
      if (hasChanges) {
        // Convert map to sorted array (newest first)
        const sortedAnalyses = Array.from(analysesMapRef.current.values()).sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        // If paused (tab hidden), queue updates
        if (isPausedRef.current) {
          pendingUpdatesRef.current = sortedAnalyses;
        } else {
          debouncedSetAnalyses(sortedAnalyses);
        }
      }

      // Mark initial load as complete
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        setLoading(false);
      }

      setIsConnected(true);
    },
    [debouncedSetAnalyses, onNewAnalysis]
  );

  // ============================================================================
  // Setup Firestore Listener
  // ============================================================================

  const setupListener = useCallback(() => {
    // Clean up existing listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Reset state for new listener
    setLoading(true);
    setError(null);
    isInitialLoadRef.current = true;
    analysesMapRef.current.clear();

    try {
      // Build query
      const analysesRef = collection(db, 'analyses');
      const constraints = [];

      // Add college filter if specified
      if (collegeId) {
        constraints.push(where('collegeId', '==', collegeId));
      }

      // Add ordering and limit
      constraints.push(firestoreOrderBy(orderByField, 'desc'));
      constraints.push(firestoreLimit(limit));

      const q = query(analysesRef, ...constraints);

      // Setup real-time listener
      if (realtime) {
        unsubscribeRef.current = onSnapshot(
          q,
          {
            // Include metadata changes to detect connection state
            includeMetadataChanges: true,
          },
          (snapshot) => {
            // Check if data is from cache (offline) or server
            const isFromCache = snapshot.metadata.fromCache;
            setIsConnected(!isFromCache);

            processChanges(snapshot);
          },
          (err) => {
            console.error('Firestore snapshot error:', err);
            setError(err);
            setLoading(false);
            setIsConnected(false);
          }
        );
      }
    } catch (err) {
      console.error('Error setting up Firestore listener:', err);
      setError(err instanceof Error ? err : new Error('Failed to setup listener'));
      setLoading(false);
    }
  }, [collegeId, limit, orderByField, realtime, processChanges]);

  // ============================================================================
  // Visibility Management
  // ============================================================================

  useEffect(() => {
    if (typeof document === 'undefined') return;

    visibilityManagerRef.current = createVisibilityManager(
      // On visible: Resume updates and flush pending
      () => {
        isPausedRef.current = false;
        if (pendingUpdatesRef.current.length > 0) {
          setAnalyses(pendingUpdatesRef.current);
          setLastUpdated(new Date());
          pendingUpdatesRef.current = [];
        }
      },
      // On hidden: Pause updates
      () => {
        isPausedRef.current = true;
      }
    );

    return () => {
      visibilityManagerRef.current?.cleanup();
    };
  }, []);

  // ============================================================================
  // Setup Effect
  // ============================================================================

  useEffect(() => {
    setupListener();

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      debouncedSetAnalyses.cancel();
    };
  }, [setupListener, debouncedSetAnalyses]);

  // ============================================================================
  // Public Methods
  // ============================================================================

  const resetNewCount = useCallback(() => {
    setNewAnalysesCount(0);
  }, []);

  const refresh = useCallback(() => {
    setupListener();
  }, [setupListener]);

  // ============================================================================
  // Memoized Return Value
  // ============================================================================

  const returnValue = useMemo<UseRealtimeAnalysesReturn>(
    () => ({
      analyses,
      loading,
      error,
      newAnalysesCount,
      lastUpdated,
      isConnected,
      resetNewCount,
      refresh,
    }),
    [analyses, loading, error, newAnalysesCount, lastUpdated, isConnected, resetNewCount, refresh]
  );

  return returnValue;
}

// ============================================================================
// Default Export
// ============================================================================

export default useRealtimeAnalyses;
