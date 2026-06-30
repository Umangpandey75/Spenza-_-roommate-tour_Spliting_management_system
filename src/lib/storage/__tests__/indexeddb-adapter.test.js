// Unit tests for IndexedDBAdapter
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { IndexedDBAdapter } from '../adapters/indexeddb-adapter.js';

// Mock IndexedDB
const mockIDBRequest = {
  result: null,
  error: null,
  onsuccess: null,
  onerror: null,
  onupgradeneeded: null,
};

const mockIDBDatabase = {
  objectStoreNames: {
    contains: vi.fn(),
  },
  createObjectStore: vi.fn(),
  transaction: vi.fn(),
  close: vi.fn(),
};

const mockIDBObjectStore = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  getAll: vi.fn(),
};

const mockIDBTransaction = {
  objectStore: vi.fn().mockReturnValue(mockIDBObjectStore),
};

const mockIndexedDB = {
  open: vi.fn(),
};

// Mock navigator.storage
const mockNavigatorStorage = {
  estimate: vi.fn(),
};

Object.defineProperty(global, 'navigator', {
  value: {
    storage: mockNavigatorStorage,
  },
  writable: true,
});

// Mock window object
Object.defineProperty(global, 'window', {
  value: {
    indexedDB: mockIndexedDB,
  },
  writable: true,
});

