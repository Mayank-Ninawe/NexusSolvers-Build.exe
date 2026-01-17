/**
 * BiasBreaker Real-Time Optimization Utilities
 * Performance utilities for real-time Firestore operations
 */

import type { Analysis } from '@/types';

// ============================================================================
// Types
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
}

export interface ThrottledNotification {
  execute: (callback: () => void) => void;
  clear: () => void;
}

export interface ConnectionStatus {
  isConnected: boolean;
  lastConnected: Date | null;
  reconnectAttempts: number;
  error: Error | null;
}

// ============================================================================
// Debounce Utility
// ============================================================================

/**
 * Creates a debounced version of a callback function
 * Prevents excessive re-renders by waiting for a pause in calls
 * 
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds (default: 1000ms)
 * @returns Debounced function with cancel and flush methods
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounceUpdates<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 1000
): DebouncedFunction<T> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    lastArgs = args;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      if (lastArgs) {
        callback(...lastArgs);
      }
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  debouncedFn.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      callback(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debouncedFn;
}

// ============================================================================
// Throttle Utility
// ============================================================================

/**
 * Creates a throttled notification handler
 * Limits notifications to a maximum rate to prevent spam
 * 
 * @param limitMs - Minimum time between notifications in milliseconds
 * @returns Throttled notification handler
 */
export function throttleNotifications(limitMs: number = 1000): ThrottledNotification {
  let lastExecutionTime = 0;
  let pendingCallback: (() => void) | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  const execute = (callback: () => void) => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutionTime;

    if (timeSinceLastExecution >= limitMs) {
      // Can execute immediately
      lastExecutionTime = now;
      callback();
    } else {
      // Queue for later execution
      pendingCallback = callback;
      
      if (!timeoutId) {
        const delay = limitMs - timeSinceLastExecution;
        timeoutId = setTimeout(() => {
          if (pendingCallback) {
            lastExecutionTime = Date.now();
            pendingCallback();
            pendingCallback = null;
          }
          timeoutId = null;
        }, delay);
      }
    }
  };

  const clear = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    pendingCallback = null;
  };

  return { execute, clear };
}

// ============================================================================
// Batch Processing
// ============================================================================

/**
 * Batches analyses into groups for efficient rendering
 * Useful for rendering large lists in chunks
 * 
 * @param analyses - Array of analyses to batch
 * @param batchSize - Number of items per batch
 * @returns Array of batched analysis arrays
 */
export function batchAnalyses(analyses: Analysis[], batchSize: number = 10): Analysis[][] {
  const batches: Analysis[][] = [];
  
  for (let i = 0; i < analyses.length; i += batchSize) {
    batches.push(analyses.slice(i, i + batchSize));
  }
  
  return batches;
}

/**
 * Processes analyses in batches with delay between each batch
 * Prevents UI blocking when processing large datasets
 * 
 * @param analyses - Array of analyses to process
 * @param processor - Function to process each analysis
 * @param batchSize - Number of items per batch
 * @param delayMs - Delay between batches in milliseconds
 */
export async function processBatchedAnalyses<T>(
  analyses: Analysis[],
  processor: (analysis: Analysis) => T,
  batchSize: number = 10,
  delayMs: number = 16 // ~60fps frame time
): Promise<T[]> {
  const results: T[] = [];
  const batches = batchAnalyses(analyses, batchSize);

  for (const batch of batches) {
    for (const analysis of batch) {
      results.push(processor(analysis));
    }
    
    // Yield to browser between batches
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  return results;
}

// ============================================================================
// Connection Management
// ============================================================================

/**
 * Creates a connection status manager for real-time listeners
 * Tracks connection state with exponential backoff for retries
 */
export function createConnectionManager(): {
  getStatus: () => ConnectionStatus;
  setConnected: () => void;
  setDisconnected: (error?: Error) => void;
  resetRetries: () => void;
  getBackoffDelay: () => number;
} {
  let status: ConnectionStatus = {
    isConnected: false,
    lastConnected: null,
    reconnectAttempts: 0,
    error: null,
  };

  const MAX_BACKOFF_MS = 30000; // 30 seconds max
  const BASE_BACKOFF_MS = 1000; // 1 second base

  return {
    getStatus: () => ({ ...status }),
    
    setConnected: () => {
      status = {
        isConnected: true,
        lastConnected: new Date(),
        reconnectAttempts: 0,
        error: null,
      };
    },
    
    setDisconnected: (error?: Error) => {
      status = {
        ...status,
        isConnected: false,
        reconnectAttempts: status.reconnectAttempts + 1,
        error: error || null,
      };
    },
    
    resetRetries: () => {
      status = { ...status, reconnectAttempts: 0 };
    },
    
    getBackoffDelay: () => {
      // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
      const delay = Math.min(
        BASE_BACKOFF_MS * Math.pow(2, status.reconnectAttempts),
        MAX_BACKOFF_MS
      );
      // Add jitter to prevent thundering herd
      return delay + Math.random() * 1000;
    },
  };
}

// ============================================================================
// Memory Management
// ============================================================================

/**
 * Limits array size by removing oldest items
 * Useful for preventing memory leaks in long-running sessions
 * 
 * @param items - Array of items
 * @param maxItems - Maximum number of items to keep
 * @returns Trimmed array (keeps newest items)
 */
export function limitArraySize<T>(items: T[], maxItems: number = 100): T[] {
  if (items.length <= maxItems) return items;
  return items.slice(0, maxItems);
}

/**
 * Creates a cache with automatic expiration
 * Prevents stale data from accumulating in memory
 */
export function createExpiringCache<K, V>(
  ttlMs: number = 60000 // 1 minute default TTL
): {
  get: (key: K) => V | undefined;
  set: (key: K, value: V) => void;
  delete: (key: K) => void;
  clear: () => void;
  size: () => number;
} {
  const cache = new Map<K, { value: V; expiresAt: number }>();

  const cleanup = () => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (entry.expiresAt <= now) {
        cache.delete(key);
      }
    }
  };

  // Periodic cleanup
  const cleanupInterval = setInterval(cleanup, ttlMs / 2);

  return {
    get: (key: K) => {
      const entry = cache.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt <= Date.now()) {
        cache.delete(key);
        return undefined;
      }
      return entry.value;
    },
    
    set: (key: K, value: V) => {
      cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      });
    },
    
    delete: (key: K) => {
      cache.delete(key);
    },
    
    clear: () => {
      cache.clear();
      clearInterval(cleanupInterval);
    },
    
    size: () => cache.size,
  };
}

