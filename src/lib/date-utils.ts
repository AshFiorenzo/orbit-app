import { formatInTimeZone, toDate } from 'date-fns-tz';

export const APP_TIMEZONE = 'Asia/Dhaka'; // UTC+6:00

/**
 * Returns the current date/time in the application's timezone.
 */
export function getNow(): Date {
  return toDate(new Date(), { timeZone: APP_TIMEZONE });
}

/**
 * Formats a date in the application's timezone.
 */
export function formatInAppTZ(date: Date | string | number, formatStr: string): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return formatInTimeZone(d, APP_TIMEZONE, formatStr);
}

/**
 * Returns a date string (YYYY-MM-DD) for today in the application's timezone.
 */
export function getTodayStr(): string {
  return formatInAppTZ(new Date(), 'yyyy-MM-dd');
}

/**
 * Returns the current hour in the application's timezone.
 */
export function getCurrentHour(): number {
  return parseInt(formatInAppTZ(new Date(), 'H'), 10);
}

/**
 * Converts a date to the application's timezone object for local calculations.
 */
export function toAppTZ(date: Date | string | number): Date {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return toDate(d, { timeZone: APP_TIMEZONE });
}
