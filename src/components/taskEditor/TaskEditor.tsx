import { useEffect, useRef } from 'react';
import { TaskEditorCalendar } from '$components/taskEditor/TaskEditorCalendar';
import { TaskEditorDates } from '$components/taskEditor/TaskEditorDates';
import { TaskEditorDescription } from '$components/taskEditor/TaskEditorDescription';
import { TaskEditorFooter } from '$components/taskEditor/TaskEditorFooter';
import { TaskEditorHeader } from '$components/taskEditor/TaskEditorHeader';
import { TaskEditorPriority } from '$components/taskEditor/TaskEditorPriority';
import { TaskEditorReminders } from '$components/taskEditor/TaskEditorReminders';
import { TaskEditorStatus } from '$components/taskEditor/TaskEditorStatus';
import { TaskEditorSubtasks } from '$components/taskEditor/TaskEditorSubtasks';
import { TaskEditorTags } from '$components/taskEditor/TaskEditorTags';
import { TaskEditorTitle } from '$components/taskEditor/TaskEditorTitle';
import { TaskEditorUrl } from '$components/taskEditor/TaskEditorUrl';
import { useAccounts } from '$hooks/queries/useAccounts';
import { useTags } from '$hooks/queries/useTags';
import {
  useAddReminder,
  useAddTagToTask,
  useRemoveReminder,
  useRemoveTagFromTask,
  useUpdateReminder,
  useUpdateTask,
} from '$hooks/queries/useTasks';
import { useSetEditorOpen } from '$hooks/queries/useUIState';
import { useConfirmTaskDelete } from '$hooks/useConfirmTaskDelete';
import { useModalEscapeKey } from '$hooks/useModalEscapeKey';
import { useSettingsStore } from '$hooks/useSettingsStore';
import type { Task, TaskStatus } from '$types/index';
import { getContrastTextColor } from '$utils/color';
import { hasOpenModalElements } from '$utils/misc';

interface TaskEditorProps {
  task: Task;
  onOpenNotificationSettings?: () => void;
}

