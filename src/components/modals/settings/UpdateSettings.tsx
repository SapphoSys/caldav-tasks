import CheckCircle from 'lucide-react/icons/check-circle';
import Download from 'lucide-react/icons/download';
import FileText from 'lucide-react/icons/file-text';
import Loader from 'lucide-react/icons/loader-circle';
import RefreshCw from 'lucide-react/icons/refresh-cw';
import { useState } from 'react';
import { ChangelogModal } from '$components/modals/ChangelogModal';
import { useSettingsStore } from '$hooks/useSettingsStore';
import { useUpdateChecker } from '$hooks/useUpdateChecker';
import { getAppInfo } from '$utils/version';

export const UpdateSettings = () => {
  const { version } = getAppInfo();
  const { checkForUpdatesAutomatically, setCheckForUpdatesAutomatically } = useSettingsStore();
  const {
    updateAvailable,
    isChecking,
    error,
    checkForUpdates,
    downloadAndInstall,
    isDownloading,
    downloadProgress,
  } = useUpdateChecker();
  const [hasManuallyChecked, setHasManuallyChecked] = useState(false);
  const [showChangelogModal, setShowChangelogModal] = useState(false);

  const handleManualCheck = async () => {
    setHasManuallyChecked(true);
    await checkForUpdates('settings-manual');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-surface-800 dark:text-surface-200">Updates</h3>

      {/* Current version and check section */}
      <div className="space-y-4 rounded-lg border border-surface-200 dark:border-surface-700 p-4 bg-white dark:bg-surface-800">
        {/* Current Version */}
        <div>
          <p className="text-sm text-surface-700 dark:text-surface-300 mb-1">Current Version</p>
          <p className="text-base font-medium text-surface-800 dark:text-surface-200">{version}</p>
        </div>

        {/* Auto-update setting */}
        <label className="flex items-center justify-between">
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">
              Check for updates automatically
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Automatically check for updates on startup
            </p>
          </div>
          <input
            type="checkbox"
            checked={checkForUpdatesAutomatically}
            onChange={(e) => setCheckForUpdatesAutomatically(e.target.checked)}
            className="rounded border-surface-300 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 outline-none"
          />
        </label>

        {/* Manual check button */}
        <div>
          <button
            type="button"
            onClick={handleManualCheck}
            disabled={isChecking}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 dark:disabled:bg-surface-700 disabled:text-surface-600 dark:disabled:text-surface-400 disabled:cursor-not-allowed text-primary-contrast rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
          >
            {isChecking ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Checking for updates...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Check for updates now
              </>
            )}
          </button>
        </div>

        {/* Update status */}
        {!isChecking && error && (hasManuallyChecked || error.kind === 'download') && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800">
            <div>
              <p className="text-sm font-semibold">{error.title}</p>
              <p className="text-xs mt-1">{error.description}</p>
            </div>
          </div>
        )}

        {hasManuallyChecked && !isChecking && !updateAvailable && !error && (
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-sm">You're up to date!</p>
          </div>
        )}
      </div>

      {/* Update available section - separate */}
      {updateAvailable && (
        <div className="space-y-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-4">
          <div className="flex items-start gap-2">
            <Download className="w-5 h-5 mt-0.5 shrink-0 text-primary-600 dark:text-primary-400" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">
                Update Available: {updateAvailable.version}
              </p>
              <p className="text-xs text-surface-600 dark:text-surface-400 mt-1">
                A new version is ready to download and install.
              </p>
            </div>
          </div>

          {/* Download progress */}
          {isDownloading && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  Downloading update...
                </span>
                <span className="text-sm font-medium text-surface-900 dark:text-surface-100">
                  {Math.round(downloadProgress)}%
                </span>
              </div>
              <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary-600 dark:bg-primary-500 h-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowChangelogModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-700 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
            >
              <FileText className="w-4 h-4" />
              View Changelog
            </button>

            <button
              type="button"
              onClick={downloadAndInstall}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 dark:disabled:bg-surface-700 disabled:cursor-not-allowed text-primary-contrast rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
            >
              {isDownloading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download & Install
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Changelog Modal */}
      {showChangelogModal && updateAvailable && (
        <ChangelogModal
          version={updateAvailable.version}
          changelog={updateAvailable.body || ''}
          onClose={() => setShowChangelogModal(false)}
        />
      )}
    </div>
  );
};
