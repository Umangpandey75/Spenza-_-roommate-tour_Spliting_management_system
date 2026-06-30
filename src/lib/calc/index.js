/**
 * Calculation engine for the Group Expense Splitter
 * Handles expense calculations, balance computations, and settlement optimization
 * Optimized with memoization for performance
 */

import { getCurrencySymbol } from '../utils/format';

// Cache for expensive calculations
const calculationCache = new Map();

/**
 * Generate cache key for calculations
 * @param {string} type - Calculation type
 * @param {any} data - Data to hash
 * @returns {string} Cache key
 */
function getCacheKey(type, data) {
  return `${type}_${JSON.stringify(data)}`;
}

/**
 * Memoized calculation wrapper
 * @param {string} type - Calculation type
 * @param {any} data - Input data
 * @param {Function} calculation - Calculation function
 * @returns {any} Cached or calculated result
 */
function memoizedCalculation(type, data, calculation) {
  const key = getCacheKey(type, data);
  
  if (calculationCache.has(key)) {
    return calculationCache.get(key);
  }
  
  const result = calculation();
  calculationCache.set(key, result);
  
  // Limit cache size to prevent memory leaks
  if (calculationCache.size > 100) {
    const firstKey = calculationCache.keys().next().value;
    calculationCache.delete(firstKey);
  }
  
  return result;
}

/**
 * Computes how much each participant owes for a given expense with weighted splits
 * @param {Expense} expense - The expense to calculate splits for
 * @param {Participant[]} participants - Array of all participants
 * @returns {Object.<string, number>} Map of participantId to amount owed
 */
export function computeOwed(expense, participants) {
  return memoizedCalculation('owed', { expense, participants }, () => {
    if (!expense || !expense.split || !participants) {
      throw new Error('Invalid expense or participants data');
    }

    // Get only included participants with their weights
    const includedSplits = expense.split.filter(split => split.included);
    
    if (includedSplits.length === 0) {
      throw new Error('No participants included in expense split');
    }

    // Calculate total weight
    const totalWeight = includedSplits.reduce((sum, split) => sum + split.weight, 0);
    
    if (totalWeight <= 0) {
      throw new Error('Total weight must be greater than zero');
    }

    // Calculate amount owed by each participant
    const owedAmounts = {};
    let totalAllocated = 0;

    // Calculate weighted amounts for all but the last participant
    for (let i = 0; i < includedSplits.length - 1; i++) {
      const split = includedSplits[i];
      const amount = Math.round((expense.amount * split.weight / totalWeight) * 100) / 100;
      owedAmounts[split.participantId] = amount;
      totalAllocated += amount;
    }

    // Assign remaining amount to last participant to handle rounding
    const lastSplit = includedSplits[includedSplits.length - 1];
    owedAmounts[lastSplit.participantId] = Math.round((expense.amount - totalAllocated) * 100) / 100;

    return owedAmounts;
  });
}

/**
 * Computes net balances for all participants (amount paid - amount owed)
 * @param {Expense[]} expenses - Array of all expenses
 * @param {Participant[]} participants - Array of all participants
 * @returns {BalanceCalculation[]} Array of balance calculations for each participant
 */
export function computeNet(expenses, participants) {
  if (!expenses || !participants) {
    throw new Error('Invalid expenses or participants data');
  }

  // Initialize balances for all participants
  const balances = {};
  participants.forEach(participant => {
    balances[participant.id] = {
      participantId: participant.id,
      totalPaid: 0,
      totalOwed: 0,
      netBalance: 0
    };
  });

  // Process each expense
  expenses.forEach(expense => {
    // Add to payer's totalPaid
    if (balances[expense.payerId]) {
      balances[expense.payerId].totalPaid += expense.amount;
    }

    // Calculate and add owed amounts
    try {
      const owedAmounts = computeOwed(expense, participants);
      Object.entries(owedAmounts).forEach(([participantId, amount]) => {
        if (balances[participantId]) {
          balances[participantId].totalOwed += amount;
        }
      });
    } catch (error) {
      console.warn(`Error calculating owed amounts for expense ${expense.id}:`, error.message);
    }
  });

  // Calculate net balances and round to 2 decimal places
  Object.values(balances).forEach(balance => {
    balance.totalPaid = Math.round(balance.totalPaid * 100) / 100;
    balance.totalOwed = Math.round(balance.totalOwed * 100) / 100;
    balance.netBalance = Math.round((balance.totalPaid - balance.totalOwed) * 100) / 100;
  });

  return Object.values(balances);
}

/**
 * Computes minimal settlements using a greedy algorithm
 * @param {BalanceCalculation[]} balances - Array of participant balances
 * @returns {Transfer[]} Array of transfers needed to settle all debts
 */
