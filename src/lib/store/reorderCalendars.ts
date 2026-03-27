/**
 * Calendar reordering operations
 */

import * as db from '$lib/database';
import { loggers } from '$lib/logger';
import { loadDataStore, saveDataStore } from '$lib/store';

const log = loggers.dataStore;

export const reorderCalendars = (accountId: string, activeId: string, overId: string) => {
  if (activeId === overId) return;

  const data = loadDataStore();
  const account = data.accounts.find((a) => a.id === accountId);
  if (!account) return;

  const calendars = [...account.calendars].sort((a, b) => a.sortOrder - b.sortOrder);
  const activeIndex = calendars.findIndex((c) => c.id === activeId);
  const overIndex = calendars.findIndex((c) => c.id === overId);

  if (activeIndex === -1 || overIndex === -1) return;

  // Move active to over position
  const [moved] = calendars.splice(activeIndex, 1);
  calendars.splice(overIndex, 0, moved);

  // Reassign sort orders with gaps
  const reordered = calendars.map((cal, index) => ({
    ...cal,
    sortOrder: (index + 1) * 100,
  }));

  // Persist only the calendars whose sort order actually changed
  for (const cal of reordered) {
    const original = account.calendars.find((c) => c.id === cal.id);
    if (original?.sortOrder !== cal.sortOrder) {
      log.info(`Updating sort_order for calendar "${cal.displayName}": ${cal.sortOrder}`);
      db.updateCalendar(cal.id, { sortOrder: cal.sortOrder }).catch((e) =>
        log.error('Failed to persist calendar sort order:', e),
      );
    }
  }

  saveDataStore({
    ...data,
    accounts: data.accounts.map((acc) =>
      acc.id === accountId ? { ...acc, calendars: reordered } : acc,
    ),
  });
};
