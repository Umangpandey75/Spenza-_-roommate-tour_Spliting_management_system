// IndexedDB adapter implementation
import { INDEXEDDB_CONFIG } from '../storage-types.js';

/**
 * IndexedDB adapter for browser storage
 * @implements {import('../storage-types.js').StorageAdapter}
 */
export class IndexedDBAdapter {
  constructor() {
    this.name = 'indexedDB';
    this.available = this.checkAvailability();
    this.db = null;
  }

  /**
   * Check if IndexedDB is available
   * @returns {boolean}
   */
  checkAvailability() {
    try {
      return typeof window !== 'undefined' && 
             'indexedDB' in window && 
             window.indexedDB !== null;
    } catch (error) {
      console.warn('IndexedDB not available:', error);
      return false;
    }
  }

  /**
   * Initialize IndexedDB connection
   * @returns {Promise<IDBDatabase>}
   */
  async initDB() {
    if (this.db) {
      return this.db;
    }

    if (!this.available) {
      throw new Error('IndexedDB not available');
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(
        INDEXEDDB_CONFIG.DATABASE_NAME, 
        INDEXEDDB_CONFIG.VERSION
      );

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains(INDEXEDDB_CONFIG.STORES.GROUPS)) {
          db.createObjectStore(INDEXEDDB_CONFIG.STORES.GROUPS, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(INDEXEDDB_CONFIG.STORES.SETTINGS)) {
          db.createObjectStore(INDEXEDDB_CONFIG.STORES.SETTINGS);
        }
        
        if (!db.objectStoreNames.contains(INDEXEDDB_CONFIG.STORES.METADATA)) {
          db.createObjectStore(INDEXEDDB_CONFIG.STORES.METADATA);
        }
      };
    });
  }

  /**
   * Get item from IndexedDB
   * @param {string} key
   * @returns {Promise<any>}
   */
  async getItem(key) {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INDEXEDDB_CONFIG.STORES.METADATA], 'readonly');
      const store = transaction.objectStore(INDEXEDDB_CONFIG.STORES.METADATA);
      const request = store.get(key);

      request.onerror = () => {
        reject(new Error(`Failed to read ${key} from IndexedDB`));
      };

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : null);
      };
    });
  }

  /**
   * Set item in IndexedDB
   * @param {string} key
   * @param {any} value
   * @returns {Promise<void>}
   */
  async setItem(key, value) {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INDEXEDDB_CONFIG.STORES.METADATA], 'readwrite');
      const store = transaction.objectStore(INDEXEDDB_CONFIG.STORES.METADATA);
      const request = store.put({ key, value });

      request.onerror = () => {
        reject(new Error(`Failed to write ${key} to IndexedDB`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Remove item from IndexedDB
   * @param {string} key
   * @returns {Promise<void>}
   */
  async removeItem(key) {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INDEXEDDB_CONFIG.STORES.METADATA], 'readwrite');
      const store = transaction.objectStore(INDEXEDDB_CONFIG.STORES.METADATA);
      const request = store.delete(key);

      request.onerror = () => {
        reject(new Error(`Failed to remove ${key} from IndexedDB`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Clear all IndexedDB data
   * @returns {Promise<void>}
   */
  async clear() {
    const db = await this.initDB();
    
    const stores = [
      INDEXEDDB_CONFIG.STORES.GROUPS,
      INDEXEDDB_CONFIG.STORES.SETTINGS,
      INDEXEDDB_CONFIG.STORES.METADATA,
    ];

    return Promise.all(stores.map(storeName => 
      new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onerror = () => {
          reject(new Error(`Failed to clear ${storeName} store`));
        };

        request.onsuccess = () => {
          resolve();
        };
      })
    ));
  }

  /**
   * Get approximate storage size in bytes
   * @returns {Promise<number>}
   */
  async getSize() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return estimate.usage || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error calculating IndexedDB size:', error);
      return 0;
    }
  }

  /**
   * Store a group in IndexedDB
   * @param {import('../../types/index.js').Group} group
   * @returns {Promise<void>}
   */
  async storeGroup(group) {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INDEXEDDB_CONFIG.STORES.GROUPS], 'readwrite');
      const store = transaction.objectStore(INDEXEDDB_CONFIG.STORES.GROUPS);
      const request = store.put(group);

      request.onerror = () => {
        reject(new Error(`Failed to store group ${group.id}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  /**
   * Get a group from IndexedDB
   * @param {string} groupId
   * @returns {Promise<import('../../types/index.js').Group|null>}
   */
  async getGroup(groupId) {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INDEXEDDB_CONFIG.STORES.GROUPS], 'readonly');
      const store = transaction.objectStore(INDEXEDDB_CONFIG.STORES.GROUPS);
      const request = store.get(groupId);

      request.onerror = () => {
        reject(new Error(`Failed to get group ${groupId}`));
      };

      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }

  /**
   * Get all groups from IndexedDB
   * @returns {Promise<import('../../types/index.js').Group[]>}
   */
  async getAllGroups() {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INDEXEDDB_CONFIG.STORES.GROUPS], 'readonly');
      const store = transaction.objectStore(INDEXEDDB_CONFIG.STORES.GROUPS);
      const request = store.getAll();

      request.onerror = () => {
        reject(new Error('Failed to get all groups'));
      };

      request.onsuccess = () => {
        resolve(request.result || []);
      };
    });
  }

  /**
   * Delete a group from IndexedDB
   * @param {string} groupId
   * @returns {Promise<void>}
   */
  async deleteGroup(groupId) {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INDEXEDDB_CONFIG.STORES.GROUPS], 'readwrite');
      const store = transaction.objectStore(INDEXEDDB_CONFIG.STORES.GROUPS);
      const request = store.delete(groupId);

      request.onerror = () => {
        reject(new Error(`Failed to delete group ${groupId}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }
}