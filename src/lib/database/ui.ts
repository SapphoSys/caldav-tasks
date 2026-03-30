import {
  DEFAULT_ACCOUNT_SORT_CONFIG,
  DEFAULT_CALENDAR_SORT_CONFIG,
  DEFAULT_SORT_CONFIG,
  DEFAULT_TAG_SORT_CONFIG,
} from '$constants';
import { getDb, notifyListeners } from '$lib/database/connection';
import type {
  AccountSortConfig,
  AccountSortMode,
  CalendarSortConfig,
  CalendarSortMode,
  SortConfig,
  SortDirection,
  SortMode,
  TagSortConfig,
  TagSortMode,
} from '$types';
import type { UIStateRow } from '$types/database';

export interface UIState {
  activeAccountId: string | null;
  activeCalendarId: string | null;
  activeTagId: string | null;
  selectedTaskId: string | null;
  searchQuery: string;
  sortConfig: SortConfig;
  accountSortConfig: AccountSortConfig;
  calendarSortConfig: CalendarSortConfig;
  tagSortConfig: TagSortConfig;
  showCompletedTasks: boolean;
  showUnstartedTasks: boolean;
  isEditorOpen: boolean;
}

export const defaultUIState: UIState = {
  activeAccountId: null,
  activeCalendarId: null,
  activeTagId: null,
  selectedTaskId: null,
  searchQuery: '',
  sortConfig: DEFAULT_SORT_CONFIG,
  accountSortConfig: DEFAULT_ACCOUNT_SORT_CONFIG,
  calendarSortConfig: DEFAULT_CALENDAR_SORT_CONFIG,
  tagSortConfig: DEFAULT_TAG_SORT_CONFIG,
  showCompletedTasks: true,
  showUnstartedTasks: true,
  isEditorOpen: false,
};

export const getUIState = async (): Promise<UIState> => {
  const database = await getDb();
  const rows = await database.select<UIStateRow[]>('SELECT * FROM ui_state WHERE id = 1');

  if (rows.length === 0) {
    return defaultUIState;
  }

  const row = rows[0];
  return {
    activeAccountId: row.active_account_id,
    activeCalendarId: row.active_calendar_id,
    activeTagId: row.active_tag_id,
    selectedTaskId: row.selected_task_id,
    searchQuery: row.search_query,
    sortConfig: {
      mode: row.sort_mode as SortMode,
      direction: row.sort_direction as SortDirection,
    },
    accountSortConfig: {
      mode: (row.account_sort_mode ?? 'manual') as AccountSortMode,
      direction: (row.account_sort_direction ?? 'asc') as SortDirection,
    },
    calendarSortConfig: {
      mode: (row.calendar_sort_mode ?? 'manual') as CalendarSortMode,
      direction: (row.calendar_sort_direction ?? 'asc') as SortDirection,
    },
    tagSortConfig: {
      mode: (row.tag_sort_mode ?? 'manual') as TagSortMode,
      direction: (row.tag_sort_direction ?? 'asc') as SortDirection,
    },
    showCompletedTasks: row.show_completed_tasks === 1,
    showUnstartedTasks: row.show_unstarted_tasks === 1,
    isEditorOpen: row.is_editor_open === 1,
  };
};

export const setActiveAccount = async (id: string | null) => {
  const database = await getDb();
  await database.execute(
    `UPDATE ui_state SET active_account_id = $1, active_calendar_id = NULL WHERE id = 1`,
    [id],
  );
  notifyListeners();
};

export const setActiveCalendar = async (id: string | null) => {
  const database = await getDb();
  await database.execute(
    `UPDATE ui_state SET active_calendar_id = $1, active_tag_id = NULL, selected_task_id = NULL, is_editor_open = 0 WHERE id = 1`,
    [id],
  );
  notifyListeners();
};

export const setActiveTag = async (id: string | null) => {
  const database = await getDb();
  await database.execute(
    `UPDATE ui_state SET active_tag_id = $1, active_calendar_id = NULL, selected_task_id = NULL, is_editor_open = 0 WHERE id = 1`,
    [id],
  );
  notifyListeners();
};

export const setAllTasksView = async () => {
  const database = await getDb();
  await database.execute(
    `UPDATE ui_state SET active_calendar_id = NULL, active_tag_id = NULL, selected_task_id = NULL, is_editor_open = 0 WHERE id = 1`,
    [],
  );
  notifyListeners();
};

export const setSelectedTask = async (id: string | null) => {
  const database = await getDb();
  await database.execute(
    `UPDATE ui_state SET selected_task_id = $1, is_editor_open = $2 WHERE id = 1`,
    [id, id !== null ? 1 : 0],
  );
  notifyListeners();
};

export const setEditorOpen = async (open: boolean) => {
  const database = await getDb();
  const uiState = await getUIState();
  await database.execute(
    `UPDATE ui_state SET is_editor_open = $1, selected_task_id = $2 WHERE id = 1`,
    [open ? 1 : 0, open ? uiState.selectedTaskId : null],
  );
  notifyListeners();
};

export const setSearchQuery = async (query: string) => {
  const database = await getDb();
  await database.execute(`UPDATE ui_state SET search_query = $1 WHERE id = 1`, [query]);
  notifyListeners();
};

export const setSortConfig = async (config: SortConfig) => {
  const database = await getDb();
  await database.execute(`UPDATE ui_state SET sort_mode = $1, sort_direction = $2 WHERE id = 1`, [
    config.mode,
    config.direction,
  ]);
  notifyListeners();
};

export const setAccountSortConfig = async (config: AccountSortConfig) => {
  const database = await getDb();
  await database.execute(
    `UPDATE ui_state SET account_sort_mode = $1, account_sort_direction = $2 WHERE id = 1`,
    [config.mode, config.direction],
  );
  notifyListeners();
};

export const setCalendarSortConfig = async (config: CalendarSortConfig) => {
  const database = await getDb();
  await database.execute(
    `UPDATE ui_state SET calendar_sort_mode = $1, calendar_sort_direction = $2 WHERE id = 1`,
    [config.mode, config.direction],
  );
  notifyListeners();
};

export const setTagSortConfig = async (config: TagSortConfig) => {
  const database = await getDb();
  await database.execute(
    `UPDATE ui_state SET tag_sort_mode = $1, tag_sort_direction = $2 WHERE id = 1`,
    [config.mode, config.direction],
  );
  notifyListeners();
};

export const setShowCompletedTasks = async (show: boolean) => {
  const database = await getDb();
  await database.execute(`UPDATE ui_state SET show_completed_tasks = $1 WHERE id = 1`, [
    show ? 1 : 0,
  ]);
  notifyListeners();
};

export const setShowUnstartedTasks = async (show: boolean) => {
  const database = await getDb();
  await database.execute(`UPDATE ui_state SET show_unstarted_tasks = $1 WHERE id = 1`, [
    show ? 1 : 0,
  ]);
  notifyListeners();
};
