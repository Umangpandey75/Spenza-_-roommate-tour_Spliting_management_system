import { createClient } from '../../../utils/supabase/client.js';

/**
 * Supabase storage adapter for authenticated users
 */
export class SupabaseAdapter {
  constructor() {
    this.name = 'supabase';
    this.supabase = createClient();
    this.userCache = null;
    this.userCacheExpiry = 0;
    console.log('🔧 SupabaseAdapter created with client:', this.supabase);
    
    // Test connection immediately
    this.testConnection();
  }

  /**
   * Test Supabase connection
   */
  async testConnection() {
    try {
      console.log('🧪 Testing Supabase connection...');
      const { data, error } = await this.supabase.from('groups').select('count').limit(1);
      
      if (error) {
        console.error('❌ Supabase connection test failed:', error);
      } else {
        console.log('✅ Supabase connection test successful:', data);
      }
    } catch (err) {
      console.error('💥 Supabase connection test exception:', err);
    }
  }

  get available() {
    return true; // Supabase is always available if configured
  }

  /**
   * Get current authenticated user with caching
   * @returns {Promise<any|null>}
   */
  async getCurrentUser() {
    try {
      console.log('👤 SupabaseAdapter.getCurrentUser() called');
      
      // Check cache first (valid for 30 seconds)
      const now = Date.now();
      if (this.userCache && now < this.userCacheExpiry) {
        console.log('📋 Using cached user:', this.userCache ? `${this.userCache.email} (${this.userCache.id})` : 'null');
        return this.userCache;
      }
      
      console.log('🔧 Supabase client available:', !!this.supabase);
      console.log('🔧 Supabase auth available:', !!this.supabase?.auth);
      
      // First check if there's a session to avoid "Auth session missing" error
      console.log('🔄 Checking for existing session...');
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      
      if (sessionError) {
        console.error('💥 Error getting session:', sessionError);
        this.userCache = null;
        this.userCacheExpiry = 0;
        return null;
      }

      if (!session?.user) {
        console.log('📋 No active session found');
        this.userCache = null;
        this.userCacheExpiry = 0;
        return null;
      }

      console.log('✅ Active session found, getting user details...');
      
      try {
        const { data: { user }, error } = await this.supabase.auth.getUser();
        
        if (error) {
          // Handle specific auth errors gracefully
          if (error.message === 'Auth session missing!') {
            console.log('📋 Auth session missing - user not authenticated');
            this.userCache = null;
            this.userCacheExpiry = 0;
            return null;
          } else {
            console.error('💥 Error getting current user:', error);
            this.userCache = null;
            this.userCacheExpiry = 0;
            return null;
          }
        }
        
        // Cache the result
        this.userCache = user;
        this.userCacheExpiry = now + 30000; // Cache for 30 seconds
        
        console.log('👤 Retrieved user:', user ? `${user.email} (${user.id})` : 'null');
        return user;
      } catch (authError) {
        // Handle auth errors gracefully
        if (authError.message === 'Auth session missing!') {
          console.log('📋 Auth session missing - user not authenticated');
        } else {
          console.error('💥 Exception getting user:', authError);
        }
        
        this.userCache = null;
        this.userCacheExpiry = 0;
        return null;
      }
    } catch (error) {
      // Handle any unexpected errors
      if (error.message === 'Auth session missing!') {
        console.log('📋 Auth session missing - user not authenticated');
      } else {
        console.error('💥 Exception in getCurrentUser:', error);
      }
      
      this.userCache = null;
      this.userCacheExpiry = 0;
      return null;
    }
  }

