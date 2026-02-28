export type WeekStartDay = 0 | 1; // 0 = Sunday, 1 = Monday

export const DAYS_OF_WEEK_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

/**
 * Convert week start setting to numeric value
 * @param setting - 'sunday' or 'monday'
 * @returns 0 for Sunday, 1 for Monday
 */
export function getWeekStartValue(setting: 'sunday' | 'monday'): WeekStartDay {
  return setting === 'monday' ? 1 : 0;
}

/**
 * Get days of week labels based on week start setting
 * @param weekStartsOn - 0 for Sunday, 1 for Monday
 * @returns Array of day labels properly ordered
 */
export function getDaysOfWeekLabels(weekStartsOn: WeekStartDay): readonly string[] {
  if (weekStartsOn === 1) {
    return [...DAYS_OF_WEEK_LABELS.slice(1), DAYS_OF_WEEK_LABELS[0]];
  }
  return DAYS_OF_WEEK_LABELS;
}

/**
 * Calculate padding needed at start of month grid based on first day of month
 * @param firstDayOfMonth - Day of week (0-6, where 0 is Sunday)
 * @param weekStartsOn - 0 for Sunday, 1 for Monday
 * @returns Number of empty cells needed at start of grid
 */
export function getMonthStartPadding(firstDayOfMonth: number, weekStartsOn: WeekStartDay): number {
  if (weekStartsOn === 1) {
    return firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  }
  return firstDayOfMonth;
}

/**
 * Create padded days array for calendar grid
 * @param days - Array of dates in the month
 * @param startPadding - Number of empty cells at start
 * @returns Array with null values for padding followed by dates
 */
export function createPaddedDaysArray(days: Date[], startPadding: number): (Date | null)[] {
  return Array(startPadding).fill(null).concat(days);
}

/**
 * Update time component in a time object
 * @param currentTime - Current time object with hours and minutes
 * @param type - 'hours' or 'minutes'
 * @param value - New value for the time component
 * @returns New time object with updated value
 */
export function updateTimeComponent(
  currentTime: { hours: number; minutes: number },
  type: 'hours' | 'minutes',
  value: number,
): { hours: number; minutes: number } {
  return { ...currentTime, [type]: value };
}

/**
 * Create a date with specific time components
 * @param baseDate - Base date to copy
 * @param hours - Hours to set
 * @param minutes - Minutes to set
 * @returns New date with time set
 */
export function setDateTime(baseDate: Date, hours: number, minutes: number): Date {
  const newDate = new Date(baseDate);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

/**
 * Create an all-day date (time set to 00:00:00)
 * @param date - Date to convert
 * @returns New date with time set to start of day
 */
export function createAllDayDate(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}
