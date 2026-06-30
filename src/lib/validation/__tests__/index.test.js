import { describe, it, expect } from 'vitest';
import {
  validateData,
  validateWithDefault,
  validateGroup,
  validateParticipant,
  validateExpense,
  validateArray,
  getErrorMessages,
  isValidCurrencyCode,
  isValidExpenseCategory,
} from '../index';
import { participantSchema, groupSchema } from '../schemas';

describe('Validation Utilities', () => {
  describe('validateData', () => {
    it('should return success for valid data', () => {
      const validParticipant = {
        id: 'p1',
        name: 'Alice',
        active: true,
        defaultWeight: 1,
      };

      const result = validateData(participantSchema, validParticipant);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validParticipant);
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid data', () => {
      const invalidParticipant = {
        id: '',
        name: '',
        defaultWeight: -1,
      };

      const result = validateData(participantSchema, invalidParticipant);
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(Array.isArray(result.error)).toBe(true);
      expect(result.error.length).toBeGreaterThan(0);
    });
  });

  describe('validateWithDefault', () => {
    it('should return validated data for valid input', () => {
      const validParticipant = {
        id: 'p1',
        name: 'Alice',
        active: true,
        defaultWeight: 1,
      };

      const result = validateWithDefault(participantSchema, validParticipant, null);
      expect(result).toEqual(validParticipant);
    });

    it('should return default value for invalid input', () => {
      const invalidParticipant = {
        id: '',
        name: '',
      };

      const defaultValue = { id: 'default', name: 'Default User' };
      const result = validateWithDefault(participantSchema, invalidParticipant, defaultValue);
      expect(result).toEqual(defaultValue);
    });
  });

  describe('validateArray', () => {
    it('should validate array of valid items', () => {
      const participants = [
        { id: 'p1', name: 'Alice', active: true, defaultWeight: 1 },
        { id: 'p2', name: 'Bob', active: true, defaultWeight: 1 },
      ];

      const result = validateArray(participantSchema, participants);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.error).toBeUndefined();
    });

    it('should return errors for invalid items', () => {
      const participants = [
        { id: 'p1', name: 'Alice', active: true, defaultWeight: 1 },
        { id: '', name: '', defaultWeight: -1 }, // Invalid
      ];

      const result = validateArray(participantSchema, participants);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toHaveLength(1);
      expect(result.error[0].index).toBe(1);
    });

    it('should reject non-array input', () => {
      const result = validateArray(participantSchema, 'not-an-array');
      expect(result.success).toBe(false);
      expect(result.error).toEqual([{ message: 'Expected an array' }]);
    });
  });

  describe('getErrorMessages', () => {
    it('should format error messages with paths', () => {
      const errors = [
        { path: ['name'], message: 'Name is required' },
        { path: ['defaultWeight'], message: 'Weight must be non-negative' },
      ];

      const messages = getErrorMessages(errors);
      expect(messages).toEqual([
        'name: Name is required',
        'defaultWeight: Weight must be non-negative',
      ]);
    });

    it('should format error messages without paths', () => {
      const errors = [
        { message: 'General validation error' },
      ];

      const messages = getErrorMessages(errors);
      expect(messages).toEqual(['General validation error']);
    });

    it('should handle empty or invalid errors', () => {
      expect(getErrorMessages(null)).toEqual(['Validation failed']);
      expect(getErrorMessages(undefined)).toEqual(['Validation failed']);
      expect(getErrorMessages([])).toEqual([]);
    });
  });

  describe('isValidCurrencyCode', () => {
    it('should return true for valid currency codes', () => {
      expect(isValidCurrencyCode('USD')).toBe(true);
      expect(isValidCurrencyCode('EUR')).toBe(true);
      expect(isValidCurrencyCode('GBP')).toBe(true);
    });

    it('should return false for invalid currency codes', () => {
      expect(isValidCurrencyCode('INVALID')).toBe(false);
      expect(isValidCurrencyCode('')).toBe(false);
      expect(isValidCurrencyCode(null)).toBe(false);
    });
  });

  describe('isValidExpenseCategory', () => {
    it('should return true for valid expense categories', () => {
      expect(isValidExpenseCategory('Food & Dining')).toBe(true);
      expect(isValidExpenseCategory('Transportation')).toBe(true);
      expect(isValidExpenseCategory('Entertainment')).toBe(true);
    });

    it('should return false for invalid expense categories', () => {
      expect(isValidExpenseCategory('Invalid Category')).toBe(false);
      expect(isValidExpenseCategory('')).toBe(false);
      expect(isValidExpenseCategory(null)).toBe(false);
    });
  });

  describe('Specific validation functions', () => {
    it('should validate group data', () => {
      const validGroup = {
        id: 'group-1',
        name: 'Test Group',
        currency: 'USD',
        createdAt: new Date(),
        participants: [
          { id: 'p1', name: 'Alice', active: true, defaultWeight: 1 },
        ],
        expenses: [],
      };

      const result = validateGroup(validGroup);
      expect(result.success).toBe(true);
    });

    it('should validate participant data', () => {
      const validParticipant = {
        id: 'p1',
        name: 'Alice',
        active: true,
        defaultWeight: 1,
      };

      const result = validateParticipant(validParticipant);
      expect(result.success).toBe(true);
    });

    it('should validate expense data', () => {
      const validExpense = {
        id: 'expense-1',
        groupId: 'group-1',
        description: 'Test expense',
        amount: 50,
        currency: 'USD',
        date: new Date(),
        category: 'Food & Dining',
        payerId: 'p1',
        split: [
          { participantId: 'p1', weight: 1, included: true },
        ],
      };

      const result = validateExpense(validExpense);
      expect(result.success).toBe(true);
    });
  });
});