// Local Storage adapter implementation

/**
 * Local Storage adapter for browser storage
 * @implements {import('../storage-types.js').StorageAdapter}
 */
export class LocalStorageAdapter {
  constructor() {
    this.name = 'localStorage';
    this.available = this.checkAvailability();
  }

  /**
   * Check if localStorage is available
   * @returns {boolean}
   */
  checkAvailability() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      
      // Test write/read/delete
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, 'test');
      const result = window.localStorage.getItem(testKey);
      window.localStorage.removeItem(testKey);
      
      return result === 'test';
    } catch (error) {
      console.warn('localStorage not available:', error);
      return false;
    }
  }

  /**
   * Get item from localStorage
   * @param {string} key
   * @returns {Promise<any>}
   */
  async getItem(key) {
    if (!this.available) {
      throw new Error('localStorage not available');
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      throw new Error(`Failed to read ${key} from localStorage`);
    }
  }

  /**
   * Set item in localStorage
   * @param {string} key
   * @param {any} value
   * @returns {Promise<void>}
   */
  async setItem(key, value) {
    if (!this.available) {
      throw new Error('localStorage not available');
    }

    try {
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded');
      }
      console.error('Error writing to localStorage:', error);
      throw new Error(`Failed to write ${key} to localStorage`);
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key
   * @returns {Promise<void>}
   */
  async removeItem(key) {
    if (!this.available) {
      throw new Error('localStorage not available');
    }

    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      throw new Error(`Failed to remove ${key} from localStorage`);
    }
  }

  /**
   * Clear all localStorage
   * @returns {Promise<void>}
   */
  async clear() {
    if (!this.available) {
      throw new Error('localStorage not available');
    }

    try {
      // Only clear our app's keys to avoid affecting other apps
      const keysToRemove = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('group-expense-splitter-')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => window.localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      throw new Error('Failed to clear localStorage');
    }
  }

  /**
   * Get approximate storage size in bytes
   * @returns {Promise<number>}
   */
  async getSize() {
    if (!this.available) {
      return 0;
    }

    try {
      let totalSize = 0;
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('group-expense-splitter-')) {
          const value = window.localStorage.getItem(key);
          totalSize += key.length + (value ? value.length : 0);
        }
      }
      return totalSize * 2; // Approximate UTF-16 encoding
    } catch (error) {
      console.error('Error calculating localStorage size:', error);
      return 0;
    }
  }
}