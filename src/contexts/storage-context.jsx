'use client';

import { createContext, useContext, useMemo } from 'react';
import { StorageManager } from '../lib/storage/storage-manager';

const StorageContext = createContext(null);

export function StorageProvider({ children }) {
  const storageManager = useMemo(() => new StorageManager(), []);
  
  return (
    <StorageContext.Provider value={storageManager}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}