import React from 'react';
import clsx from 'clsx';

export const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'animate-pulse bg-slate-200/80 rounded-md',
            className || 'h-4 w-full mb-2'
          )}
        />
      ))}
    </>
  );
};
