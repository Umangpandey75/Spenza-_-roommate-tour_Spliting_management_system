// Storage-specific type definitions and constants

/**
 * @typedef {Object} StorageSchema
 * @property {number} version - Schema version for migrations
 * @property {Record<string, import('../../types/index.js').Group>} groups - Groups indexed by ID
 * @property {import('../../types/index.js').UserSettings} settings - User settings
 * @property {Date} lastSync - Last synchronization timestamp
 */

/**
 * @typedef {Object} StorageAdapter
 * @property {string} name - Name of the storage adapter
 * @property {boolean} available - Whether this adapter is available
 * @property {(key: string) => Promise<any>} getItem - Get item from storage
 * @property {(key: string, value: any) => Promise<void>} setItem - Set item in storage
 * @property {(key: string) => Promise<void>} removeItem - Remove item from storage
 * @property {() => Promise<void>} clear - Clear all storage
 * @property {() => Promise<number>} getSize - Get storage size in bytes
 */

/**
 * @typedef {Object} MigrationStep
 * @property {number} fromVersion - Version to migrate from
 * @property {number} toVersion - Version to migrate to
 * @property {(data: any) => any} migrate - Migration function
 * @property {string} description - Description of the migration
 */

/**
 * @typedef {Object} ExportData
 * @property {number} version - Export format version
 * @property {Date} exportedAt - When the data was exported
 * @property {Record<string, import('../../types/index.js').Group>} groups - Exported groups
 * @property {import('../../types/index.js').UserSettings} settings - Exported settings
 */

export const STORAGE_VERSION = 1;

export const STORAGE_KEYS = {
  SCHEMA: 'group-expense-splitter-schema',
  GROUPS: 'group-expense-splitter-groups',
  SETTINGS: 'group-expense-splitter-settings',
  VERSION: 'group-expense-splitter-version',
};

export const INDEXEDDB_CONFIG = {
  DATABASE_NAME: 'GroupExpenseSplitter',
  VERSION: 1,
  STORES: {
    GROUPS: 'groups',
    SETTINGS: 'settings',
    METADATA: 'metadata',
  },
};

export const STORAGE_LIMITS = {
  LOCAL_STORAGE_QUOTA: 5 * 1024 * 1024, // 5MB
  INDEXEDDB_QUOTA: 50 * 1024 * 1024, // 50MB
  MAX_GROUPS: 100,
  MAX_EXPENSES_PER_GROUP: 1000,
};

export const EXPORT_FORMATS = {
  JSON: 'json',
  CSV: 'csv',
};