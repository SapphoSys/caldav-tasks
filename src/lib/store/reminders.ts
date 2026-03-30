import { loadDataStore, saveDataStore } from '$lib/store';
import type { Reminder } from '$types';
import { generateUUID } from '$utils/misc';

export const addReminder = (taskId: string, trigger: Date) => {
  const data = loadDataStore();
  const reminder: Reminder = {
    id: generateUUID(),
    trigger,
  };
  const tasks = data.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          reminders: [...(task.reminders ?? []), reminder],
          modifiedAt: new Date(),
          synced: false,
        }
      : task,
  );
  saveDataStore({ ...data, tasks });
};

export const removeReminder = (taskId: string, reminderId: string) => {
  const data = loadDataStore();
  const tasks = data.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          reminders: (task.reminders ?? []).filter((r) => r.id !== reminderId),
          modifiedAt: new Date(),
          synced: false,
        }
      : task,
  );
  saveDataStore({ ...data, tasks });
};

export const updateReminder = (taskId: string, reminderId: string, trigger: Date) => {
  const data = loadDataStore();
  const tasks = data.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          reminders: (task.reminders ?? []).map((r) =>
            r.id === reminderId ? { ...r, trigger } : r,
          ),
          modifiedAt: new Date(),
          synced: false,
        }
      : task,
  );
  saveDataStore({ ...data, tasks });
};
