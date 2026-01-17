/**
 * BiasBreaker Real-Time Notifications Component
 * Toast notification system for admin dashboard with react-hot-toast
 * 
 * Features:
 * - Real-time notifications for new analyses
 * - Color-coded by severity (info, warning, critical)
 * - Sound notifications (optional)
 * - User preferences stored in localStorage
 * - Queue management (max 3 visible)
 */

'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useRealtimeAnalyses } from '@/hooks/useRealtimeAnalyses';
import { throttleNotifications } from '@/lib/realtimeOptimization';
import type { Analysis } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  criticalOnly: boolean;
}

interface NotificationToastProps {
  analysis: Analysis;
  type: 'info' | 'warning' | 'critical';
  onView: () => void;
  onDismiss: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const PREFERENCES_KEY = 'biasbreaker_notification_prefs';

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  sound: true,
  criticalOnly: false,
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get severity color based on bias score and severity
 */
function getSeverityColor(severity: 'low' | 'medium' | 'high'): {
  border: string;
  bg: string;
  text: string;
} {
  switch (severity) {
    case 'high':
      return { border: 'border-red-500', bg: 'bg-red-100', text: 'text-red-700' };
    case 'medium':
      return { border: 'border-orange-500', bg: 'bg-orange-100', text: 'text-orange-700' };
    case 'low':
    default:
      return { border: 'border-green-500', bg: 'bg-green-100', text: 'text-green-700' };
  }
}

/**
 * Get notification type based on bias score
 */
function getNotificationType(biasScore: number): 'info' | 'warning' | 'critical' {
  if (biasScore >= 80) return 'critical';
  if (biasScore >= 50) return 'warning';
  return 'info';
}

/**
 * Get score color for badge
 */
function getScoreBadgeColor(score: number): string {
  if (score >= 70) return 'bg-red-500 text-white';
  if (score >= 40) return 'bg-orange-500 text-white';
  if (score >= 20) return 'bg-yellow-500 text-gray-900';
  return 'bg-green-500 text-white';
}

/**
 * Load preferences from localStorage
 */
function loadPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load notification preferences:', e);
  }
  
  return DEFAULT_PREFERENCES;
}

/**
 * Save preferences to localStorage
 */
function savePreferences(prefs: NotificationPreferences): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Failed to save notification preferences:', e);
  }
}

// ============================================================================
// Sound Notification Hook
// ============================================================================

function useNotificationSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: 'info' | 'warning' | 'critical') => {
    try {
      // Create AudioContext on first use (required for autoplay policies)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Different tones for different notification types
      switch (type) {
        case 'critical':
          oscillator.frequency.value = 880; // A5 - higher, urgent
          break;
        case 'warning':
          oscillator.frequency.value = 660; // E5 - medium
          break;
        case 'info':
        default:
          oscillator.frequency.value = 440; // A4 - soft
          break;
      }

      oscillator.type = 'sine';
      gainNode.gain.value = 0.1; // Soft volume

      // Fade out
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Browser doesn't support Web Audio API
      console.warn('Sound notification failed:', e);
    }
  }, []);

  return playSound;
}

// ============================================================================
// Custom Toast Component
// ============================================================================

