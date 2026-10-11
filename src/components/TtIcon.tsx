import React from 'react';

/**
 * Clean Lucide-styled "Tt" icon representing typography & text reading width.
 */
export const TtIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Capital T */}
    <polyline points="4 7 4 4 14 4 14 7" />
    <line x1="9" y1="4" x2="9" y2="20" />
    {/* Lowercase t */}
    <line x1="14" y1="11" x2="20" y2="11" />
    <path d="M17 8v10a2 2 0 0 0 2 2" />
  </svg>
);
