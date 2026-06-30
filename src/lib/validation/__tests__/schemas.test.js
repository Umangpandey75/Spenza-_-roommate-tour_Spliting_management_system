import { describe, it, expect } from 'vitest';
import {
  participantSchema,
  expenseSplitSchema,
  expenseSchema,
  groupSchema,
  transferSchema,
  settlementSchema,
  balanceCalculationSchema,
  userSettingsSchema,
  createGroupFormSchema,
  addExpenseFormSchema,
  editParticipantFormSchema,
} from '../schemas';

describe('Participant Schema', () => {
  it('should validate a valid participant', () => {
    const validParticipant = {
      id: 'participant-1',
      name: 'John Doe',
      active: true,
      defaultWeight: 1,
    };

    const result = participantSchema.safeParse(validParticipant);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validParticipant);
  });

  it('should apply default values', () => {
    const participant = {
      id: 'participant-1',
      name: 'John Doe',
    };

    const result = participantSchema.safeParse(participant);
    expect(result.success).toBe(true);
    expect(result.data.active).toBe(true);
    expect(result.data.defaultWeight).toBe(1);
  });

  it('should reject invalid participant data', () => {
    const invalidParticipant = {
      id: '',
      name: '',
      defaultWeight: -1,
    };

    const result = participantSchema.safeParse(invalidParticipant);
    expect(result.success).toBe(false);
    expect(result.error.issues.length).toBeGreaterThan(0);
  });

  it('should validate optional avatar URL', () => {
    const participantWithAvatar = {
      id: 'participant-1',
      name: 'John Doe',
      avatar: 'https://example.com/avatar.jpg',
      active: true,
      defaultWeight: 1,
    };

    const result = participantSchema.safeParse(participantWithAvatar);
    expect(result.success).toBe(true);
  });

  it('should reject invalid avatar URL', () => {
    const participantWithInvalidAvatar = {
      id: 'participant-1',
      name: 'John Doe',
      avatar: 'not-a-url',
      active: true,
      defaultWeight: 1,
    };

    const result = participantSchema.safeParse(participantWithInvalidAvatar);
    expect(result.success).toBe(false);
  });
});

describe('Expense Split Schema', () => {
  it('should validate a valid expense split', () => {
    const validSplit = {
      participantId: 'participant-1',
      weight: 1.5,
      included: true,
    };

    const result = expenseSplitSchema.safeParse(validSplit);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validSplit);
  });

  it('should apply default included value', () => {
    const split = {
      participantId: 'participant-1',
      weight: 1,
    };

    const result = expenseSplitSchema.safeParse(split);
    expect(result.success).toBe(true);
    expect(result.data.included).toBe(true);
  });

  it('should reject negative weights', () => {
    const invalidSplit = {
      participantId: 'participant-1',
      weight: -1,
      included: true,
    };

    const result = expenseSplitSchema.safeParse(invalidSplit);
    expect(result.success).toBe(false);
  });
});

describe('Expense Schema', () => {
  it('should validate a valid expense', () => {
    const validExpense = {
      id: 'expense-1',
      groupId: 'group-1',
      description: 'Dinner at restaurant',
      amount: 120.50,
      currency: 'USD',
      date: new Date('2024-01-15'),
      category: 'Food & Dining',
      payerId: 'participant-1',
      split: [
        { participantId: 'participant-1', weight: 1, included: true },
        { participantId: 'participant-2', weight: 1, included: true },
      ],
    };

    const result = expenseSchema.safeParse(validExpense);
    expect(result.success).toBe(true);
  });

  it('should reject expenses with zero or negative amounts', () => {
    const invalidExpense = {
      id: 'expense-1',
      groupId: 'group-1',
      description: 'Invalid expense',
      amount: -50,
      currency: 'USD',
      date: new Date(),
      category: 'Food & Dining',
      payerId: 'participant-1',
      split: [{ participantId: 'participant-1', weight: 1, included: true }],
    };

    const result = expenseSchema.safeParse(invalidExpense);
    expect(result.success).toBe(false);
  });

  it('should reject expenses with invalid currency', () => {
    const invalidExpense = {
      id: 'expense-1',
      groupId: 'group-1',
      description: 'Invalid currency expense',
      amount: 50,
      currency: 'INVALID',
      date: new Date(),
      category: 'Food & Dining',
      payerId: 'participant-1',
      split: [{ participantId: 'participant-1', weight: 1, included: true }],
    };

    const result = expenseSchema.safeParse(invalidExpense);
    expect(result.success).toBe(false);
  });

  it('should reject expenses with empty split array', () => {
    const invalidExpense = {
      id: 'expense-1',
      groupId: 'group-1',
      description: 'No split expense',
      amount: 50,
      currency: 'USD',
      date: new Date(),
      category: 'Food & Dining',
      payerId: 'participant-1',
      split: [],
    };

    const result = expenseSchema.safeParse(invalidExpense);
    expect(result.success).toBe(false);
  });
});

