import { getDb, notifyListeners } from '$lib/database/connection';
import type { PendingDeletionRow } from '$types/database';

export interface PendingDeletion {
  uid: string;
  href: string;
  accountId: string;
  calendarId: string;
}

export const getPendingDeletions = async (): Promise<PendingDeletion[]> => {
  const database = await getDb();
  const rows = await database.select<PendingDeletionRow[]>('SELECT * FROM pending_deletions');
  return rows.map((row) => ({
    uid: row.uid,
    href: row.href,
    accountId: row.account_id,
    calendarId: row.calendar_id,
  }));
};

export const clearPendingDeletion = async (uid: string) => {
  const database = await getDb();
  await database.execute('DELETE FROM pending_deletions WHERE uid = $1', [uid]);
  notifyListeners();
};
