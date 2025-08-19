import React from 'react';

export function Checkbox({ id, checked, defaultChecked, onChange, className = '', ...props }) {
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
        className="form-checkbox h-5 w-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500 transition"
        checked={isChecked}
        onChange={handleChange}
        {...props}
      />
    </label>
  );
}

export default Checkbox; 