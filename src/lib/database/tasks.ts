import { settingsStore } from '$context/settingsContext';
import { getAllAccounts } from '$lib/database/accounts';
import { getDb, notifyListeners } from '$lib/database/connection';
import { rowToTask } from '$lib/database/converters';
import { getUIState, setSelectedTask } from '$lib/database/ui';
import { toAppleEpoch } from '$lib/ical';
import type { Task, TaskStatus } from '$types';
import type { TaskRow } from '$types/database';
import { generateUUID } from '$utils/misc';

export const getAllTasks = async (): Promise<Task[]> => {
  const database = await getDb();
  const rows = await database.select<TaskRow[]>('SELECT * FROM tasks');
  return rows.map(rowToTask);
};

export const getTaskById = async (id: string): Promise<Task | undefined> => {
  const database = await getDb();
  const rows = await database.select<TaskRow[]>('SELECT * FROM tasks WHERE id = $1', [id]);
  return rows.length > 0 ? rowToTask(rows[0]) : undefined;
};

export const getTaskByUid = async (uid: string): Promise<Task | undefined> => {
  const database = await getDb();
  const rows = await database.select<TaskRow[]>('SELECT * FROM tasks WHERE uid = $1', [uid]);
  return rows.length > 0 ? rowToTask(rows[0]) : undefined;
};

export const getTasksByCalendar = async (calendarId: string): Promise<Task[]> => {
  const database = await getDb();
  const rows = await database.select<TaskRow[]>('SELECT * FROM tasks WHERE calendar_id = $1', [
    calendarId,
  ]);
  return rows.map(rowToTask);
};

export const getTasksByTag = async (tagId: string): Promise<Task[]> => {
  const database = await getDb();
  const rows = await database.select<TaskRow[]>('SELECT * FROM tasks WHERE tags LIKE $1', [
    `%"${tagId}"%`,
  ]);
  return rows.map(rowToTask);
};

export const getChildTasks = async (parentUid: string): Promise<Task[]> => {
  const database = await getDb();
  const rows = await database.select<TaskRow[]>('SELECT * FROM tasks WHERE parent_uid = $1', [
    parentUid,
  ]);
  return rows.map(rowToTask);
};

export const countChildren = async (parentUid: string): Promise<number> => {
  const database = await getDb();
  const rows = await database.select<Array<{ count: number }>>(
    'SELECT COUNT(*) as count FROM tasks WHERE parent_uid = $1',
    [parentUid],
  );
  return rows[0]?.count || 0;
};

