import React, { useState } from 'react';

const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (month, year) => {
  return new Date(year, month, 1).getDay();
};

export const Calendar = ({ value, onChange }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDate = (day) => {
    if (onChange) {
      onChange(new Date(currentYear, currentMonth, day));
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full max-w-xs mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-2">
        <button onClick={handlePrevMonth} className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">&#8592;</button>
        <span className="font-semibold">
          {today.toLocaleString('default', { month: 'long' })} {currentYear}
        </span>
        <button onClick={handleNextMonth} className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">&#8594;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400 mb-1">
        {weekDays.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array(firstDay)
          .fill(null)
          .map((_, i) => (
            <div key={i}></div>
          ))}
        {Array(daysInMonth)
          .fill(null)
          .map((_, i) => {
            const day = i + 1;
            const isSelected =
              value &&
              value.getDate() === day &&
              value.getMonth() === currentMonth &&
              value.getFullYear() === currentYear;
            return (
              <button
                key={day}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                  isSelected
                    ? 'bg-orange-500 text-white'
                    : 'hover:bg-orange-100 dark:hover:bg-orange-900'
                }`}
                onClick={() => handleSelectDate(day)}
              >
                {day}
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default Calendar; 