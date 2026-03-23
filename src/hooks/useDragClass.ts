import { useEffect } from 'react';

/**
 * Adds `is-dragging` to <html> while `active` is truthy, which suppresses
 * hover states on all child elements (needed on WebKit) and shows a grabbing cursor.
 */
export const useDragClass = (active: boolean) => {
  useEffect(() => {
    if (active) {
      document.documentElement.classList.add('is-dragging');
      return () => document.documentElement.classList.remove('is-dragging');
    }
  }, [active]);
};
