import { updateAccount } from '$lib/database/accounts';
import { loggers } from '$lib/logger';
import { loadDataStore, saveDataStore } from '$lib/store';

const log = loggers.dataStore;

export const reorderAccounts = (activeId: string, overId: string) => {
  if (activeId === overId) return;

  const data = loadDataStore();
  const accounts = [...data.accounts].sort((a, b) => a.sortOrder - b.sortOrder);
  const activeIndex = accounts.findIndex((a) => a.id === activeId);
  const overIndex = accounts.findIndex((a) => a.id === overId);

  if (activeIndex === -1 || overIndex === -1) return;

  // Move active to over position
  const [moved] = accounts.splice(activeIndex, 1);
  accounts.splice(overIndex, 0, moved);

  // Reassign sort orders with gaps
  const reordered = accounts.map((acc, index) => ({
    ...acc,
    sortOrder: (index + 1) * 100,
  }));

  // Persist only the accounts whose sort order actually changed
  for (const acc of reordered) {
    const original = data.accounts.find((a) => a.id === acc.id);
    if (original?.sortOrder !== acc.sortOrder) {
      log.info(`Updating sort_order for account "${acc.name}": ${acc.sortOrder}`);
      updateAccount(acc.id, { sortOrder: acc.sortOrder }).catch((e) =>
        log.error('Failed to persist account sort order:', e),
      );
    }
  }

  saveDataStore({ ...data, accounts: reordered });
};
