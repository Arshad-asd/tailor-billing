import React, { useState, createContext, useContext } from 'react';

const TabsContext = createContext();

export function Tabs({ defaultValue, value, onValueChange, children, className }) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (val) => {
    setInternalValue(val);
    if (onValueChange) onValueChange(val);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, setValue: handleChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({ value, children, className }) {
  const { value: activeValue, setValue } = useContext(TabsContext);
  const isActive = activeValue === value;
  return (
    <button
      type="button"
      className={
        `px-4 py-2 rounded-md font-medium focus:outline-none transition-colors ` +
        (isActive
          ? 'bg-white dark:bg-gray-700 text-orange-600 shadow data-[state=active]:bg-white ' + (className || '')
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 ' + (className || ''))
      }
      data-state={isActive ? 'active' : undefined}
      onClick={() => setValue(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }) {
  const { value: activeValue } = useContext(TabsContext);
  if (activeValue !== value) return null;
  return <div className={className}>{children}</div>;
} 