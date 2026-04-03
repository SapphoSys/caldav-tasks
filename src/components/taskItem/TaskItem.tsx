import type { AnimateLayoutChanges } from '@dnd-kit/sortable';
import { defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import Check from 'lucide-react/icons/check';
import ChevronRight from 'lucide-react/icons/chevron-right';
import Clock from 'lucide-react/icons/clock';
import Loader from 'lucide-react/icons/loader';
import X from 'lucide-react/icons/x';
import { useEffect, useRef, useState } from 'react';
import { TaskContextMenu } from '$components/TaskContextMenu';
import { TaskItemBadges } from '$components/taskItem/TaskItemBadges';
import { getPriorityColor, getPriorityRingColor } from '$constants/priority';
import { useAccounts } from '$hooks/queries/useAccounts';
import { useToggleTaskComplete } from '$hooks/queries/useTasks';
import {
  useSetActiveAccount,
  useSetActiveCalendar,
  useSetActiveTag,
  useSetEditorOpen,
  useSetSelectedTask,
  useUIState,
} from '$hooks/queries/useUIState';
import { useSettingsStore } from '$hooks/store/useSettingsStore';
import { useContextMenu } from '$hooks/ui/useContextMenu';
import { filterCalDavDescription } from '$lib/ical/vtodo';
import { toggleTaskCollapsed } from '$lib/store/tasks';
import type { Task } from '$types';
import { getContrastTextColor } from '$utils/color';
import { formatDueDate } from '$utils/date';

// Moved outside component — does not close over any component state
const animateLayoutChanges: AnimateLayoutChanges = (args) => {
  const { isSorting, wasDragging } = args;
  if (wasDragging || !isSorting) return false;
  return defaultAnimateLayoutChanges(args);
};

interface TaskItemProps {
  task: Task;
  depth: number;
  ancestorIds: string[];
  isDragEnabled: boolean;
  isOverlay?: boolean;
}

export const TaskItem = ({ task, depth, ancestorIds, isDragEnabled, isOverlay }: TaskItemProps) => {
  const { data: uiState } = useUIState();
  const { data: accounts = [] } = useAccounts();
  const toggleTaskCompleteMutation = useToggleTaskComplete();
  const setSelectedTaskMutation = useSetSelectedTask();
  const setEditorOpenMutation = useSetEditorOpen();
  const setActiveTagMutation = useSetActiveTag();
  const setActiveCalendarMutation = useSetActiveCalendar();
  const setActiveAccountMutation = useSetActiveAccount();
  const { accentColor, taskListDensity, taskBadgeVisibility } = useSettingsStore();
  const { contextMenu, handleContextMenu, handleCloseContextMenu, setContextMenu } =
    useContextMenu();

  // Ref for the task element to manage focus
  const taskElementRef = useRef<HTMLDivElement>(null);

  const selectedTaskId = uiState?.selectedTaskId ?? null;
  const activeCalendarId = uiState?.activeCalendarId ?? null;
  const showCompletedTasks = uiState?.showCompletedTasks ?? true;
  const isEditorOpen = uiState?.isEditorOpen ?? false;
  const isSelected = selectedTaskId === task.id;

  // Focus the task element when it becomes selected via keyboard navigation
  useEffect(() => {
    if (isSelected && !isOverlay) {
      // Only focus if this element is not already focused
      // This prevents re-focusing when clicking with mouse
      if (document.activeElement !== taskElementRef.current) {
        taskElementRef.current?.focus();
      }
    }
  }, [isSelected, isOverlay]);

  // get contrast color for checkbox checkmark
  const checkmarkColor = getContrastTextColor(accentColor);

  // pass ancestorIds as data so it can be accessed in handleDragEnd
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: task.id,
    disabled: !isDragEnabled,
    data: { ancestorIds },
    animateLayoutChanges,
  });

  // Merge refs: need both sortable's setNodeRef and our taskElementRef for focus management
  const mergedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    taskElementRef.current = node;
  };

  // Disable all transitions - items will snap to positions immediately.
  // This prevents the "jumping" animation when drag ends and displaced items
  // return to their natural positions.
  // Use opacity: 0 instead of visibility: hidden for instant hiding without flash.
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: 'none',
    opacity: isDragging ? 0 : undefined,
    pointerEvents: isDragging ? 'none' : undefined,
  };

  const dueDateDisplay = task.dueDate ? formatDueDate(task.dueDate) : null;
  const isUnstarted = task.startDate && new Date(task.startDate) > new Date();

  const handleClick = (e: React.MouseEvent) => {
    // don't select if clicking the checkbox or collapse button
    if (
      (e.target as HTMLElement).closest('.task-checkbox-wrapper') ||
      (e.target as HTMLElement).closest('.collapse-button')
    ) {
      return;
    }

    // If the task is already selected and editor is open, close the editor
    if (isSelected && isEditorOpen) {
      setEditorOpenMutation.mutate(false);
      return;
    }

    setSelectedTaskMutation.mutate(task.id);
  };

  const [flashComplete, setFlashComplete] = useState(false);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // For recurring tasks that will advance (not permanently complete), briefly flash
    // the completed state so the user can tell their click registered.
    if (task.rrule && task.status !== 'completed') {
      setFlashComplete(true);
      flashTimerRef.current = setTimeout(() => setFlashComplete(false), 600);
    }
    toggleTaskCompleteMutation.mutate(task.id);
  };

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const handleToggleCollapsed = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskCollapsed(task.id);
  };

  // todo: implement duplicate functionality at some point

  // calculate left margin based on depth
  const marginLeft = depth * 24; // 24px per level
  const paddingLeft = 12 + depth * 4;

  return (
    <>
      {/* biome-ignore lint/a11y/useSemanticElements: Task item div contains complex drag-drop layout that button element can't support */}
      <div
        ref={mergedRef}
        style={{ ...style, marginLeft: `${marginLeft}px`, paddingLeft: `${paddingLeft}px` }}
        {...attributes}
        {...(isDragEnabled ? listeners : {})}
        onClick={handleClick}
        onKeyDown={(e) => e.key === 'Enter' && handleClick(e as unknown as React.MouseEvent)}
        onContextMenu={handleContextMenu}
        role="button"
        tabIndex={0}
        data-context-menu
        className={`
          group relative flex items-start gap-3 pr-3 ${taskListDensity === 'compact' ? 'py-2' : 'py-3'} rounded-lg border transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-900
          ${contextMenu && !isOverlay ? 'bg-surface-100 dark:bg-surface-700/60' : 'bg-white dark:bg-surface-800'}
          ${isOverlay ? 'shadow-xl' : 'shadow-sm hover:shadow-md'}
          ${isSelected ? '' : task.priority === 'none' ? 'border-surface-200 dark:border-surface-700' : ''}
          ${task.status === 'completed' || task.status === 'cancelled' ? 'opacity-60' : isUnstarted ? 'opacity-70' : ''}
          ${isDragEnabled ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
          ${!isOverlay ? 'hover:bg-surface-50 dark:hover:bg-surface-800/70' : ''}
          ${isSelected && `border-transparent ${getPriorityRingColor(task.priority)}`}
          ${getPriorityColor(task.priority)}
        `}
      >
        <div className="task-checkbox-wrapper flex-shrink-0">
          <button
            type="button"
            onClick={handleCheckboxClick}
            title={
              task.status === 'cancelled'
                ? 'Cancelled'
                : task.status === 'in-process'
                  ? 'In Progress'
                  : task.status === 'completed'
                    ? 'Completed — click to reopen'
                    : 'Mark complete'
            }
            className={`
              w-5 h-5 rounded border-2 flex items-center justify-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset
              ${
                task.status === 'completed' || flashComplete
                  ? 'bg-primary-500 border-primary-500'
                  : task.status === 'cancelled'
                    ? 'bg-rose-400 border-rose-400 dark:bg-rose-500 dark:border-rose-500'
                    : task.status === 'in-process'
                      ? 'bg-blue-400 border-blue-400 dark:bg-blue-500 dark:border-blue-500'
                      : 'border-surface-300 dark:border-surface-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30'
              }
            `}
          >
            {(task.status === 'completed' || flashComplete) && (
              <Check className="w-4 h-4" style={{ color: checkmarkColor }} strokeWidth={3} />
            )}
            {task.status === 'cancelled' && (
              <X className="w-4 h-4 text-white dark:text-surface-200" strokeWidth={3} />
            )}
            {task.status === 'in-process' && (
              <Loader className="w-4 h-4 text-white dark:text-blue-100" />
            )}
          </button>
        </div>

        <div className="flex-1 min-w-0">
          {taskListDensity === 'compact' ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                <div
                  className={`text-sm font-medium truncate shrink min-w-0 ${
                    task.status === 'completed'
                      ? 'line-through text-surface-400'
                      : task.status === 'cancelled'
                        ? 'line-through text-surface-400 dark:text-surface-500'
                        : isUnstarted
                          ? 'text-surface-500 dark:text-surface-400'
                          : 'text-surface-800 dark:text-surface-200'
                  }`}
                >
                  {task.title || <span className="text-surface-400 italic">Untitled task</span>}
                </div>

                <TaskItemBadges
                  task={task}
                  accounts={accounts}
                  activeCalendarId={activeCalendarId}
                  showCompletedTasks={showCompletedTasks}
                  onTagClick={(tagId) => setActiveTagMutation.mutate(tagId)}
                  onCalendarClick={(calendarId) => {
                    const account = accounts.find((a) =>
                      a.calendars.some((c) => c.id === calendarId),
                    );
                    if (account) setActiveAccountMutation.mutate(account.id);
                    setActiveCalendarMutation.mutate(calendarId);
                  }}
                  onToggleCollapsed={handleToggleCollapsed}
                  compact={true}
                  badgeVisibility={taskBadgeVisibility}
                />
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {taskBadgeVisibility.dueDate && dueDateDisplay && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${dueDateDisplay.className}`}
                  >
                    <Clock className="w-3 h-3" />
                    {dueDateDisplay.text}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`text-sm font-medium leading-5 truncate flex-1 min-w-0 ${
                    task.status === 'completed'
                      ? 'line-through text-surface-400'
                      : task.status === 'cancelled'
                        ? 'line-through text-surface-400 dark:text-surface-500'
                        : isUnstarted
                          ? 'text-surface-500 dark:text-surface-400'
                          : 'text-surface-800 dark:text-surface-200'
                  }`}
                >
                  {task.title || <span className="text-surface-400 italic">Untitled task</span>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {dueDateDisplay && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${dueDateDisplay.className}`}
                    >
                      <Clock className="w-3 h-3" />
                      {dueDateDisplay.text}
                    </span>
                  )}
                </div>
              </div>
              {filterCalDavDescription(task.description) && (
                <div
                  className={`text-xs mt-1 line-clamp-1 ${task.status === 'completed' || task.status === 'cancelled' ? 'text-surface-400 dark:text-surface-500' : 'text-surface-500 dark:text-surface-400'}`}
                >
                  {filterCalDavDescription(task.description)}
                </div>
              )}
              <TaskItemBadges
                task={task}
                accounts={accounts}
                activeCalendarId={activeCalendarId}
                showCompletedTasks={showCompletedTasks}
                onTagClick={(tagId) => setActiveTagMutation.mutate(tagId)}
                onCalendarClick={(calendarId) => {
                  const account = accounts.find((a) =>
                    a.calendars.some((c) => c.id === calendarId),
                  );
                  if (account) setActiveAccountMutation.mutate(account.id);
                  setActiveCalendarMutation.mutate(calendarId);
                }}
                onToggleCollapsed={handleToggleCollapsed}
                compact={false}
                badgeVisibility={taskBadgeVisibility}
              />
            </>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-surface-300 dark:text-surface-600 group-hover:text-surface-500 dark:group-hover:text-surface-400 transition-colors flex-shrink-0" />
      </div>

      {contextMenu && (
        <TaskContextMenu
          task={task}
          contextMenu={contextMenu}
          onClose={handleCloseContextMenu}
          setContextMenu={setContextMenu}
        />
      )}
    </>
  );
};
