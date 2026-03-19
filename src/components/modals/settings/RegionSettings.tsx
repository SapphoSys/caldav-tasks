import { WEEK_START_OPTIONS } from '$data/settings';
import { useSettingsStore } from '$hooks/useSettingsStore';
import type { StartOfWeek, TimeFormat } from '$types/index';

export const RegionSettings = () => {
  const { startOfWeek, setStartOfWeek, timeFormat, setTimeFormat } = useSettingsStore();

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-surface-800 dark:text-surface-200">Region</h3>
      <div className="space-y-4 rounded-lg border border-surface-200 dark:border-surface-700 p-4 bg-white dark:bg-surface-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">Week starts on</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Choose how dates are shown in calendars
            </p>
          </div>
          <select
            value={startOfWeek}
            onChange={(e) => setStartOfWeek(e.target.value as StartOfWeek)}
            className="px-3 py-1.5 text-sm border border-transparent bg-surface-100 dark:bg-surface-700 text-surface-800 dark:text-surface-200 rounded-lg outline-none focus:border-primary-300 dark:focus:border-primary-400 focus:bg-white dark:focus:bg-primary-900/30 transition-colors"
          >
            {WEEK_START_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">Time format</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Choose 12-hour or 24-hour time display
            </p>
          </div>
          <select
            value={timeFormat}
            onChange={(e) => setTimeFormat(e.target.value as TimeFormat)}
            className="px-3 py-1.5 text-sm border border-transparent bg-surface-100 dark:bg-surface-700 text-surface-800 dark:text-surface-200 rounded-lg outline-none focus:border-primary-300 dark:focus:border-primary-400 focus:bg-white dark:focus:bg-primary-900/30 transition-colors"
          >
            <option value="12">12-hour</option>
            <option value="24">24-hour</option>
          </select>
        </div>
      </div>
    </div>
  );
};
