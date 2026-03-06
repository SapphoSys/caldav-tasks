/**
 * Subtask operations
 */

import { loadDataStore, saveDataStore } from '$lib/store';
import type { Subtask } from '$types/index';
import { generateUUID } from '$utils/misc';

export const addSubtask = (taskId: string, title: string) => {
  const data = loadDataStore();

  const subtask: Subtask = {
    id: generateUUID(),
    title,
    completed: false,
  } satisfies Subtask;

  const tasks = data.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          subtasks: [...task.subtasks, subtask],
          modifiedAt: new Date(),
          synced: false,
        }
      : task,
  );
  saveDataStore({ ...data, tasks });
};

export const updateSubtask = (taskId: string, subtaskId: string, updates: Partial<Subtask>) => {
  const data = loadDataStore();
  const tasks = data.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          subtasks: task.subtasks.map((st) => (st.id === subtaskId ? { ...st, ...updates } : st)),
          modifiedAt: new Date(),
          synced: false,
        }
      : task,
  );
  saveDataStore({ ...data, tasks });
};

export const deleteSubtask = (taskId: string, subtaskId: string) => {
  const data = loadDataStore();
  const tasks = data.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
          modifiedAt: new Date(),
          synced: false,
        }
      : task,
  );
  saveDataStore({ ...data, tasks });
};

export const toggleSubtaskComplete = (taskId: string, subtaskId: string) => {
  const data = loadDataStore();
  const tasks = data.tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          subtasks: task.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st,
          ),
          modifiedAt: new Date(),
          synced: false,
        }
      : task,
  );
  saveDataStore({ ...data, tasks });
};