describe('Group Schema', () => {
  it('should validate a valid group', () => {
    const validGroup = {
      id: 'group-1',
      name: 'Trip to Paris',
      currency: 'EUR',
      createdAt: new Date('2024-01-01'),
      participants: [
        { id: 'p1', name: 'Alice', active: true, defaultWeight: 1 },
        { id: 'p2', name: 'Bob', active: true, defaultWeight: 1 },
      ],
      expenses: [],
    };

    const result = groupSchema.safeParse(validGroup);
    expect(result.success).toBe(true);
  });

  it('should apply default empty expenses array', () => {
    const group = {
      id: 'group-1',
      name: 'Trip to Paris',
      currency: 'EUR',
      createdAt: new Date('2024-01-01'),
      participants: [
        { id: 'p1', name: 'Alice', active: true, defaultWeight: 1 },
      ],
    };

    const result = groupSchema.safeParse(group);
    expect(result.success).toBe(true);
    expect(result.data.expenses).toEqual([]);
  });

  it('should reject groups with no participants', () => {
    const invalidGroup = {
      id: 'group-1',
      name: 'Empty group',
      currency: 'USD',
      createdAt: new Date(),
      participants: [],
      expenses: [],
    };

    const result = groupSchema.safeParse(invalidGroup);
    expect(result.success).toBe(false);
  });
});

describe('Transfer Schema', () => {
  it('should validate a valid transfer', () => {
    const validTransfer = {
      fromId: 'participant-1',
      toId: 'participant-2',
      amount: 25.50,
    };

    const result = transferSchema.safeParse(validTransfer);
    expect(result.success).toBe(true);
  });

  it('should reject transfers with zero or negative amounts', () => {
    const invalidTransfer = {
      fromId: 'participant-1',
      toId: 'participant-2',
      amount: -10,
    };

    const result = transferSchema.safeParse(invalidTransfer);
    expect(result.success).toBe(false);
  });
});

describe('Settlement Schema', () => {
  it('should validate a valid settlement', () => {
    const validSettlement = {
      id: 'settlement-1',
      groupId: 'group-1',
      transfers: [
        { fromId: 'p1', toId: 'p2', amount: 25 },
        { fromId: 'p3', toId: 'p2', amount: 15 },
      ],
      createdAt: new Date(),
    };

    const result = settlementSchema.safeParse(validSettlement);
    expect(result.success).toBe(true);
  });

  it('should allow empty transfers array', () => {
    const settlement = {
      id: 'settlement-1',
      groupId: 'group-1',
      transfers: [],
      createdAt: new Date(),
    };

    const result = settlementSchema.safeParse(settlement);
    expect(result.success).toBe(true);
  });
});

describe('Balance Calculation Schema', () => {
  it('should validate a valid balance calculation', () => {
    const validBalance = {
      participantId: 'participant-1',
      totalPaid: 100,
      totalOwed: 75,
      netBalance: 25,
    };

    const result = balanceCalculationSchema.safeParse(validBalance);
    expect(result.success).toBe(true);
  });

  it('should reject negative paid or owed amounts', () => {
    const invalidBalance = {
      participantId: 'participant-1',
      totalPaid: -50,
      totalOwed: -25,
      netBalance: -25,
    };

    const result = balanceCalculationSchema.safeParse(invalidBalance);
    expect(result.success).toBe(false);
  });
});

describe('User Settings Schema', () => {
  it('should validate valid user settings', () => {
    const validSettings = {
      theme: 'dark',
      currency: 'USD',
      reducedMotion: true,
      highContrast: false,
    };

    const result = userSettingsSchema.safeParse(validSettings);
    expect(result.success).toBe(true);
  });

  it('should apply default values', () => {
    const settings = {};

    const result = userSettingsSchema.safeParse(settings);
    expect(result.success).toBe(true);
    expect(result.data.theme).toBe('system');
    expect(result.data.currency).toBe('INR');
    expect(result.data.reducedMotion).toBe(false);
    expect(result.data.highContrast).toBe(false);
  });
});

describe('Form Schemas', () => {
  describe('Create Group Form Schema', () => {
    it('should validate valid create group form data', () => {
      const validForm = {
        name: 'Weekend Trip',
        currency: 'USD',
        participantNames: ['Alice', 'Bob', 'Charlie'],
      };

      const result = createGroupFormSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it('should reject form with empty participant names', () => {
      const invalidForm = {
        name: 'Weekend Trip',
        currency: 'USD',
        participantNames: [],
      };

      const result = createGroupFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });
  });

  describe('Add Expense Form Schema', () => {
    it('should validate valid add expense form data', () => {
      const validForm = {
        description: 'Dinner',
        amount: '45.50',
        date: '2024-01-15',
        category: 'Food & Dining',
        payerId: 'participant-1',
        split: [
          { participantId: 'p1', weight: 1, included: true },
          { participantId: 'p2', weight: 1, included: true },
        ],
      };

      const result = addExpenseFormSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it('should reject invalid amount strings', () => {
      const invalidForm = {
        description: 'Dinner',
        amount: 'not-a-number',
        date: '2024-01-15',
        category: 'Food & Dining',
        payerId: 'participant-1',
        split: [{ participantId: 'p1', weight: 1, included: true }],
      };

      const result = addExpenseFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });
  });

  describe('Edit Participant Form Schema', () => {
    it('should validate valid edit participant form data', () => {
      const validForm = {
        name: 'Updated Name',
        defaultWeight: 1.5,
        active: true,
      };

      const result = editParticipantFormSchema.safeParse(validForm);
      expect(result.success).toBe(true);
    });

    it('should reject negative weights', () => {
      const invalidForm = {
        name: 'Updated Name',
        defaultWeight: -1,
        active: true,
      };

      const result = editParticipantFormSchema.safeParse(invalidForm);
      expect(result.success).toBe(false);
    });
  });
});