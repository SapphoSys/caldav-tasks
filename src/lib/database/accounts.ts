import { getDb, notifyListeners } from '$lib/database/connection';
import { rowToAccount, rowToCalendar } from '$lib/database/converters';
import { getUIState } from '$lib/database/ui';
import type { Account } from '$types';
import type { AccountRow, CalendarRow } from '$types/database';
import { generateUUID } from '$utils/misc';

export const getAllAccounts = async (): Promise<Account[]> => {
  const database = await getDb();

  const accountRows = await database.select<AccountRow[]>(
    'SELECT * FROM accounts ORDER BY sort_order ASC',
  );
  const calendarRows = await database.select<CalendarRow[]>(
    'SELECT * FROM calendars ORDER BY sort_order ASC',
  );
  const calendars = calendarRows.map(rowToCalendar);

  return accountRows.map((row) => rowToAccount(row, calendars));
};

export const getAccountById = async (id: string): Promise<Account | undefined> => {
  const accounts = await getAllAccounts();
  return accounts.find((a) => a.id === id);
};

export const createAccount = async (accountData: Partial<Account>): Promise<Account> => {
  const database = await getDb();

  const maxOrderRow = await database.select<[{ max_order: number | null }]>(
    'SELECT MAX(sort_order) as max_order FROM accounts',
  );
  const maxOrder = maxOrderRow[0]?.max_order ?? 0;

  const account: Account = {
    id: accountData.id ?? generateUUID(),
    name: accountData.name ?? 'New Account',
    serverUrl: accountData.serverUrl ?? '',
    username: accountData.username ?? '',
    password: accountData.password ?? '',
    serverType: accountData.serverType,
    calendars: [],
    isActive: true,
    sortOrder: accountData.sortOrder || maxOrder + 100,
  };

  await database.execute(
    `INSERT INTO accounts (id, name, server_url, username, password, server_type, last_sync, is_active, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      account.id,
      account.name,
      account.serverUrl,
      account.username,
      account.password,
      account.serverType || null,
      account.lastSync ? account.lastSync.toISOString() : null,
      account.isActive ? 1 : 0,
      account.sortOrder,
    ],
  );

  // Set as active account if none set
  const uiState = await getUIState();
  if (!uiState.activeAccountId) {
    await database.execute(`UPDATE ui_state SET active_account_id = $1 WHERE id = 1`, [account.id]);
  }

  notifyListeners();
  return account;
};

export const updateAccount = async (
  id: string,
  updates: Partial<Account>,
): Promise<Account | undefined> => {
  const database = await getDb();
  const existing = await getAccountById(id);
  if (!existing) return undefined;

  const updatedAccount: Account = { ...existing, ...updates };

  await database.execute(
    `UPDATE accounts SET name = $1, server_url = $2, username = $3, password = $4, server_type = $5, last_sync = $6, is_active = $7, sort_order = $8
     WHERE id = $9`,
    [
      updatedAccount.name,
      updatedAccount.serverUrl,
      updatedAccount.username,
      updatedAccount.password,
      updatedAccount.serverType || null,
      updatedAccount.lastSync ? updatedAccount.lastSync.toISOString() : null,
      updatedAccount.isActive ? 1 : 0,
      updatedAccount.sortOrder,
      id,
    ],
  );

  notifyListeners();
  return updatedAccount;
};

export const deleteAccount = async (id: string) => {
  const database = await getDb();

  // Delete cascades to calendars and tasks via foreign keys
  await database.execute('DELETE FROM accounts WHERE id = $1', [id]);

  // Update UI state
  const accounts = await getAllAccounts();
  const uiState = await getUIState();
  if (uiState.activeAccountId === id) {
    await database.execute(`UPDATE ui_state SET active_account_id = $1 WHERE id = 1`, [
      accounts[0]?.id || null,
    ]);
  }

  notifyListeners();
};
