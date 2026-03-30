import { getAllAccounts } from '$lib/database/accounts';
import { getDb, notifyListeners } from '$lib/database/connection';
import { rowToCalendar } from '$lib/database/converters';
import { getTasksByCalendar } from '$lib/database/tasks';
import { getUIState } from '$lib/database/ui';
import { loggers } from '$lib/logger';
import type { Calendar } from '$types';
import type { CalendarRow } from '$types/database';
import { generateUUID } from '$utils/misc';

const log = loggers.database;

export const addCalendar = async (accountId: string, calendarData: Partial<Calendar>) => {
  const database = await getDb();

  // Use provided sortOrder, or place at the end of the account's calendars
  let sortOrder = calendarData.sortOrder ?? 0;
  if (!sortOrder) {
    const maxRows = await database.select<Array<{ max_order: number | null }>>(
      'SELECT MAX(sort_order) as max_order FROM calendars WHERE account_id = $1',
      [accountId],
    );
    sortOrder = (maxRows[0]?.max_order ?? 0) + 100;
  }

  const calendarId = calendarData.id ?? generateUUID();
  const displayName = calendarData.displayName ?? 'Tasks';
  const url = calendarData.url ?? '';

  log.debug(`Adding calendar: ${displayName} with ID: ${calendarId}`);

  await database.execute(
    `INSERT INTO calendars (id, account_id, display_name, url, ctag, sync_token, color, icon, emoji, supported_components, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      calendarId,
      accountId,
      displayName,
      url,
      calendarData.ctag || null,
      calendarData.syncToken || null,
      calendarData.color || null,
      calendarData.icon || null,
      calendarData.emoji || null,
      calendarData.supportedComponents ? JSON.stringify(calendarData.supportedComponents) : null,
      sortOrder,
    ],
  );

  // Set as active calendar if none set
  const uiState = await getUIState();
  if (!uiState.activeCalendarId) {
    await database.execute(`UPDATE ui_state SET active_calendar_id = $1 WHERE id = 1`, [
      calendarId,
    ]);
  }

  notifyListeners();
};

export const updateCalendar = async (calendarId: string, updates: Partial<Calendar>) => {
  const database = await getDb();

  const rows = await database.select<CalendarRow[]>('SELECT * FROM calendars WHERE id = $1', [
    calendarId,
  ]);

  if (rows.length === 0) {
    log.warn(`Calendar ${calendarId} not found for update`);
    return;
  }

  const existing = rowToCalendar(rows[0]);
  const updated = { ...existing, ...updates };

  await database.execute(
    `UPDATE calendars SET
      display_name = $1,
      url = $2,
      ctag = $3,
      sync_token = $4,
      color = $5,
      icon = $6,
      emoji = $7,
      supported_components = $8,
      sort_order = $9
    WHERE id = $10`,
    [
      updated.displayName,
      updated.url,
      updated.ctag || null,
      updated.syncToken || null,
      updated.color || null,
      updated.icon || null,
      updated.emoji || null,
      updated.supportedComponents ? JSON.stringify(updated.supportedComponents) : null,
      updated.sortOrder ?? 0,
      calendarId,
    ],
  );

  notifyListeners();
};

export const deleteCalendar = async (_accountId: string, calendarId: string) => {
  const database = await getDb();

  // Get tasks to track for server deletion
  const tasks = await getTasksByCalendar(calendarId);
  const tasksWithHref = tasks.filter((t) => t.href);

  for (const t of tasksWithHref) {
    await database.execute(
      `INSERT OR REPLACE INTO pending_deletions (uid, href, account_id, calendar_id)
       VALUES ($1, $2, $3, $4)`,
      [t.uid, t.href, t.accountId, t.calendarId],
    );
  }

  // Delete calendar (tasks cascade)
  await database.execute('DELETE FROM calendars WHERE id = $1', [calendarId]);

  // Update UI state
  const uiState = await getUIState();
  if (uiState.activeCalendarId === calendarId) {
    const accounts = await getAllAccounts();
    const otherCalendars = accounts.flatMap((a) => a.calendars).filter((c) => c.id !== calendarId);
    await database.execute(`UPDATE ui_state SET active_calendar_id = $1 WHERE id = 1`, [
      otherCalendars[0]?.id || null,
    ]);
  }

  notifyListeners();
};
