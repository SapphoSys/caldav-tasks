import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

interface SyncState {
  syncingCalendarId: string | null;
}

interface SyncActions {
  setSyncingCalendarId: (id: string | null) => void;
}

type SyncStore = SyncState & SyncActions;

const SyncContext = createContext<SyncStore | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const [syncingCalendarId, setSyncingCalendarIdState] = useState<string | null>(null);

  const setSyncingCalendarId = useCallback((id: string | null) => {
    setSyncingCalendarIdState(id);
  }, []);

  const value: SyncStore = {
    syncingCalendarId,
    setSyncingCalendarId,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSyncStore(): SyncStore {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSyncStore must be used within a SyncProvider');
  }
  return context;
}