// ============================================================================
// Tab Visibility Management
// ============================================================================

/**
 * Creates a visibility state manager
 * Pauses real-time updates when tab is inactive
 */
export function createVisibilityManager(
  onVisible: () => void,
  onHidden: () => void
): {
  isVisible: () => boolean;
  cleanup: () => void;
} {
  let visible = !document.hidden;

  const handleVisibilityChange = () => {
    const wasVisible = visible;
    visible = !document.hidden;

    if (visible && !wasVisible) {
      onVisible();
    } else if (!visible && wasVisible) {
      onHidden();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return {
    isVisible: () => visible,
    cleanup: () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    },
  };
}

// ============================================================================
// Rate Limiting
// ============================================================================

/**
 * Creates a rate limiter for API calls
 * Prevents exceeding Firestore quota limits
 */
export function createRateLimiter(
  maxRequests: number = 10,
  windowMs: number = 1000
): {
  canProceed: () => boolean;
  recordRequest: () => void;
  getRemaining: () => number;
  reset: () => void;
} {
  const requests: number[] = [];

  const cleanup = () => {
    const now = Date.now();
    const cutoff = now - windowMs;
    while (requests.length > 0 && requests[0] < cutoff) {
      requests.shift();
    }
  };

  return {
    canProceed: () => {
      cleanup();
      return requests.length < maxRequests;
    },
    
    recordRequest: () => {
      cleanup();
      requests.push(Date.now());
    },
    
    getRemaining: () => {
      cleanup();
      return Math.max(0, maxRequests - requests.length);
    },
    
    reset: () => {
      requests.length = 0;
    },
  };
}

// ============================================================================
// Notification Queue
// ============================================================================

/**
 * Creates a notification queue with max visible limit
 * Queues excess notifications and shows them as slots become available
 */
export function createNotificationQueue(
  maxVisible: number = 3,
  onShow: (notification: QueuedNotification) => string,
  onDismiss: (toastId: string) => void
): {
  add: (notification: Omit<QueuedNotification, 'id'>) => void;
  dismiss: (id: string) => void;
  clear: () => void;
  getQueue: () => QueuedNotification[];
} {
  const queue: QueuedNotification[] = [];
  const visible = new Map<string, string>(); // id -> toastId
  let nextId = 1;

  const showNext = () => {
    while (visible.size < maxVisible && queue.length > 0) {
      const notification = queue.shift()!;
      const toastId = onShow(notification);
      visible.set(notification.id, toastId);
    }
  };

  return {
    add: (notification) => {
      const id = `notification-${nextId++}`;
      const queuedNotification: QueuedNotification = { ...notification, id };
      
      if (visible.size < maxVisible) {
        const toastId = onShow(queuedNotification);
        visible.set(id, toastId);
      } else {
        queue.push(queuedNotification);
      }
    },
    
    dismiss: (id: string) => {
      const toastId = visible.get(id);
      if (toastId) {
        onDismiss(toastId);
        visible.delete(id);
        showNext();
      } else {
        const index = queue.findIndex(n => n.id === id);
        if (index > -1) {
          queue.splice(index, 1);
        }
      }
    },
    
    clear: () => {
      for (const toastId of visible.values()) {
        onDismiss(toastId);
      }
      visible.clear();
      queue.length = 0;
    },
    
    getQueue: () => [...queue],
  };
}

export interface QueuedNotification {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  analysisId?: string;
  collegeName?: string;
  biasScore?: number;
  severity?: 'low' | 'medium' | 'high';
}

// ============================================================================
// Utility Helpers
// ============================================================================

/**
 * Compares two arrays of analyses to detect changes
 * Returns added, modified, and removed items
 */
export function diffAnalyses(
  oldAnalyses: Analysis[],
  newAnalyses: Analysis[]
): {
  added: Analysis[];
  modified: Analysis[];
  removed: Analysis[];
} {
  const oldMap = new Map(oldAnalyses.map(a => [a.id, a]));
  const newMap = new Map(newAnalyses.map(a => [a.id, a]));

  const added: Analysis[] = [];
  const modified: Analysis[] = [];
  const removed: Analysis[] = [];

  // Find added and modified
  for (const [id, analysis] of newMap.entries()) {
    const old = oldMap.get(id);
    if (!old) {
      added.push(analysis);
    } else if (JSON.stringify(old) !== JSON.stringify(analysis)) {
      modified.push(analysis);
    }
  }

  // Find removed
  for (const [id, analysis] of oldMap.entries()) {
    if (!newMap.has(id)) {
      removed.push(analysis);
    }
  }

  return { added, modified, removed };
}

/**
 * Generates a unique ID for notifications
 */
export function generateNotificationId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
