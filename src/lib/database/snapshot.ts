import { getAllAccounts } from '$lib/database/accounts';
import type { PendingDeletion } from '$lib/database/pendingDeletions';
import { getPendingDeletions } from '$lib/database/pendingDeletions';
import { getAllTags } from '$lib/database/tags';
import { getAllTasks } from '$lib/database/tasks';
import type { UIState } from '$lib/database/ui';
import { getUIState, setAllTasksView } from '$lib/database/ui';
import { loggers } from '$lib/logger';
import type { Account, Tag, Task } from '$types/index';

const log = loggers.database;

// Complete data store interface
export interface DataStore {
  tasks: Task[];
  tags: Tag[];
  accounts: Account[];
  pendingDeletions: PendingDeletion[];
  ui: UIState;
}

export const getDataSnapshot = async (): Promise<DataStore> => {
  const [tasks, tags, accounts, pendingDeletions, ui] = await Promise.all([
    getAllTasks(),
    getAllTags(),
    getAllAccounts(),
    getPendingDeletions(),
    getUIState(),
  ]);

  // Validate and clean up stale UI state references
  let cleanedUI = ui;
  let needsUpdate = false;

  // Check if active calendar still exists
  if (ui.activeCalendarId) {
    const calendarExists = accounts.some((account) =>
      account.calendars.some((calendar) => calendar.id === ui.activeCalendarId),
    );
    if (!calendarExists) {
      log.warn('Active calendar no longer exists, clearing UI state', {
        staleCalendarId: ui.activeCalendarId,
      });
      cleanedUI = {
        ...cleanedUI,
        activeCalendarId: null,
        activeAccountId: null,
        selectedTaskId: null,
      };
      needsUpdate = true;
    }
  }

  // Check if active tag still exists
  if (ui.activeTagId) {
    const tagExists = tags.some((tag) => tag.id === ui.activeTagId);
    if (!tagExists) {
      log.warn('Active tag no longer exists, clearing UI state', {
        staleTagId: ui.activeTagId,
      });
      cleanedUI = {
        ...cleanedUI,
        activeTagId: null,
        activeAccountId: null,
        selectedTaskId: null,
      };
      needsUpdate = true;
    }
  }

  // Persist cleaned state back to database if needed
  if (needsUpdate) {
    await setAllTasksView();
    log.info('Stale UI state cleaned up');
  }

  return { tasks, tags, accounts, pendingDeletions, ui: cleanedUI };
};
