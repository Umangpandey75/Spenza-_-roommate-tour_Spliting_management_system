import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateId,
  transformCreateGroupForm,
  transformAddExpenseForm,
  transformEditParticipantForm,
  createDefaultExpenseSplit,
  normalizeExpenseSplits,
  calculateSplitAmounts,
  parseDate,
  formatDateForInput,
  sanitizeString,
  parseNumber,
  deepClone,
} from '../transform';

describe('Transform Utilities', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(10);
    });
  });

  describe('transformCreateGroupForm', () => {
    it('should transform valid form data to group object', () => {
      const formData = {
        name: '  Weekend Trip  ',
        currency: 'USD',
        participantNames: ['Alice', '  Bob  ', 'Charlie'],
      };

      const result = transformCreateGroupForm(formData);
      
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Weekend Trip');
      expect(result.currency).toBe('USD');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.participants).toHaveLength(3);
      expect(result.participants[0].name).toBe('Alice');
      expect(result.participants[1].name).toBe('Bob');
      expect(result.participants[2].name).toBe('Charlie');
      expect(result.expenses).toEqual([]);
    });

    it('should throw error for invalid form data', () => {
      const invalidFormData = {
        name: '',
        currency: 'INVALID',
        participantNames: [],
      };

      expect(() => transformCreateGroupForm(invalidFormData)).toThrow();
    });
  });

  describe('transformAddExpenseForm', () => {
    it('should transform valid form data to expense object', () => {
      const formData = {
        description: '  Dinner at restaurant  ',
        amount: '120.50',
        date: '2024-01-15',
        category: 'Food & Dining',
        payerId: 'participant-1',
        split: [
          { participantId: 'p1', weight: 1, included: true },
          { participantId: 'p2', weight: 1.5, included: true },
          { participantId: 'p3', weight: 0, included: false },
        ],
      };

      const result = transformAddExpenseForm(formData, 'group-1');
      
      expect(result.id).toBeDefined();
      expect(result.groupId).toBe('group-1');
      expect(result.description).toBe('Dinner at restaurant');
      expect(result.amount).toBe(120.50);
      expect(result.date).toBeInstanceOf(Date);
      expect(result.category).toBe('Food & Dining');
      expect(result.payerId).toBe('participant-1');
      expect(result.split).toHaveLength(2); // Only included participants
    });

    it('should throw error for invalid form data', () => {
      const invalidFormData = {
        description: '',
        amount: 'invalid',
        date: 'invalid-date',
        category: 'Invalid Category',
        payerId: '',
        split: [],
      };

      expect(() => transformAddExpenseForm(invalidFormData, 'group-1')).toThrow();
    });
  });

  describe('transformEditParticipantForm', () => {
    it('should transform valid form data to participant object', () => {
      const formData = {
        name: '  Updated Name  ',
        defaultWeight: 1.5,
        active: false,
      };

      const result = transformEditParticipantForm(formData, 'participant-1');
      
      expect(result.id).toBe('participant-1');
      expect(result.name).toBe('Updated Name');
      expect(result.defaultWeight).toBe(1.5);
      expect(result.active).toBe(false);
    });

    it('should throw error for invalid form data', () => {
      const invalidFormData = {
        name: '',
        defaultWeight: -1,
        active: true,
      };

      expect(() => transformEditParticipantForm(invalidFormData, 'participant-1')).toThrow();
    });
  });

  describe('createDefaultExpenseSplit', () => {
    it('should create default splits for active participants', () => {
      const participants = [
        { id: 'p1', name: 'Alice', active: true, defaultWeight: 1 },
        { id: 'p2', name: 'Bob', active: true, defaultWeight: 2 },
        { id: 'p3', name: 'Charlie', active: false, defaultWeight: 1 },
      ];

      const result = createDefaultExpenseSplit(participants);
      
      expect(result).toHaveLength(2); // Only active participants
      expect(result[0]).toEqual({
        participantId: 'p1',
        weight: 1,
        included: true,
      });
      expect(result[1]).toEqual({
        participantId: 'p2',
        weight: 2,
        included: true,
      });
    });

    it('should use default weight when participant weight is missing', () => {
      const participants = [
        { id: 'p1', name: 'Alice', active: true },
      ];

      const result = createDefaultExpenseSplit(participants, 1.5);
      
      expect(result[0].weight).toBe(1.5);
    });
  });

  describe('normalizeExpenseSplits', () => {
    it('should normalize valid splits', () => {
      const splits = [
        { participantId: 'p1', weight: 1, included: true },
        { participantId: 'p2', weight: 2, included: true },
        { participantId: 'p3', weight: 0, included: false },
      ];

      const result = normalizeExpenseSplits(splits);
      
      expect(result).toHaveLength(3);
      expect(result[0].weight).toBe(1);
      expect(result[1].weight).toBe(2);
      expect(result[2].weight).toBe(0);
    });

    it('should fix negative weights for included participants', () => {
      const splits = [
        { participantId: 'p1', weight: -1, included: true },
        { participantId: 'p2', weight: null, included: true },
      ];

      const result = normalizeExpenseSplits(splits);
      
      expect(result[0].weight).toBe(0);
      expect(result[1].weight).toBe(1);
    });

    it('should throw error when no participants are included', () => {
      const splits = [
        { participantId: 'p1', weight: 1, included: false },
        { participantId: 'p2', weight: 1, included: false },
      ];

      expect(() => normalizeExpenseSplits(splits)).toThrow('At least one participant must be included');
    });
  });

  describe('calculateSplitAmounts', () => {
    it('should calculate amounts based on weights', () => {
      const splits = [
        { participantId: 'p1', weight: 1, included: true },
        { participantId: 'p2', weight: 2, included: true },
        { participantId: 'p3', weight: 0, included: false },
      ];

      const result = calculateSplitAmounts(90, splits);
      
      expect(result).toHaveLength(3);
      expect(result[0].amount).toBe(30); // 90 * 1/3
      expect(result[1].amount).toBe(60); // 90 * 2/3
      expect(result[2].amount).toBe(0);  // Not included
    });

    it('should handle rounding correctly', () => {
      const splits = [
        { participantId: 'p1', weight: 1, included: true },
        { participantId: 'p2', weight: 1, included: true },
        { participantId: 'p3', weight: 1, included: true },
      ];

      const result = calculateSplitAmounts(100, splits);
      
      expect(result[0].amount).toBe(33.33);
      expect(result[1].amount).toBe(33.33);
      expect(result[2].amount).toBe(33.33);
    });

    it('should throw error when total weight is zero', () => {
      const splits = [
        { participantId: 'p1', weight: 0, included: true },
      ];

      expect(() => calculateSplitAmounts(100, splits)).toThrow('Total weight cannot be zero');
    });
  });

  describe('parseDate', () => {
    it('should parse valid date strings', () => {
      const result = parseDate('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(15);
    });

    it('should throw error for invalid date strings', () => {
      expect(() => parseDate('invalid-date')).toThrow('Invalid date format');
      expect(() => parseDate('')).toThrow('Invalid date format');
    });
  });

  describe('formatDateForInput', () => {
    it('should format valid dates for input', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const result = formatDateForInput(date);
      expect(result).toBe('2024-01-15');
    });

    it('should return current date for invalid input', () => {
      const today = new Date().toISOString().split('T')[0];
      
      expect(formatDateForInput(null)).toBe(today);
      expect(formatDateForInput('invalid')).toBe(today);
      expect(formatDateForInput(new Date('invalid'))).toBe(today);
    });
  });

  describe('sanitizeString', () => {
    it('should trim and limit string length', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
      expect(sanitizeString('a'.repeat(300), 10)).toBe('a'.repeat(10));
    });

    it('should handle non-string input', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
      expect(sanitizeString(123)).toBe('');
    });
  });

  describe('parseNumber', () => {
    it('should parse valid numbers', () => {
      expect(parseNumber('123.45')).toBe(123.45);
      expect(parseNumber(123.45)).toBe(123.45);
      expect(parseNumber('123.456', { decimals: 1 })).toBe(123.5);
    });

    it('should apply min/max constraints', () => {
      expect(parseNumber(-10, { min: 0 })).toBe(0);
      expect(parseNumber(100, { max: 50 })).toBe(50);
    });

    it('should throw error for invalid input', () => {
      expect(() => parseNumber('invalid')).toThrow('Invalid number format');
      expect(() => parseNumber(null)).toThrow('Invalid number format');
    });
  });

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
    });

    it('should clone dates', () => {
      const date = new Date('2024-01-15');
      const cloned = deepClone(date);
      
      expect(cloned).toBeInstanceOf(Date);
      expect(cloned.getTime()).toBe(date.getTime());
      expect(cloned).not.toBe(date);
    });

    it('should clone arrays', () => {
      const arr = [1, 2, { a: 3 }];
      const cloned = deepClone(arr);
      
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[2]).not.toBe(arr[2]);
    });

    it('should clone objects', () => {
      const obj = {
        a: 1,
        b: {
          c: 2,
          d: [3, 4],
        },
      };
      const cloned = deepClone(obj);
      
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
      expect(cloned.b.d).not.toBe(obj.b.d);
    });
  });
});