export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
  const database = await getDb();

  const now = new Date();
  const { defaultCalendarId, defaultPriority, defaultTags } = settingsStore.getState();

  // Get UI state for active context
  const uiState = await getUIState();

  // Determine calendar and account to use
  let calendarId = taskData.calendarId ?? uiState.activeCalendarId;
  let accountId = taskData.accountId ?? uiState.activeAccountId;

  // Handle tags
  let tags = taskData.tags ?? [];
  if (uiState.activeTagId && !tags.includes(uiState.activeTagId)) {
    tags = [uiState.activeTagId, ...tags];
  }
  if (tags.length === 0 && defaultTags.length > 0) {
    tags = [...defaultTags];
  }

  // If no active calendar, find one
  if (!calendarId) {
    const accounts = await getAllAccounts();
    if (defaultCalendarId) {
      for (const account of accounts) {
        const calendar = account.calendars.find((c) => c.id === defaultCalendarId);
        if (calendar) {
          calendarId = calendar.id;
          accountId = account.id;
          break;
        }
      }
    }

    if (!calendarId) {
      const firstAccount = accounts.find((a) => a.calendars.length > 0);
      if (firstAccount) {
        calendarId = firstAccount.calendars[0].id;
        accountId = firstAccount.id;
      }
    }
  }

  // Calculate sort order
  const maxOrderRows = await database.select<Array<{ max_order: number | null }>>(
    'SELECT MAX(sort_order) as max_order FROM tasks',
  );
  const maxSortOrder = maxOrderRows[0]?.max_order ?? toAppleEpoch(now.getTime()) - 1;

  // Determine if this is a local-only task
  const isLocalOnly = !calendarId || !accountId;

  const task: Task = {
    id: generateUUID(),
    uid: generateUUID(),
    title: taskData.title ?? 'New Task',
    description: taskData.description ?? '',
    status: 'needs-action',
    completed: false,
    priority: taskData.priority ?? defaultPriority,
    sortOrder: maxSortOrder + 1,
    accountId: accountId ?? '',
    calendarId: calendarId ?? '',
    synced: false,
    createdAt: now,
    modifiedAt: now,
    localOnly: isLocalOnly,
    ...taskData,
    tags,
  };

  await database.execute(
    `INSERT INTO tasks (
      id, uid, etag, href, title, description, completed, completed_at,
      tags, category_id, priority, start_date, start_date_all_day,
      due_date, due_date_all_day, created_at, modified_at, reminders,
      parent_uid, is_collapsed, sort_order, account_id,
      calendar_id, synced, local_only, url, status, percent_complete,
      rrule, repeat_from
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)`,
    [
      task.id,
      task.uid,
      task.etag || null,
      task.href || null,
      task.title,
      task.description,
      task.completed ? 1 : 0,
      task.completedAt ? task.completedAt.toISOString() : null,
      task.tags && task.tags.length > 0 ? JSON.stringify(task.tags) : null,
      task.categoryId || null,
      task.priority,
      task.startDate ? task.startDate.toISOString() : null,
      task.startDateAllDay ? 1 : 0,
      task.dueDate ? task.dueDate.toISOString() : null,
      task.dueDateAllDay ? 1 : 0,
      task.createdAt.toISOString(),
      task.modifiedAt.toISOString(),
      task.reminders && task.reminders.length > 0 ? JSON.stringify(task.reminders) : null,
      task.parentUid || null,
      task.isCollapsed ? 1 : 0,
      task.sortOrder,
      task.accountId || null,
      task.calendarId || null,
      task.synced ? 1 : 0,
      task.localOnly ? 1 : 0,
      task.url || null,
      task.status,
      task.percentComplete ?? null,
      task.rrule || null,
      task.repeatFrom ?? 0,
    ],
  );

  notifyListeners();
  return task;
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task | undefined> => {
  const database = await getDb();
  const existing = await getTaskById(id);
  if (!existing) return undefined;

  const merged: Task = {
    ...existing,
    ...updates,
    modifiedAt: updates.modifiedAt !== undefined ? updates.modifiedAt : new Date(),
    synced: updates.synced !== undefined ? updates.synced : false,
  };
  // Keep status and completed in sync
  if (updates.status !== undefined && updates.completed === undefined) {
    merged.completed = updates.status === 'completed';
  } else if (updates.completed !== undefined && updates.status === undefined) {
    merged.status = updates.completed ? 'completed' : 'needs-action';
  }
  const updatedTask = merged;

  await database.execute(
    `UPDATE tasks SET
      uid = $1, etag = $2, href = $3, title = $4, description = $5,
      completed = $6, completed_at = $7, tags = $8, category_id = $9,
      priority = $10, start_date = $11, start_date_all_day = $12,
      due_date = $13, due_date_all_day = $14, modified_at = $15,
      reminders = $16, parent_uid = $17, is_collapsed = $18,
      sort_order = $19, account_id = $20, calendar_id = $21, synced = $22,
      local_only = $23, url = $24, status = $25, percent_complete = $26,
      rrule = $27, repeat_from = $28
     WHERE id = $29`,
    [
      updatedTask.uid,
      updatedTask.etag || null,
      updatedTask.href || null,
      updatedTask.title,
      updatedTask.description,
      updatedTask.completed ? 1 : 0,
      updatedTask.completedAt ? updatedTask.completedAt.toISOString() : null,
      updatedTask.tags && updatedTask.tags.length > 0 ? JSON.stringify(updatedTask.tags) : null,
      updatedTask.categoryId || null,
      updatedTask.priority,
      updatedTask.startDate ? updatedTask.startDate.toISOString() : null,
      updatedTask.startDateAllDay ? 1 : 0,
      updatedTask.dueDate ? updatedTask.dueDate.toISOString() : null,
      updatedTask.dueDateAllDay ? 1 : 0,
      updatedTask.modifiedAt.toISOString(),
      updatedTask.reminders && updatedTask.reminders.length > 0
        ? JSON.stringify(updatedTask.reminders)
        : null,
      updatedTask.parentUid || null,
      updatedTask.isCollapsed ? 1 : 0,
      updatedTask.sortOrder,
      updatedTask.accountId || null,
      updatedTask.calendarId || null,
      updatedTask.synced ? 1 : 0,
      updatedTask.localOnly ? 1 : 0,
      updatedTask.url || null,
      updatedTask.status,
      updatedTask.percentComplete ?? null,
      updatedTask.rrule || null,
      updatedTask.repeatFrom ?? 0,
      id,
    ],
  );

  notifyListeners();
  return updatedTask;
};

