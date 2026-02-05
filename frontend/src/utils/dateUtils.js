/**
 * Date/time utilities using Qatar timezone (Asia/Qatar).
 * Matches backend TIME_ZONE = 'Asia/Qatar' so frontend and server show the same dates/times.
 */
export const APP_TIMEZONE = 'Asia/Qatar';

const tzOpt = (opts = {}) => ({ timeZone: APP_TIMEZONE, ...opts });

/**
 * Format date as YYYY-MM-DD in Qatar timezone (for date inputs, filters, "today").
 */
export function formatDateStr(date) {
  if (!date) return '';
  try {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-CA', tzOpt());
  } catch {
    return '';
  }
}

/**
 * Format date for display (locale date string in Qatar).
 */
export function formatDate(date) {
  if (!date) return '';
  try {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString(undefined, tzOpt());
  } catch {
    return '';
  }
}

/**
 * Format time for display (Qatar timezone).
 */
export function formatTime(date, options = { hour: '2-digit', minute: '2-digit', hour12: true }) {
  if (!date) return '';
  try {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString('en-US', tzOpt(options));
  } catch {
    return '';
  }
}

/**
 * Format date + time for display (YYYY-MM-DD and time in Qatar).
 */
export function formatDateTime(date) {
  if (!date) return '';
  try {
    const d = date instanceof Date ? date : new Date(date);
    const datePart = d.toLocaleDateString('en-CA', tzOpt());
    const timePart = d.toLocaleTimeString('en-US', tzOpt({ hour: '2-digit', minute: '2-digit', hour12: true }));
    return `${datePart} ${timePart}`;
  } catch {
    return '';
  }
}

/**
 * toIsoDate: YYYY-MM-DD in Qatar (for display in tables/lists).
 */
export function toIsoDate(d) {
  if (!d) return '';
  try {
    const dt = d instanceof Date ? d : new Date(d);
    return dt.toLocaleDateString('en-CA', tzOpt());
  } catch {
    return '';
  }
}

/**
 * toIsoDateTime: "YYYY-MM-DD HH:MM AM/PM" in Qatar.
 */
export function toIsoDateTime(d) {
  if (!d) return '';
  try {
    const dt = d instanceof Date ? d : new Date(d);
    const datePart = dt.toLocaleDateString('en-CA', tzOpt());
    const timePart = dt.toLocaleTimeString('en-US', tzOpt({ hour: '2-digit', minute: '2-digit', hour12: true }));
    return `${datePart} ${timePart}`;
  } catch {
    return '';
  }
}

/**
 * Format as DD-MM-YYYY in Qatar (for display).
 */
export function formatDMY(date) {
  if (!date) return '';
  const s = formatDateStr(date instanceof Date ? date : new Date(date));
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return `${d}-${m}-${y}`;
}

/**
 * Current time in Qatar (for print time, etc.).
 */
export function nowTimeString() {
  return new Date().toLocaleTimeString('en-US', tzOpt({ hour: '2-digit', minute: '2-digit', hour12: true }));
}

/**
 * Format as YYYY-MM-DDTHH:mm in Qatar (for datetime-local input).
 */
export function formatDateTimeLocal(date) {
  if (!date) return '';
  try {
    const d = date instanceof Date ? date : new Date(date);
    const datePart = d.toLocaleDateString('en-CA', tzOpt());
    const timePart = d.toLocaleTimeString('en-GB', tzOpt({ hour: '2-digit', minute: '2-digit', hour12: false }));
    return `${datePart}T${timePart}`;
  } catch {
    return '';
  }
}

/**
 * Current date-time in Qatar as YYYY-MM-DDTHH:mm (for datetime-local default).
 */
export function nowDateTimeLocal() {
  const d = new Date();
  const datePart = d.toLocaleDateString('en-CA', tzOpt());
  const timePart = d.toLocaleTimeString('en-GB', tzOpt({ hour: '2-digit', minute: '2-digit', hour12: false }));
  return `${datePart}T${timePart}`;
}
