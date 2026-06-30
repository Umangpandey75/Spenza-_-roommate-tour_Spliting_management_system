import { describe, test, expect } from 'vitest';
import {
  computeOwed,
  computeNet,
  computeMinimalSettlements,
  formatCurrency,
  roundToPrecision,
  validateSettlement
} from './index.js';

describe('computeOwed', () => {
  const participants = [
    { id: 'alice', name: 'Alice', active: true, defaultWeight: 1 },
    { id: 'bob', name: 'Bob', active: true, defaultWeight: 1 },
    { id: 'charlie', name: 'Charlie', active: true, defaultWeight: 1 }
  ];

  test('should calculate equal splits correctly', () => {
    const expense = {
      id: 'exp1',
      amount: 30,
      split: [
        { participantId: 'alice', weight: 1, included: true },
        { participantId: 'bob', weight: 1, included: true },
        { participantId: 'charlie', weight: 1, included: true }
      ]
    };

    const result = computeOwed(expense, participants);
    
    expect(result.alice).toBe(10);
    expect(result.bob).toBe(10);
    expect(result.charlie).toBe(10);
  });

  test('should calculate weighted splits correctly', () => {
    const expense = {
      id: 'exp1',
      amount: 100,
      split: [
        { participantId: 'alice', weight: 2, included: true },
        { participantId: 'bob', weight: 1, included: true },
        { participantId: 'charlie', weight: 1, included: true }
      ]
    };

    const result = computeOwed(expense, participants);
    
    expect(result.alice).toBe(50);
    expect(result.bob).toBe(25);
    expect(result.charlie).toBe(25);
  });

  test('should handle excluded participants', () => {
    const expense = {
      id: 'exp1',
      amount: 20,
      split: [
        { participantId: 'alice', weight: 1, included: true },
        { participantId: 'bob', weight: 1, included: true },
        { participantId: 'charlie', weight: 1, included: false }
      ]
    };

    const result = computeOwed(expense, participants);
    
    expect(result.alice).toBe(10);
    expect(result.bob).toBe(10);
    expect(result.charlie).toBeUndefined();
  });

  test('should handle rounding correctly', () => {
    const expense = {
      id: 'exp1',
      amount: 10,
      split: [
        { participantId: 'alice', weight: 1, included: true },
        { participantId: 'bob', weight: 1, included: true },
        { participantId: 'charlie', weight: 1, included: true }
      ]
    };

    const result = computeOwed(expense, participants);
    
    // Should sum to exactly 10.00
    const total = result.alice + result.bob + result.charlie;
    expect(total).toBe(10);
    
    // Each should be close to 3.33
    expect(result.alice).toBeCloseTo(3.33, 2);
    expect(result.bob).toBeCloseTo(3.33, 2);
    expect(result.charlie).toBeCloseTo(3.34, 2);
  });

  test('should handle zero weights', () => {
    const expense = {
      id: 'exp1',
      amount: 30,
      split: [
        { participantId: 'alice', weight: 0, included: true },
        { participantId: 'bob', weight: 0, included: true },
        { participantId: 'charlie', weight: 0, included: true }
      ]
    };

    expect(() => computeOwed(expense, participants)).toThrow('Total weight must be greater than zero');
  });

  test('should handle no included participants', () => {
    const expense = {
      id: 'exp1',
      amount: 30,
      split: [
        { participantId: 'alice', weight: 1, included: false },
        { participantId: 'bob', weight: 1, included: false },
        { participantId: 'charlie', weight: 1, included: false }
      ]
    };

    expect(() => computeOwed(expense, participants)).toThrow('No participants included in expense split');
  });

  test('should handle invalid input', () => {
    expect(() => computeOwed(null, participants)).toThrow('Invalid expense or participants data');
    expect(() => computeOwed({}, null)).toThrow('Invalid expense or participants data');
  });
});

