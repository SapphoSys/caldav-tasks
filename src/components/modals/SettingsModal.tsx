import Bell from 'lucide-react/icons/bell';
import Database from 'lucide-react/icons/database';
import Download from 'lucide-react/icons/download';
import Globe from 'lucide-react/icons/globe';
import Info from 'lucide-react/icons/info';
import Keyboard from 'lucide-react/icons/keyboard';
import ListTodo from 'lucide-react/icons/list-todo';
import Monitor from 'lucide-react/icons/monitor';
import Palette from 'lucide-react/icons/palette';
import RefreshCw from 'lucide-react/icons/refresh-cw';
import Settings from 'lucide-react/icons/settings';
import User from 'lucide-react/icons/user';
import X from 'lucide-react/icons/x';
import { useState } from 'react';
import { AboutSettings } from '$components/modals/settings/AboutSettings';
import { AppearanceSettings } from '$components/modals/settings/AppearanceSettings';
import { BehaviorSettings } from '$components/modals/settings/BehaviorSettings';
import { ConnectionsSettings } from '$components/modals/settings/ConnectionsSettings';
import { DataSettings } from '$components/modals/settings/DataSettings';
import { NotificationSettings } from '$components/modals/settings/NotificationSettings';
import { RegionSettings } from '$components/modals/settings/RegionSettings';
import { ShortcutsSettings } from '$components/modals/settings/ShortcutsSettings';
import { SyncSettings } from '$components/modals/settings/SyncSettings';
import { SystemSettings } from '$components/modals/settings/SystemSettings';
import { TaskDefaultsSettings } from '$components/modals/settings/TaskDefaultsSettings';
import { UpdateSettings } from '$components/modals/settings/UpdateSettings';
import { useAccounts } from '$hooks/queries/useAccounts';
import { useFocusTrap } from '$hooks/useFocusTrap';
import { useModalEscapeKey } from '$hooks/useModalEscapeKey';
import type { SettingsCategory, SettingsSubtab } from '$types/index';

interface SettingsModalProps {
  onClose: () => void;
  initialCategory?: SettingsCategory;
  initialSubtab?: SettingsSubtab;
}

type SettingsSubtabInfo = {
  id: SettingsSubtab;
  label: string;
  icon: React.ReactNode;
};