export const TaskEditor = ({ task, onOpenNotificationSettings }: TaskEditorProps) => {
  const updateTaskMutation = useUpdateTask();
  const setEditorOpenMutation = useSetEditorOpen();
  const addTagToTaskMutation = useAddTagToTask();
  const removeTagFromTaskMutation = useRemoveTagFromTask();
  const addReminderMutation = useAddReminder();
  const removeReminderMutation = useRemoveReminder();
  const updateReminderMutation = useUpdateReminder();
  const { data: tags = [] } = useTags();
  const { data: accounts = [] } = useAccounts();
  const { accentColor, notifications, timeFormat } = useSettingsStore();
  const { confirmAndDelete } = useConfirmTaskDelete();

  const checkmarkColor = getContrastTextColor(accentColor);

  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Handle escape key to blur focused inputs
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;

        // Don't handle escape if any modal is open (they should handle it first)
        if (hasOpenModalElements()) {
          return;
        }

        // Check if focus is on an input or textarea within the editor
        if (
          editorContainerRef.current?.contains(activeElement) &&
          (activeElement instanceof HTMLInputElement ||
            activeElement instanceof HTMLTextAreaElement)
        ) {
          // Blur the input only; stop immediate propagation so useModalEscapeKey doesn't
          // also close the editor on this same keypress — a second Escape will close it.
          e.preventDefault();
          e.stopImmediatePropagation();
          activeElement.blur();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleEsc, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleEsc, { capture: true });
    };
  }, []);

  // mark as panel so it yields to modal dialogs (closes on ESC when no input is focused)
  useModalEscapeKey(() => setEditorOpenMutation.mutate(false), {
    isPanel: true,
  });

  const handleStatusChange = (status: TaskStatus) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: {
        status,
        completed: status === 'completed',
        completedAt: status === 'completed' ? (task.completedAt ?? new Date()) : undefined,
      },
    });
  };

  const commitPercentComplete = (value: number) => {
    const updates: Partial<Task> = { percentComplete: value };
    if (value === 100) {
      updates.status = 'completed';
      updates.completed = true;
      updates.completedAt = task.completedAt ?? new Date();
    } else if (value === 0) {
      updates.status = 'needs-action';
      updates.completed = false;
      updates.completedAt = undefined;
    } else {
      updates.status = 'in-process';
      updates.completed = false;
      updates.completedAt = undefined;
    }
    updateTaskMutation.mutate({ id: task.id, updates });
  };

  const handleCalendarChange = (calendarId: string) => {
    const allCalendars = accounts.flatMap((a) =>
      a.calendars.map((cal) => ({ ...cal, accountId: a.id })),
    );
    const targetCalendar = allCalendars.find((c) => c.id === calendarId);
    if (targetCalendar) {
      const updates: Partial<Task> = {
        calendarId: targetCalendar.id,
        accountId: targetCalendar.accountId,
      };
      if (task.parentUid) {
        updates.parentUid = undefined;
      }
      updateTaskMutation.mutate({ id: task.id, updates });
    }
  };

  const handleStartDateChange = (date: Date | undefined, allDay?: boolean) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { startDate: date, startDateAllDay: allDay },
    });
  };

  const handleDueDateChange = (date: Date | undefined, allDay?: boolean) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { dueDate: date, dueDateAllDay: allDay },
    });
  };

  const handleStartDateAllDayChange = (allDay: boolean) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { startDateAllDay: allDay },
    });
  };

  const handleDueDateAllDayChange = (allDay: boolean) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { dueDateAllDay: allDay },
    });
  };

  const handleDelete = async () => {
    const deleted = await confirmAndDelete(task.id);
    if (deleted) {
      setEditorOpenMutation.mutate(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-surface-900" ref={editorContainerRef}>
      <TaskEditorHeader
        onDelete={handleDelete}
        onClose={() => setEditorOpenMutation.mutate(false)}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-6 flex overscroll-contain flex-col">
        <TaskEditorTitle task={task} checkmarkColor={checkmarkColor} />

        <TaskEditorStatus
          task={task}
          onStatusChange={handleStatusChange}
          onCommitPercent={commitPercentComplete}
        />

        <TaskEditorDescription task={task} />

        <TaskEditorUrl task={task} />

        <TaskEditorDates
          task={task}
          timeFormat={timeFormat}
          onStartDateChange={handleStartDateChange}
          onDueDateChange={handleDueDateChange}
          onStartDateAllDayChange={handleStartDateAllDayChange}
          onDueDateAllDayChange={handleDueDateAllDayChange}
        />

        <TaskEditorPriority task={task} />

        <TaskEditorCalendar
          task={task}
          accounts={accounts}
          onCalendarChange={handleCalendarChange}
        />

        <TaskEditorTags
          task={task}
          tags={tags}
          onAddTag={(tagId) => addTagToTaskMutation.mutate({ taskId: task.id, tagId })}
          onRemoveTag={(tagId) => removeTagFromTaskMutation.mutate({ taskId: task.id, tagId })}
        />

        <TaskEditorReminders
          task={task}
          timeFormat={timeFormat}
          notifications={notifications}
          onOpenNotificationSettings={onOpenNotificationSettings}
          onAddReminder={(date) => addReminderMutation.mutate({ taskId: task.id, trigger: date })}
          onRemoveReminder={(reminderId) =>
            removeReminderMutation.mutate({ taskId: task.id, reminderId })
          }
          onUpdateReminder={(reminderId, trigger) =>
            updateReminderMutation.mutate({ taskId: task.id, reminderId, trigger })
          }
        />

        <TaskEditorSubtasks
          task={task}
          checkmarkColor={checkmarkColor}
          updateTask={(id, updates) => updateTaskMutation.mutate({ id, updates })}
          confirmAndDelete={confirmAndDelete}
        />
      </div>

      <TaskEditorFooter task={task} timeFormat={timeFormat} />
    </div>
  );
};