function NotificationToast({ analysis, type, onView, onDismiss }: NotificationToastProps) {
  const colors = getSeverityColor(analysis.severity);
  const scoreColor = getScoreBadgeColor(analysis.biasScore);

  // Get college initial for avatar
  const initial = analysis.collegeName?.charAt(0).toUpperCase() || '?';

  // Get type-specific styling
  const typeStyles = {
    info: 'border-l-blue-500',
    warning: 'border-l-orange-500',
    critical: 'border-l-red-500',
  };

  return (
    <div className={`
      relative w-80 bg-white rounded-lg shadow-2xl border-l-4 ${typeStyles[type]}
      animate-slide-in-right overflow-hidden
    `}>
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start gap-3">
          {/* College Avatar */}
          <div className={`
            flex-shrink-0 w-10 h-10 rounded-full 
            ${colors.bg} ${colors.text}
            flex items-center justify-center font-bold text-sm
          `}>
            {initial}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {analysis.collegeName}
            </p>
            <p className="text-gray-600 text-xs mt-0.5">
              New bias analysis detected
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 mt-3">
          {/* Bias Score Badge */}
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${scoreColor}`}>
            {Math.round(analysis.biasScore)}% Bias
          </span>

          {/* Severity Badge */}
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
            {analysis.severity.charAt(0).toUpperCase() + analysis.severity.slice(1)}
          </span>

          {/* Time */}
          <span className="text-xs text-gray-400 ml-auto">
            Just now
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <button
          onClick={onView}
          className="text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
        >
          View Details →
        </button>
      </div>

      {/* Progress bar for auto-dismiss */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-gray-200 w-full">
        <div className="h-full bg-purple-500 animate-shrink" />
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function RealtimeNotifications() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const playSound = useNotificationSound();
  const throttlerRef = useRef(throttleNotifications(1000));
  const processedIdsRef = useRef<Set<string>>(new Set());

  // Load preferences on mount
  useEffect(() => {
    setPreferences(loadPreferences());
  }, []);

  // Handle new analysis callback
  const handleNewAnalysis = useCallback((analysis: Analysis) => {
    // Skip if already processed (prevents duplicates)
    if (processedIdsRef.current.has(analysis.id)) return;
    processedIdsRef.current.add(analysis.id);

    // Check preferences
    if (!preferences.enabled) return;

    const notificationType = getNotificationType(analysis.biasScore);
    
    // Skip non-critical if preference set
    if (preferences.criticalOnly && notificationType !== 'critical') return;

    // Throttle notifications
    throttlerRef.current.execute(() => {
      // Play sound if enabled
      if (preferences.sound) {
        playSound(notificationType);
      }

      // Show toast notification
      toast.custom(
        (t) => (
          <NotificationToast
            analysis={analysis}
            type={notificationType}
            onView={() => {
              toast.dismiss(t.id);
              router.push(`/student/analysis/${analysis.id}`);
            }}
            onDismiss={() => toast.dismiss(t.id)}
          />
        ),
        {
          duration: 5000,
          position: 'top-right',
        }
      );
    });
  }, [preferences, playSound, router]);

  // Subscribe to real-time analyses
  useRealtimeAnalyses({
    limit: 10,
    realtime: true,
    onNewAnalysis: handleNewAnalysis,
  });

  // Clean up throttler on unmount
  useEffect(() => {
    const throttler = throttlerRef.current;
    return () => {
      throttler.clear();
    };
  }, []);

  return (
    <Toaster
      position="top-right"
      containerClassName="!z-[100]"
      containerStyle={{
        top: 16,
        right: 16,
      }}
      toastOptions={{
        duration: 5000,
        style: {
          padding: 0,
          background: 'transparent',
          boxShadow: 'none',
        },
      }}
    />
  );
}

// ============================================================================
// Notification Preferences Component
// ============================================================================

export function NotificationPreferencesPanel() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    setPreferences(loadPreferences());
  }, []);

  const updatePreference = <K extends keyof NotificationPreferences>(
    key: K,
    value: NotificationPreferences[K]
  ) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Notification Preferences
      </h3>

      <div className="space-y-4">
        {/* Enable Notifications */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-700">Enable Notifications</span>
          <button
            role="switch"
            aria-checked={preferences.enabled}
            onClick={() => updatePreference('enabled', !preferences.enabled)}
            className={`
              relative w-12 h-6 rounded-full transition-colors
              ${preferences.enabled ? 'bg-purple-600' : 'bg-gray-300'}
            `}
          >
            <span className={`
              absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform
              ${preferences.enabled ? 'translate-x-6' : 'translate-x-0'}
            `} />
          </button>
        </label>

        {/* Sound */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-700">Sound Alerts</span>
          <button
            role="switch"
            aria-checked={preferences.sound}
            onClick={() => updatePreference('sound', !preferences.sound)}
            disabled={!preferences.enabled}
            className={`
              relative w-12 h-6 rounded-full transition-colors
              ${!preferences.enabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${preferences.sound && preferences.enabled ? 'bg-purple-600' : 'bg-gray-300'}
            `}
          >
            <span className={`
              absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform
              ${preferences.sound ? 'translate-x-6' : 'translate-x-0'}
            `} />
          </button>
        </label>

        {/* Critical Only */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-700">Critical Alerts Only</span>
          <button
            role="switch"
            aria-checked={preferences.criticalOnly}
            onClick={() => updatePreference('criticalOnly', !preferences.criticalOnly)}
            disabled={!preferences.enabled}
            className={`
              relative w-12 h-6 rounded-full transition-colors
              ${!preferences.enabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${preferences.criticalOnly && preferences.enabled ? 'bg-purple-600' : 'bg-gray-300'}
            `}
          >
            <span className={`
              absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform
              ${preferences.criticalOnly ? 'translate-x-6' : 'translate-x-0'}
            `} />
          </button>
        </label>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Notifications appear when new analyses are submitted by students.
      </p>
    </div>
  );
}

// ============================================================================
// CSS Animations (add to globals.css)
// ============================================================================

// Add these keyframes to your globals.css:
/*
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

.animate-shrink {
  animation: shrink 5s linear forwards;
}
*/

export default RealtimeNotifications;
