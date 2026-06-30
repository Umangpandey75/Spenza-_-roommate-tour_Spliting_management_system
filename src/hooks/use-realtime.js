import { useEffect, useRef } from 'react';
import { getRealtimeManager } from '../utils/supabase/realtime.js';

export function useRealtimeGroups(userId, onGroupsChange) {
  const realtimeManager = useRef(getRealtimeManager());
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!userId || !onGroupsChange) return;

    console.log('🔄 Setting up real-time groups subscription for user:', userId);
    
    const manager = realtimeManager.current;
    
    // Subscribe to groups changes
    subscriptionRef.current = manager.subscribeToGroups(
      userId,
      (payload) => {
        console.log('📡 Groups real-time update:', payload);
        onGroupsChange(payload);
      }
    );

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        console.log('🧹 Cleaning up groups real-time subscription');
        manager.unsubscribe(`groups-${userId}`);
        subscriptionRef.current = null;
      }
    };
  }, [userId, onGroupsChange]);

  return {
    testConnection: () => realtimeManager.current.testConnection(),
    unsubscribe: () => {
      if (subscriptionRef.current && userId) {
        realtimeManager.current.unsubscribe(`groups-${userId}`);
        subscriptionRef.current = null;
      }
    }
  };
}

export function useRealtimeGroupExpenses(groupId, onExpensesChange) {
  const realtimeManager = useRef(getRealtimeManager());
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (!groupId || !onExpensesChange) return;

    console.log('🔄 Setting up real-time expenses subscription for group:', groupId);
    
    const manager = realtimeManager.current;
    
    // Subscribe to expense changes
    subscriptionRef.current = manager.subscribeToGroupExpenses(
      groupId,
      (payload) => {
        console.log('📡 Expenses real-time update:', payload);
        onExpensesChange(payload);
      }
    );

    // Cleanup on unmount
    return () => {
      if (subscriptionRef.current) {
        console.log('🧹 Cleaning up expenses real-time subscription');
        manager.unsubscribe(`group-expenses-${groupId}`);
        subscriptionRef.current = null;
      }
    };
  }, [groupId, onExpensesChange]);

  return {
    unsubscribe: () => {
      if (subscriptionRef.current && groupId) {
        realtimeManager.current.unsubscribe(`group-expenses-${groupId}`);
        subscriptionRef.current = null;
      }
    }
  };
}