export function computeMinimalSettlements(balances) {
  if (!balances || balances.length === 0) {
    return [];
  }

  // Create working copies and separate creditors from debtors
  const creditors = balances
    .filter(b => b.netBalance > 0.01) // Positive balance = owed money
    .map(b => ({ ...b }))
    .sort((a, b) => b.netBalance - a.netBalance); // Sort by amount descending

  const debtors = balances
    .filter(b => b.netBalance < -0.01) // Negative balance = owes money
    .map(b => ({ ...b, netBalance: -b.netBalance })) // Make positive for easier calculation
    .sort((a, b) => b.netBalance - a.netBalance); // Sort by amount descending

  const transfers = [];
  let creditorIndex = 0;
  let debtorIndex = 0;

  // Greedy algorithm: match largest creditor with largest debtor
  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    // Calculate transfer amount (minimum of what creditor is owed and debtor owes)
    const transferAmount = Math.min(creditor.netBalance, debtor.netBalance);
    
    if (transferAmount > 0.01) { // Only create transfer if amount is significant
      transfers.push({
        fromId: debtor.participantId,
        toId: creditor.participantId,
        amount: Math.round(transferAmount * 100) / 100
      });

      // Update balances
      creditor.netBalance -= transferAmount;
      debtor.netBalance -= transferAmount;
    }

    // Move to next creditor or debtor if current one is settled
    if (creditor.netBalance <= 0.01) {
      creditorIndex++;
    }
    if (debtor.netBalance <= 0.01) {
      debtorIndex++;
    }
  }

  return transfers;
}

/**
 * Formats currency amount with proper precision and symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (e.g., 'USD', 'EUR')
 * @param {Object} options - Formatting options
 * @param {boolean} options.showSymbol - Whether to show currency symbol
 * @param {boolean} options.showCode - Whether to show currency code
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'INR', options = {}) {
  const { showSymbol = true, showCode = false } = options;

  if (typeof amount !== 'number' || isNaN(amount)) {
    // Get the appropriate currency symbol for the fallback
    const symbol = getCurrencySymbol(currency);
    return showSymbol ? `${symbol}0.00` : '0.00';
  }

  // Round to 2 decimal places
  const roundedAmount = Math.round(amount * 100) / 100;

  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    let formatted = formatter.format(Math.abs(roundedAmount));
    
    // Add currency code if requested
    if (showCode && !showSymbol) {
      formatted += ` ${currency}`;
    }

    // Handle negative amounts
    if (roundedAmount < 0) {
      formatted = showSymbol ? `-${formatted}` : `-${formatted}`;
    }

    return formatted;
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    const formatted = Math.abs(roundedAmount).toFixed(2);
    const symbol = showSymbol ? getCurrencySymbol(currency) : '';
    const code = showCode && !showSymbol ? ` ${currency}` : '';
    return `${roundedAmount < 0 ? '-' : ''}${symbol}${formatted}${code}`;
  }
}

/**
 * Handles precision issues with floating point arithmetic
 * @param {number} value - Value to round
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Precisely rounded value
 */
export function roundToPrecision(value, decimals = 2) {
  if (typeof value !== 'number' || isNaN(value)) {
    return 0;
  }
  
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Validates that settlement transfers actually balance out
 * @param {Transfer[]} transfers - Array of transfers to validate
 * @param {BalanceCalculation[]} originalBalances - Original balances before settlement
 * @returns {boolean} True if transfers are valid and balanced
 */
export function validateSettlement(transfers, originalBalances) {
  if (!transfers || !originalBalances) {
    return false;
  }

  // Calculate net effect of all transfers for each participant
  const netTransfers = {};
  originalBalances.forEach(balance => {
    netTransfers[balance.participantId] = 0;
  });

  // Validate each transfer and calculate net effects
  for (const transfer of transfers) {
    if (!netTransfers.hasOwnProperty(transfer.fromId) || !netTransfers.hasOwnProperty(transfer.toId)) {
      return false; // Invalid participant ID
    }
    
    // When someone pays a transfer, their debt decreases (balance becomes more positive)
    // When someone receives a transfer, what they're owed decreases (balance becomes less positive)
    netTransfers[transfer.fromId] += transfer.amount; // Paying reduces debt
    netTransfers[transfer.toId] -= transfer.amount;   // Receiving reduces what they're owed
  }

  // Check that each participant's final balance is approximately zero
  for (const balance of originalBalances) {
    const finalBalance = balance.netBalance + netTransfers[balance.participantId];
    if (Math.abs(finalBalance) > 0.01) {
      return false;
    }
  }

  return true;
}