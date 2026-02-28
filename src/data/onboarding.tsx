import ArrowRight from 'lucide-react/icons/arrow-right';
import Calendar from 'lucide-react/icons/calendar';
import CheckCircle2 from 'lucide-react/icons/check-circle-2';
import FolderKanban from 'lucide-react/icons/folder-kanban';
import Sparkles from 'lucide-react/icons/sparkles';
import User from 'lucide-react/icons/user';

/**
 * Onboarding step interface
 */
export interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  illustration?: React.ReactNode;
}

/**
 * Onboarding steps content
 */
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to caldav-tasks',
    description:
      'A lightweight app that syncs with your CalDAV server. Keep your tasks organized across all your devices.',
    icon: <FolderKanban className="w-12 h-12 text-primary-500" />,
    illustration: (
      <div className="flex items-center justify-center gap-4 py-8">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
          <FolderKanban className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
    ),
  },
  {
    title: 'Connect your CalDAV account',
    description:
      'Add your CalDAV server credentials to sync your tasks. We support Nextcloud, Fastmail, and any standard CalDAV server.',
    icon: <User className="w-12 h-12 text-primary-500" />,
    illustration: (
      <div className="flex items-center justify-center gap-4 py-8">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <ArrowRight className="w-6 h-6 text-surface-400" />
        <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
      </div>
    ),
  },
  {
    title: 'Organize With Calendars & Tags',
    description:
      'Create multiple calendars for different projects. Use tags to categorize tasks across calendars. Everything stays in sync.',
    icon: <Calendar className="w-12 h-12 text-primary-500" />,
    illustration: (
      <div className="flex items-center justify-center gap-2 py-8 flex-wrap">
        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
          Work
        </span>
        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
          Personal
        </span>
        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
          Urgent
        </span>
        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
          Ideas
        </span>
      </div>
    ),
  },
  {
    title: "You're All Set!",
    description:
      'Start adding tasks and stay productive. Your tasks will sync automatically in the background.',
    icon: <CheckCircle2 className="w-12 h-12 text-primary-500" />,
    illustration: (
      <div className="flex items-center justify-center py-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center animate-pulse">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
      </div>
    ),
  },
];
