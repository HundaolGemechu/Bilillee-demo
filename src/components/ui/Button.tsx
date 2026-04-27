import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClass = `btn-${variant} btn-${size}`;
  const combinedClasses = `${baseClass} ${className}`.trim();

  return (
    <button className={combinedClasses} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <span className="opacity-50">Loading...</span>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 16 : 20} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 16 : 20} />}
        </>
      )}
    </button>
  );
}
