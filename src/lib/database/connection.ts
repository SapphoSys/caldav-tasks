import Database from '@tauri-apps/plugin-sql';
import { loggers } from '$lib/logger';

const log = loggers.database;

// Database connection instance
let db: Database | null = null;

// Database name
const DB_NAME = 'sqlite:chiri.db';

// Event listeners for data changes
type DataChangeListener = () => void;
const listeners: Set<DataChangeListener> = new Set();

export const subscribeToDataChanges = (listener: DataChangeListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const notifyListeners = () => {
  listeners.forEach((listener) => {
    listener();
  });
};

// Initialize database connection
export const initDatabase = async (): Promise<Database> => {
  if (db) return db;

  try {
    db = await Database.load(DB_NAME);
    log.info('Connected to SQLite database');
    return db;
  } catch (error) {
    log.error('Failed to connect:', error);
    throw error;
  }
};

// Get database instance (ensures initialization)
export const getDb = async (): Promise<Database> => {
  if (!db) {
    await initDatabase();
  }
  return db!;
};
