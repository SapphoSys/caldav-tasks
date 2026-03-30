import {
  DEFAULT_ACCOUNT_SORT_CONFIG,
  DEFAULT_CALENDAR_SORT_CONFIG,
  DEFAULT_SORT_CONFIG,
  DEFAULT_TAG_SORT_CONFIG,
} from '$constants';
import {
  subscribeToDataChanges as dbSubscribeToDataChanges,
  initDatabase,
} from '$lib/database/connection';
import { getDataSnapshot as dbGetDataSnapshot } from '$lib/database/snapshot';
import { loggers } from '$lib/logger';
import type { DataChangeListener, DataStore, UIState } from '$types/store';

const log = loggers.dataStore;

export const defaultUIState: UIState = {
  activeAccountId: null,
  activeCalendarId: null,
  activeTagId: null,
  selectedTaskId: null,
  searchQuery: '',
  sortConfig: DEFAULT_SORT_CONFIG,
  accountSortConfig: DEFAULT_ACCOUNT_SORT_CONFIG,
  calendarSortConfig: DEFAULT_CALENDAR_SORT_CONFIG,
  tagSortConfig: DEFAULT_TAG_SORT_CONFIG,
  showCompletedTasks: true,
  showUnstartedTasks: true,
  isEditorOpen: false,
};

export const defaultDataStore: DataStore = {
  tasks: [],
  tags: [],
  accounts: [],
  pendingDeletions: [],
  ui: defaultUIState,
};

// In-memory cache of the data store
let dataStoreCache: DataStore | null = null;
let isInitialized = false;
let initPromise: Promise<void> | null = null;

// Event listeners for data changes
const listeners: Set<DataChangeListener> = new Set();

export const subscribeToDataChanges = (listener: DataChangeListener) => {
  listeners.add(listener);
  // Also subscribe to database changes
  dbSubscribeToDataChanges(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const notifyListeners = () => {
  listeners.forEach((listener) => {
    listener();
  });
};

export const initializeDataStore = async () => {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await initDatabase();
    await refreshCache();
    isInitialized = true;
    log.info('Data store initialized with SQLite');
  })();

  return initPromise;
};

export const refreshCache = async () => {
  try {
    dataStoreCache = await dbGetDataSnapshot();
  } catch (error) {
    log.error('Failed to refresh cache:', error);
  }
};

export const loadDataStore = () => {
  if (!dataStoreCache) {
    log.warn('Data store not initialized, returning defaults');
    return { ...defaultDataStore };
  }
  return dataStoreCache;
};

export const saveDataStore = (data: DataStore) => {
  dataStoreCache = data;
  notifyListeners();
};

export const getDataSnapshot = () => {
  return loadDataStore();
};

export const getIsInitialized = () => {
  return isInitialized;
};
