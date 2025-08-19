import React from 'react';

export function Switch({ id, checked, defaultChecked, onChange, className = '', ...props }) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked || false);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const handleChange = (e) => {
    if (!isControlled) setInternalChecked(e.target.checked);
    if (onChange) onChange(e);
  };

  return (
    <label className={`inline-flex items-center cursor-pointer ${className}`} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={isChecked}
        onChange={handleChange}
        {...props}
      />
      <span
        className={`w-10 h-6 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-200 ${
          isChecked ? 'bg-orange-500' : ''
        }`}
      >
        <span
          className={`bg-white dark:bg-gray-200 w-4 h-4 rounded-full shadow transform transition-transform duration-200 ${
            isChecked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </span>
    </label>
  );
}

export default Switch; 