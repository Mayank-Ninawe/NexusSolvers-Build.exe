import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

export function getSeverityColor(severity: string): string {
  const colors = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400'
  };
  return colors[severity as keyof typeof colors] || 'text-gray-400';
}

export function getSeverityBg(severity: string): string {
  const colors = {
    low: 'bg-green-500/20',
    medium: 'bg-yellow-500/20',
    high: 'bg-orange-500/20',
    critical: 'bg-red-500/20'
  };
  return colors[severity as keyof typeof colors] || 'bg-gray-500/20';
}

export function calculateBiasScore(biases: any[]): number {
  if (!biases || biases.length === 0) return 0;
  
  const severityWeights = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  };
  
  const totalWeight = biases.reduce((sum, bias) => {
    return sum + (severityWeights[bias.severity as keyof typeof severityWeights] || 0);
  }, 0);
  
  return Math.min(100, (totalWeight / biases.length) * 25);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
