import { getAppInfo } from '@/utils/version';

export function AboutSettings() {
  const { version, name, description, author } = getAppInfo();

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-surface-800 dark:text-surface-200 mb-1">{name}</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400">Version {version}</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-surface-50 dark:bg-surface-700 rounded-lg">
          <h3 className="text-sm font-medium text-surface-800 dark:text-surface-200 mb-2">About</h3>
          <p className="text-sm text-surface-600 dark:text-surface-400">{description}</p>
        </div>

        <div className="p-4 bg-surface-50 dark:bg-surface-700 rounded-lg">
          <h3 className="text-sm font-medium text-surface-800 dark:text-surface-200 mb-2">
            Credits
          </h3>
          <p className="text-sm text-surface-600 dark:text-surface-400">{author}</p>
        </div>
      </div>
    </div>
  );
}
