import { createClient } from './client.js';

export class RealtimeManager {
  constructor() {
    this.supabase = createClient();
    this.subscriptions = new Map();
    this.setupConnectionMonitoring();
  }

  setupConnectionMonitoring() {
    // Add connection status monitoring using the correct Supabase realtime API
    if (typeof window !== 'undefined') {
      // Only set up monitoring in browser environment
      // Use the state change callbacks instead
      this.supabase.realtime.stateChangeCallbacks.open.push(() => {
        console.log('✅ Real-time connection opened');
      });

      this.supabase.realtime.stateChangeCallbacks.close.push(() => {
        console.log('❌ Real-time connection closed');
      });

      this.supabase.realtime.stateChangeCallbacks.error.push((error) => {
        console.error('❌ Real-time connection error:', error);
      });
    }
  }

  subscribeToGroups(userId, callback) {
    const channelName = `groups-${userId}`;
    
    // Remove existing subscription if any
    this.unsubscribe(channelName);

    console.log('🔄 Setting up real-time subscription for groups...');
    
    const channel = this.supabase
      .channel(channelName)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'groups',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('✅ Real-time event received:', payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('🔄 Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to groups changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Failed to subscribe to groups changes');
        }
      });

    this.subscriptions.set(channelName, channel);
    return channel;
  }

  subscribeToGroupExpenses(groupId, callback) {
    const channelName = `group-expenses-${groupId}`;
    
    // Remove existing subscription if any
    this.unsubscribe(channelName);

    console.log(`🔄 Setting up real-time subscription for group ${groupId} expenses...`);
    
    const channel = this.supabase
      .channel(channelName)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'expenses',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          console.log('✅ Real-time expense event received:', payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('🔄 Real-time expense subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to expense changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Failed to subscribe to expense changes');
        }
      });

    this.subscriptions.set(channelName, channel);
    return channel;
  }

  unsubscribe(channelName) {
    const channel = this.subscriptions.get(channelName);
    if (channel) {
      console.log(`🔄 Unsubscribing from ${channelName}...`);
      this.supabase.removeChannel(channel);
      this.subscriptions.delete(channelName);
    }
  }

  unsubscribeAll() {
    console.log('🔄 Unsubscribing from all real-time channels...');
    for (const [channelName, channel] of this.subscriptions) {
      this.supabase.removeChannel(channel);
    }
    this.subscriptions.clear();
  }

  // Test real-time connection
  async testConnection() {
    console.log('🧪 Testing real-time connection...');
    
    try {
      const testChannel = this.supabase
        .channel('test-connection')
        .subscribe((status) => {
          console.log('🧪 Test connection status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time connection test successful');
            // Clean up test channel
            setTimeout(() => {
              this.supabase.removeChannel(testChannel);
            }, 1000);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Real-time connection test failed');
          }
        });
      
      return testChannel;
    } catch (error) {
      console.error('❌ Real-time connection test error:', error);
      throw error;
    }
  }
}

// Create singleton instance
let realtimeManager = null;

export function getRealtimeManager() {
  if (!realtimeManager) {
    realtimeManager = new RealtimeManager();
  }
  return realtimeManager;
}