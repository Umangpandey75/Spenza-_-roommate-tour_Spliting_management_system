import { validateGroup, validateExpense, validateParticipant } from '../validation/index.js';

/**
 * Generate a unique ID
 * @returns {string} Unique identifier
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Transform form data to create a new group
 * @param {Object} formData - Form data from create group form
 * @returns {Object} Group object ready for storage
 */
export function transformCreateGroupForm(formData) {
  const { name, currency, participantNames } = formData;
  
  const participants = participantNames.map(name => ({
    id: generateId(),
    name: name.trim(),
    active: true,
    defaultWeight: 1,
  }));

  const group = {
    id: generateId(),
    name: name.trim(),
    currency,
    createdAt: new Date(),
    participants,
    expenses: [],
  };

  const validation = validateGroup(group);
  if (!validation.success) {
    throw new Error(`Invalid group data: ${validation.error.map(e => e.message).join(', ')}`);
  }

  return validation.data;
}

/**
 * Transform form data to create a new expense
 * @param {Object} formData - Form data from add expense form
 * @param {string} groupId - ID of the group
 * @returns {Object} Expense object ready for storage
 */
export function transformAddExpenseForm(formData, groupId) {
  const { description, amount, date, category, payerId, split } = formData;

  const expense = {
    id: generateId(),
    groupId,
    description: description.trim(),
    amount: parseFloat(amount),
    currency: 'INR', // This should come from group settings
    date: new Date(date),
    category,
    payerId,
    split: split.filter(s => s.included).map(s => ({
      participantId: s.participantId,
      weight: s.weight,
      included: s.included,
    })),
  };

  const validation = validateExpense(expense);
  if (!validation.success) {
    throw new Error(`Invalid expense data: ${validation.error.map(e => e.message).join(', ')}`);
  }

  return validation.data;
}

/**
 * Transform participant data for editing
 * @param {Object} formData - Form data from edit participant form
 * @param {string} participantId - ID of the participant
 * @returns {Object} Updated participant object
 */
export function transformEditParticipantForm(formData, participantId) {
  const participant = {
    id: participantId,
    name: formData.name.trim(),
    defaultWeight: formData.defaultWeight,
    active: formData.active,
  };

  const validation = validateParticipant(participant);
  if (!validation.success) {
    throw new Error(`Invalid participant data: ${validation.error.map(e => e.message).join(', ')}`);
  }

  return validation.data;
}

/**
 * Create default expense split for all participants
 * @param {Object[]} participants - Array of participants
 * @param {number} defaultWeight - Default weight for each participant
 * @returns {Object[]} Array of expense split objects
 */
export function createDefaultExpenseSplit(participants, defaultWeight = 1) {
  return participants
    .filter(p => p.active)
    .map(participant => ({
      participantId: participant.id,
      weight: participant.defaultWeight || defaultWeight,
      included: true,
    }));
}

/**
 * Normalize expense splits to ensure weights are valid
 * @param {Object[]} splits - Array of expense split objects
 * @returns {Object[]} Normalized splits
 */
export function normalizeExpenseSplits(splits) {
  const includedSplits = splits.filter(s => s.included);
  
  if (includedSplits.length === 0) {
    throw new Error('At least one participant must be included in the expense split');
  }

  // Ensure all weights are positive numbers
  return splits.map(split => ({
    ...split,
    weight: split.included ? Math.max(0, split.weight || 1) : 0,
  }));
}

/**
 * Calculate individual amounts from expense splits
 * @param {number} totalAmount - Total expense amount
 * @param {Object[]} splits - Array of expense split objects
 * @returns {Object[]} Splits with calculated amounts
 */
export function calculateSplitAmounts(totalAmount, splits) {
  const includedSplits = splits.filter(s => s.included);
  const totalWeight = includedSplits.reduce((sum, split) => sum + split.weight, 0);

  if (totalWeight === 0) {
    throw new Error('Total weight cannot be zero');
  }

  return splits.map(split => {
    if (!split.included) {
      return { ...split, amount: 0 };
    }

    const amount = (totalAmount * split.weight) / totalWeight;
    return { ...split, amount: Math.round(amount * 100) / 100 }; // Round to 2 decimal places
  });
}

/**
 * Convert date string to Date object with validation
 * @param {string} dateString - Date string to convert
 * @returns {Date} Date object
 */
export function parseDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  return date;
}

/**
 * Convert Date object to ISO date string for form inputs
 * @param {Date} date - Date object to convert
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export function formatDateForInput(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

/**
 * Sanitize string input by trimming and limiting length
 * @param {string} input - Input string to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
export function sanitizeString(input, maxLength = 200) {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim().substring(0, maxLength);
}

/**
 * Parse and validate numeric input
 * @param {string|number} input - Numeric input to parse
 * @param {Object} options - Parsing options
 * @returns {number} Parsed number
 */
export function parseNumber(input, options = {}) {
  const { min = 0, max = Infinity, decimals = 2 } = options;
  
  if (input === null || input === undefined) {
    throw new Error('Invalid number format');
  }
  
  let num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num)) {
    throw new Error('Invalid number format');
  }

  num = Math.max(min, Math.min(max, num));
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Deep clone an object to prevent mutations
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}