describe('IndexedDBAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new IndexedDBAdapter();
    vi.clearAllMocks();
    
    // Reset mock objects
    mockIDBRequest.result = null;
    mockIDBRequest.error = null;
    mockIDBRequest.onsuccess = null;
    mockIDBRequest.onerror = null;
    mockIDBRequest.onupgradeneeded = null;
    
    mockIDBDatabase.objectStoreNames.contains.mockReturnValue(false);
    mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('availability check', () => {
    it('should be available when IndexedDB exists', () => {
      expect(adapter.available).toBe(true);
    });

    it('should not be available when IndexedDB is null', () => {
      Object.defineProperty(global, 'window', {
        value: {
          indexedDB: null,
        },
        writable: true,
      });

      const adapter = new IndexedDBAdapter();

      expect(adapter.available).toBe(false);

      // Restore
      Object.defineProperty(global, 'window', {
        value: {
          indexedDB: mockIndexedDB,
        },
        writable: true,
      });
    });

    it.skip('should not be available when window is undefined', () => {
      // Skipping this test as deleting global.window is not allowed in this environment
    });
  });

  describe('database initialization', () => {
    it('should initialize database successfully', async () => {
      mockIndexedDB.open.mockReturnValue(mockIDBRequest);
      
      // Simulate successful database opening
      setTimeout(() => {
        mockIDBRequest.result = mockIDBDatabase;
        mockIDBRequest.onsuccess({ target: mockIDBRequest });
      }, 0);

      const db = await adapter.initDB();

      expect(db).toBe(mockIDBDatabase);
      expect(adapter.db).toBe(mockIDBDatabase);
    });

    it('should handle database opening errors', async () => {
      mockIndexedDB.open.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.onerror();
      }, 0);

      await expect(adapter.initDB()).rejects.toThrow('Failed to open IndexedDB');
    });

    it('should create object stores on upgrade', async () => {
      mockIndexedDB.open.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.result = mockIDBDatabase;
        mockIDBRequest.onupgradeneeded({ target: mockIDBRequest });
        mockIDBRequest.onsuccess({ target: mockIDBRequest });
      }, 0);

      await adapter.initDB();

      expect(mockIDBDatabase.createObjectStore).toHaveBeenCalledTimes(3);
      expect(mockIDBDatabase.createObjectStore).toHaveBeenCalledWith('groups', { keyPath: 'id' });
      expect(mockIDBDatabase.createObjectStore).toHaveBeenCalledWith('settings');
      expect(mockIDBDatabase.createObjectStore).toHaveBeenCalledWith('metadata');
    });

    it('should not create existing object stores', async () => {
      mockIDBDatabase.objectStoreNames.contains.mockReturnValue(true);
      mockIndexedDB.open.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.result = mockIDBDatabase;
        mockIDBRequest.onupgradeneeded({ target: mockIDBRequest });
        mockIDBRequest.onsuccess({ target: mockIDBRequest });
      }, 0);

      await adapter.initDB();

      expect(mockIDBDatabase.createObjectStore).not.toHaveBeenCalled();
    });

    it('should return existing database connection', async () => {
      adapter.db = mockIDBDatabase;

      const db = await adapter.initDB();

      expect(db).toBe(mockIDBDatabase);
      expect(mockIndexedDB.open).not.toHaveBeenCalled();
    });

    it('should throw error when IndexedDB not available', async () => {
      adapter.available = false;

      await expect(adapter.initDB()).rejects.toThrow('IndexedDB not available');
    });
  });

  describe('getItem', () => {
    beforeEach(async () => {
      adapter.db = mockIDBDatabase;
    });

    it('should get item from IndexedDB', async () => {
      const testValue = { test: 'value' };
      mockIDBObjectStore.get.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.result = { key: 'test-key', value: testValue };
        mockIDBRequest.onsuccess();
      }, 0);

      const result = await adapter.getItem('test-key');

      expect(result).toEqual(testValue);
      expect(mockIDBObjectStore.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null for non-existent item', async () => {
      mockIDBObjectStore.get.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.result = null;
        mockIDBRequest.onsuccess();
      }, 0);

      const result = await adapter.getItem('non-existent');

      expect(result).toBeNull();
    });

    it('should handle get errors', async () => {
      mockIDBObjectStore.get.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.onerror();
      }, 0);

      await expect(adapter.getItem('test-key')).rejects.toThrow('Failed to read test-key from IndexedDB');
    });
  });

  describe('setItem', () => {
    beforeEach(async () => {
      adapter.db = mockIDBDatabase;
    });

    it('should set item in IndexedDB', async () => {
      const testValue = { test: 'value' };
      mockIDBObjectStore.put.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.onsuccess();
      }, 0);

      await adapter.setItem('test-key', testValue);

      expect(mockIDBObjectStore.put).toHaveBeenCalledWith({ key: 'test-key', value: testValue });
    });

    it('should handle set errors', async () => {
      mockIDBObjectStore.put.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.onerror();
      }, 0);

      await expect(adapter.setItem('test-key', {})).rejects.toThrow('Failed to write test-key to IndexedDB');
    });
  });

  describe('removeItem', () => {
    beforeEach(async () => {
      adapter.db = mockIDBDatabase;
    });

    it('should remove item from IndexedDB', async () => {
      mockIDBObjectStore.delete.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.onsuccess();
      }, 0);

      await adapter.removeItem('test-key');

      expect(mockIDBObjectStore.delete).toHaveBeenCalledWith('test-key');
    });

    it('should handle remove errors', async () => {
      mockIDBObjectStore.delete.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.onerror();
      }, 0);

      await expect(adapter.removeItem('test-key')).rejects.toThrow('Failed to remove test-key from IndexedDB');
    });
  });

  describe('clear', () => {
    beforeEach(async () => {
      adapter.db = mockIDBDatabase;
    });

    it('should clear all object stores', async () => {
      mockIDBObjectStore.clear.mockReturnValue(mockIDBRequest);
      
      // Mock successful clear for all stores - need to call onsuccess for each Promise.all
      const clearPromise = adapter.clear();
      
      // Trigger success for all three stores
      setTimeout(() => {
        mockIDBRequest.onsuccess();
        mockIDBRequest.onsuccess();
        mockIDBRequest.onsuccess();
      }, 0);

      await clearPromise;

      expect(mockIDBObjectStore.clear).toHaveBeenCalledTimes(3);
    });

    it('should handle clear errors', async () => {
      mockIDBObjectStore.clear.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.onerror();
      }, 0);

      await expect(adapter.clear()).rejects.toThrow('Failed to clear');
    });
  });

  describe('getSize', () => {
    it('should get storage size estimate', async () => {
      mockNavigatorStorage.estimate.mockResolvedValue({ usage: 1024 });

      const size = await adapter.getSize();

      expect(size).toBe(1024);
    });

    it('should return 0 when storage estimate not available', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      const size = await adapter.getSize();

      expect(size).toBe(0);

      // Restore
      Object.defineProperty(global, 'navigator', {
        value: {
          storage: mockNavigatorStorage,
        },
        writable: true,
      });
    });

    it('should handle storage estimate errors', async () => {
      mockNavigatorStorage.estimate.mockRejectedValue(new Error('Estimate error'));

      const size = await adapter.getSize();

      expect(size).toBe(0);
    });
  });

  describe('group operations', () => {
    beforeEach(async () => {
      adapter.db = mockIDBDatabase;
    });

    it('should store a group', async () => {
      const testGroup = { id: 'group1', name: 'Test Group' };
      mockIDBObjectStore.put.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.onsuccess();
      }, 0);

      await adapter.storeGroup(testGroup);

      expect(mockIDBObjectStore.put).toHaveBeenCalledWith(testGroup);
    });

    it('should get a group', async () => {
      const testGroup = { id: 'group1', name: 'Test Group' };
      mockIDBObjectStore.get.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.result = testGroup;
        mockIDBRequest.onsuccess();
      }, 0);

      const result = await adapter.getGroup('group1');

      expect(result).toEqual(testGroup);
      expect(mockIDBObjectStore.get).toHaveBeenCalledWith('group1');
    });

    it('should get all groups', async () => {
      const testGroups = [
        { id: 'group1', name: 'Test Group 1' },
        { id: 'group2', name: 'Test Group 2' },
      ];
      mockIDBObjectStore.getAll.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.result = testGroups;
        mockIDBRequest.onsuccess();
      }, 0);

      const result = await adapter.getAllGroups();

      expect(result).toEqual(testGroups);
    });

    it('should delete a group', async () => {
      mockIDBObjectStore.delete.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.onsuccess();
      }, 0);

      await adapter.deleteGroup('group1');

      expect(mockIDBObjectStore.delete).toHaveBeenCalledWith('group1');
    });

    it('should handle group operation errors', async () => {
      mockIDBObjectStore.put.mockReturnValue(mockIDBRequest);
      
      setTimeout(() => {
        mockIDBRequest.onerror();
      }, 0);

      await expect(adapter.storeGroup({ id: 'group1' })).rejects.toThrow('Failed to store group group1');
    });
  });

  describe('adapter properties', () => {
    it('should have correct name', () => {
      expect(adapter.name).toBe('indexedDB');
    });

    it('should implement all required methods', () => {
      expect(typeof adapter.getItem).toBe('function');
      expect(typeof adapter.setItem).toBe('function');
      expect(typeof adapter.removeItem).toBe('function');
      expect(typeof adapter.clear).toBe('function');
      expect(typeof adapter.getSize).toBe('function');
      expect(typeof adapter.storeGroup).toBe('function');
      expect(typeof adapter.getGroup).toBe('function');
      expect(typeof adapter.getAllGroups).toBe('function');
      expect(typeof adapter.deleteGroup).toBe('function');
    });
  });
});