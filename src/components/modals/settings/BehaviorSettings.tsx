import { useSettingsStore } from '$hooks/useSettingsStore';
import type { SubtaskDeletionBehavior } from '$types/index';

export const BehaviorSettings = () => {
  const {
    confirmBeforeDelete,
    setConfirmBeforeDelete,
    confirmBeforeDeleteCalendar,
    setConfirmBeforeDeleteCalendar,
    confirmBeforeDeleteAccount,
    setConfirmBeforeDeleteAccount,
    confirmBeforeDeleteTag,
    setConfirmBeforeDeleteTag,
    deleteSubtasksWithParent,
    setDeleteSubtasksWithParent,
    defaultAccountsExpanded,
    setDefaultAccountsExpanded,
  } = useSettingsStore();

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-surface-800 dark:text-surface-200">Behavior</h3>
      <div className="space-y-4 rounded-lg border border-surface-200 dark:border-surface-700 p-4 bg-white dark:bg-surface-800">
        <label className="flex items-center justify-between">
          <span className="text-sm text-surface-600 dark:text-surface-400">
            Confirm before deleting tasks
          </span>
          <input
            type="checkbox"
            checked={confirmBeforeDelete}
            onChange={(e) => setConfirmBeforeDelete(e.target.checked)}
            className="rounded border-surface-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 outline-none"
          />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-surface-600 dark:text-surface-400">
            Confirm before deleting calendars
          </span>
          <input
            type="checkbox"
            checked={confirmBeforeDeleteCalendar}
            onChange={(e) => setConfirmBeforeDeleteCalendar(e.target.checked)}
            className="rounded border-surface-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 outline-none"
          />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-surface-600 dark:text-surface-400">
            Confirm before deleting accounts
          </span>
          <input
            type="checkbox"
            checked={confirmBeforeDeleteAccount}
            onChange={(e) => setConfirmBeforeDeleteAccount(e.target.checked)}
            className="rounded border-surface-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 outline-none"
          />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-surface-600 dark:text-surface-400">
            Confirm before deleting tags
          </span>
          <input
            type="checkbox"
            checked={confirmBeforeDeleteTag}
            onChange={(e) => setConfirmBeforeDeleteTag(e.target.checked)}
            className="rounded border-surface-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 outline-none"
          />
        </label>

        <div className="flex flex-row items-center justify-between">
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">
              When deleting a task with subtasks
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Choose what happens to subtasks
            </p>
          </div>

          <select
            value={deleteSubtasksWithParent}
            onChange={(e) => setDeleteSubtasksWithParent(e.target.value as SubtaskDeletionBehavior)}
            className="px-3 text-sm border border-transparent bg-surface-100 dark:bg-surface-700 text-surface-800 dark:text-surface-200 rounded-lg outline-none focus:border-primary-300 dark:focus:border-primary-400 focus:bg-white dark:focus:bg-primary-900/30 transition-colors"
          >
            <option value="delete">Delete all subtasks</option>
            <option value="keep">Keep subtasks</option>
          </select>
        </div>

        <label className="flex items-center justify-between">
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">
              Expand new accounts in the sidebar by default
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Show calendars when adding a new account
            </p>
          </div>
          <input
            type="checkbox"
            checked={defaultAccountsExpanded}
            onChange={(e) => setDefaultAccountsExpanded(e.target.checked)}
            className="rounded border-surface-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 outline-none"
          />
        </label>
      </div>
    </div>
  );
};
