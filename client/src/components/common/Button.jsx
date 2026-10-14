import React from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-press';

  const variantStyles = {
    primary:
      'bg-primary hover:bg-primary-container text-on-primary shadow-sm focus:ring-primary border border-transparent',
    secondary:
      'bg-inverse-surface hover:bg-inverse-surface/90 text-inverse-on-surface shadow-sm focus:ring-inverse-surface border border-transparent',
    outline:
      'bg-surface-container-lowest hover:bg-surface-container-low text-on-surface border border-outline-variant/40 shadow-sm focus:ring-secondary',
    ghost:
      'bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface focus:ring-primary',
    danger:
      'bg-error hover:bg-error/90 text-on-error shadow-sm focus:ring-error border border-transparent',
    tertiary:
      'bg-tertiary-container hover:bg-tertiary text-on-primary shadow-sm focus:ring-tertiary border border-transparent',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant] || variantStyles.primary,
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
};