  /**
   * Clear user cache
   */
  clearUserCache() {
    console.log('🗑️ Clearing user cache');
    this.userCache = null;
    this.userCacheExpiry = 0;
  }

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    try {
      console.log('🔐 SupabaseAdapter.isAuthenticated() called');
      const user = await this.getCurrentUser();
      console.log('👤 Current user:', user ? `${user.email} (${user.id})` : 'null');
      const isAuth = !!user;
      console.log('🔐 Is authenticated:', isAuth);
      return isAuth;
    } catch (error) {
      console.error('💥 Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Get all groups for the authenticated user
   * @returns {Promise<any[]>}
   */
  async getAllGroups() {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching groups for user:', user.id);

      const { data: groups, error } = await this.supabase
        .from('groups')
        .select(`
          *,
          participants (*),
          expenses (*, expense_splits (*))
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching groups:', error);
        throw new Error(`Failed to fetch groups: ${error.message}`);
      }

      console.log('Raw groups from Supabase:', groups);

      // Handle null or empty results
      if (!groups) {
        console.log('Groups is null/undefined');
        return [];
      }

      if (groups.length === 0) {
        console.log('No groups found for user - returning empty array');
        return [];
      }

      const transformedGroups = groups.map(group => this.transformGroupFromDB(group));
      console.log('Transformed groups:', transformedGroups);
      
      return transformedGroups;
    } catch (error) {
      console.error('Error in getAllGroups:', error);
      throw error;
    }
  }

  /**
   * Get a specific group by ID
   * @param {string} groupId
   * @returns {Promise<any|null>}
   */
  async getGroup(groupId) {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: group, error } = await this.supabase
      .from('groups')
      .select(`
        *,
        participants (*),
        expenses (*, expense_splits (*))
      `)
      .eq('id', groupId)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Group not found
      }
      throw new Error(`Failed to fetch group: ${error.message}`);
    }

    return this.transformGroupFromDB(group);
  }

  /**
   * Store a group in Supabase
   * @param {any} group
   * @returns {Promise<void>}
   */
  async storeGroup(group) {
    try {
      console.log('🔄 Storing group in Supabase:', group);
      
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('👤 User authenticated:', user.id);

      // Simplified approach - just store the group first
      const { participants, expenses, ...groupData } = group;
      console.log('📊 Group data to store:', groupData);

      const groupToInsert = {
        id: groupData.id,
        name: groupData.name,
        currency: groupData.currency,
        created_at: groupData.createdAt,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };
      
      console.log('💾 Inserting group (simplified):', groupToInsert);
      
      const { data: groupResult, error: groupError } = await this.supabase
        .from('groups')
        .upsert(groupToInsert, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();

      if (groupError) {
        console.error('❌ Group insert error:', groupError);
        throw new Error(`Failed to save group: ${groupError.message}`);
      }

      console.log('✅ Group inserted successfully:', groupResult);

      // Now handle participants
      console.log('👥 Processing participants:', participants);
      
      // Always delete existing participants for this group first to ensure clean state
      const { error: deleteError } = await this.supabase
        .from('participants')
        .delete()
        .eq('group_id', groupData.id);
        
      if (deleteError) {
        console.warn('⚠️ Warning deleting existing participants:', deleteError);
      }
      
      // Only insert if we have valid participants
      if (participants && Array.isArray(participants) && participants.length > 0) {
        console.log('👥 Storing participants:', participants);
        
        // Validate and clean participant data
        const participantsToInsert = participants
          .filter(participant => participant && participant.id && participant.name) // Filter out invalid participants
          .map((participant, index) => ({
            id: participant.id,
            group_id: groupData.id,
            name: participant.name,
            weight: parseFloat(participant.defaultWeight || participant.weight || 1.0),
            created_at: participant.createdAt ? new Date(participant.createdAt).toISOString() : new Date().toISOString()
          }));
        
        // Check for duplicate participant IDs and names within the same group
        const seenIds = new Set();
        const seenNames = new Set();
        const validParticipants = [];
        
        for (const participant of participantsToInsert) {
          if (seenIds.has(participant.id)) {
            console.warn(`⚠️ Duplicate participant ID found: ${participant.id}, skipping`);
            continue;
          }
          
          // Allow same names but ensure unique IDs
          seenIds.add(participant.id);
          validParticipants.push(participant);
        }
        
        console.log('📊 Filtered participants (removed duplicates):', validParticipants);
        
        if (validParticipants.length > 0) {
          console.log('📊 Valid participants to insert:', validParticipants);
          
          const { data: participantsResult, error: participantsError } = await this.supabase
            .from('participants')
            .insert(validParticipants)
            .select();
            
          if (participantsError) {
            console.error('❌ Participants insert error:', participantsError);
            console.error('❌ Participants data that failed:', JSON.stringify(validParticipants, null, 2));
            console.error('❌ Error details:', {
              message: participantsError.message,
              details: participantsError.details,
              hint: participantsError.hint,
              code: participantsError.code
            });
            
            // Provide more specific error messages based on error type
            let errorMessage = 'Failed to save participants';
            if (participantsError.code === '23505') {
              errorMessage = 'Duplicate participant detected. Each participant must have a unique ID.';
            } else if (participantsError.message) {
              errorMessage = `Failed to save participants: ${participantsError.message}`;
            }
            
            throw new Error(errorMessage);
          }
          
          console.log('✅ Participants insert result:', participantsResult);
          
          console.log('✅ Participants stored successfully');
        } else {
          console.log('ℹ️ No valid participants to insert after filtering');
        }
      } else {
        console.log('ℹ️ No participants to store (empty or invalid array)');
      }

      // Handle expenses (for completeness, though they might be empty)
      console.log('💰 Processing expenses:', expenses);
      
      // Always delete existing expenses for this group first to ensure clean state
      const { error: deleteExpensesError } = await this.supabase
        .from('expenses')
        .delete()
        .eq('group_id', groupData.id);
        
      if (deleteExpensesError) {
        console.warn('⚠️ Warning deleting existing expenses:', deleteExpensesError);
      }
      
      // Only insert if we have valid expenses
      if (expenses && Array.isArray(expenses) && expenses.length > 0) {
        console.log('💰 Storing expenses:', expenses);
        
        // Validate and clean expense data
        const expensesToInsert = expenses
          .filter(expense => expense && expense.id && expense.description && expense.amount) // Filter out invalid expenses
          .map(expense => ({
            id: expense.id,
            group_id: groupData.id,
            description: expense.description,
            amount: parseFloat(expense.amount),
            paid_by: expense.payerId || expense.paidBy, // Use payerId first, fallback to paidBy
            date: expense.date ? new Date(expense.date).toISOString() : new Date().toISOString(),
            category: expense.category || 'Others',
            created_at: expense.createdAt ? new Date(expense.createdAt).toISOString() : new Date().toISOString()
          }));
        
        if (expensesToInsert.length > 0) {
          console.log('📊 Cleaned expenses to insert:', expensesToInsert);
          
          const { error: expensesError } = await this.supabase
            .from('expenses')
            .insert(expensesToInsert);
            
          if (expensesError) {
            console.error('❌ Expenses insert error:', expensesError);
            throw new Error(`Failed to save expenses: ${expensesError.message}`);
          }
          
          console.log('✅ Expenses stored successfully');
          
          // Now handle expense splits
          const splitsToInsert = [];
          for (const expense of expenses) {
            if (expense.split && Array.isArray(expense.split) && expense.split.length > 0) {
              const totalWeight = expense.split.reduce((sum, s) => s.included ? sum + (parseFloat(s.weight) || 1) : sum, 0);
              for (const split of expense.split) {
                if (split.included && split.participantId) {
                  splitsToInsert.push({
                    expense_id: expense.id,
                    participant_id: split.participantId,
                    amount: totalWeight > 0 ? parseFloat(expense.amount) * ((parseFloat(split.weight) || 1) / totalWeight) : 0,
                    weight: parseFloat(split.weight) || 1.0,
                  });
                }
              }
            }
          }
          
          if (splitsToInsert.length > 0) {
            console.log('📊 Storing expense splits:', splitsToInsert);
            const { error: splitsError } = await this.supabase
              .from('expense_splits')
              .insert(splitsToInsert);
              
            if (splitsError) {
              console.error('❌ Expense splits insert error:', splitsError);
              throw new Error(`Failed to save expense splits: ${splitsError.message}`);
            }
            console.log('✅ Expense splits stored successfully');
          }
        } else {
          console.log('ℹ️ No valid expenses to insert after filtering');
        }
      } else {
        console.log('ℹ️ No expenses to store (empty or invalid array)');
      }
      
      console.log('🎉 Group stored successfully in Supabase!');
    } catch (error) {
      console.error('💥 Error storing group in Supabase:', error);
      throw error;
    }
  }

  /**
   * Delete a group from Supabase
   * @param {string} groupId
   * @returns {Promise<void>}
   */
  async deleteGroup(groupId) {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await this.supabase
      .from('groups')
      .delete()
      .eq('id', groupId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete group: ${error.message}`);
    }
  }

  /**
   * Delete an expense from Supabase
   * @param {string} expenseId
   * @returns {Promise<void>}
   */
  async deleteExpense(expenseId) {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Delete the expense (splits will be handled later when we fix the schema)
      const { error } = await this.supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) {
        throw new Error(`Failed to delete expense: ${error.message}`);
      }
      
      console.log('✅ Expense deleted successfully:', expenseId);
    } catch (error) {
      console.error('💥 Error deleting expense:', error);
      throw error;
    }
  }

  /**
   * Get user settings
   * @returns {Promise<any>}
   */
  async getUserSettings() {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: settings, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return defaults
        return {
          theme: 'system',
          currency: 'INR',
          notifications: true
        };
      }
      throw new Error(`Failed to fetch user settings: ${error.message}`);
    }

    return {
      theme: settings.theme,
      currency: settings.currency,
      notifications: settings.notifications
    };
  }

  /**
   * Save user settings
   * @param {any} settings
   * @returns {Promise<void>}
   */
  async saveUserSettings(settings) {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await this.supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        theme: settings.theme,
        currency: settings.currency,
        notifications: settings.notifications,
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Failed to save user settings: ${error.message}`);
    }
  }

  /**
   * Transform group data from database format to app format
   * @param {any} dbGroup
   * @returns {any}
   */
  transformGroupFromDB(dbGroup) {
    try {
      return {
        id: dbGroup.id,
        name: dbGroup.name,
        currency: dbGroup.currency,
        createdAt: new Date(dbGroup.created_at),
        participants: (dbGroup.participants || []).map(participant => ({
          id: participant.id,
          name: participant.name,
          defaultWeight: participant.weight || 1.0,
          active: true, // Default to active since we don't store this in DB
          createdAt: new Date(participant.created_at)
        })),
        expenses: (dbGroup.expenses || []).map(expense => {
          let split = [];
          
          // Use expense_splits from DB if they exist
          if (expense.expense_splits && expense.expense_splits.length > 0) {
            split = expense.expense_splits.map(s => ({
              participantId: s.participant_id,
              weight: parseFloat(s.weight) || 1.0,
              included: true,
              amount: parseFloat(s.amount)
            }));
          } else if (expense.category !== 'Settlement') {
            // Fallback: Generate equal split for all participants for non-settlement expenses
            split = (dbGroup.participants || []).map(participant => ({
              participantId: participant.id,
              weight: parseFloat(participant.weight) || 1.0,
              included: true,
              amount: parseFloat(expense.amount) / (dbGroup.participants || []).length
            }));
          }
          
          return {
            id: expense.id,
            description: expense.description,
            amount: parseFloat(expense.amount),
            payerId: expense.paid_by, // Map paid_by to payerId for consistency
            date: new Date(expense.date),
            category: expense.category,
            split: split
          };
        })
      };
    } catch (error) {
      console.error('Error transforming group from DB:', error, dbGroup);
      throw error;
    }
  }

  /**
   * Clear all data (not implemented for Supabase - use with caution)
   * @returns {Promise<void>}
   */
  async clear() {
    throw new Error('Clear all data not implemented for Supabase adapter for safety reasons');
  }

  /**
   * Get storage size (not applicable for Supabase)
   * @returns {Promise<number>}
   */
  async getSize() {
    return 0; // Not applicable for Supabase
  }

  // Compatibility methods for the existing storage manager interface
  async getItem(key) {
    if (key === 'schema') {
      const groups = await this.getAllGroups();
      const settings = await this.getUserSettings();
      
      return {
        version: '1.0.0',
        groups: groups.reduce((acc, group) => {
          acc[group.id] = group;
          return acc;
        }, {}),
        settings,
        lastSync: new Date()
      };
    }
    return null;
  }

  async setItem(key, value) {
    // Not needed for Supabase implementation
    return;
  }
}