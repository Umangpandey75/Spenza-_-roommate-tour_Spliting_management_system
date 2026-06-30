// Main storage manager with fallback support
import { LocalStorageAdapter } from './adapters/local-storage-adapter.js';
import { IndexedDBAdapter } from './adapters/indexeddb-adapter.js';
import { SupabaseAdapter } from './adapters/supabase-adapter.js';
import { STORAGE_KEYS, STORAGE_VERSION, STORAGE_LIMITS } from './storage-types.js';
import { groupSchema, userSettingsSchema } from '../validation/schemas.js';
import { DEFAULT_SETTINGS } from '../utils/constants.js';

/**
 * Storage manager with automatic fallback from Supabase to localStorage to IndexedDB
 */
export class StorageManager {
  constructor() {
    this.supabaseAdapter = new SupabaseAdapter();
    this.adapters = [
      new LocalStorageAdapter(),
      new IndexedDBAdapter(),
    ];
    this.primaryAdapter = null;
    this.fallbackAdapter = null;
    this.initialized = false;
  }

  /**
   * Initialize storage adapters
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Check if user is authenticated for Supabase
      const isAuthenticated = await this.supabaseAdapter.isAuthenticated();
      
      if (isAuthenticated) {
        // Use Supabase for authenticated users
        console.log('🔄 Setting up Supabase as primary adapter');
        this.primaryAdapter = this.supabaseAdapter;
        // Keep local storage as fallback for offline scenarios
        const availableAdapters = this.adapters.filter(adapter => adapter.available);
        this.fallbackAdapter = availableAdapters[0] || null;
        
        console.log(`✅ Storage initialized with Supabase (authenticated user)${
          this.fallbackAdapter ? `, fallback: ${this.fallbackAdapter.name}` : ''
        }`);
      } else {
        // Use local storage for anonymous users
        console.log('🔄 Setting up local storage for anonymous user');
        const availableAdapters = this.adapters.filter(adapter => adapter.available);
        
        if (availableAdapters.length === 0) {
          throw new Error('No storage adapters available');
        }

        this.primaryAdapter = availableAdapters[0];
        this.fallbackAdapter = availableAdapters[1] || null;

        console.log(`✅ Storage initialized with primary: ${this.primaryAdapter.name} (anonymous user)${
          this.fallbackAdapter ? `, fallback: ${this.fallbackAdapter.name}` : ''
        }`);
      }

      this.initialized = true;
      console.log('✅ StorageManager initialization completed');
    } catch (error) {
      console.error('💥 StorageManager initialization failed:', error);
      throw error;
    }
  }

  /**
   * Execute operation with fallback support
   * @param {Function} operation
   * @returns {Promise<any>}
   */
  async executeWithFallback(operation) {
    console.log('🔄 executeWithFallback called');
    await this.initialize();
    console.log(`🔄 Initialized. Primary adapter: ${this.primaryAdapter?.name}`);

    try {
      console.log(`🔄 Executing operation with primary adapter: ${this.primaryAdapter.name}`);
      console.log('🔄 About to call operation function...');
      
      const result = await Promise.race([
        operation(this.primaryAdapter),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Operation timeout after 10 seconds')), 10000)
        )
      ]);
      
      console.log(`✅ Operation completed successfully with ${this.primaryAdapter.name}`);
      return result;
    } catch (error) {
      console.warn(`Primary storage (${this.primaryAdapter.name}) failed:`, error);
      
      if (this.fallbackAdapter) {
        console.log(`Falling back to ${this.fallbackAdapter.name}`);
        try {
          return await operation(this.fallbackAdapter);
        } catch (fallbackError) {
          console.error(`Fallback storage (${this.fallbackAdapter.name}) also failed:`, fallbackError);
          throw new Error(`All storage adapters failed. Primary: ${error.message}, Fallback: ${fallbackError.message}`);
        }
      } else {
        throw error;
      }
    }
  }

  /**
   * Get storage schema with version and metadata
   * @returns {Promise<import('./storage-types.js').StorageSchema>}
   */
  async getSchema() {
    return this.executeWithFallback(async (adapter) => {
      const schema = await adapter.getItem(STORAGE_KEYS.SCHEMA);
      
      if (!schema) {
        // Initialize new schema
        const newSchema = {
          version: STORAGE_VERSION,
          groups: {},
          settings: { ...DEFAULT_SETTINGS },
          lastSync: new Date(),
        };
        
        await adapter.setItem(STORAGE_KEYS.SCHEMA, newSchema);
        return newSchema;
      }

      return schema;
    });
  }

  /**
   * Update storage schema
   * @param {import('./storage-types.js').StorageSchema} schema
   * @returns {Promise<void>}
   */
  async updateSchema(schema) {
    return this.executeWithFallback(async (adapter) => {
      schema.lastSync = new Date();
      await adapter.setItem(STORAGE_KEYS.SCHEMA, schema);
    });
  }

  /**
   * Get all groups
   * @returns {Promise<import('../../types/index.js').Group[]>}
   */
  async getGroups() {
    return this.executeWithFallback(async (adapter) => {
      // Try Supabase-specific method first if available
      if (adapter.name === 'supabase' && adapter.getAllGroups) {
        const groups = await adapter.getAllGroups();
        // Groups from Supabase are already in the correct format
        return groups;
      }

      // Try IndexedDB-specific method if available
      if (adapter.name === 'indexedDB' && adapter.getAllGroups) {
        const groups = await adapter.getAllGroups();
        return groups.map(group => this.deserializeGroup(group));
      }

      // Fallback to schema-based approach for local storage
      const schema = await this.getSchema();
      return Object.values(schema.groups).map(group => this.deserializeGroup(group));
    });
  }

  /**
   * Get a specific group by ID
   * @param {string} groupId
   * @returns {Promise<import('../../types/index.js').Group|null>}
   */
  async getGroup(groupId) {
    return this.executeWithFallback(async (adapter) => {
      // Try Supabase-specific method first if available
      if (adapter.name === 'supabase' && adapter.getGroup) {
        const group = await adapter.getGroup(groupId);
        // Group from Supabase is already in the correct format
        return group;
      }

      // Try IndexedDB-specific method if available
      if (adapter.name === 'indexedDB' && adapter.getGroup) {
        const group = await adapter.getGroup(groupId);
        return group ? this.deserializeGroup(group) : null;
      }

      // Fallback to schema-based approach for local storage
      const schema = await this.getSchema();
      const group = schema.groups[groupId];
      return group ? this.deserializeGroup(group) : null;
    });
  }

  /**
   * Save a group
   * @param {import('../../types/index.js').Group} group
   * @returns {Promise<void>}
   */
  async saveGroup(group) {
    try {
      console.log('💾 StorageManager.saveGroup called with:', group);
      
      // Normalize group data before validation
      const normalizedGroup = this.normalizeGroupData(group);
      console.log('🔧 Normalized group data:', normalizedGroup);
      
      // Validate group data
      let validatedGroup;
      try {
        validatedGroup = groupSchema.parse(normalizedGroup);
        console.log('✅ Group validation passed:', validatedGroup);
      } catch (zodError) {
        console.error('❌ Zod validation failed:', zodError);
        console.error('📊 Validation errors:', zodError.errors);
        console.error('📊 Normalized data that failed:', JSON.stringify(normalizedGroup, null, 2));
        throw zodError;
      }

      const result = await this.executeWithFallback(async (adapter) => {
        console.log(`🔄 Saving group with adapter: ${adapter.name}`);
        
        // Try Supabase-specific method first if available
        if (adapter.name === 'supabase' && adapter.storeGroup) {
          console.log('🔄 Using Supabase adapter to store group');
          const serializedGroup = this.serializeGroup(validatedGroup);
          console.log('📦 Serialized group for Supabase:', serializedGroup);
          await adapter.storeGroup(serializedGroup);
          console.log('✅ Group saved to Supabase successfully');
          return;
        }

        // For local storage adapters, use serialized format
        const serializedGroup = this.serializeGroup(validatedGroup);
        console.log('📦 Serialized group for local storage:', serializedGroup);

        // Try IndexedDB-specific method if available
        if (adapter.name === 'indexedDB' && adapter.storeGroup) {
          console.log('🔄 Using IndexedDB adapter to store group');
          await adapter.storeGroup(serializedGroup);
        }

        // Always update schema for consistency with local storage
        console.log('🔄 Updating schema for local storage');
        const schema = await this.getSchema();
        schema.groups[group.id] = serializedGroup;
        await this.updateSchema(schema);
        console.log('✅ Group saved to local storage successfully');
      });
      
      console.log('🎉 SaveGroup completed successfully');
      return result;
    } catch (error) {
      console.error('💥 Group save failed:', error);
      console.error('📊 Group data:', JSON.stringify(group, null, 2));
      throw error;
    }
  }

  /**
   * Delete a group
   * @param {string} groupId
   * @returns {Promise<void>}
   */
  async deleteGroup(groupId) {
    console.log('🗑️ StorageManager.deleteGroup called for:', groupId);
    
    return this.executeWithFallback(async (adapter) => {
      console.log(`🔄 Deleting group with adapter: ${adapter.name}`);
      
      // Try Supabase-specific method first if available
      if (adapter.name === 'supabase' && adapter.deleteGroup) {
        console.log('🔄 Using Supabase adapter to delete group');
        await adapter.deleteGroup(groupId);
        console.log('✅ Group deleted from Supabase successfully');
        return;
      }

      // Try IndexedDB-specific method if available
      if (adapter.name === 'indexedDB' && adapter.deleteGroup) {
        console.log('🔄 Using IndexedDB adapter to delete group');
        await adapter.deleteGroup(groupId);
      }

      // Always update schema for consistency with local storage
      console.log('🔄 Updating schema for local storage');
      const schema = await this.getSchema();
      delete schema.groups[groupId];
      await this.updateSchema(schema);
      console.log('✅ Group deleted from local storage successfully');
    });
  }

  /**
   * Get user settings
   * @returns {Promise<import('../../types/index.js').UserSettings>}
   */
  async getSettings() {
    return this.executeWithFallback(async (adapter) => {
      const schema = await this.getSchema();
      return userSettingsSchema.parse(schema.settings);
    });
  }

  /**
   * Save user settings
   * @param {import('../../types/index.js').UserSettings} settings
   * @returns {Promise<void>}
   */
  async saveSettings(settings) {
    const validatedSettings = userSettingsSchema.parse(settings);

    return this.executeWithFallback(async (adapter) => {
      const schema = await this.getSchema();
      schema.settings = validatedSettings;
      await this.updateSchema(schema);
    });
  }

  /**
   * Clear all data
   * @returns {Promise<void>}
   */
  async clearAll() {
    return this.executeWithFallback(async (adapter) => {
      await adapter.clear();
    });
  }

  /**
   * Get storage usage information
   * @returns {Promise<{size: number, adapter: string}>}
   */
  async getStorageInfo() {
    await this.initialize();
    
    const size = await this.primaryAdapter.getSize();
    return {
      size,
      adapter: this.primaryAdapter.name,
      hasQuotaExceeded: size > STORAGE_LIMITS.LOCAL_STORAGE_QUOTA,
    };
  }

  /**
   * Check if storage quota is exceeded
   * @returns {Promise<boolean>}
   */
  async isQuotaExceeded() {
    const info = await this.getStorageInfo();
    return info.hasQuotaExceeded;
  }

  /**
   * Serialize group for storage (convert dates to strings)
   * @param {import('../../types/index.js').Group} group
   * @returns {any}
   */
  serializeGroup(group) {
    return {
      ...group,
      createdAt: group.createdAt.toISOString(),
      expenses: group.expenses.map(expense => ({
        ...expense,
        date: expense.date.toISOString(),
      })),
    };
  }

  /**
   * Deserialize group from storage (convert strings to dates)
   * @param {any} serializedGroup
   * @returns {import('../../types/index.js').Group}
   */
  deserializeGroup(serializedGroup) {
    return {
      ...serializedGroup,
      createdAt: new Date(serializedGroup.createdAt),
      expenses: serializedGroup.expenses.map(expense => ({
        ...expense,
        date: new Date(expense.date),
      })),
    };
  }

  /**
   * Add a participant to a group
   * @param {string} groupId
   * @param {import('../../types/index.js').Participant} participant
   * @returns {Promise<void>}
   */
  async addParticipant(groupId, participant) {
    const group = await this.getGroup(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }

    group.participants.push(participant);
    await this.saveGroup(group);
  }

  /**
   * Update a participant in a group
   * @param {string} groupId
   * @param {string} participantId
   * @param {Partial<import('../../types/index.js').Participant>} updates
   * @returns {Promise<void>}
   */
  async updateParticipant(groupId, participantId, updates) {
    const group = await this.getGroup(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }

    const participantIndex = group.participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) {
      throw new Error(`Participant ${participantId} not found in group ${groupId}`);
    }

    group.participants[participantIndex] = {
      ...group.participants[participantIndex],
      ...updates,
    };

    await this.saveGroup(group);
  }

  /**
   * Remove a participant from a group
   * @param {string} groupId
   * @param {string} participantId
   * @returns {Promise<void>}
   */
  async removeParticipant(groupId, participantId) {
    const group = await this.getGroup(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }

    group.participants = group.participants.filter(p => p.id !== participantId);
    
    // Also remove participant from all expense splits
    group.expenses.forEach(expense => {
      expense.split = expense.split.filter(split => split.participantId !== participantId);
    });

    await this.saveGroup(group);
  }

  /**
   * Add an expense to a group
   * @param {string} groupId
   * @param {import('../../types/index.js').Expense} expense
   * @returns {Promise<void>}
   */
  async addExpense(groupId, expense) {
    const group = await this.getGroup(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }

    // Check limits
    if (group.expenses.length >= STORAGE_LIMITS.MAX_EXPENSES_PER_GROUP) {
      throw new Error(`Maximum number of expenses (${STORAGE_LIMITS.MAX_EXPENSES_PER_GROUP}) reached for group`);
    }

    group.expenses.push(expense);
    await this.saveGroup(group);
  }

  /**
   * Update an expense in a group
   * @param {string} groupId
   * @param {string} expenseId
   * @param {Partial<import('../../types/index.js').Expense>} updates
   * @returns {Promise<void>}
   */
  async updateExpense(groupId, expenseId, updates) {
    const group = await this.getGroup(groupId);
    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }

    const expenseIndex = group.expenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) {
      throw new Error(`Expense ${expenseId} not found in group ${groupId}`);
    }

    group.expenses[expenseIndex] = {
      ...group.expenses[expenseIndex],
      ...updates,
    };

    await this.saveGroup(group);
  }

  /**
   * Remove an expense from a group
   * @param {string} groupId
   * @param {string} expenseId
   * @returns {Promise<void>}
   */
  async removeExpense(groupId, expenseId) {
    return this.executeWithFallback(async (adapter) => {
      // Try Supabase-specific method first if available
      if (adapter.name === 'supabase' && adapter.deleteExpense) {
        console.log('🔄 Using Supabase adapter to delete expense');
        await adapter.deleteExpense(expenseId);
        console.log('✅ Expense deleted from Supabase successfully');
        return;
      }

      // Fallback to the general approach
      const group = await this.getGroup(groupId);
      if (!group) {
        throw new Error(`Group ${groupId} not found`);
      }

      group.expenses = group.expenses.filter(e => e.id !== expenseId);
      await this.saveGroup(group);
    });
  }

  /**
   * Migrate data from local storage to Supabase when user authenticates
   * @returns {Promise<void>}
   */
  async migrateToSupabase() {
    try {
      console.log('🔄 Starting migration to Supabase...');
      
      // Check if user is authenticated
      const isAuthenticated = await this.supabaseAdapter.isAuthenticated();
      if (!isAuthenticated) {
        console.log('❌ User not authenticated, skipping migration');
        return;
      }

      // Get data from local storage
      const localAdapter = new LocalStorageAdapter();
      if (!localAdapter.available) {
        console.log('ℹ️ No local storage available, skipping migration');
        return;
      }

      const localSchema = await localAdapter.getItem(STORAGE_KEYS.SCHEMA);
      if (!localSchema || !localSchema.groups) {
        console.log('ℹ️ No local schema or groups found, skipping migration');
        return;
      }

      const localGroups = Object.values(localSchema.groups);
      if (localGroups.length === 0) {
        console.log('ℹ️ No local groups to migrate');
        return;
      }

      console.log(`🔄 Migrating ${localGroups.length} groups to Supabase...`);

      let successCount = 0;
      let failureCount = 0;

      // Migrate each group to Supabase
      for (const group of localGroups) {
        try {
          console.log(`🔄 Migrating group: ${group.name} (${group.id})`);
          
          // Skip groups with invalid data
          if (!group.id || !group.name) {
            console.warn(`⚠️ Skipping invalid group:`, group);
            failureCount++;
            continue;
          }
          
          // Validate and normalize group data before migration
          const deserializedGroup = this.deserializeGroup(group);
          const normalizedGroup = this.normalizeGroupData(deserializedGroup);
          
          // Additional validation - ensure participants array is valid
          if (normalizedGroup.participants && !Array.isArray(normalizedGroup.participants)) {
            console.warn(`⚠️ Invalid participants data for group ${group.name}, resetting to empty array`);
            normalizedGroup.participants = [];
          }
          
          // Additional validation - ensure expenses array is valid
          if (normalizedGroup.expenses && !Array.isArray(normalizedGroup.expenses)) {
            console.warn(`⚠️ Invalid expenses data for group ${group.name}, resetting to empty array`);
            normalizedGroup.expenses = [];
          }
          
          const serializedGroup = this.serializeGroup(normalizedGroup);
          
          console.log(`📊 Normalized group data for ${group.name}:`, {
            id: serializedGroup.id,
            name: serializedGroup.name,
            participantCount: serializedGroup.participants?.length || 0,
            expenseCount: serializedGroup.expenses?.length || 0,
            participants: serializedGroup.participants,
            expenses: serializedGroup.expenses
          });
          
          await this.supabaseAdapter.storeGroup(serializedGroup);
          console.log(`✅ Successfully migrated group: ${group.name}`);
          successCount++;
        } catch (error) {
          console.error(`❌ Failed to migrate group ${group.name}:`, error);
          failureCount++;
          
          // Continue with other groups even if one fails
          continue;
        }
      }

      // Migrate user settings if they exist
      if (localSchema.settings) {
        try {
          console.log('🔄 Migrating user settings...');
          await this.supabaseAdapter.saveUserSettings(localSchema.settings);
          console.log('✅ Successfully migrated user settings');
        } catch (error) {
          console.error('❌ Failed to migrate user settings:', error);
        }
      }

      console.log(`🎉 Migration completed: ${successCount} successful, ${failureCount} failed`);
      
      // Don't clear local storage automatically - let user decide
      // This preserves data in case of partial migration failures
      
    } catch (error) {
      console.error('💥 Migration to Supabase failed:', error);
      // Don't throw the error - let the app continue with local storage
      // The user can try again later or continue using local storage
    }
  }

  /**
   * Switch to Supabase storage after authentication
   * @returns {Promise<void>}
   */
  async switchToSupabase() {
    console.log('🔄 Switching to Supabase storage...');
    this.initialized = false;
    await this.initialize();
    
    // Attempt to migrate existing local data
    try {
      await this.migrateToSupabase();
      console.log('✅ Successfully switched to Supabase storage');
    } catch (error) {
      console.warn('⚠️ Migration failed, but continuing with Supabase storage:', error);
      // Continue anyway - the user can still use Supabase storage
      // and their local data is preserved
    }
  }

  /**
   * Switch back to local storage after sign out
   * @returns {Promise<void>}
   */
  async switchToLocal() {
    this.initialized = false;
    await this.initialize();
  }

  /**
   * Normalize group data to ensure consistency with schema
   * @param {any} group - Raw group data
   * @returns {any} Normalized group data
   */
  normalizeGroupData(group) {
    const normalized = { ...group };

    // Normalize expenses
    if (normalized.expenses) {
      normalized.expenses = normalized.expenses.map(expense => {
        const normalizedExpense = { ...expense };

        // Fix payerId vs paidBy inconsistency
        if (normalizedExpense.paidBy && !normalizedExpense.payerId) {
          normalizedExpense.payerId = normalizedExpense.paidBy;
          delete normalizedExpense.paidBy;
        }

        // Ensure currency is set
        if (!normalizedExpense.currency) {
          normalizedExpense.currency = normalized.currency || 'USD';
        }

        // Ensure split array has at least one entry if empty
        if (!normalizedExpense.split || normalizedExpense.split.length === 0) {
          // Create equal split for all participants
          normalizedExpense.split = (normalized.participants || []).map(participant => ({
            participantId: participant.id,
            weight: participant.defaultWeight || 1,
            included: true
          }));
        }

        // Ensure date is a Date object
        if (typeof normalizedExpense.date === 'string') {
          normalizedExpense.date = new Date(normalizedExpense.date);
        }

        // Ensure all required fields are present
        if (!normalizedExpense.id) {
          normalizedExpense.id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        }
        if (!normalizedExpense.groupId) {
          normalizedExpense.groupId = normalized.id;
        }

        return normalizedExpense;
      });
    }

    // Normalize participants
    if (normalized.participants) {
      normalized.participants = normalized.participants.map(participant => ({
        ...participant,
        active: participant.active !== false, // Default to true
        defaultWeight: participant.defaultWeight || 1,
        createdAt: participant.createdAt ? new Date(participant.createdAt) : new Date()
      }));
    }

    // Ensure createdAt is a Date object
    if (typeof normalized.createdAt === 'string') {
      normalized.createdAt = new Date(normalized.createdAt);
    }

    return normalized;
  }
}