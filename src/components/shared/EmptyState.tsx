'use client';

/**
 * EmptyState Component
 * Displays a centered message when no data is available
 */

import React, { ReactNode } from 'react';
import Link from 'next/link';

// ============================================================================
// Types
// ============================================================================

interface EmptyStateProps {
  /** Icon or illustration to display */
  icon?: ReactNode;
  /** Main title */
  title: string;
  /** Description message */
  message?: string;
  /** Action button label */
  actionLabel?: string;
  /** Action button href (Link) */
  actionHref?: string;
  /** Action button click handler (Button) */
  onAction?: () => void;
  /** Secondary action */
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Background variant */
  variant?: 'default' | 'card';
}

// ============================================================================
// Default Icons
// ============================================================================

const DefaultIcons = {
  NoData: () => (
    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  Search: () => (
    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Document: () => (
    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  History: () => (
    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Error: () => (
    <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

// ============================================================================
// Size Configuration
// ============================================================================

const sizeConfig = {
  sm: {
    container: 'py-8',
    icon: 'w-12 h-12',
    title: 'text-lg',
    message: 'text-sm',
    button: 'px-4 py-2 text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'w-16 h-16',
    title: 'text-xl',
    message: 'text-base',
    button: 'px-5 py-2.5 text-sm',
  },
  lg: {
    container: 'py-16',
    icon: 'w-20 h-20',
    title: 'text-2xl',
    message: 'text-lg',
    button: 'px-6 py-3 text-base',
  },
};

// ============================================================================
// EmptyState Component
// ============================================================================

export default function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
  secondaryAction,
  size = 'md',
  variant = 'default',
}: EmptyStateProps) {
  const sizes = sizeConfig[size];

  const containerClasses = `
    ${sizes.container}
    ${variant === 'card' ? 'bg-white rounded-xl shadow-md border border-gray-100' : ''}
    flex flex-col items-center justify-center text-center px-4
  `;

  // Action button component
  const ActionButton = () => {
    const buttonClasses = `
      ${sizes.button}
      inline-flex items-center gap-2 font-medium rounded-lg
      bg-gradient-to-r from-indigo-600 to-purple-600 text-white
      hover:from-indigo-700 hover:to-purple-700
      shadow-lg shadow-indigo-200/50
      transition-all duration-200 hover:-translate-y-0.5
      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
    `;

    if (actionHref) {
      return (
        <Link href={actionHref} className={buttonClasses}>
          {actionLabel}
        </Link>
      );
    }

    if (onAction) {
      return (
        <button onClick={onAction} className={buttonClasses}>
          {actionLabel}
        </button>
      );
    }

    return null;
  };

  // Secondary action component
  const SecondaryActionButton = () => {
    if (!secondaryAction) return null;

    const buttonClasses = `
      ${sizes.button}
      inline-flex items-center gap-2 font-medium rounded-lg
      bg-white text-gray-700 border border-gray-300
      hover:bg-gray-50 hover:border-gray-400
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
    `;

    if (secondaryAction.href) {
      return (
        <Link href={secondaryAction.href} className={buttonClasses}>
          {secondaryAction.label}
        </Link>
      );
    }

    if (secondaryAction.onClick) {
      return (
        <button onClick={secondaryAction.onClick} className={buttonClasses}>
          {secondaryAction.label}
        </button>
      );
    }

    return null;
  };

  return (
    <div className={containerClasses}>
      {/* Icon */}
      <div className="mb-4 text-gray-400">
        {icon || <DefaultIcons.NoData />}
      </div>

      {/* Title */}
      <h3 className={`${sizes.title} font-semibold text-gray-900 mb-2`}>
        {title}
      </h3>

      {/* Message */}
      {message && (
        <p className={`${sizes.message} text-gray-500 max-w-md mb-6`}>
          {message}
        </p>
      )}

      {/* Actions */}
      {(actionLabel || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <ActionButton />
          <SecondaryActionButton />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Preset Empty States
// ============================================================================

export function NoDataEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={<DefaultIcons.NoData />}
      title="No data available"
      message="There's nothing to show here yet."
      {...props}
    />
  );
}

export function NoSearchResultsEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={<DefaultIcons.Search />}
      title="No results found"
      message="Try adjusting your search or filter criteria."
      {...props}
    />
  );
}

export function NoHistoryEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={<DefaultIcons.History />}
      title="No analysis history"
      message="Start by analyzing your first email to see it here."
      actionLabel="Analyze Email"
      actionHref="/upload"
      {...props}
    />
  );
}

export function UploadPromptEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={<DefaultIcons.Upload />}
      title="Upload an email to analyze"
      message="Drag and drop or click to upload a placement email for bias detection."
      actionLabel="Upload Email"
      {...props}
    />
  );
}

export function ErrorEmptyState(props: Partial<EmptyStateProps>) {
  return (
    <EmptyState
      icon={<DefaultIcons.Error />}
      title="Something went wrong"
      message="We encountered an error loading this content. Please try again."
      actionLabel="Retry"
      {...props}
    />
  );
}
