import { updateTag } from '$lib/database/tags';
import { loggers } from '$lib/logger';
import { loadDataStore, saveDataStore } from '$lib/store';

const log = loggers.dataStore;

export const reorderTags = (activeId: string, overId: string) => {
  if (activeId === overId) return;

  const data = loadDataStore();
  const tags = [...data.tags].sort((a, b) => a.sortOrder - b.sortOrder);
  const activeIndex = tags.findIndex((t) => t.id === activeId);
  const overIndex = tags.findIndex((t) => t.id === overId);

  if (activeIndex === -1 || overIndex === -1) return;

  // Move active to over position
  const [moved] = tags.splice(activeIndex, 1);
  tags.splice(overIndex, 0, moved);

  // Reassign sort orders with gaps
  const reordered = tags.map((tag, index) => ({
    ...tag,
    sortOrder: (index + 1) * 100,
  }));

  // Persist only the tags whose sort order actually changed
  for (const tag of reordered) {
    const original = data.tags.find((t) => t.id === tag.id);
    if (original?.sortOrder !== tag.sortOrder) {
      log.info(`Updating sort_order for tag "${tag.name}": ${tag.sortOrder}`);
      updateTag(tag.id, { sortOrder: tag.sortOrder }).catch((e) =>
        log.error('Failed to persist tag sort order:', e),
      );
    }
  }

  saveDataStore({ ...data, tags: reordered });
};
