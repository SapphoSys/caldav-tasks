import { FALLBACK_ITEM_COLOR } from '$constants';
import { getDb, notifyListeners } from '$lib/database/connection';
import { rowToTag } from '$lib/database/converters';
import { getTasksByTag, updateTask } from '$lib/database/tasks';
import { getUIState, setActiveTag } from '$lib/database/ui';
import type { Tag } from '$types';
import type { TagRow } from '$types/database';
import { generateUUID } from '$utils/misc';

export const getAllTags = async (): Promise<Tag[]> => {
  const database = await getDb();
  const rows = await database.select<TagRow[]>('SELECT * FROM tags ORDER BY sort_order ASC');
  return rows.map(rowToTag);
};

export const getTagById = async (id: string): Promise<Tag | undefined> => {
  const database = await getDb();
  const rows = await database.select<TagRow[]>('SELECT * FROM tags WHERE id = $1', [id]);
  return rows.length > 0 ? rowToTag(rows[0]) : undefined;
};

export const createTag = async (tagData: Partial<Tag>): Promise<Tag> => {
  const database = await getDb();

  const maxOrderRow = await database.select<[{ max_order: number | null }]>(
    'SELECT MAX(sort_order) as max_order FROM tags',
  );
  const maxOrder = maxOrderRow[0]?.max_order ?? 0;

  const tag: Tag = {
    id: generateUUID(),
    name: tagData.name ?? 'New Tag',
    color: tagData.color ?? FALLBACK_ITEM_COLOR,
    icon: tagData.icon,
    emoji: tagData.emoji,
    sortOrder: tagData.sortOrder || maxOrder + 100,
  };

  await database.execute(
    `INSERT INTO tags (id, name, color, icon, emoji, sort_order) VALUES ($1, $2, $3, $4, $5, $6)`,
    [tag.id, tag.name, tag.color, tag.icon || null, tag.emoji || null, tag.sortOrder],
  );

  notifyListeners();
  return tag;
};

export const updateTag = async (id: string, updates: Partial<Tag>): Promise<Tag | undefined> => {
  const database = await getDb();
  const existing = await getTagById(id);
  if (!existing) return undefined;

  const updatedTag: Tag = { ...existing, ...updates };

  await database.execute(
    `UPDATE tags SET name = $1, color = $2, icon = $3, emoji = $4, sort_order = $5 WHERE id = $6`,
    [
      updatedTag.name,
      updatedTag.color,
      updatedTag.icon || null,
      updatedTag.emoji || null,
      updatedTag.sortOrder,
      id,
    ],
  );

  notifyListeners();
  return updatedTag;
};

export const deleteTag = async (id: string) => {
  const database = await getDb();

  // Remove tag from all tasks
  const tasks = await getTasksByTag(id);
  for (const task of tasks) {
    const newTags = (task.tags ?? []).filter((t) => t !== id);
    await updateTask(task.id, { tags: newTags });
  }

  await database.execute('DELETE FROM tags WHERE id = $1', [id]);

  // Update UI state if this was the active tag
  const uiState = await getUIState();
  if (uiState.activeTagId === id) {
    await setActiveTag(null);
  }

  notifyListeners();
};
