import { createContext } from 'react';

interface SyncState {
  syncingCalendarId: string | null;
}

interface SyncActions {
  setSyncingCalendarId: (id: string | null) => void;
}

export type SyncStore = SyncState & SyncActions;

// Context for React components
export const SyncContext = createContext<SyncStore | null>(null);
