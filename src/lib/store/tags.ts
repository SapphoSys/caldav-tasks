import { FALLBACK_ITEM_COLOR } from '$constants';
import {
  createTag as dbCreateTag,
  deleteTag as dbDeleteTag,
  updateTag as dbUpdateTag,
} from '$lib/database/tags';
import { updateTask as dbUpdateTask } from '$lib/database/tasks';
import { loggers } from '$lib/logger';
import { loadDataStore, saveDataStore } from '$lib/store';
import type { Tag } from '$types';
import { generateUUID } from '$utils/misc';

const log = loggers.dataStore;

export const getAllTags = () => {
  return loadDataStore().tags;
};

export const getTagById = (id: string) => {
  return loadDataStore().tags.find((t) => t.id === id);
};

export const createTag = (tagData: Partial<Tag>) => {
  const data = loadDataStore();

  const maxExistingOrder = data.tags.reduce((max, t) => Math.max(max, t.sortOrder), 0);

  const tag: Tag = {
    id: generateUUID(),
    name: tagData.name ?? 'New Tag',
    color: tagData.color ?? FALLBACK_ITEM_COLOR,
    icon: tagData.icon,
    emoji: tagData.emoji,
    sortOrder: tagData.sortOrder || maxExistingOrder + 100,
  } satisfies Tag;

  dbCreateTag(tag).catch((e) => log.error('Failed to persist tag:', e));

  saveDataStore({ ...data, tags: [...data.tags, tag] });
  return tag;
};

interface UpdateTagOptions {
  markTaskSyncDirty?: boolean;
}

export const updateTag = (id: string, updates: Partial<Tag>, options: UpdateTagOptions = {}) => {
  const data = loadDataStore();
  const currentTag = data.tags.find((tag) => tag.id === id);
  if (!currentTag) return undefined;

  const updatedTag = { ...currentTag, ...updates } satisfies Tag;

  const tags = data.tags.map((tag) => (tag.id === id ? updatedTag : tag));

  const shouldMarkTaskSyncDirty =
    options.markTaskSyncDirty !== false &&
    updates.color !== undefined &&
    updates.color !== currentTag.color;

  const now = new Date();
  const tasksToPersist: typeof data.tasks = [];

  const tasks = shouldMarkTaskSyncDirty
    ? data.tasks.map((task) => {
        if (!(task.tags ?? []).includes(id)) return task;

        const updatedTask = {
          ...task,
          modifiedAt: now,
          synced: false,
        };
        tasksToPersist.push(updatedTask);
        return updatedTask;
      })
    : data.tasks;

  dbUpdateTag(id, updates).catch((e) => log.error('Failed to persist tag update:', e));

  if (tasksToPersist.length > 0) {
    for (const task of tasksToPersist) {
      dbUpdateTask(task.id, task).catch((e) => log.error('Failed to persist task update:', e));
    }
  }

  saveDataStore({ ...data, tags, tasks });
  return updatedTag;
};

export const deleteTag = (id: string) => {
  const data = loadDataStore();
  const now = new Date();

  dbDeleteTag(id).catch((e) => log.error('Failed to persist tag deletion:', e));

  saveDataStore({
    ...data,
    tags: data.tags.filter((tag) => tag.id !== id),
    tasks: data.tasks.map((task) => {
      if (!(task.tags ?? []).includes(id)) {
        return task;
      }

      return {
        ...task,
        tags: (task.tags ?? []).filter((t) => t !== id),
        modifiedAt: now,
        synced: false,
      };
    }),
    ui: {
      ...data.ui,
      activeTagId: data.ui.activeTagId === id ? null : data.ui.activeTagId,
    },
  });
};
