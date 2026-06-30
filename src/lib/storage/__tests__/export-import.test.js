// Unit tests for ExportImport
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExportImport } from '../export-import.js';

// Mock StorageManager
const mockStorageManager = {
  getGroups: vi.fn(),
  getGroup: vi.fn(),
  saveGroup: vi.fn(),
  getSettings: vi.fn(),
  saveSettings: vi.fn(),
};

// Mock window object for URL generation
Object.defineProperty(global, 'window', {
  value: {
    location: {
      origin: 'https://test-app.com',
    },
  },
  writable: true,
});

// Mock global functions for base64 encoding/decoding
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
global.atob = (str) => Buffer.from(str, 'base64').toString('binary');

describe('ExportImport', () => {
  let exportImport;

  beforeEach(() => {
    exportImport = new ExportImport(mockStorageManager);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('JSON export', () => {
    const mockGroups = [
      {
        id: 'group1',
        name: 'Test Group 1',
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
      },
      {
        id: 'group2',
        name: 'Test Group 2',
        currency: 'EUR',
        createdAt: new Date('2023-01-03'),
        participants: [
          { id: 'p3', name: 'Charlie', active: true, defaultWeight: 1 },
        ],
        expenses: [],
      },
    ];

    const mockSettings = {
      theme: 'dark',
      currency: 'USD',
      reducedMotion: false,
      highContrast: false,
    };

    beforeEach(() => {
      mockStorageManager.getGroups.mockResolvedValue(mockGroups);
      mockStorageManager.getSettings.mockResolvedValue(mockSettings);
    });

    it('should export all groups with settings', async () => {
      const exportData = await exportImport.exportToJSON();

      expect(exportData).toMatchObject({
        version: 1,
        exportedAt: expect.any(Date),
        groups: {
          group1: expect.objectContaining({ id: 'group1', name: 'Test Group 1' }),
          group2: expect.objectContaining({ id: 'group2', name: 'Test Group 2' }),
        },
        settings: mockSettings,
        metadata: {
          totalGroups: 2,
          totalExpenses: 1,
          exportOptions: {},
        },
      });
    });

    it('should export specific groups only', async () => {
      const exportData = await exportImport.exportToJSON({
        groupIds: ['group1'],
      });

      expect(Object.keys(exportData.groups)).toEqual(['group1']);
      expect(exportData.metadata.totalGroups).toBe(1);
    });

    it('should export without settings', async () => {
      const exportData = await exportImport.exportToJSON({
        includeSettings: false,
      });

      expect(exportData.settings).toEqual({});
    });

    it('should sanitize names when requested', async () => {
      const exportData = await exportImport.exportToJSON({
        sanitizeNames: true,
      });

      const group1 = exportData.groups.group1;
      expect(group1.name).toBe('Shared Group');
      expect(group1.participants[0].name).toBe('Person 1');
      expect(group1.participants[1].name).toBe('Person 2');
      expect(group1.participants[0].avatar).toBeUndefined();
    });

    it('should handle export errors', async () => {
      mockStorageManager.getGroups.mockRejectedValue(new Error('Storage error'));

      await expect(exportImport.exportToJSON()).rejects.toThrow('Export failed: Storage error');
    });
  });

  describe('CSV export', () => {
    const mockGroup = {
      id: 'group1',
      name: 'Test Group',
      currency: 'USD',
      participants: [
        { id: 'p1', name: 'Alice', active: true, defaultWeight: 1 },
        { id: 'p2', name: 'Bob', active: true, defaultWeight: 1 },
      ],
      expenses: [
        {
          id: 'e1',
          groupId: 'group1',
          description: 'Dinner at restaurant',
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
        {
          id: 'e2',
          groupId: 'group1',
          description: 'Taxi ride',
          amount: 20,
          currency: 'USD',
          date: new Date('2023-01-03'),
          category: 'Transportation',
          payerId: 'p2',
          split: [
            { participantId: 'p1', weight: 1, included: true },
            { participantId: 'p2', weight: 1, included: true },
          ],
        },
      ],
    };

    beforeEach(() => {
      mockStorageManager.getGroup.mockResolvedValue(mockGroup);
    });

    it('should export expenses to CSV', async () => {
      const result = await exportImport.exportToCSV('group1');

      expect(result.expenses).toContain('Date,Description,Amount,Currency,Category,Paid By,Split Details');
      expect(result.expenses).toContain('2023-01-02,"Dinner at restaurant",60,USD,Food & Dining,Alice,"Alice:1;Bob:1"');
      expect(result.expenses).toContain('2023-01-03,"Taxi ride",20,USD,Transportation,Bob,"Alice:1;Bob:1"');
    });

    it('should include settlements when requested', async () => {
      const result = await exportImport.exportToCSV('group1', {
        includeSettlements: true,
      });

      expect(result.settlements).toBeDefined();
      expect(result.settlements).toContain('From,To,Amount,Currency');
    });

    it('should handle non-existent group', async () => {
      mockStorageManager.getGroup.mockResolvedValue(null);

      await expect(exportImport.exportToCSV('nonexistent')).rejects.toThrow('Group nonexistent not found');
    });

    it('should handle CSV export errors', async () => {
      mockStorageManager.getGroup.mockRejectedValue(new Error('Storage error'));

      await expect(exportImport.exportToCSV('group1')).rejects.toThrow('CSV export failed: Storage error');
    });
  });

  describe('JSON import', () => {
    const mockImportData = {
      version: 1,
      exportedAt: new Date('2023-01-01'),
      groups: {
        group1: {
          id: 'group1',
          name: 'Imported Group',
          currency: 'USD',
          createdAt: new Date('2023-01-01'),
          participants: [
            { id: 'p1', name: 'Alice', active: true, defaultWeight: 1 },
          ],
          expenses: [],
        },
      },
      settings: {
        theme: 'light',
        currency: 'EUR',
        reducedMotion: true,
        highContrast: false,
      },
    };

    beforeEach(() => {
      mockStorageManager.getGroup.mockResolvedValue(null); // No existing group
      mockStorageManager.saveGroup.mockResolvedValue();
      mockStorageManager.saveSettings.mockResolvedValue();
    });

    it('should import groups successfully', async () => {
      const result = await exportImport.importFromJSON(mockImportData);

      expect(result).toMatchObject({
        imported: 1,
        skipped: 0,
        errors: [],
      });
      expect(mockStorageManager.saveGroup).toHaveBeenCalledWith(mockImportData.groups.group1);
      expect(mockStorageManager.saveSettings).toHaveBeenCalledWith(mockImportData.settings);
    });

    it('should skip existing groups when overwrite is false', async () => {
      mockStorageManager.getGroup.mockResolvedValue({ id: 'group1', name: 'Existing' });

      const result = await exportImport.importFromJSON(mockImportData, {
        overwrite: false,
      });

      expect(result).toMatchObject({
        imported: 0,
        skipped: 1,
        errors: [],
      });
      expect(mockStorageManager.saveGroup).not.toHaveBeenCalled();
    });

    it('should overwrite existing groups when overwrite is true', async () => {
      mockStorageManager.getGroup.mockResolvedValue({ id: 'group1', name: 'Existing' });

      const result = await exportImport.importFromJSON(mockImportData, {
        overwrite: true,
      });

      expect(result).toMatchObject({
        imported: 1,
        skipped: 0,
        errors: [],
      });
      expect(mockStorageManager.saveGroup).toHaveBeenCalledWith(mockImportData.groups.group1);
    });

    it('should handle validation errors', async () => {
      const invalidImportData = {
        ...mockImportData,
        groups: {
          group1: {
            id: 'group1',
            // Missing required fields
          },
        },
      };

      const result = await exportImport.importFromJSON(invalidImportData);

      expect(result.imported).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Failed to import group group1');
    });

    it('should skip validation when requested', async () => {
      const invalidImportData = {
        ...mockImportData,
        groups: {
          group1: {
            id: 'group1',
            // Missing required fields but validation disabled
            name: 'Test',
          },
        },
      };

      const result = await exportImport.importFromJSON(invalidImportData, {
        validateData: false,
      });

      expect(result.imported).toBe(1);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle invalid import data structure', async () => {
      await expect(exportImport.importFromJSON(null)).rejects.toThrow('Invalid import data format');
      await expect(exportImport.importFromJSON({})).rejects.toThrow('No groups found in import data');
    });
  });

  describe('shareable URLs', () => {
    const mockGroup = {
      id: 'group1',
      name: 'Test Group',
      currency: 'USD',
      participants: [
        { id: 'p1', name: 'Alice', active: true, defaultWeight: 1 },
        { id: 'p2', name: 'Bob', active: true, defaultWeight: 1 },
      ],
      expenses: [],
    };

    beforeEach(() => {
      mockStorageManager.getGroup.mockResolvedValue(mockGroup);
    });

    it('should generate shareable URL', async () => {
      const url = await exportImport.generateShareableURL('group1');

      expect(url).toMatch(/^https:\/\/test-app\.com\/share\/.+$/);
    });

    it('should sanitize names by default', async () => {
      const url = await exportImport.generateShareableURL('group1');
      const encodedData = url.split('/share/')[1];
      const shareData = await exportImport.decodeShareableURL(encodedData);

      expect(shareData.group.name).toBe('Shared Group');
      expect(shareData.group.participants[0].name).toBe('Person 1');
    });

    it('should preserve names when sanitization is disabled', async () => {
      const url = await exportImport.generateShareableURL('group1', {
        sanitizeNames: false,
      });
      const encodedData = url.split('/share/')[1];
      const shareData = await exportImport.decodeShareableURL(encodedData);

      expect(shareData.group.name).toBe('Test Group');
      expect(shareData.group.participants[0].name).toBe('Alice');
    });

    it('should handle non-existent group', async () => {
      mockStorageManager.getGroup.mockResolvedValue(null);

      await expect(exportImport.generateShareableURL('nonexistent'))
        .rejects.toThrow('Group nonexistent not found');
    });

    it('should encode and decode share data correctly', async () => {
      const testData = {
        version: 1,
        readOnly: true,
        sharedAt: new Date(),
        group: mockGroup,
      };

      const encoded = exportImport.encodeShareData(testData);
      const decoded = exportImport.decodeShareData(encoded);

      expect(decoded).toEqual(JSON.parse(JSON.stringify(testData))); // Dates become strings in JSON
    });

    it('should handle encoding errors', () => {
      const circularData = {};
      circularData.self = circularData;

      expect(() => exportImport.encodeShareData(circularData)).toThrow('Failed to encode share data');
    });

    it('should handle decoding errors', () => {
      expect(() => exportImport.decodeShareData('invalid-data')).toThrow('Failed to decode share data');
    });
  });

  describe('file validation', () => {
    it('should validate JSON file', async () => {
      const jsonFile = new File(
        [JSON.stringify({ groups: { group1: { id: 'group1' } } })],
        'export.json',
        { type: 'application/json' }
      );

      const result = await exportImport.validateImportFile(jsonFile);

      expect(result).toEqual({
        valid: true,
        format: 'json',
      });
    });

    it('should validate CSV file', async () => {
      const csvFile = new File(['Date,Description,Amount'], 'expenses.csv', { type: 'text/csv' });

      const result = await exportImport.validateImportFile(csvFile);

      expect(result).toEqual({
        valid: true,
        format: 'csv',
      });
    });

    it('should reject invalid JSON structure', async () => {
      const invalidJsonFile = new File(
        [JSON.stringify({ invalid: 'structure' })],
        'invalid.json',
        { type: 'application/json' }
      );

      const result = await exportImport.validateImportFile(invalidJsonFile);

      expect(result).toEqual({
        valid: false,
        format: 'json',
        error: 'Invalid JSON structure',
      });
    });

    it('should reject unsupported file format', async () => {
      const txtFile = new File(['Some text'], 'file.txt', { type: 'text/plain' });

      const result = await exportImport.validateImportFile(txtFile);

      expect(result).toEqual({
        valid: false,
        format: 'unknown',
        error: 'Unsupported file format',
      });
    });

    it('should handle no file provided', async () => {
      const result = await exportImport.validateImportFile(null);

      expect(result).toEqual({
        valid: false,
        format: 'unknown',
        error: 'No file provided',
      });
    });

    it('should handle file reading errors', async () => {
      const corruptFile = new File([''], 'corrupt.json', { type: 'application/json' });
      // Mock file.text() to throw an error
      vi.spyOn(corruptFile, 'text').mockRejectedValue(new Error('Cannot read file'));

      const result = await exportImport.validateImportFile(corruptFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Cannot read file');
    });
  });

  describe('export statistics', () => {
    const mockGroups = [
      {
        id: 'group1',
        participants: [{ id: 'p1' }, { id: 'p2' }],
        expenses: [{ id: 'e1' }, { id: 'e2' }],
      },
      {
        id: 'group2',
        participants: [{ id: 'p3' }],
        expenses: [{ id: 'e3' }],
      },
    ];

    beforeEach(() => {
      mockStorageManager.getGroups.mockResolvedValue(mockGroups);
      mockStorageManager.getStorageInfo = vi.fn().mockResolvedValue({
        size: 1024,
        adapter: 'localStorage',
      });
    });

    it('should calculate export statistics', async () => {
      const stats = await exportImport.getExportStatistics();

      expect(stats).toEqual({
        totalGroups: 2,
        totalExpenses: 3,
        totalParticipants: 3,
        storageSize: 1024,
      });
    });

    it('should handle statistics calculation errors', async () => {
      mockStorageManager.getGroups.mockRejectedValue(new Error('Storage error'));

      await expect(exportImport.getExportStatistics())
        .rejects.toThrow('Failed to get export statistics: Storage error');
    });
  });
});