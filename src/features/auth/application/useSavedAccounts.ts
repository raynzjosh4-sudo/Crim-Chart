import { useState, useEffect } from 'react';

export interface SavedAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  notificationsCount: number;
}

export function useSavedAccounts() {
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);

  useEffect(() => {
    // In a full implementation, this watches your local SQLite database (e.g. expo-sqlite)
    // for all logged-in accounts on the device.
    // We provide an empty list for now until the local DB is fully implemented.
    setAccounts([]);
  }, []);

  return accounts;
}
