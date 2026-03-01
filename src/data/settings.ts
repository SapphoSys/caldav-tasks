/**
 * Settings data and configuration options
 */

import type { ServerType, StartOfWeek } from '@/types';

/**
 * Days of week options for calendar start day
 */
export const WEEK_START_OPTIONS: Array<{ value: StartOfWeek; label: string }> = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
];

/**
 * Sync interval options (in minutes)
 */
export const SYNC_INTERVAL_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 1, label: 'Every 1 minute' },
  { value: 5, label: 'Every 5 minutes' },
  { value: 15, label: 'Every 15 minutes' },
  { value: 30, label: 'Every 30 minutes' },
  { value: 60, label: 'Every hour' },
];

/**
 * Server type options with descriptions
 */
export interface ServerTypeOption {
  value: ServerType;
  label: string;
  description: string;
}

export const SERVER_TYPE_OPTIONS: ServerTypeOption[] = [
  {
    value: 'generic',
    label: 'Generic (auto-detect)',
    description: 'Uses .well-known/caldav. Good enough for most servers.',
  },
  {
    value: 'nextcloud',
    label: 'Nextcloud',
    description: 'Uses /remote.php/dav/ path structure',
  },
  {
    value: 'rustical',
    label: 'RustiCal',
    description: 'Uses /caldav/principal/{username}/ path structure',
  },
  {
    value: 'radicale',
    label: 'Radicale',
    description: 'Uses /{username}/ path structure',
  },
  {
    value: 'baikal',
    label: 'Baikal',
    description: 'Uses /dav.php/principals/{username}/ path structure',
  },
];

/**
 * Get description for a server type
 */
export function getServerTypeDescription(type: ServerType): string {
  return SERVER_TYPE_OPTIONS.find((opt) => opt.value === type)?.description || '';
}
