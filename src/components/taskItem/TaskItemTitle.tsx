import type { TaskStatus } from '$types';

interface TaskItemTitleProps {
  title: string;
  status: TaskStatus;
  isUnstarted: boolean;
  className?: string;
}

export const TaskItemTitle = ({
  title,
  status,
  isUnstarted,
  className = '',
}: TaskItemTitleProps) => {
  const getTextClass = () => {
    if (status === 'completed') return 'line-through text-surface-400';
    if (status === 'cancelled') return 'line-through text-surface-400 dark:text-surface-500';
    if (isUnstarted) return 'text-surface-500 dark:text-surface-400';
    return 'text-surface-800 dark:text-surface-200';
  };

  return (
    <div className={`${className} ${getTextClass()}`}>
      {title || <span className="text-surface-400 italic">Untitled task</span>}
    </div>
  );
};
