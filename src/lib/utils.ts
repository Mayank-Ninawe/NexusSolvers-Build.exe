import { BiasSeverity } from '@/types';

/**
 * Get Tailwind color class for severity level
 */
export function getSeverityColor(severity: BiasSeverity): string {
  switch (severity) {
    case 'high':
      return 'text-red-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get Tailwind background color class for severity level
 */
export function getSeverityBg(severity: BiasSeverity): string {
  switch (severity) {
    case 'high':
      return 'bg-red-500/10';
    case 'medium':
      return 'bg-yellow-500/10';
    case 'low':
      return 'bg-green-500/10';
    default:
      return 'bg-gray-500/10';
  }
}

/**
 * Get gradient colors for severity level
 */
export function getSeverityGradient(severity: BiasSeverity): string {
  switch (severity) {
    case 'high':
      return 'from-red-500 to-red-600';
    case 'medium':
      return 'from-yellow-500 to-yellow-600';
    case 'low':
      return 'from-green-500 to-green-600';
    default:
      return 'from-gray-500 to-gray-600';
  }
}