describe('computeNet', () => {
  const participants = [
    { id: 'alice', name: 'Alice', active: true, defaultWeight: 1 },
    { id: 'bob', name: 'Bob', active: true, defaultWeight: 1 }
  ];

  test('should calculate net balances correctly', () => {
    const expenses = [
      {
        id: 'exp1',
        amount: 20,
        payerId: 'alice',
        split: [
          { participantId: 'alice', weight: 1, included: true },
          { participantId: 'bob', weight: 1, included: true }
        ]
      },
      {
        id: 'exp2',
        amount: 30,
        payerId: 'bob',
        split: [
          { participantId: 'alice', weight: 1, included: true },
          { participantId: 'bob', weight: 1, included: true }
        ]
      }
    ];

    const result = computeNet(expenses, participants);
    
    const alice = result.find(b => b.participantId === 'alice');
    const bob = result.find(b => b.participantId === 'bob');
    
    expect(alice.totalPaid).toBe(20);
    expect(alice.totalOwed).toBe(25); // 10 + 15
    expect(alice.netBalance).toBe(-5); // 20 - 25
    
    expect(bob.totalPaid).toBe(30);
    expect(bob.totalOwed).toBe(25); // 10 + 15
    expect(bob.netBalance).toBe(5); // 30 - 25
  });

  test('should handle empty expenses', () => {
    const result = computeNet([], participants);
    
    expect(result).toHaveLength(2);
    result.forEach(balance => {
      expect(balance.totalPaid).toBe(0);
      expect(balance.totalOwed).toBe(0);
      expect(balance.netBalance).toBe(0);
    });
  });

  test('should handle invalid expenses gracefully', () => {
    const expenses = [
      {
        id: 'exp1',
        amount: 20,
        payerId: 'alice',
        split: [] // Invalid split
      }
    ];

    const result = computeNet(expenses, participants);
    
    const alice = result.find(b => b.participantId === 'alice');
    expect(alice.totalPaid).toBe(20);
    expect(alice.totalOwed).toBe(0); // Should be 0 due to invalid split
  });

  test('should handle invalid input', () => {
    expect(() => computeNet(null, participants)).toThrow('Invalid expenses or participants data');
    expect(() => computeNet([], null)).toThrow('Invalid expenses or participants data');
  });
});

describe('computeMinimalSettlements', () => {
  test('should compute minimal settlements for simple case', () => {
    const balances = [
      { participantId: 'alice', netBalance: -10 }, // Owes 10
      { participantId: 'bob', netBalance: 15 },    // Owed 15
      { participantId: 'charlie', netBalance: -5 } // Owes 5
    ];

    const result = computeMinimalSettlements(balances);
    
    expect(result).toHaveLength(2);
    
    // Should have Alice pay Bob 10 and Charlie pay Bob 5
    const aliceToBob = result.find(t => t.fromId === 'alice' && t.toId === 'bob');
    const charlieToBob = result.find(t => t.fromId === 'charlie' && t.toId === 'bob');
    
    expect(aliceToBob.amount).toBe(10);
    expect(charlieToBob.amount).toBe(5);
  });

  test('should handle complex settlement scenario', () => {
    const balances = [
      { participantId: 'alice', netBalance: -20 },  // Owes 20
      { participantId: 'bob', netBalance: 15 },     // Owed 15
      { participantId: 'charlie', netBalance: -10 }, // Owes 10
      { participantId: 'david', netBalance: 15 }    // Owed 15
    ];

    const result = computeMinimalSettlements(balances);
    
    // Should create optimal transfers
    expect(result.length).toBeGreaterThan(0);
    
    // Verify total amounts balance
    const totalFrom = result.reduce((sum, t) => sum + t.amount, 0);
    const totalTo = result.reduce((sum, t) => sum + t.amount, 0);
    expect(totalFrom).toBe(totalTo);
    expect(totalFrom).toBe(30); // Total debt amount
  });

  test('should handle already balanced scenario', () => {
    const balances = [
      { participantId: 'alice', netBalance: 0 },
      { participantId: 'bob', netBalance: 0 }
    ];

    const result = computeMinimalSettlements(balances);
    expect(result).toHaveLength(0);
  });

  test('should ignore small balances', () => {
    const balances = [
      { participantId: 'alice', netBalance: -0.005 }, // Too small
      { participantId: 'bob', netBalance: 0.005 }     // Too small
    ];

    const result = computeMinimalSettlements(balances);
    expect(result).toHaveLength(0);
  });

  test('should handle empty input', () => {
    expect(computeMinimalSettlements([])).toEqual([]);
    expect(computeMinimalSettlements(null)).toEqual([]);
  });

  test('should sort by amount for optimal settlements', () => {
    const balances = [
      { participantId: 'alice', netBalance: -5 },   // Owes 5
      { participantId: 'bob', netBalance: -20 },    // Owes 20 (largest debt)
      { participantId: 'charlie', netBalance: 15 }, // Owed 15
      { participantId: 'david', netBalance: 10 }    // Owed 10
    ];

    const result = computeMinimalSettlements(balances);
    
    // Should prioritize largest amounts first
    expect(result.length).toBeGreaterThan(0);
    
    // Verify the settlement is valid
    expect(validateSettlement(result, balances)).toBe(true);
  });
});

