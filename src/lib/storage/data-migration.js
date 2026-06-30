// Data migration system for schema changes
import { STORAGE_VERSION } from './storage-types.js';

/**
 * Data migration manager for handling schema changes
 */
export class DataMigration {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.migrations = new Map();
    this.setupMigrations();
  }

  /**
   * Setup available migrations
   */
  setupMigrations() {
    // Example migration from version 0 to 1
    this.addMigration({
      fromVersion: 0,
      toVersion: 1,
      description: 'Initial schema setup',
      migrate: (data) => {
        return {
          version: 1,
          groups: data.groups || {},
          settings: data.settings || {
            theme: 'system',
            currency: 'INR',
            reducedMotion: false,
            highContrast: false,
          },
          lastSync: new Date(),
        };
      },
    });

    // Future migrations can be added here
    // this.addMigration({
    //   fromVersion: 1,
    //   toVersion: 2,
    //   description: 'Add new field to groups',
    //   migrate: (data) => {
    //     // Migration logic here
    //     return data;
    //   },
    // });
  }

  /**
   * Add a migration step
   * @param {import('./storage-types.js').MigrationStep} migration
   */
  addMigration(migration) {
    const key = `${migration.fromVersion}-${migration.toVersion}`;
    this.migrations.set(key, migration);
  }

  /**
   * Check if migration is needed
   * @returns {Promise<boolean>}
   */
  async isMigrationNeeded() {
    try {
      const schema = await this.storageManager.getSchema();
      return schema.version < STORAGE_VERSION;
    } catch (error) {
      // If we can't read the schema, assume migration is needed
      console.warn('Could not read schema version, assuming migration needed:', error);
      return true;
    }
  }

  /**
   * Get current data version
   * @returns {Promise<number>}
   */
  async getCurrentVersion() {
    try {
      const schema = await this.storageManager.getSchema();
      return schema.version || 0;
    } catch (error) {
      console.warn('Could not read current version, assuming 0:', error);
      return 0;
    }
  }

  /**
   * Perform migration from current version to target version
   * @param {number} [targetVersion] - Target version (defaults to STORAGE_VERSION)
   * @returns {Promise<void>}
   */
  async migrate(targetVersion = STORAGE_VERSION) {
    const currentVersion = await this.getCurrentVersion();
    
    if (currentVersion >= targetVersion) {
      console.log(`No migration needed. Current version: ${currentVersion}, Target: ${targetVersion}`);
      return;
    }

    console.log(`Starting migration from version ${currentVersion} to ${targetVersion}`);

    try {
      // Create backup before migration
      await this.createBackup();

      let data = await this.getCurrentData();
      let version = currentVersion;

      // Apply migrations step by step
      while (version < targetVersion) {
        const nextVersion = this.findNextVersion(version, targetVersion);
        if (nextVersion === null) {
          throw new Error(`No migration path found from version ${version} to ${targetVersion}`);
        }

        const migrationKey = `${version}-${nextVersion}`;
        const migration = this.migrations.get(migrationKey);

        if (!migration) {
          throw new Error(`Migration ${migrationKey} not found`);
        }

        console.log(`Applying migration: ${migration.description} (${version} → ${nextVersion})`);
        
        data = migration.migrate(data);
        data.version = nextVersion;
        version = nextVersion;

        // Save intermediate state
        await this.storageManager.updateSchema(data);
      }

      console.log(`Migration completed successfully to version ${version}`);
    } catch (error) {
      console.error('Migration failed:', error);
      await this.restoreBackup();
      throw new Error(`Migration failed: ${error.message}`);
    }
  }

  /**
   * Find the next version in the migration path
   * @param {number} currentVersion
   * @param {number} targetVersion
   * @returns {number|null}
   */
  findNextVersion(currentVersion, targetVersion) {
    const availableVersions = [];
    
    for (const [key] of this.migrations) {
      const [from, to] = key.split('-').map(Number);
      if (from === currentVersion && to <= targetVersion) {
        availableVersions.push(to);
      }
    }

    if (availableVersions.length === 0) {
      return null;
    }

    // Return the smallest next version to ensure step-by-step migration
    return Math.min(...availableVersions);
  }

  /**
   * Get current data for migration
   * @returns {Promise<any>}
   */
  async getCurrentData() {
    try {
      return await this.storageManager.getSchema();
    } catch (error) {
      // If no schema exists, return empty data
      console.warn('No existing schema found, starting with empty data');
      return {
        version: 0,
        groups: {},
        settings: {},
        lastSync: new Date(),
      };
    }
  }

  /**
   * Create a backup of current data
   * @returns {Promise<void>}
   */
  async createBackup() {
    try {
      const data = await this.getCurrentData();
      const backupKey = `backup-${Date.now()}`;
      
      // Store backup in the same storage system
      await this.storageManager.executeWithFallback(async (adapter) => {
        await adapter.setItem(backupKey, {
          ...data,
          backupCreatedAt: new Date(),
        });
      });

      console.log(`Backup created with key: ${backupKey}`);
    } catch (error) {
      console.warn('Failed to create backup:', error);
      // Don't fail migration if backup fails, but warn user
    }
  }

  /**
   * Restore from backup (in case of migration failure)
   * @returns {Promise<void>}
   */
  async restoreBackup() {
    try {
      // Find the most recent backup
      // This is a simplified implementation - in production you might want
      // to store backup keys in a separate index
      console.warn('Backup restoration not fully implemented - manual recovery may be needed');
    } catch (error) {
      console.error('Failed to restore backup:', error);
    }
  }

  /**
   * Validate migrated data
   * @param {any} data
   * @returns {boolean}
   */
  validateMigratedData(data) {
    try {
      // Basic validation
      if (!data || typeof data !== 'object') {
        return false;
      }

      if (typeof data.version !== 'number' || data.version < 0) {
        return false;
      }

      if (!data.groups || typeof data.groups !== 'object') {
        return false;
      }

      if (!data.settings || typeof data.settings !== 'object') {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Data validation failed:', error);
      return false;
    }
  }

  /**
   * Get migration history
   * @returns {Promise<Array<{version: number, migratedAt: Date, description: string}>>}
   */
  async getMigrationHistory() {
    // This could be implemented to track migration history
    // For now, return basic info
    const currentVersion = await this.getCurrentVersion();
    return [
      {
        version: currentVersion,
        migratedAt: new Date(),
        description: `Current version: ${currentVersion}`,
      },
    ];
  }

  /**
   * Clean up old backups
   * @param {number} maxBackups - Maximum number of backups to keep
   * @returns {Promise<void>}
   */
  async cleanupBackups(maxBackups = 5) {
    // This could be implemented to clean up old backup files
    // For now, just log the intent
    console.log(`Backup cleanup requested (keep ${maxBackups} backups)`);
  }
}