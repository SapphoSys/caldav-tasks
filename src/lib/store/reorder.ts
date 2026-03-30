import { loadDataStore, saveDataStore } from '$lib/store';
import { getSortedTasks } from '$lib/store/filters';
import type { FlattenedTask } from '$types/store';

export const reorderTasks = (
  activeId: string,
  overId: string,
  flattenedItems: FlattenedTask[],
  targetIndent?: number,
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: complex reordering logic is necessary and difficult to break down
) => {
  const data = loadDataStore();
  const tasks = data.tasks;
  const activeTask = tasks.find((t) => t.id === activeId);
  const overTask = tasks.find((t) => t.id === overId);

  if (!activeTask || !overTask) return;

  const activeIndex = flattenedItems.findIndex((t) => t.id === activeId);
  const overIndex = flattenedItems.findIndex((t) => t.id === overId);

  if (activeIndex === -1 || overIndex === -1) return;

  const overItem = flattenedItems[overIndex];
  const activeItem = flattenedItems[activeIndex];

  // Prevent dropping into own descendants
  if (overItem.ancestorIds.includes(activeId)) {
    return;
  }

  // Determine the effective indent level
  const effectiveIndent = targetIndent ?? overItem.depth;

  // Find the new parent based on the target indent
  let newParentUid: string | undefined;

  if (effectiveIndent > 0) {
    const searchStart =
      activeIndex === overIndex
        ? activeIndex - 1
        : activeIndex < overIndex
          ? overIndex
          : overIndex - 1;

    for (let i = searchStart; i >= 0; i--) {
      const candidate = flattenedItems[i];
      if (candidate.id === activeId) continue;

      if (candidate.depth === effectiveIndent - 1) {
        newParentUid = candidate.uid;
        break;
      }

      if (candidate.depth < effectiveIndent - 1) {
        break;
      }
    }

    if (!newParentUid && effectiveIndent > 0) {
      for (let i = (activeIndex === overIndex ? activeIndex : overIndex) - 1; i >= 0; i--) {
        const candidate = flattenedItems[i];
        if (candidate.id === activeId) continue;

        if (candidate.depth < effectiveIndent) {
          newParentUid = candidate.uid;
          break;
        }
      }
    }
  }

  // Get all items at the target parent level (excluding the task being moved and its descendants)
  const activeDescendantIds = new Set<string>();
  const collectDescendants = (taskId: string) => {
    for (const item of flattenedItems) {
      if (item.ancestorIds.includes(taskId)) {
        activeDescendantIds.add(item.id);
      }
    }
  };
  collectDescendants(activeId);

  // Get siblings at the target parent level, excluding active and its descendants
  const siblings = tasks.filter(
    (t) => t.parentUid === newParentUid && t.id !== activeId && !activeDescendantIds.has(t.id),
  );
  const sortedSiblings = getSortedTasks(siblings, data.ui.sortConfig);

  // Determine where to insert among siblings based on visual position
  let insertIndex = 0;

  // Find the last sibling that appears before the over position in the flattened list
  for (let i = overIndex; i >= 0; i--) {
    const item = flattenedItems[i];
    if (item.id === activeId || activeDescendantIds.has(item.id)) continue;

    if (item.parentUid === newParentUid) {
      // Found a sibling at the target level
      const siblingIndex = sortedSiblings.findIndex((s) => s.id === item.id);
      if (siblingIndex !== -1) {
        // If moving down, insert after this sibling; if moving up or same position, insert at this position
        if (activeIndex < overIndex) {
          insertIndex = siblingIndex + 1;
        } else {
          insertIndex = siblingIndex;
        }
        break;
      }
    } else if (item.uid === newParentUid) {
      // We've reached the parent itself, insert at the beginning
      insertIndex = 0;
      break;
    }
  }

  // If activeId === overId but indent changed, need to recalculate position
  if (activeId === overId && activeItem.parentUid !== newParentUid) {
    // Moving to a new parent at the same visual position
    // Find where in the new parent's children we should insert
    insertIndex = 0;
    for (let i = overIndex - 1; i >= 0; i--) {
      const item = flattenedItems[i];
      if (item.id === activeId || activeDescendantIds.has(item.id)) continue;

      if (item.parentUid === newParentUid) {
        const siblingIndex = sortedSiblings.findIndex((s) => s.id === item.id);
        if (siblingIndex !== -1) {
          insertIndex = siblingIndex + 1;
          break;
        }
      } else if (item.uid === newParentUid) {
        insertIndex = 0;
        break;
      }
    }
  }

  // Build new order with active task inserted at the right position
  const newOrder = [...sortedSiblings];
  newOrder.splice(Math.min(insertIndex, newOrder.length), 0, activeTask);

  // If the task is becoming a child of another task, inherit the parent's calendar
  let inheritedCalendarId: string | undefined;
  let inheritedAccountId: string | undefined;

  if (newParentUid && newParentUid !== activeTask.parentUid) {
    const parentTask = tasks.find((t) => t.uid === newParentUid);
    if (parentTask && parentTask.calendarId !== activeTask.calendarId) {
      inheritedCalendarId = parentTask.calendarId;
      inheritedAccountId = parentTask.accountId;
    }
  }

  // Assign sort orders with consistent gaps
  const updates: Map<
    string,
    { sortOrder: number; parentUid: string | undefined; calendarId?: string; accountId?: string }
  > = new Map();

  newOrder.forEach((task, index) => {
    const newSortOrder = (index + 1) * 100;
    const updateData: {
      sortOrder: number;
      parentUid: string | undefined;
      calendarId?: string;
      accountId?: string;
    } = {
      sortOrder: newSortOrder,
      parentUid: task.id === activeId ? newParentUid : task.parentUid,
    };

    if (task.id === activeId && inheritedCalendarId) {
      updateData.calendarId = inheritedCalendarId;
      updateData.accountId = inheritedAccountId;
    }

    updates.set(task.id, updateData);
  });

  // Also update all descendants of the moved task to inherit the new calendar
  const getAllDescendantIds = (parentUid: string): string[] => {
    const children = tasks.filter((t) => t.parentUid === parentUid);
    return children.flatMap((c) => [c.id, ...getAllDescendantIds(c.uid)]);
  };

  if (inheritedCalendarId) {
    const descendantIds = getAllDescendantIds(activeTask.uid);
    descendantIds.forEach((id) => {
      const existing = updates.get(id);
      if (existing) {
        existing.calendarId = inheritedCalendarId;
        existing.accountId = inheritedAccountId;
      } else {
        const task = tasks.find((t) => t.id === id);
        if (task) {
          updates.set(id, {
            sortOrder: task.sortOrder,
            parentUid: task.parentUid,
            calendarId: inheritedCalendarId,
            accountId: inheritedAccountId,
          });
        }
      }
    });
  }

  // Apply all updates
  const updatedTasks = tasks.map((task) => {
    const update = updates.get(task.id);
    if (update) {
      return {
        ...task,
        sortOrder: update.sortOrder,
        parentUid: update.parentUid,
        ...(update.calendarId && { calendarId: update.calendarId }),
        ...(update.accountId && { accountId: update.accountId }),
        synced: false,
        modifiedAt: new Date(),
      };
    }
    return task;
  });

  saveDataStore({ ...data, tasks: updatedTasks });
};
