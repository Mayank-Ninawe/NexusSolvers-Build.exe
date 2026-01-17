'use client';

/**
 * BiasBreaker Student Area Layout
 * Provides consistent layout wrapper for all student pages
 */

import React, { ReactNode } from 'react';

interface StudentLayoutProps {
  children: ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      {children}
    </div>
  );
}
