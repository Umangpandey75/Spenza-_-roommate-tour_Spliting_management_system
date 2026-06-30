/**
 * Example usage of the calculation engine
 * This file demonstrates how to use the calculation functions
 */

import {
  computeOwed,
  computeNet,
  computeMinimalSettlements,
  formatCurrency,
  validateSettlement
} from './index.js';

// Example data
const participants = [
  { id: 'alice', name: 'Alice', active: true, defaultWeight: 1 },
  { id: 'bob', name: 'Bob', active: true, defaultWeight: 1 },
  { id: 'charlie', name: 'Charlie', active: true, defaultWeight: 1 }
];

const expenses = [
  {
    id: 'exp1',
    description: 'Dinner',
    amount: 60,
    payerId: 'alice',
    split: [
      { participantId: 'alice', weight: 1, included: true },
      { participantId: 'bob', weight: 1, included: true },
      { participantId: 'charlie', weight: 1, included: true }
    ]
  },
  {
    id: 'exp2',
    description: 'Groceries',
    amount: 45,
    payerId: 'bob',
    split: [
      { participantId: 'alice', weight: 1, included: true },
      { participantId: 'bob', weight: 1, included: true },
      { participantId: 'charlie', weight: 1, included: false } // Charlie didn't participate
    ]
  },
  {
    id: 'exp3',
    description: 'Gas',
    amount: 30,
    payerId: 'charlie',
    split: [
      { participantId: 'alice', weight: 2, included: true }, // Alice used more gas
      { participantId: 'bob', weight: 1, included: true },
      { participantId: 'charlie', weight: 1, included: true }
    ]
  }
];

console.log('=== Group Expense Splitter Example ===\n');

// Step 1: Calculate individual expense splits
console.log('1. Individual Expense Splits:');
expenses.forEach(expense => {
  const owedAmounts = computeOwed(expense, participants);
  console.log(`${expense.description} (${formatCurrency(expense.amount)}) paid by ${expense.payerId}:`);
  Object.entries(owedAmounts).forEach(([participantId, amount]) => {
    console.log(`  ${participantId}: ${formatCurrency(amount)}`);
  });
  console.log();
});

// Step 2: Calculate net balances
console.log('2. Net Balances:');
const balances = computeNet(expenses, participants);
balances.forEach(balance => {
  console.log(`${balance.participantId}:`);
  console.log(`  Total Paid: ${formatCurrency(balance.totalPaid)}`);
  console.log(`  Total Owed: ${formatCurrency(balance.totalOwed)}`);
  console.log(`  Net Balance: ${formatCurrency(balance.netBalance)} ${balance.netBalance > 0 ? '(owed money)' : '(owes money)'}`);
  console.log();
});

// Step 3: Calculate minimal settlements
console.log('3. Minimal Settlement Transfers:');
const settlements = computeMinimalSettlements(balances);
if (settlements.length === 0) {
  console.log('No transfers needed - everyone is settled!');
} else {
  settlements.forEach((transfer, index) => {
    console.log(`${index + 1}. ${transfer.fromId} pays ${transfer.toId}: ${formatCurrency(transfer.amount)}`);
  });
}

// Step 4: Validate the settlement
console.log('\n4. Settlement Validation:');
const isValid = validateSettlement(settlements, balances);
console.log(`Settlement is ${isValid ? 'valid' : 'invalid'}`);

if (isValid) {
  console.log('✅ All balances will be zero after these transfers');
} else {
  console.log('❌ Settlement calculation error - balances won\'t be zero');
}

// Step 5: Show total group spending
const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
console.log(`\n5. Group Summary:`);
console.log(`Total Group Spending: ${formatCurrency(totalSpent)}`);
console.log(`Average per Person: ${formatCurrency(totalSpent / participants.length)}`);
console.log(`Number of Transfers Needed: ${settlements.length}`);