import { useMemo } from 'react';
import { computeNet, computeMinimalSettlements } from '../lib/calc';

/**
 * Custom hook for memoizing expensive calculations
 * Prevents unnecessary recalculations when data hasn't changed
 */
export function useMemoizedCalculations(expenses = [], participants = []) {
  // Memoize balance calculations
  const balances = useMemo(() => {
    if (!expenses.length || !participants.length) {
      return [];
    }
    
    try {
      return computeNet(expenses, participants);
    } catch (error) {
      console.warn('Error computing balances:', error);
      return [];
    }
  }, [expenses, participants]);

  // Memoize settlement calculations
  const settlements = useMemo(() => {
    if (!balances.length) {
      return [];
    }
    
    try {
      return computeMinimalSettlements(balances);
    } catch (error) {
      console.warn('Error computing settlements:', error);
      return [];
    }
  }, [balances]);

  // Memoize derived statistics
  const statistics = useMemo(() => {
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const hasDebts = balances.some(balance => Math.abs(balance.netBalance) > 0.01);
    const totalTransfers = settlements.reduce((sum, transfer) => sum + transfer.amount, 0);
    
    return {
      totalSpent,
      hasDebts,
      totalTransfers,
      expenseCount: expenses.length,
      participantCount: participants.length,
      settlementCount: settlements.length,
    };
  }, [expenses, balances, settlements, participants]);

  return {
    balances,
    settlements,
    statistics,
  };
}

/**
 * Custom hook for memoizing group data transformations
 */
export function useMemoizedGroupData(group) {
  return useMemo(() => {
    if (!group) {
      return {
        expenses: [],
        participants: [],
        totalSpent: 0,
        hasExpenses: false,
        hasParticipants: false,
      };
    }

    const expenses = group.expenses || [];
    const participants = group.participants || [];
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      expenses,
      participants,
      totalSpent,
      hasExpenses: expenses.length > 0,
      hasParticipants: participants.length > 0,
    };
  }, [group]);
}

/**
 * Custom hook for memoizing filtered and sorted data
 */
export function useMemoizedFilters(data = [], filters = {}, sortConfig = {}) {
  return useMemo(() => {
    let filtered = [...data];

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        filtered = filtered.filter(item => {
          if (typeof value === 'string') {
            return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
          }
          return item[key] === value;
        });
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, filters, sortConfig]);
}