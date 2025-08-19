import React from 'react';

export function Separator({ orientation = 'horizontal', className = '', ...props }) {
  return orientation === 'vertical' ? (
    <div
      className={`w-px h-full bg-gray-200 dark:bg-gray-700 mx-2 ${className}`}
      role="separator"
      aria-orientation="vertical"
      {...props}
    />
  ) : (
    <div
      className={`h-px w-full bg-gray-200 dark:bg-gray-700 my-2 ${className}`}
      role="separator"
      aria-orientation="horizontal"
      {...props}
    />
  );
}

export default Separator; 