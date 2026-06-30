// Unit tests for DataMigration
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DataMigration } from '../data-migration.js';

// Mock StorageManager
const mockStorageManager = {
  getSchema: vi.fn(),
  updateSchema: vi.fn(),
  executeWithFallback: vi.fn(),
};

describe('DataMigration', () => {
  let dataMigration;

  beforeEach(() => {
    dataMigration = new DataMigration(mockStorageManager);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should setup default migrations', () => {
      expect(dataMigration.migrations.size).toBeGreaterThan(0);
      expect(dataMigration.migrations.has('0-1')).toBe(true);
    });

    it('should allow adding custom migrations', () => {
      const customMigration = {
        fromVersion: 1,
        toVersion: 2,
        description: 'Test migration',
        migrate: (data) => data,
      };

      dataMigration.addMigration(customMigration);

      expect(dataMigration.migrations.has('1-2')).toBe(true);
    });
  });

  describe('version checking', () => {
    it('should detect when migration is needed', async () => {
      mockStorageManager.getSchema.mockResolvedValue({ version: 0 });

      const isNeeded = await dataMigration.isMigrationNeeded();

      expect(isNeeded).toBe(true);
    });

    it('should detect when migration is not needed', async () => {
      mockStorageManager.getSchema.mockResolvedValue({ version: 1 });

      const isNeeded = await dataMigration.isMigrationNeeded();

      expect(isNeeded).toBe(false);
    });

    it('should assume migration needed when schema cannot be read', async () => {
      mockStorageManager.getSchema.mockRejectedValue(new Error('Cannot read schema'));

      const isNeeded = await dataMigration.isMigrationNeeded();

      expect(isNeeded).toBe(true);
    });

    it('should get current version', async () => {
      mockStorageManager.getSchema.mockResolvedValue({ version: 0 });

      const version = await dataMigration.getCurrentVersion();

      expect(version).toBe(0);
    });

    it('should default to version 0 when schema cannot be read', async () => {
      mockStorageManager.getSchema.mockRejectedValue(new Error('Cannot read schema'));

      const version = await dataMigration.getCurrentVersion();

      expect(version).toBe(0);
    });
  });

  describe('migration execution', () => {
    beforeEach(() => {
      // Mock backup creation
      mockStorageManager.executeWithFallback.mockImplementation(async (fn) => {
        return fn({
          setItem: vi.fn().mockResolvedValue(),
        });
      });
    });

    it('should skip migration when not needed', async () => {
      mockStorageManager.getSchema.mockResolvedValue({ version: 1 });

      await dataMigration.migrate(1);

      expect(mockStorageManager.updateSchema).not.toHaveBeenCalled();
    });

    it('should perform migration from version 0 to 1', async () => {
      mockStorageManager.getSchema
        .mockResolvedValueOnce({ version: 0 }) // getCurrentVersion call
        .mockResolvedValueOnce({ // getCurrentData call
          version: 0,
          groups: { 'group1': { id: 'group1', name: 'Test' } },
          settings: {},
        });
      
      mockStorageManager.updateSchema.mockResolvedValue();

      await dataMigration.migrate(1);

      expect(mockStorageManager.updateSchema).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 1,
          groups: expect.any(Object),
          settings: expect.objectContaining({
            theme: 'system',
            currency: 'USD',
            reducedMotion: false,
            highContrast: false,
          }),
          lastSync: expect.any(Date),
        })
      );
    });

    it('should handle empty data during migration', async () => {
      mockStorageManager.getSchema
        .mockResolvedValueOnce({ version: 0 }) // getCurrentVersion call
        .mockRejectedValueOnce(new Error('No schema')); // getCurrentData call
      
      mockStorageManager.updateSchema.mockResolvedValue();

      await dataMigration.migrate(1);

      expect(mockStorageManager.updateSchema).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 1,
          groups: {},
          settings: expect.any(Object),
        })
      );
    });

    it('should throw error when no migration path exists', async () => {
      mockStorageManager.getSchema.mockResolvedValue({ version: 0 });

      // Try to migrate to version 5 (no path exists)
      await expect(dataMigration.migrate(5)).rejects.toThrow('No migration path found');
    });

    it('should throw error when migration step is missing', async () => {
      mockStorageManager.getSchema.mockResolvedValue({ version: 0 });
      
      // Remove the 0-1 migration
      dataMigration.migrations.delete('0-1');

      await expect(dataMigration.migrate(1)).rejects.toThrow('No migration path found');
    });
  });

  describe('migration path finding', () => {
    beforeEach(() => {
      // Add some test migrations
      dataMigration.addMigration({
        fromVersion: 1,
        toVersion: 2,
        description: 'Test 1->2',
        migrate: (data) => data,
      });
      
      dataMigration.addMigration({
        fromVersion: 1,
        toVersion: 3,
        description: 'Test 1->3',
        migrate: (data) => data,
      });
      
      dataMigration.addMigration({
        fromVersion: 2,
        toVersion: 3,
        description: 'Test 2->3',
        migrate: (data) => data,
      });
    });

    it('should find next version in migration path', () => {
      const nextVersion = dataMigration.findNextVersion(1, 3);
      
      // Should return the smallest next version (2, not 3)
      expect(nextVersion).toBe(2);
    });

    it('should return null when no path exists', () => {
      const nextVersion = dataMigration.findNextVersion(5, 6);
      
      expect(nextVersion).toBeNull();
    });

    it('should respect target version limit', () => {
      const nextVersion = dataMigration.findNextVersion(1, 2);
      
      expect(nextVersion).toBe(2);
    });
  });

  describe('data validation', () => {
    it('should validate correct migrated data', () => {
      const validData = {
        version: 1,
        groups: {},
        settings: {},
        lastSync: new Date(),
      };

      const isValid = dataMigration.validateMigratedData(validData);

      expect(isValid).toBe(true);
    });

    it('should reject invalid data structure', () => {
      const invalidData = null;

      const isValid = dataMigration.validateMigratedData(invalidData);

      expect(isValid).toBe(false);
    });

    it('should reject data with invalid version', () => {
      const invalidData = {
        version: 'invalid',
        groups: {},
        settings: {},
      };

      const isValid = dataMigration.validateMigratedData(invalidData);

      expect(isValid).toBe(false);
    });

    it('should reject data with missing groups', () => {
      const invalidData = {
        version: 1,
        settings: {},
      };

      const isValid = dataMigration.validateMigratedData(invalidData);

      expect(isValid).toBe(false);
    });

    it('should reject data with missing settings', () => {
      const invalidData = {
        version: 1,
        groups: {},
      };

      const isValid = dataMigration.validateMigratedData(invalidData);

      expect(isValid).toBe(false);
    });
  });

  describe('migration history', () => {
    it('should get migration history', async () => {
      mockStorageManager.getSchema.mockResolvedValue({ version: 1 });

      const history = await dataMigration.getMigrationHistory();

      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        version: 1,
        migratedAt: expect.any(Date),
        description: expect.any(String),
      });
    });
  });

  describe('backup operations', () => {
    it('should create backup before migration', async () => {
      const mockAdapter = {
        setItem: vi.fn().mockResolvedValue(),
      };
      
      mockStorageManager.executeWithFallback.mockImplementation(async (fn) => {
        return fn(mockAdapter);
      });

      await dataMigration.createBackup();

      expect(mockAdapter.setItem).toHaveBeenCalledWith(
        expect.stringMatching(/^backup-\d+$/),
        expect.objectContaining({
          backupCreatedAt: expect.any(Date),
        })
      );
    });

    it('should not fail migration if backup fails', async () => {
      mockStorageManager.executeWithFallback.mockRejectedValue(new Error('Backup failed'));

      // Should not throw
      await expect(dataMigration.createBackup()).resolves.toBeUndefined();
    });
  });

  describe('cleanup operations', () => {
    it('should log cleanup intent', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await dataMigration.cleanupBackups(3);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Backup cleanup requested')
      );

      consoleSpy.mockRestore();
    });
  });
});