describe('formatCurrency', () => {
  test('should format INR correctly', () => {
    expect(formatCurrency(123.45, 'INR')).toBe('₹123.45');
    expect(formatCurrency(0, 'INR')).toBe('₹0.00');
    expect(formatCurrency(-50.25, 'INR')).toBe('-₹50.25');
  });

  test('should format USD correctly', () => {
    expect(formatCurrency(123.45, 'USD')).toBe('$123.45');
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
    expect(formatCurrency(-50.25, 'USD')).toBe('-$50.25');
  });

  test('should handle different currencies', () => {
    expect(formatCurrency(100, 'EUR')).toMatch(/€100\.00|100\.00\s*€/);
    expect(formatCurrency(100, 'GBP')).toMatch(/£100\.00|100\.00\s*£/);
  });

  test('should handle formatting options', () => {
    expect(formatCurrency(123.45, 'USD', { showSymbol: false })).toBe('123.45');
    expect(formatCurrency(123.45, 'USD', { showSymbol: false, showCode: true })).toBe('123.45 USD');
  });

  test('should handle rounding', () => {
    expect(formatCurrency(123.456, 'INR')).toBe('₹123.46');
    expect(formatCurrency(123.454, 'INR')).toBe('₹123.45');
  });

  test('should handle invalid input', () => {
    expect(formatCurrency(NaN, 'INR')).toBe('₹0.00');
    expect(formatCurrency('invalid', 'INR')).toBe('₹0.00');
    expect(formatCurrency(null, 'INR')).toBe('₹0.00');
  });

  test('should fallback gracefully', () => {
    // Test with invalid currency code
    const result = formatCurrency(100, 'INVALID');
    expect(result).toMatch(/100\.00/);
  });
});

describe('roundToPrecision', () => {
  test('should round to 2 decimal places by default', () => {
    expect(roundToPrecision(123.456)).toBe(123.46);
    expect(roundToPrecision(123.454)).toBe(123.45);
    expect(roundToPrecision(123.455)).toBe(123.46);
  });

  test('should handle custom decimal places', () => {
    expect(roundToPrecision(123.456, 1)).toBe(123.5);
    expect(roundToPrecision(123.456, 3)).toBe(123.456);
    expect(roundToPrecision(123.456, 0)).toBe(123);
  });

  test('should handle edge cases', () => {
    expect(roundToPrecision(0)).toBe(0);
    expect(roundToPrecision(-123.456)).toBe(-123.46);
    expect(roundToPrecision(NaN)).toBe(0);
    expect(roundToPrecision('invalid')).toBe(0);
  });
});

