import React from 'react';

export function Progress({ value = 0, max = 100, className = '', ...props }) {
  const percent = Math.min(Math.max(value, 0), max) / max * 100;
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${className}`} {...props}>
      <div
        className="bg-orange-500 h-2 rounded-full transition-all"
        style={{ width: `${percent}%` }}
        aria-valuenow={value}
        aria-valuemax={max}
        aria-valuemin={0}
        role="progressbar"
      />
    </div>
  );
}

export default Progress; 