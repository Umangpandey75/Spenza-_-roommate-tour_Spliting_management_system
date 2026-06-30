// Export and import functionality for data portability
import { EXPORT_FORMATS } from './storage-types.js';
import { groupSchema, userSettingsSchema } from '../validation/schemas.js';

/**
 * Export and import manager for data portability
 */
export class ExportImport {
  constructor(storageManager) {
    this.storageManager = storageManager;
  }

  /**
   * Export all data to JSON format
   * @param {Object} options - Export options
   * @param {boolean} [options.includeSettings=true] - Include user settings
   * @param {string[]} [options.groupIds] - Specific group IDs to export (all if not specified)
   * @param {boolean} [options.sanitizeNames=false] - Replace names with generic identifiers
   * @returns {Promise<import('./storage-types.js').ExportData>}
   */
  async exportToJSON(options = {}) {
    const {
      includeSettings = true,
      groupIds = null,
      sanitizeNames = false,
    } = options;

    try {
      // Get all groups
      const allGroups = await this.storageManager.getGroups();
      
      // Filter groups if specific IDs provided
      const groupsToExport = groupIds 
        ? allGroups.filter(group => groupIds.includes(group.id))
        : allGroups;

      // Process groups for export
      const processedGroups = {};
      for (const group of groupsToExport) {
        const processedGroup = sanitizeNames 
          ? this.sanitizeGroupData(group)
          : group;
        processedGroups[group.id] = processedGroup;
      }

      // Get settings if requested
      let settings = {};
      if (includeSettings) {
        settings = await this.storageManager.getSettings();
      }

      const exportData = {
        version: 1,
        exportedAt: new Date(),
        groups: processedGroups,
        settings: includeSettings ? settings : {},
        metadata: {
          totalGroups: Object.keys(processedGroups).length,
          totalExpenses: Object.values(processedGroups).reduce(
            (sum, group) => sum + group.expenses.length, 0
          ),
          exportOptions: options,
        },
      };

      return exportData;
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Export data to CSV format
   * @param {string} groupId - Group ID to export
   * @param {Object} options - Export options
   * @param {boolean} [options.includeSettlements=false] - Include settlement calculations
   * @returns {Promise<{expenses: string, settlements?: string}>}
   */
  async exportToCSV(groupId, options = {}) {
    const { includeSettlements = false } = options;

    try {
      const group = await this.storageManager.getGroup(groupId);
      if (!group) {
        throw new Error(`Group ${groupId} not found`);
      }

      // Export expenses to CSV
      const expensesCSV = this.generateExpensesCSV(group);
      
      const result = { expenses: expensesCSV };

      // Optionally include settlements
      if (includeSettlements) {
        result.settlements = this.generateSettlementsCSV(group);
      }

      return result;
    } catch (error) {
      throw new Error(`CSV export failed: ${error.message}`);
    }
  }

  /**
   * Import data from JSON format
   * @param {import('./storage-types.js').ExportData} importData
   * @param {Object} options - Import options
   * @param {boolean} [options.overwrite=false] - Overwrite existing groups
   * @param {boolean} [options.validateData=true] - Validate imported data
   * @returns {Promise<{imported: number, skipped: number, errors: string[]}>}
   */
  async importFromJSON(importData, options = {}) {
    const {
      overwrite = false,
      validateData = true,
    } = options;

    const result = {
      imported: 0,
      skipped: 0,
      errors: [],
    };

    try {
      // Validate import data structure
      if (!importData || typeof importData !== 'object') {
        throw new Error('Invalid import data format');
      }

      if (!importData.groups || typeof importData.groups !== 'object') {
        throw new Error('No groups found in import data');
      }

      // Import groups
      for (const [groupId, groupData] of Object.entries(importData.groups)) {
        try {
          // Check if group already exists
          const existingGroup = await this.storageManager.getGroup(groupId);
          if (existingGroup && !overwrite) {
            result.skipped++;
            continue;
          }

          // Validate group data if requested
          if (validateData) {
            groupSchema.parse(groupData);
          }

          // Import the group
          await this.storageManager.saveGroup(groupData);
          result.imported++;
        } catch (error) {
          result.errors.push(`Failed to import group ${groupId}: ${error.message}`);
        }
      }

      // Import settings if provided
      if (importData.settings && Object.keys(importData.settings).length > 0) {
        try {
          if (validateData) {
            userSettingsSchema.parse(importData.settings);
          }
          await this.storageManager.saveSettings(importData.settings);
        } catch (error) {
          result.errors.push(`Failed to import settings: ${error.message}`);
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  /**
   * Generate shareable URL with encoded group data
   * @param {string} groupId
   * @param {Object} options - Sharing options
   * @param {boolean} [options.sanitizeNames=true] - Replace names with generic identifiers
   * @param {boolean} [options.readOnly=true] - Make the shared data read-only
   * @returns {Promise<string>}
   */
  async generateShareableURL(groupId, options = {}) {
    const {
      sanitizeNames = true,
      readOnly = true,
    } = options;

    try {
      const group = await this.storageManager.getGroup(groupId);
      if (!group) {
        throw new Error(`Group ${groupId} not found`);
      }

      // Process group for sharing
      const shareableGroup = sanitizeNames 
        ? this.sanitizeGroupData(group)
        : group;

      // Create share data
      const shareData = {
        version: 1,
        readOnly,
        sharedAt: new Date(),
        group: shareableGroup,
      };

      // Encode data to base64 URL-safe string
      const encodedData = this.encodeShareData(shareData);
      
      // Generate URL (this would be your app's domain)
      const baseURL = typeof window !== 'undefined' 
        ? window.location.origin 
        : 'https://your-app-domain.com';
      
      return `${baseURL}/share/${encodedData}`;
    } catch (error) {
      throw new Error(`Failed to generate shareable URL: ${error.message}`);
    }
  }

  /**
   * Decode shareable URL data
   * @param {string} encodedData
   * @returns {Promise<any>}
   */
  async decodeShareableURL(encodedData) {
    try {
      return this.decodeShareData(encodedData);
    } catch (error) {
      throw new Error(`Failed to decode shareable URL: ${error.message}`);
    }
  }

  /**
   * Sanitize group data by replacing names with generic identifiers
   * @param {import('../../types/index.js').Group} group
   * @returns {import('../../types/index.js').Group}
   */
  sanitizeGroupData(group) {
    const participantMap = new Map();
    
    // Create mapping for participants
    group.participants.forEach((participant, index) => {
      participantMap.set(participant.id, `Person ${index + 1}`);
    });

    return {
      ...group,
      name: 'Shared Group',
      participants: group.participants.map((participant, index) => ({
        ...participant,
        name: `Person ${index + 1}`,
        avatar: undefined, // Remove avatar for privacy
      })),
      expenses: group.expenses.map(expense => ({
        ...expense,
        description: expense.description, // Keep expense descriptions as they're usually not personal
      })),
    };
  }

  /**
   * Generate CSV for expenses
   * @param {import('../../types/index.js').Group} group
   * @returns {string}
   */
  generateExpensesCSV(group) {
    const headers = [
      'Date',
      'Description',
      'Amount',
      'Currency',
      'Category',
      'Paid By',
      'Split Details',
    ];

    const rows = group.expenses.map(expense => {
      const payer = group.participants.find(p => p.id === expense.payerId);
      const splitDetails = expense.split
        .filter(split => split.included)
        .map(split => {
          const participant = group.participants.find(p => p.id === split.participantId);
          return `${participant?.name || 'Unknown'}:${split.weight}`;
        })
        .join(';');

      return [
        expense.date.toISOString().split('T')[0], // Date only
        `"${expense.description}"`, // Quoted to handle commas
        expense.amount,
        expense.currency,
        expense.category,
        payer?.name || 'Unknown',
        `"${splitDetails}"`,
      ];
    });

    return [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
  }

  /**
   * Generate CSV for settlements
   * @param {import('../../types/index.js').Group} group
   * @returns {string}
   */
  generateSettlementsCSV(group) {
    // Dynamic import for calculation functions to avoid circular dependencies
    let computeNet, computeMinimalSettlements;
    try {
      const calcModule = require('../calc');
      computeNet = calcModule.computeNet;
      computeMinimalSettlements = calcModule.computeMinimalSettlements;
    } catch (error) {
      console.error('Failed to import calculation functions:', error);
      const headers = ['From', 'To', 'Amount', 'Currency'];
      const errorRow = [['Calculation functions not available', '', '', '']];
      return [headers, ...errorRow]
        .map(row => row.join(','))
        .join('\n');
    }
    
    try {
      // Calculate balances and settlements
      const balances = computeNet(group.expenses, group.participants);
      const settlements = computeMinimalSettlements(balances);
      
      const headers = ['From', 'To', 'Amount', 'Currency', 'From Balance', 'To Balance'];
      
      if (settlements.length === 0) {
        // All settled
        const settled = [['All balances are settled', '', '', '', '', '']];
        return [headers, ...settled]
          .map(row => row.join(','))
          .join('\n');
      }
      
      const rows = settlements.map(transfer => {
        const fromParticipant = group.participants.find(p => p.id === transfer.fromId);
        const toParticipant = group.participants.find(p => p.id === transfer.toId);
        const fromBalance = balances.find(b => b.participantId === transfer.fromId);
        const toBalance = balances.find(b => b.participantId === transfer.toId);
        
        return [
          fromParticipant?.name || 'Unknown',
          toParticipant?.name || 'Unknown',
          transfer.amount,
          group.currency,
          fromBalance?.netBalance || 0,
          toBalance?.netBalance || 0,
        ];
      });
      
      return [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
    } catch (error) {
      console.error('Error generating settlements CSV:', error);
      const headers = ['From', 'To', 'Amount', 'Currency'];
      const errorRow = [['Error calculating settlements', '', '', '']];
      return [headers, ...errorRow]
        .map(row => row.join(','))
        .join('\n');
    }
  }

  /**
   * Encode share data to URL-safe base64
   * @param {any} data
   * @returns {string}
   */
  encodeShareData(data) {
    try {
      const jsonString = JSON.stringify(data);
      const base64 = btoa(jsonString);
      // Make URL-safe
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    } catch (error) {
      throw new Error('Failed to encode share data');
    }
  }

  /**
   * Decode share data from URL-safe base64
   * @param {string} encodedData
   * @returns {any}
   */
  decodeShareData(encodedData) {
    try {
      // Restore base64 padding and characters
      let base64 = encodedData.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      
      const jsonString = atob(base64);
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Failed to decode share data');
    }
  }

  /**
   * Validate import file format
   * @param {File} file
   * @returns {Promise<{valid: boolean, format: string, error?: string}>}
   */
  async validateImportFile(file) {
    try {
      if (!file) {
        return { valid: false, format: 'unknown', error: 'No file provided' };
      }

      const fileName = file.name.toLowerCase();
      
      if (fileName.endsWith('.json')) {
        // Validate JSON structure
        const text = await file.text();
        const data = JSON.parse(text);
        
        if (data.groups && typeof data.groups === 'object') {
          return { valid: true, format: 'json' };
        } else {
          return { valid: false, format: 'json', error: 'Invalid JSON structure' };
        }
      } else if (fileName.endsWith('.csv')) {
        return { valid: true, format: 'csv' };
      } else {
        return { valid: false, format: 'unknown', error: 'Unsupported file format' };
      }
    } catch (error) {
      return { valid: false, format: 'unknown', error: error.message };
    }
  }

  /**
   * Get export statistics
   * @returns {Promise<{totalGroups: number, totalExpenses: number, totalParticipants: number, storageSize: number}>}
   */
  async getExportStatistics() {
    try {
      const groups = await this.storageManager.getGroups();
      const storageInfo = await this.storageManager.getStorageInfo();
      
      const totalExpenses = groups.reduce((sum, group) => sum + group.expenses.length, 0);
      const totalParticipants = groups.reduce((sum, group) => sum + group.participants.length, 0);
      
      return {
        totalGroups: groups.length,
        totalExpenses,
        totalParticipants,
        storageSize: storageInfo.size,
      };
    } catch (error) {
      throw new Error(`Failed to get export statistics: ${error.message}`);
    }
  }
}