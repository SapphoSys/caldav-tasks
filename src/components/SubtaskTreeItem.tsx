import type { AnimateLayoutChanges } from '@dnd-kit/sortable';
import { defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import Check from 'lucide-react/icons/check';
import ChevronRight from 'lucide-react/icons/chevron-right';
import X from 'lucide-react/icons/x';
import { useRef, useState } from 'react';
import { useChildTasks } from '$hooks/queries/useTasks';
import type { Task } from '$types/index';
import { getPriorityDot } from '$utils/priority';

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

// Each depth level adds 20px of left-padding. The chevron/spacer (w-4) + gap (gap-1.5)
// is always shown before the checkbox so all levels align consistently.
const getPaddingLeft = (depth: number) => 8 + depth * 20;

interface SubtaskTreeItemProps {
  task: Task;
  depth: number;
  checkmarkColor: string;
  expandedSubtasks: Set<string>;
  setExpandedSubtasks: React.Dispatch<React.SetStateAction<Set<string>>>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  confirmAndDelete: (id: string) => Promise<boolean>;
  isDragEnabled: boolean;
  isOverlay?: boolean;
}

export const SubtaskTreeItem = ({
  task,
  depth,
  checkmarkColor,
  expandedSubtasks,
  setExpandedSubtasks,
  updateTask,
  confirmAndDelete,
  isDragEnabled,
  isOverlay = false,
}: SubtaskTreeItemProps) => {
  const { data: children = [] } = useChildTasks(task.uid);
  const hasChildren = children.length > 0;
  const isExpanded = expandedSubtasks.has(task.id);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const { listeners, setNodeRef, transform, isDragging } = useSortable({
    id: task.id,
    disabled: !isDragEnabled,
    animateLayoutChanges,
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: 'none',
    opacity: isDragging ? 0 : undefined,
    pointerEvents: isDragging ? 'none' : undefined,
  };

  const toggleExpanded = () => {
    setExpandedSubtasks((prev) => {
      const next = new Set(prev);
      if (next.has(task.id)) next.delete(task.id);
      else next.add(task.id);
      return next;
    });
  };

  const handleStartEdit = () => {
    setEditValue(task.title);
    setIsEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleCommitEdit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.title) {
      updateTask(task.id, { title: trimmed });
    } else if (!trimmed) {
      setEditValue(task.title);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setEditValue(task.title);
      setIsEditing(false);
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...(isDragEnabled ? listeners : {})}
        className={`group/row flex items-center gap-1.5 py-1.5 pr-2 rounded-md transition-colors ${
          isDragEnabled ? 'cursor-grab active:cursor-grabbing' : ''
        } ${
          isOverlay
            ? 'bg-surface-50 dark:bg-surface-800 shadow-lg'
            : 'hover:bg-surface-50 dark:hover:bg-surface-800/60'
        }`}
        style={{ paddingLeft: `${getPaddingLeft(depth)}px` }}
      >
        {/* Chevron if has children; spacer if depth > 0 (preserves hierarchy indent);
            nothing for root-level leaves (no unnecessary extra padding) */}
        {hasChildren ? (
          <button
            type="button"
            onClick={toggleExpanded}
            className="cursor-pointer flex-shrink-0 w-4 h-4 flex items-center justify-center rounded text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            aria-label={isExpanded ? 'Collapse subtasks' : 'Expand subtasks'}
          >
            <ChevronRight
              className={`w-3 h-3 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
        ) : depth > 0 ? (
          <div className="flex-shrink-0 w-4 h-4" aria-hidden="true" />
        ) : null}

        {/* Checkbox */}
        <button
          type="button"
          onClick={() => {
            const newStatus = task.status === 'needs-action' ? 'completed' : 'needs-action';
            updateTask(task.id, {
              status: newStatus,
              completed: newStatus === 'completed',
              completedAt: newStatus === 'completed' ? new Date() : undefined,
            });
          }}
          className={`cursor-pointer w-4 h-4 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 transition-colors ${
            task.status === 'completed'
              ? 'bg-primary-500 border-primary-500'
              : task.status === 'cancelled'
                ? 'bg-surface-400 border-surface-400'
                : 'border-surface-300 dark:border-surface-600 hover:border-primary-400 dark:hover:border-primary-500'
          }`}
        >
          {task.completed && (
            <Check className="w-2.5 h-2.5" style={{ color: checkmarkColor }} strokeWidth={3} />
          )}
        </button>

        {/* Priority dot */}
        {task.priority !== 'none' && (
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${getPriorityDot(task.priority)}`} />
        )}

        {/* Title — click to edit inline */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={handleCommitEdit}
            className="flex-1 text-sm bg-transparent outline-none text-surface-700 dark:text-surface-300 min-w-0"
          />
        ) : (
          <button
            type="button"
            onClick={handleStartEdit}
            className={`flex-1 text-sm text-left truncate ${
              task.completed
                ? 'line-through text-surface-400 dark:text-surface-500'
                : 'text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100'
            }`}
          >
            {task.title || (
              <span className="text-surface-400 dark:text-surface-500 italic">Untitled</span>
            )}
          </button>
        )}

        {/* Delete */}
        {!isEditing && (
          <button
            type="button"
            onClick={async () => {
              await confirmAndDelete(task.id);
            }}
            className="cursor-pointer opacity-0 group-hover/row:opacity-100 p-0.5 flex-shrink-0 rounded text-surface-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