describe('validateSettlement', () => {
  test('should validate correct settlement', () => {
    const balances = [
      { participantId: 'alice', netBalance: -10 },
      { participantId: 'bob', netBalance: 10 }
    ];
    
    const transfers = [
      { fromId: 'alice', toId: 'bob', amount: 10 }
    ];

    expect(validateSettlement(transfers, balances)).toBe(true);
  });

  test('should reject incorrect settlement', () => {
    const balances = [
      { participantId: 'alice', netBalance: -10 },
      { participantId: 'bob', netBalance: 10 }
    ];
    
    const transfers = [
      { fromId: 'alice', toId: 'bob', amount: 5 } // Incorrect amount
    ];

    expect(validateSettlement(transfers, balances)).toBe(false);
  });

  test('should handle invalid participants', () => {
    const balances = [
      { participantId: 'alice', netBalance: -10 },
      { participantId: 'bob', netBalance: 10 }
    ];
    
    const transfers = [
      { fromId: 'charlie', toId: 'bob', amount: 10 } // Invalid participant
    ];

    expect(validateSettlement(transfers, balances)).toBe(false);
  });

  test('should handle invalid input', () => {
    expect(validateSettlement(null, [])).toBe(false);
    expect(validateSettlement([], null)).toBe(false);
  });

  test('should handle complex valid settlement', () => {
    const balances = [
      { participantId: 'alice', netBalance: -15 },
      { participantId: 'bob', netBalance: 10 },
      { participantId: 'charlie', netBalance: 5 }
    ];
    
    const transfers = [
      { fromId: 'alice', toId: 'bob', amount: 10 },
      { fromId: 'alice', toId: 'charlie', amount: 5 }
    ];

    expect(validateSettlement(transfers, balances)).toBe(true);
  });
});

// Integration tests
describe('Integration Tests', () => {
  test('should handle complete expense calculation workflow', () => {
    const participants = [
      { id: 'alice', name: 'Alice', active: true, defaultWeight: 1 },
      { id: 'bob', name: 'Bob', active: true, defaultWeight: 1 },
      { id: 'charlie', name: 'Charlie', active: true, defaultWeight: 1 }
    ];

    const expenses = [
      {
        id: 'exp1',
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
        amount: 30,
        payerId: 'bob',
        split: [
          { participantId: 'alice', weight: 1, included: true },
          { participantId: 'bob', weight: 1, included: true },
          { participantId: 'charlie', weight: 1, included: false }
        ]
      }
    ];

    // Calculate net balances
    const balances = computeNet(expenses, participants);
    
    // Alice: paid 60, owes 20+15=35, net = 25
    // Bob: paid 30, owes 20+15=35, net = -5
    // Charlie: paid 0, owes 20, net = -20
    
    const alice = balances.find(b => b.participantId === 'alice');
    const bob = balances.find(b => b.participantId === 'bob');
    const charlie = balances.find(b => b.participantId === 'charlie');
    
    expect(alice.netBalance).toBe(25);
    expect(bob.netBalance).toBe(-5);
    expect(charlie.netBalance).toBe(-20);

    // Calculate minimal settlements
    const settlements = computeMinimalSettlements(balances);
    
    // Should create optimal transfers
    expect(settlements.length).toBeGreaterThan(0);
    expect(validateSettlement(settlements, balances)).toBe(true);
    
    // Total transfers should equal total debt
    const totalTransfers = settlements.reduce((sum, t) => sum + t.amount, 0);
    expect(totalTransfers).toBe(25); // Bob owes 5, Charlie owes 20
  });

  test('should handle weighted splits with settlements', () => {
    const participants = [
      { id: 'alice', name: 'Alice', active: true, defaultWeight: 2 },
      { id: 'bob', name: 'Bob', active: true, defaultWeight: 1 }
    ];

    const expenses = [
      {
        id: 'exp1',
        amount: 90,
        payerId: 'alice',
        split: [
          { participantId: 'alice', weight: 2, included: true },
          { participantId: 'bob', weight: 1, included: true }
        ]
      }
    ];

    const balances = computeNet(expenses, participants);
    const alice = balances.find(b => b.participantId === 'alice');
    const bob = balances.find(b => b.participantId === 'bob');
    
    // Alice should owe 60 (2/3 of 90), Bob should owe 30 (1/3 of 90)
    // Alice paid 90, owes 60, net = 30
    // Bob paid 0, owes 30, net = -30
    expect(alice.netBalance).toBe(30);
    expect(bob.netBalance).toBe(-30);

    const settlements = computeMinimalSettlements(balances);
    expect(settlements).toHaveLength(1);
    expect(settlements[0].fromId).toBe('bob');
    expect(settlements[0].toId).toBe('alice');
    expect(settlements[0].amount).toBe(30);
  });
});