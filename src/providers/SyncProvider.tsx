import { type ReactNode, useCallback, useState } from 'react';
import { SyncContext, type SyncStore } from '$context/syncContext';

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const [syncingCalendarId, setSyncingCalendarIdState] = useState<string | null>(null);

  const setSyncingCalendarId = useCallback((id: string | null) => {
    setSyncingCalendarIdState(id);
  }, []);

  const value: SyncStore = {
    syncingCalendarId,
    setSyncingCalendarId,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};
