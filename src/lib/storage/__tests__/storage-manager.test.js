// Unit tests for StorageManager
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageManager } from '../storage-manager.js';

// Mock the adapters
vi.mock('../adapters/local-storage-adapter.js', () => ({
  LocalStorageAdapter: vi.fn().mockImplementation(() => ({
    name: 'localStorage',
    available: true,
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    getSize: vi.fn().mockResolvedValue(1024),
  })),
}));

vi.mock('../adapters/indexeddb-adapter.js', () => ({
  IndexedDBAdapter: vi.fn().mockImplementation(() => ({
    name: 'indexedDB',
    available: true,
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    getSize: vi.fn().mockResolvedValue(2048),
    getAllGroups: vi.fn(),
    getGroup: vi.fn(),
    storeGroup: vi.fn(),
    deleteGroup: vi.fn(),
  })),
}));

describe('StorageManager', () => {
  let storageManager;
  let mockLocalStorage;
  let mockIndexedDB;

  beforeEach(() => {
    storageManager = new StorageManager();
    mockLocalStorage = storageManager.adapters[0];
    mockIndexedDB = storageManager.adapters[1];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with available adapters', async () => {
      await storageManager.initialize();
      
      expect(storageManager.initialized).toBe(true);
      expect(storageManager.primaryAdapter).toBe(mockLocalStorage);
      expect(storageManager.fallbackAdapter).toBe(mockIndexedDB);
    });

    it('should handle no available adapters', async () => {
      mockLocalStorage.available = false;
      mockIndexedDB.available = false;
      
      await expect(storageManager.initialize()).rejects.toThrow('No storage adapters available');
    });

    it('should work with only one adapter available', async () => {
      mockIndexedDB.available = false;
      
      await storageManager.initialize();
      
      expect(storageManager.primaryAdapter).toBe(mockLocalStorage);
      expect(storageManager.fallbackAdapter).toBe(null);
    });
  });

  describe('schema management', () => {
    it('should create new schema if none exists', async () => {
      mockLocalStorage.getItem.mockResolvedValue(null);
      mockLocalStorage.setItem.mockResolvedValue();
      
      const schema = await storageManager.getSchema();
      
      expect(schema).toMatchObject({
        version: 1,
        groups: {},
        settings: expect.any(Object),
        lastSync: expect.any(Date),
      });
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should return existing schema', async () => {
      const existingSchema = {
        version: 1,
        groups: { 'group1': { id: 'group1', name: 'Test Group' } },
        settings: { theme: 'dark' },
        lastSync: new Date('2023-01-01'),
      };
      
      mockLocalStorage.getItem.mockResolvedValue(existingSchema);
      
      const schema = await storageManager.getSchema();
      
      expect(schema).toEqual(existingSchema);
    });

    it('should update schema with new lastSync', async () => {
      mockLocalStorage.setItem.mockResolvedValue();
      
      const schema = { version: 1, groups: {}, settings: {} };
      await storageManager.updateSchema(schema);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          ...schema,
          lastSync: expect.any(Date),
        })
      );
    });
  });

  describe('group operations', () => {
    const mockGroup = {
      id: 'group1',
      name: 'Test Group',
      currency: 'USD',
      createdAt: new Date('2023-01-01'),
      participants: [
        { id: 'p1', name: 'Alice', active: true, defaultWeight: 1 },
        { id: 'p2', name: 'Bob', active: true, defaultWeight: 1 },
      ],
      expenses: [
        {
          id: 'e1',
          groupId: 'group1',
          description: 'Dinner',
          amount: 60,
          currency: 'USD',
          date: new Date('2023-01-02'),
          category: 'Food & Dining',
          payerId: 'p1',
          split: [
            { participantId: 'p1', weight: 1, included: true },
            { participantId: 'p2', weight: 1, included: true },
          ],
        },
      ],
    };

    beforeEach(() => {
      mockLocalStorage.getItem.mockResolvedValue({
        version: 1,
        groups: { 'group1': mockGroup },
        settings: {},
        lastSync: new Date(),
      });
      mockLocalStorage.setItem.mockResolvedValue();
    });

    it('should get all groups', async () => {
      const groups = await storageManager.getGroups();
      
      expect(groups).toHaveLength(1);
      expect(groups[0]).toMatchObject({
        id: 'group1',
        name: 'Test Group',
      });
    });

    it('should get specific group by ID', async () => {
      const group = await storageManager.getGroup('group1');
      
      expect(group).toMatchObject({
        id: 'group1',
        name: 'Test Group',
      });
    });

    it('should return null for non-existent group', async () => {
      const group = await storageManager.getGroup('nonexistent');
      
      expect(group).toBeNull();
    });

    it('should save a group', async () => {
      await storageManager.saveGroup(mockGroup);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should validate group data before saving', async () => {
      const invalidGroup = { id: 'invalid' }; // Missing required fields
      
      await expect(storageManager.saveGroup(invalidGroup)).rejects.toThrow();
    });

    it('should delete a group', async () => {
      await storageManager.deleteGroup('group1');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('participant operations', () => {
    const mockGroup = {
      id: 'group1',
      name: 'Test Group',
      currency: 'USD',
      createdAt: new Date(),
      participants: [
        { id: 'p1', name: 'Alice', active: true, defaultWeight: 1 },
      ],
      expenses: [],
    };

    beforeEach(() => {
      mockLocalStorage.getItem.mockResolvedValue({
        version: 1,
        groups: { 'group1': mockGroup },
        settings: {},
        lastSync: new Date(),
      });
      mockLocalStorage.setItem.mockResolvedValue();
    });

    it('should add participant to group', async () => {
      const newParticipant = { id: 'p2', name: 'Bob', active: true, defaultWeight: 1 };
      
      await storageManager.addParticipant('group1', newParticipant);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should update participant in group', async () => {
      await storageManager.updateParticipant('group1', 'p1', { name: 'Alice Updated' });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should remove participant from group', async () => {
      await storageManager.removeParticipant('group1', 'p1');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should throw error when group not found', async () => {
      await expect(
        storageManager.addParticipant('nonexistent', { id: 'p2', name: 'Bob' })
      ).rejects.toThrow('Group nonexistent not found');
    });
  });

  describe('expense operations', () => {
    const mockGroup = {
      id: 'group1',
      name: 'Test Group',
      currency: 'USD',
      createdAt: new Date(),
      participants: [
        { id: 'p1', name: 'Alice', active: true, defaultWeight: 1 },
      ],
      expenses: [],
    };

    beforeEach(() => {
      mockLocalStorage.getItem.mockResolvedValue({
        version: 1,
        groups: { 'group1': mockGroup },
        settings: {},
        lastSync: new Date(),
      });
      mockLocalStorage.setItem.mockResolvedValue();
    });

    it('should add expense to group', async () => {
      const newExpense = {
        id: 'e1',
        groupId: 'group1',
        description: 'Lunch',
        amount: 25,
        currency: 'USD',
        date: new Date(),
        category: 'Food & Dining',
        payerId: 'p1',
        split: [{ participantId: 'p1', weight: 1, included: true }],
      };
      
      await storageManager.addExpense('group1', newExpense);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should update expense in group', async () => {
      // First add an expense
      mockGroup.expenses.push({
        id: 'e1',
        groupId: 'group1',
        description: 'Lunch',
        amount: 25,
        currency: 'USD',
        date: new Date(),
        category: 'Food & Dining',
        payerId: 'p1',
        split: [{ participantId: 'p1', weight: 1, included: true }],
      });
      
      await storageManager.updateExpense('group1', 'e1', { description: 'Updated Lunch' });
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should remove expense from group', async () => {
      // First add an expense
      mockGroup.expenses.push({
        id: 'e1',
        groupId: 'group1',
        description: 'Lunch',
        amount: 25,
        currency: 'USD',
        date: new Date(),
        category: 'Food & Dining',
        payerId: 'p1',
        split: [{ participantId: 'p1', weight: 1, included: true }],
      });
      
      await storageManager.removeExpense('group1', 'e1');
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should enforce expense limits', async () => {
      // Mock a group with maximum expenses
      const groupWithMaxExpenses = {
        ...mockGroup,
        expenses: new Array(1000).fill(null).map((_, i) => ({
          id: `e${i}`,
          groupId: 'group1',
          description: `Expense ${i}`,
          amount: 10,
          currency: 'USD',
          date: new Date(),
          category: 'Other',
          payerId: 'p1',
          split: [{ participantId: 'p1', weight: 1, included: true }],
        })),
      };
      
      mockLocalStorage.getItem.mockResolvedValue({
        version: 1,
        groups: { 'group1': groupWithMaxExpenses },
        settings: {},
        lastSync: new Date(),
      });
      
      const newExpense = {
        id: 'e1001',
        groupId: 'group1',
        description: 'Over limit',
        amount: 10,
        currency: 'USD',
        date: new Date(),
        category: 'Other',
        payerId: 'p1',
        split: [{ participantId: 'p1', weight: 1, included: true }],
      };
      
      await expect(storageManager.addExpense('group1', newExpense))
        .rejects.toThrow('Maximum number of expenses');
    });
  });

  describe('settings operations', () => {
    it('should get user settings', async () => {
      const mockSettings = {
        theme: 'dark',
        currency: 'EUR',
        reducedMotion: true,
        highContrast: false,
      };
      
      mockLocalStorage.getItem.mockResolvedValue({
        version: 1,
        groups: {},
        settings: mockSettings,
        lastSync: new Date(),
      });
      
      const settings = await storageManager.getSettings();
      
      expect(settings).toEqual(mockSettings);
    });

    it('should save user settings', async () => {
      mockLocalStorage.getItem.mockResolvedValue({
        version: 1,
        groups: {},
        settings: {},
        lastSync: new Date(),
      });
      mockLocalStorage.setItem.mockResolvedValue();
      
      const newSettings = {
        theme: 'light',
        currency: 'USD',
        reducedMotion: false,
        highContrast: true,
      };
      
      await storageManager.saveSettings(newSettings);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('should validate settings before saving', async () => {
      const invalidSettings = { theme: 'invalid-theme' };
      
      await expect(storageManager.saveSettings(invalidSettings)).rejects.toThrow();
    });
  });

  describe('fallback behavior', () => {
    it('should fallback to secondary adapter on primary failure', async () => {
      mockLocalStorage.getItem.mockRejectedValue(new Error('Primary failed'));
      mockIndexedDB.getItem.mockResolvedValue({
        version: 1,
        groups: {},
        settings: {},
        lastSync: new Date(),
      });
      
      const schema = await storageManager.getSchema();
      
      expect(schema).toBeDefined();
      expect(mockIndexedDB.getItem).toHaveBeenCalled();
    });

    it('should throw error when all adapters fail', async () => {
      mockLocalStorage.getItem.mockRejectedValue(new Error('Primary failed'));
      mockIndexedDB.getItem.mockRejectedValue(new Error('Fallback failed'));
      
      await expect(storageManager.getSchema()).rejects.toThrow('All storage adapters failed');
    });
  });

  describe('storage info', () => {
    it('should get storage information', async () => {
      const info = await storageManager.getStorageInfo();
      
      expect(info).toMatchObject({
        size: expect.any(Number),
        adapter: 'localStorage',
        hasQuotaExceeded: expect.any(Boolean),
      });
    });

    it('should detect quota exceeded', async () => {
      mockLocalStorage.getSize.mockResolvedValue(10 * 1024 * 1024); // 10MB
      
      const isExceeded = await storageManager.isQuotaExceeded();
      
      expect(isExceeded).toBe(true);
    });
  });

  describe('data serialization', () => {
    it('should serialize group dates to ISO strings', () => {
      const group = {
        id: 'group1',
        name: 'Test',
        createdAt: new Date('2023-01-01'),
        expenses: [
          {
            id: 'e1',
            date: new Date('2023-01-02'),
            description: 'Test expense',
          },
        ],
      };
      
      const serialized = storageManager.serializeGroup(group);
      
      expect(serialized.createdAt).toBe('2023-01-01T00:00:00.000Z');
      expect(serialized.expenses[0].date).toBe('2023-01-02T00:00:00.000Z');
    });

    it('should deserialize group dates from ISO strings', () => {
      const serializedGroup = {
        id: 'group1',
        name: 'Test',
        createdAt: '2023-01-01T00:00:00.000Z',
        expenses: [
          {
            id: 'e1',
            date: '2023-01-02T00:00:00.000Z',
            description: 'Test expense',
          },
        ],
      };
      
      const deserialized = storageManager.deserializeGroup(serializedGroup);
      
      expect(deserialized.createdAt).toBeInstanceOf(Date);
      expect(deserialized.expenses[0].date).toBeInstanceOf(Date);
    });
  });
});