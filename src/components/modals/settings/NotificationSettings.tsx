import { openUrl } from '@tauri-apps/plugin-opener';
import { useNotificationContext } from '$hooks/useNotificationContext';
import { useSettingsStore } from '$hooks/useSettingsStore';
import { isMacPlatform } from '$utils/platform';

export const NotificationSettings = () => {
  const {
    notifications,
    setNotifications,
    notifyReminders,
    setNotifyReminders,
    notifyOverdue,
    setNotifyOverdue,
    enableToasts,
    setEnableToasts,
  } = useSettingsStore();
  const { permissionStatus, isCheckingPermission, requestPermission } = useNotificationContext();

  const handleRequestPermission = async () => {
    try {
      const result = await requestPermission();

      // A granted=false result whose status string contains "error" means macOS
      // silently blocked the dialog due to a cached decision.
      if (!result.granted && result.status.toLowerCase().includes('error')) {
        alert(
          'The notification permission request was blocked by macOS. This usually means a previous decision was cached.\n\n' +
            'To fix this, open System Settings → Notifications, find Chiri, and toggle notifications on/off to reset the permission state.',
        );
      }
    } catch (error) {
      console.error('Failed to request permission:', error);
      alert(
        'Failed to request notification permission. Please try opening System Settings manually.',
      );
    }
  };

  const handleOpenSystemSettings = async () => {
    try {
      await openUrl(
        'x-apple.systempreferences:com.apple.preference.notifications?id=moe.sapphic.Chiri',
      );
    } catch (error) {
      console.error('Failed to open system settings:', error);
    }
  };

  // on macOS the toggle is gated behind OS permission
  // must be granted or provisional before the user can enable/disable it in-app
  const macPermissionPending =
    isMacPlatform() &&
    permissionStatus !== null &&
    permissionStatus !== 'granted' &&
    permissionStatus !== 'provisional';

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-surface-800 dark:text-surface-200">
        Notifications
      </h3>
      <div className="space-y-4 rounded-lg border border-surface-200 dark:border-surface-700 p-4 bg-white dark:bg-surface-800">
        <div className="space-y-4">
          <label
            className={`flex items-center justify-between ${macPermissionPending ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div>
              <h4 className="text-sm text-surface-700 dark:text-surface-300">
                Enable notifications
              </h4>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Get notified for task reminders and overdue tasks
              </p>
              {macPermissionPending && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Notification permission is required, use the controls below to grant it.
                </p>
              )}
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              disabled={macPermissionPending}
              className="rounded border-surface-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 outline-none disabled:cursor-not-allowed"
            />
          </label>
          {notifications && (
            <div className="space-y-3 pl-4 border-l-2 border-surface-200 dark:border-surface-600">
              <label
                className={`flex items-center justify-between ${macPermissionPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div>
                  <h4 className="text-sm text-surface-700 dark:text-surface-300">Reminders</h4>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    Notify when a task reminder is due
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyReminders}
                  onChange={(e) => setNotifyReminders(e.target.checked)}
                  disabled={macPermissionPending}
                  className="rounded border-surface-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 outline-none disabled:cursor-not-allowed"
                />
              </label>
              <label
                className={`flex items-center justify-between ${macPermissionPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div>
                  <h4 className="text-sm text-surface-700 dark:text-surface-300">Overdue tasks</h4>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    Notify when a task's due date has passed
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOverdue}
                  onChange={(e) => setNotifyOverdue(e.target.checked)}
                  disabled={macPermissionPending}
                  className="rounded border-surface-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 outline-none disabled:cursor-not-allowed"
                />
              </label>
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4 rounded-lg border border-surface-200 dark:border-surface-700 p-4 bg-white dark:bg-surface-800">
        <label className="flex items-center justify-between">
          <div>
            <h4 className="text-sm text-surface-700 dark:text-surface-300">Enable toasts</h4>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Show brief pop-up messages for sync status and errors
            </p>
          </div>
          <input
            type="checkbox"
            checked={enableToasts}
            onChange={(e) => setEnableToasts(e.target.checked)}
            className="rounded border-surface-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 outline-none"
          />
        </label>
      </div>
      {isMacPlatform() && permissionStatus !== null && (
        <div className="space-y-3 rounded-lg border border-surface-200 dark:border-surface-700 p-4 bg-white dark:bg-surface-800">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Permission Status
              </h4>
              <span
                className={`text-xs px-2 py-1 rounded-lg ${
                  permissionStatus === 'granted'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : permissionStatus === 'denied'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                }`}
              >
                {permissionStatus === 'granted'
                  ? 'Granted'
                  : permissionStatus === 'denied'
                    ? 'Denied'
                    : permissionStatus === 'provisional'
                      ? 'Provisional'
                      : 'Not Requested'}
              </span>
            </div>

            {permissionStatus === 'default' && (
              <p className="text-sm text-surface-600 dark:text-surface-400">
                You haven't been asked for notification permission yet. Click below to allow
                notifications.
              </p>
            )}

            {permissionStatus === 'denied' && (
              <p className="text-sm text-surface-600 dark:text-surface-400">
                Notifications are blocked. Please enable them in System Settings.
              </p>
            )}

            {permissionStatus === 'provisional' && (
              <p className="text-sm text-surface-600 dark:text-surface-400">
                Notifications are delivered quietly. You can change this in System Settings.
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {permissionStatus === 'default' && (
              <button
                type="button"
                onClick={handleRequestPermission}
                disabled={isCheckingPermission}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-primary-contrast rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingPermission ? 'Requesting...' : 'Request Permission'}
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenSystemSettings}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-300 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
            >
              Open macOS Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
