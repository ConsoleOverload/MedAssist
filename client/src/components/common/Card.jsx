import React from 'react';
import clsx from 'clsx';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  icon: Icon,
  noPadding = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm overflow-hidden transition-all duration-200',
        className
      )}
      {...props}
    >
      {(title || subtitle || action || Icon) && (
        <div className="px-5 py-4 border-b border-surface-container flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-surface-container text-primary rounded-lg shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && <h3 className="font-semibold text-on-surface text-base leading-snug">{title}</h3>}
              {subtitle && <p className="text-xs text-outline mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={clsx(!noPadding && 'p-5')}>{children}</div>
    </div>
  );
};
