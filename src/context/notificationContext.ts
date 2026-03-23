import { createContext } from 'react';
import type { NotificationPermissionResult, NotificationPermissionStatus } from '$lib/notifications';

export interface NotificationContextValue {
  /** macOS system permission status. Always null on Windows/Linux. */
  permissionStatus: NotificationPermissionStatus | null;
  isCheckingPermission: boolean;
  /** Re-check the current system permission and sync app state. */
  checkPermission: () => Promise<void>;
  /** Trigger the macOS permission request dialog. */
  requestPermission: () => Promise<NotificationPermissionResult>;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);
