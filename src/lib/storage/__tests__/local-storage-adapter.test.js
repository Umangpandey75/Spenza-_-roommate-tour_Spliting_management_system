// Unit tests for LocalStorageAdapter
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LocalStorageAdapter } from '../adapters/local-storage-adapter.js';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

// Mock window object
Object.defineProperty(global, 'window', {
  value: {
    localStorage: mockLocalStorage,
  },
  writable: true,
});

describe('LocalStorageAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new LocalStorageAdapter();
    vi.clearAllMocks();
    mockLocalStorage.length = 0;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('availability check', () => {
    it('should be available when localStorage works', () => {
      mockLocalStorage.setItem.mockImplementation(() => {});
      mockLocalStorage.getItem.mockReturnValue('test');
      mockLocalStorage.removeItem.mockImplementation(() => {});

      const adapter = new LocalStorageAdapter();

      expect(adapter.available).toBe(true);
    });

    it('should not be available when localStorage throws error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const adapter = new LocalStorageAdapter();

      expect(adapter.available).toBe(false);
    });

    it.skip('should not be available when window is undefined', () => {
      // Skipping this test as deleting global.window is not allowed in this environment
    });

    it('should not be available when localStorage is null', () => {
      Object.defineProperty(global, 'window', {
        value: {
          localStorage: null,
        },
        writable: true,
      });

      const adapter = new LocalStorageAdapter();

      expect(adapter.available).toBe(false);

      // Restore
      Object.defineProperty(global, 'window', {
        value: {
          localStorage: mockLocalStorage,
        },
        writable: true,
      });
    });
  });

  describe('getItem', () => {
    beforeEach(() => {
      adapter.available = true;
    });

    it('should get item from localStorage', async () => {
      const testData = { test: 'value' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));

      const result = await adapter.getItem('test-key');

      expect(result).toEqual(testData);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('should return null for non-existent item', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = await adapter.getItem('non-existent');

      expect(result).toBeNull();
    });

    it('should throw error when localStorage not available', async () => {
      adapter.available = false;

      await expect(adapter.getItem('test-key')).rejects.toThrow('localStorage not available');
    });

    it('should handle JSON parsing errors', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json');

      await expect(adapter.getItem('test-key')).rejects.toThrow('Failed to read test-key from localStorage');
    });
  });

  describe('setItem', () => {
    beforeEach(() => {
      adapter.available = true;
    });

    it('should set item in localStorage', async () => {
      const testData = { test: 'value' };
      mockLocalStorage.setItem.mockImplementation(() => {});

      await adapter.setItem('test-key', testData);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(testData));
    });

    it('should throw error when localStorage not available', async () => {
      adapter.available = false;

      await expect(adapter.setItem('test-key', {})).rejects.toThrow('localStorage not available');
    });

    it('should handle quota exceeded error', async () => {
      const quotaError = new Error('QuotaExceededError');
      quotaError.name = 'QuotaExceededError';
      mockLocalStorage.setItem.mockImplementation(() => {
        throw quotaError;
      });

      await expect(adapter.setItem('test-key', {})).rejects.toThrow('Storage quota exceeded');
    });

    it('should handle other storage errors', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      await expect(adapter.setItem('test-key', {})).rejects.toThrow('Failed to write test-key to localStorage');
    });
  });

  describe('removeItem', () => {
    beforeEach(() => {
      adapter.available = true;
    });

    it('should remove item from localStorage', async () => {
      mockLocalStorage.removeItem.mockImplementation(() => {});

      await adapter.removeItem('test-key');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('should throw error when localStorage not available', async () => {
      adapter.available = false;

      await expect(adapter.removeItem('test-key')).rejects.toThrow('localStorage not available');
    });

    it('should handle removal errors', async () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Removal error');
      });

      await expect(adapter.removeItem('test-key')).rejects.toThrow('Failed to remove test-key from localStorage');
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      adapter.available = true;
    });

    it('should clear only app-specific keys', async () => {
      mockLocalStorage.length = 3;
      mockLocalStorage.key
        .mockReturnValueOnce('group-expense-splitter-groups')
        .mockReturnValueOnce('other-app-data')
        .mockReturnValueOnce('group-expense-splitter-settings');
      mockLocalStorage.removeItem.mockImplementation(() => {});

      await adapter.clear();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('group-expense-splitter-groups');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('group-expense-splitter-settings');
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalledWith('other-app-data');
    });

    it('should throw error when localStorage not available', async () => {
      adapter.available = false;

      await expect(adapter.clear()).rejects.toThrow('localStorage not available');
    });

    it('should handle clear errors', async () => {
      mockLocalStorage.length = 1;
      mockLocalStorage.key.mockReturnValue('group-expense-splitter-test');
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Clear error');
      });

      await expect(adapter.clear()).rejects.toThrow('Failed to clear localStorage');
    });
  });

  describe('getSize', () => {
    beforeEach(() => {
      adapter.available = true;
    });

    it('should calculate storage size for app keys', async () => {
      mockLocalStorage.length = 3;
      mockLocalStorage.key
        .mockReturnValueOnce('group-expense-splitter-groups')
        .mockReturnValueOnce('other-app-data')
        .mockReturnValueOnce('group-expense-splitter-settings');
      mockLocalStorage.getItem
        .mockReturnValueOnce('{"groups":{}}') // 13 characters
        .mockReturnValueOnce('{"theme":"dark"}'); // 16 characters

      const size = await adapter.getSize();

      // Key lengths: 'group-expense-splitter-groups' (29) + 'group-expense-splitter-settings' (32)
      // Value lengths: 13 + 16 = 29
      // Total: (29 + 13 + 32 + 16) * 2 = 178 (UTF-16 encoding, actual calculation)
      expect(size).toBe(178);
    });

    it('should return 0 when localStorage not available', async () => {
      adapter.available = false;

      const size = await adapter.getSize();

      expect(size).toBe(0);
    });

    it('should handle size calculation errors', async () => {
      mockLocalStorage.length = 1;
      mockLocalStorage.key.mockImplementation(() => {
        throw new Error('Size calculation error');
      });

      const size = await adapter.getSize();

      expect(size).toBe(0);
    });

    it('should handle null values', async () => {
      mockLocalStorage.length = 1;
      mockLocalStorage.key.mockReturnValue('group-expense-splitter-test');
      mockLocalStorage.getItem.mockReturnValue(null);

      const size = await adapter.getSize();

      // Key length: 'group-expense-splitter-test' (27) * 2 = 54
      expect(size).toBe(54);
    });
  });

  describe('adapter properties', () => {
    it('should have correct name', () => {
      expect(adapter.name).toBe('localStorage');
    });

    it('should implement all required methods', () => {
      expect(typeof adapter.getItem).toBe('function');
      expect(typeof adapter.setItem).toBe('function');
      expect(typeof adapter.removeItem).toBe('function');
      expect(typeof adapter.clear).toBe('function');
      expect(typeof adapter.getSize).toBe('function');
    });
  });
});