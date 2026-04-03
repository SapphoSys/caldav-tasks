import { openUrl } from '@tauri-apps/plugin-opener';
import CalendarClock from 'lucide-react/icons/calendar-clock';
import CheckCircle2 from 'lucide-react/icons/check-circle-2';
import ChevronDown from 'lucide-react/icons/chevron-down';
import ChevronRight from 'lucide-react/icons/chevron-right';
import Link from 'lucide-react/icons/link';
import Loader from 'lucide-react/icons/loader';
import RefreshCw from 'lucide-react/icons/refresh-cw';
import { FALLBACK_ITEM_COLOR } from '$constants';
import { getIconByName } from '$constants/icons';
import { getAllTags } from '$lib/store/tags';
import { countChildren, getChildTasks } from '$lib/store/tasks';
import type { Account, Task } from '$types';
import { formatStartDate } from '$utils/date';
import { pluralize } from '$utils/misc';

interface TaskItemBadgesProps {
  task: Task;
  accounts: Account[];
  activeCalendarId: string | null;
  showCompletedTasks: boolean;
  onTagClick: (tagId: string) => void;
  onCalendarClick: (calendarId: string) => void;
  onToggleCollapsed: (e: React.MouseEvent) => void;
  compact: boolean;
  badgeVisibility: {
    startDate: boolean;
    dueDate: boolean;
    tags: boolean;
    calendar: boolean;
    url: boolean;
    status: boolean;
    repeat: boolean;
    subtasks: boolean;
  };
}

export const TaskItemBadges = ({
  task,
  accounts,
  activeCalendarId,
  showCompletedTasks,
  onTagClick,
  onCalendarClick,
  onToggleCollapsed,
  compact,
  badgeVisibility,
}: TaskItemBadgesProps) => {
  const allChildTasks = getChildTasks(task.uid);
  const hiddenChildCount = !showCompletedTasks
    ? allChildTasks.filter((c) => c.status === 'completed' || c.status === 'cancelled').length
    : 0;
  const completedSubtasks = allChildTasks.filter(
    (s) => s.status === 'completed' || s.status === 'cancelled',
  ).length;
  const totalSubtasks = allChildTasks.length;
  const childCount = countChildren(task.uid);
  const allCalendars = accounts.flatMap((a) => a.calendars);
  const calendar = allCalendars.find((c) => c.id === task.calendarId);
  const calendarColor = calendar?.color ?? FALLBACK_ITEM_COLOR;
  const showCalendar = activeCalendarId === null && calendar;
  const isUnstarted = task.startDate && new Date(task.startDate) > new Date();
  const startDateDisplay = isUnstarted && task.startDate ? formatStartDate(task.startDate) : null;
  const taskTags = (task.tags || [])
    .map((tagId) => getAllTags().find((t) => t.id === tagId))
    .filter(Boolean);

  const hasAnyVisibleBadge =
    (badgeVisibility.startDate && startDateDisplay) ||
    (badgeVisibility.tags && taskTags.length > 0) ||
    (badgeVisibility.calendar && showCalendar) ||
    (badgeVisibility.url && task.url) ||
    (badgeVisibility.status && task.status === 'in-process') ||
    (badgeVisibility.subtasks && (totalSubtasks > 0 || childCount > 0));

  if (!hasAnyVisibleBadge) {
    return null;
  }

  const CalendarIcon = calendar ? getIconByName(calendar.icon || 'calendar') : null;

  return (
    <div
      className={`flex items-center gap-2 ${compact ? 'overflow-hidden flex-shrink-0' : 'mt-2 flex-wrap'}`}
    >
      {badgeVisibility.startDate && startDateDisplay && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border"
          style={{
            borderColor: startDateDisplay.borderColor,
            backgroundColor: startDateDisplay.bgColor,
            color: startDateDisplay.textColor,
          }}
        >
          <CalendarClock className="w-3 h-3" />
          {startDateDisplay.text}
        </span>
      )}

      {badgeVisibility.tags &&
        taskTags.map((tag) => {
          if (!tag) return null;
          const TagIcon = getIconByName(tag.icon || 'tag');
          return (
            <button
              type="button"
              key={tag.id}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(tag.id);
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium hover:opacity-80 transition-opacity border outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
              style={{
                borderColor: tag.color,
                backgroundColor: `${tag.color}15`,
                color: tag.color,
              }}
            >
              {tag.emoji ? (
                <span className="text-xs leading-none">{tag.emoji}</span>
              ) : (
                <TagIcon className="w-3 h-3" />
              )}
              {tag.name}
            </button>
          );
        })}

      {badgeVisibility.calendar && showCalendar && calendar && CalendarIcon && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCalendarClick(calendar.id);
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border hover:opacity-80 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
          style={{
            borderColor: calendarColor,
            backgroundColor: `${calendarColor}15`,
            color: calendarColor,
          }}
        >
          {calendar.emoji ? (
            <span className="text-xs leading-none">{calendar.emoji}</span>
          ) : (
            <CalendarIcon className="w-3 h-3" />
          )}
          {calendar.displayName || 'Calendar'}
        </button>
      )}

      {badgeVisibility.url && task.url && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openUrl(task.url!);
          }}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:opacity-80 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
          title={task.url}
        >
          <Link className="w-3 h-3" />
          URL
        </button>
      )}

      {badgeVisibility.status && task.status === 'in-process' && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border"
          style={{
            borderColor: '#3b82f6',
            backgroundColor: '#3b82f615',
            color: '#3b82f6',
          }}
        >
          <Loader className="w-3 h-3" />
          {task.percentComplete}%
        </span>
      )}

      {badgeVisibility.repeat && task.rrule && (
        <span
          title="Repeating task"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400"
        >
          <RefreshCw className="w-3 h-3" />
        </span>
      )}

      {badgeVisibility.subtasks && totalSubtasks > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400">
          <CheckCircle2 className="w-3 h-3" />
          {completedSubtasks}/{totalSubtasks}
        </span>
      )}

      {badgeVisibility.subtasks && childCount > 0 && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="collapse-button inline-flex items-center gap-0.5 px-2 py-0.5 rounded border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors text-xs text-surface-500 dark:text-surface-400 outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
        >
          {task.isCollapsed ? (
            <>
              <ChevronRight className="w-3 h-3" />
              <span>
                {childCount} {pluralize(childCount, 'subtask')}
              </span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              <span>
                {childCount} {pluralize(childCount, 'subtask')}
              </span>
            </>
          )}
        </button>
      )}

      {badgeVisibility.subtasks && hiddenChildCount > 0 && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border border-surface-300 dark:border-surface-600 bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400">
          {hiddenChildCount} hidden {pluralize(hiddenChildCount, 'subtask')}
        </span>
      )}
    </div>
  );
};
