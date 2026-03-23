import ChevronDown from 'lucide-react/icons/chevron-down';
import Download from 'lucide-react/icons/download';
import Upload from 'lucide-react/icons/upload';
import { useState } from 'react';
import { useConfirmDialog } from '$hooks/useConfirmDialog';
import { useSettingsStore } from '$hooks/useSettingsStore';
import { deleteDatabase } from '$lib/bootstrap';
import { exportSettingsToFile, importSettingsFromFile } from '$utils/settings';

export const DataSettings = () => {
  const { exportSettings, importSettings, resetSettings } = useSettingsStore();
  const { confirm } = useConfirmDialog();
  const [showIncluded, setShowIncluded] = useState(false);

  const handleResetPreferences = async () => {
    const confirmed = await confirm({
      title: 'Reset Preferences',
      message: (
        <p>
          <span className="font-bold">Are you sure?</span> This will restore all user preferences to
          their default values.
        </p>
      ),
      confirmLabel: 'Reset Preferences',
      destructive: true,
    });

    if (confirmed) resetSettings();
  };

  const handleResetDatabase = async () => {
    const confirmed = await confirm({
      title: 'Reset Database',
      message: (
        <div className="space-y-2">
          <p>
            <span className="font-bold">Are you sure?</span> This will not affect data on your
            CalDAV servers, but local data will be lost and accounts will need to be set up again.
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Not recommended unless you are experiencing issues or want to start fresh.
          </p>
        </div>
      ),
      confirmLabel: 'Reset Database',
      destructive: true,
      delayConfirmSeconds: 5,
    });

    if (confirmed) await deleteDatabase();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-surface-800 dark:text-surface-200">Data</h3>
      <div className="space-y-4 rounded-lg border border-surface-200 dark:border-surface-700 p-4 bg-white dark:bg-surface-800">
        <div>
          <h3 className="text-sm font-medium text-surface-800 dark:text-surface-200 mb-3">
            Settings Backup
          </h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
            Export your settings to a file for backup or transfer to another device.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                const json = exportSettings();
                await exportSettingsToFile(json);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
            >
              <Download className="w-4 h-4" />
              Export Settings
            </button>
            <button
              type="button"
              onClick={async () => {
                await importSettingsFromFile(importSettings);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
            >
              <Upload className="w-4 h-4" />
              Import Settings
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900">
          <button
            type="button"
            onClick={() => setShowIncluded(!showIncluded)}
            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
          >
            <span>What's included?</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showIncluded ? 'rotate-180' : ''}`}
            />
          </button>

          {showIncluded && (
            <div className="px-4 pb-4 space-y-2 text-sm text-surface-600 dark:text-surface-400">
              <ul className="space-y-1">
                <li>• Appearance settings (theme, accent color)</li>
                <li>• Behavior preferences</li>
                <li>• Notification settings</li>
                <li>• Sync preferences</li>
              </ul>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Note: Account credentials and task data are not included in settings export.
              </p>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-base font-semibold text-surface-800 dark:text-surface-200">Reset</h3>
      <div className="space-y-4 rounded-lg border border-surface-200 dark:border-surface-700 p-4 bg-white dark:bg-surface-800">
        <div>
          <h3 className="text-sm font-medium text-surface-800 dark:text-surface-200 mb-3">
            Reset Preferences
          </h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
            Restores all user preferences to their default values.
          </p>
          <button
            type="button"
            onClick={handleResetPreferences}
            className="px-3 py-2 text-sm bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
          >
            Reset Preferences
          </button>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-red-600 dark:border-red-500 p-4 bg-white dark:bg-surface-800">
        <div>
          <h3 className="text-sm font-medium text-surface-800 dark:text-surface-200 mb-3">
            Reset Database
          </h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
            Deletes all local data. Only use this as a last resort.
          </p>
          <button
            type="button"
            onClick={handleResetDatabase}
            className="px-3 py-2 text-sm bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset"
          >
            Reset Database
          </button>
        </div>
      </div>
    </div>
  );
};
