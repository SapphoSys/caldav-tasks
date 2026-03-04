/**
 * UI styling utility functions
 */

/**
 * Get button classes for confirm dialog buttons
 * @param isDestructive - Whether the button is destructive (red)
 * @param isPrimary - Whether the button is primary (blue)
 * @returns Tailwind class string
 */
export const getButtonClasses = (isDestructive: boolean, isPrimary: boolean) => {
  if (isDestructive) {
    return 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/50 text-white';
  }

  if (isPrimary) {
    return 'bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/50 text-white';
  }

  return 'border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700';
};
