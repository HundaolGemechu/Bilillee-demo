import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'commission' | 'outline' | 'ghost' | 'secondary';
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ children, variant = 'primary', className = '', style }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {children}
    </span>
  );
}
