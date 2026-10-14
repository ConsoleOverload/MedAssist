import React from 'react';
import clsx from 'clsx';

export const Select = ({
  label,
  error,
  options = [],
  className = '',
  id,
  required,
  ...props
}) => {
  const selectId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={clsx(
          'block w-full rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 py-2.5 px-3 bg-white',
          error
            ? 'border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-300 text-slate-900 focus:border-teal-500 focus:ring-teal-100',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
};