export const SettingsModal = ({ onClose, initialCategory, initialSubtab }: SettingsModalProps) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>(initialCategory || 'app');
  const [activeSubtabs, setActiveSubtabs] = useState<Record<SettingsCategory, SettingsSubtab>>({
    tasks: initialCategory === 'tasks' && initialSubtab ? initialSubtab : 'defaults',
    app: initialCategory === 'app' && initialSubtab ? initialSubtab : 'behavior',
    accounts: initialCategory === 'accounts' && initialSubtab ? initialSubtab : 'connections',
    misc: initialCategory === 'misc' && initialSubtab ? initialSubtab : 'updates',
  });
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const { data: accounts = [] } = useAccounts();
  const focusTrapRef = useFocusTrap();

  // handle ESC key to close modal - but not if a child modal is open
  useModalEscapeKey(() => {
    if (!isChildModalOpen) {
      onClose();
    }
  });

  const categories: {
    id: SettingsCategory;
    label: string;
    icon: React.ReactNode;
    description: string;
    subtabs: SettingsSubtabInfo[];
  }[] = [
    {
      id: 'app',
      label: 'App',
      icon: <Monitor className="w-4 h-4" />,
      description: 'Behavior, appearance, notifications, region, shortcuts, system',
      subtabs: [
        {
          id: 'behavior',
          label: 'Behavior',
          icon: <Settings className="w-4 h-4" />,
        },
        {
          id: 'appearance',
          label: 'Appearance',
          icon: <Palette className="w-4 h-4" />,
        },
        {
          id: 'notifications',
          label: 'Notifications',
          icon: <Bell className="w-4 h-4" />,
        },
        { id: 'region', label: 'Region', icon: <Globe className="w-4 h-4" /> },
        {
          id: 'shortcuts',
          label: 'Shortcuts',
          icon: <Keyboard className="w-4 h-4" />,
        },
        {
          id: 'system',
          label: 'System',
          icon: <Monitor className="w-4 h-4" />,
        },
      ],
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: <ListTodo className="w-4 h-4" />,
      description: 'Defaults',
      subtabs: [
        {
          id: 'defaults',
          label: 'Defaults',
          icon: <ListTodo className="w-4 h-4" />,
        },
      ],
    },
    {
      id: 'accounts',
      label: 'Accounts',
      icon: <User className="w-4 h-4" />,
      description: 'Connections, data, sync',
      subtabs: [
        {
          id: 'connections',
          label: 'Connections',
          icon: <User className="w-4 h-4" />,
        },
        { id: 'data', label: 'Data', icon: <Database className="w-4 h-4" /> },
        { id: 'sync', label: 'Sync', icon: <RefreshCw className="w-4 h-4" /> },
      ],
    },
    {
      id: 'misc',
      label: 'Misc',
      icon: <Info className="w-4 h-4" />,
      description: 'Updates, about',
      subtabs: [
        {
          id: 'updates',
          label: 'Updates',
          icon: <Download className="w-4 h-4" />,
        },
        { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
      ],
    },
  ];

  const currentSubtab = activeSubtabs[activeCategory];

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Modal backdrop does not require keyboard handler; ESC key closes modal via useModalEscapeKey hook
    // biome-ignore lint/a11y/useKeyWithClickEvents: Modal backdrop is non-interactive; users close with Escape or X button
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        ref={focusTrapRef}
        className="bg-white dark:bg-surface-800 rounded-xl shadow-xl w-full max-w-3xl flex flex-col animate-scale-in h-full max-h-[75vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
          <h2 className="text-lg font-semibold text-surface-800 dark:text-surface-200">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-0">
          <div className="w-56 border-r border-surface-200 dark:border-surface-700 p-3 space-y-4 bg-white dark:bg-surface-800 rounded-l-xl overflow-y-auto overscroll-contain">
            {categories.map((category) => (
              <div key={category.id} className="space-y-2">
                <p className="px-2 text-xs font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400">
                  {category.label}
                </p>
                <div className="space-y-1">
                  {category.subtabs.map((tab) => {
                    const isActiveCategory = activeCategory === category.id;
                    const isActiveTab = isActiveCategory && activeSubtabs[category.id] === tab.id;

                    return (
                      <button
                        type="button"
                        key={tab.id}
                        onClick={() => {
                          setActiveCategory(category.id);
                          setActiveSubtabs((prev) => ({
                            ...prev,
                            [category.id]: tab.id,
                          }));
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset ${
                          isActiveTab
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-400'
                            : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 border border-transparent'
                        }`}
                      >
                        <span
                          className={`shrink-0 ${
                            isActiveTab
                              ? 'text-primary-600 dark:text-primary-300'
                              : 'text-surface-500 dark:text-surface-400'
                          }`}
                        >
                          {tab.icon}
                        </span>
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 p-6 overflow-y-auto overscroll-contain">
            {activeCategory === 'tasks' && (
              <div className="space-y-6">
                {currentSubtab === 'defaults' && <TaskDefaultsSettings />}
              </div>
            )}

            {activeCategory === 'app' && (
              <div className="space-y-6">
                {currentSubtab === 'behavior' && <BehaviorSettings />}
                {currentSubtab === 'appearance' && <AppearanceSettings />}
                {currentSubtab === 'notifications' && <NotificationSettings />}
                {currentSubtab === 'region' && <RegionSettings />}
                {currentSubtab === 'shortcuts' && (
                  <ShortcutsSettings onEditingShortcutChange={setIsChildModalOpen} />
                )}
                {currentSubtab === 'system' && <SystemSettings />}
              </div>
            )}

            {activeCategory === 'accounts' && (
              <div className="space-y-6">
                {currentSubtab === 'connections' && <ConnectionsSettings accounts={accounts} />}
                {currentSubtab === 'data' && <DataSettings />}
                {currentSubtab === 'sync' && <SyncSettings />}
              </div>
            )}

            {activeCategory === 'misc' && (
              <div className="space-y-6">
                {currentSubtab === 'updates' && <UpdateSettings />}
                {currentSubtab === 'about' && <AboutSettings />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
