/**
 * Utility functions for currency formatting and number handling
 */

/**
 * Safely format a value as currency with 2 decimal places
 * @param {any} value - The value to format
 * @returns {string} - Formatted currency string (e.g., "123.45")
 */
export const formatCurrency = (value) => {
  const numValue = parseFloat(value);
  return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
};

/**
 * Safely format a value as currency with dollar sign
 * @param {any} value - The value to format
 * @returns {string} - Formatted currency string with $ (e.g., "$123.45")
 */
export const formatCurrencyWithSymbol = (value) => {
  return `$${formatCurrency(value)}`;
};

/**
 * Safely parse a numeric value
 * @param {any} value - The value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} - Parsed number or default value
 */
export const safeParseFloat = (value, defaultValue = 0) => {
  const numValue = parseFloat(value);
  return isNaN(numValue) ? defaultValue : numValue;
};

/**
 * Safely parse an integer value
 * @param {any} value - The value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} - Parsed integer or default value
 */
export const safeParseInt = (value, defaultValue = 0) => {
  const intValue = parseInt(value);
  return isNaN(intValue) ? defaultValue : intValue;
};

/**
 * Calculate percentage with safe number handling
 * @param {any} value - The value to calculate percentage of
 * @param {any} total - The total value
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} - Formatted percentage string
 */
export const formatPercentage = (value, total, decimals = 1) => {
  const numValue = safeParseFloat(value);
  const numTotal = safeParseFloat(total);
  
  if (numTotal === 0) return '0.0%';
  
  const percentage = (numValue / numTotal) * 100;
  return `${percentage.toFixed(decimals)}%`;
};