export const deleteTask = async (id: string, deleteChildren: boolean = true) => {
  const database = await getDb();
  const task = await getTaskById(id);
  if (!task) return;

  // Get all descendants recursively
  const getAllDescendantIds = async (parentUid: string): Promise<string[]> => {
    const children = await getChildTasks(parentUid);
    const childIds = children.map((c) => c.id);
    const descendantIds = await Promise.all(children.map((c) => getAllDescendantIds(c.uid)));
    return [...childIds, ...descendantIds.flat()];
  };

  const descendantIds = await getAllDescendantIds(task.uid);
  const tasksToDeleteIds = deleteChildren ? [id, ...descendantIds] : [id];

  // Get tasks with href for pending deletions
  const tasksToDelete = await Promise.all(tasksToDeleteIds.map(getTaskById));
  const tasksWithHref = tasksToDelete.filter((t): t is Task => !!t && !!t.href);

  // Add to pending deletions
  for (const t of tasksWithHref) {
    await database.execute(
      `INSERT OR REPLACE INTO pending_deletions (uid, href, account_id, calendar_id)
       VALUES ($1, $2, $3, $4)`,
      [t.uid, t.href, t.accountId, t.calendarId],
    );
  }

  // If not deleting children, orphan them
  if (!deleteChildren) {
    await database.execute(
      `UPDATE tasks SET parent_uid = NULL, modified_at = $1, synced = 0 WHERE parent_uid = $2`,
      [new Date().toISOString(), task.uid],
    );
  }

  // Delete tasks
  const placeholders = tasksToDeleteIds.map((_, i) => `$${i + 1}`).join(', ');
  await database.execute(`DELETE FROM tasks WHERE id IN (${placeholders})`, tasksToDeleteIds);

  // Update UI state if selected task was deleted
  const uiState = await getUIState();
  if (tasksToDeleteIds.includes(uiState.selectedTaskId || '')) {
    await setSelectedTask(null);
  }

  notifyListeners();
};

export const toggleTaskComplete = async (id: string) => {
  const task = await getTaskById(id);
  if (!task) return;

  const newStatus: TaskStatus =
    task.status === 'completed'
      ? 'needs-action'
      : task.status === 'cancelled' || task.status === 'in-process'
        ? 'needs-action'
        : 'completed';
  await updateTask(id, {
    status: newStatus,
    completed: newStatus === 'completed',
    completedAt: newStatus === 'completed' ? new Date() : undefined,
    percentComplete: newStatus === 'completed' ? 100 : 0,
  });
};
