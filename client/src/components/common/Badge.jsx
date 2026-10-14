import React from 'react';
import clsx from 'clsx';

export const Badge = ({ children, variant = 'slate', size = 'sm', className = '' }) => {
  const variantStyles = {
    teal: 'bg-primary/10 text-primary border-primary/20',
    primary: 'bg-primary/10 text-primary border-primary/20',
    navy: 'bg-inverse-surface text-inverse-on-surface border-outline/30',
    slate: 'bg-surface-container text-on-surface-variant border-outline-variant/40',
    success: 'bg-tertiary-fixed/30 text-on-tertiary-fixed border-tertiary/20 font-semibold',
    warning: 'bg-secondary-fixed text-on-secondary-fixed border-secondary/20',
    danger: 'bg-error-container text-on-error-container border-error/20 font-semibold',
    purple: 'bg-primary-fixed text-on-primary-fixed border-primary/20',
    blue: 'bg-secondary-container/40 text-on-secondary-container border-secondary/30',
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-xs font-medium',
    sm: 'px-2.5 py-0.5 text-xs font-medium',
    md: 'px-3 py-1 text-sm font-medium',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border transition-colors',
        variantStyles[variant] || variantStyles.slate,
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
