import {
  groupSchema,
  participantSchema,
  expenseSchema,
  expenseSplitSchema,
  settlementSchema,
  transferSchema,
  balanceCalculationSchema,
  userSettingsSchema,
  createGroupFormSchema,
  addExpenseFormSchema,
  editParticipantFormSchema,
} from './schemas.js';

/**
 * Validation result type
 * @typedef {Object} ValidationResult
 * @property {boolean} success - Whether validation passed
 * @property {any} [data] - Validated data if successful
 * @property {Object} [error] - Validation error if failed
 */

/**
 * Validate data against a schema
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {any} data - Data to validate
 * @returns {ValidationResult} Validation result
 */
export function validateData(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error.issues };
  }
}

/**
 * Safely validate data and return default on failure
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {any} data - Data to validate
 * @param {any} defaultValue - Default value to return on failure
 * @returns {any} Validated data or default value
 */
export function validateWithDefault(schema, data, defaultValue) {
  const result = validateData(schema, data);
  return result.success ? result.data : defaultValue;
}

// Specific validation functions for each data type
export const validateGroup = (data) => validateData(groupSchema, data);
export const validateParticipant = (data) => validateData(participantSchema, data);
export const validateExpense = (data) => validateData(expenseSchema, data);
export const validateExpenseSplit = (data) => validateData(expenseSplitSchema, data);
export const validateSettlement = (data) => validateData(settlementSchema, data);
export const validateTransfer = (data) => validateData(transferSchema, data);
export const validateBalanceCalculation = (data) => validateData(balanceCalculationSchema, data);
export const validateUserSettings = (data) => validateData(userSettingsSchema, data);

// Form validation functions
export const validateCreateGroupForm = (data) => validateData(createGroupFormSchema, data);
export const validateAddExpenseForm = (data) => validateData(addExpenseFormSchema, data);
export const validateEditParticipantForm = (data) => validateData(editParticipantFormSchema, data);

/**
 * Validate an array of items against a schema
 * @param {import('zod').ZodSchema} schema - Schema for individual items
 * @param {any[]} items - Array of items to validate
 * @returns {ValidationResult} Validation result with array of validated items
 */
export function validateArray(schema, items) {
  if (!Array.isArray(items)) {
    return { success: false, error: [{ message: 'Expected an array' }] };
  }

  const validatedItems = [];
  const errors = [];

  items.forEach((item, index) => {
    const result = validateData(schema, item);
    if (result.success) {
      validatedItems.push(result.data);
    } else {
      errors.push({ index, errors: result.error });
    }
  });

  if (errors.length > 0) {
    return { success: false, error: errors };
  }

  return { success: true, data: validatedItems };
}

/**
 * Get user-friendly error messages from validation errors
 * @param {Object[]} errors - Zod validation errors
 * @returns {string[]} Array of user-friendly error messages
 */
export function getErrorMessages(errors) {
  if (!errors || !Array.isArray(errors)) {
    return ['Validation failed'];
  }

  return errors.map(error => {
    if (error.path && error.path.length > 0) {
      return `${error.path.join('.')}: ${error.message}`;
    }
    return error.message;
  });
}

/**
 * Check if a value is a valid currency code
 * @param {string} code - Currency code to check
 * @returns {boolean} Whether the code is valid
 */
export function isValidCurrencyCode(code) {
  const result = validateData(groupSchema.shape.currency, code);
  return result.success;
}

/**
 * Check if a value is a valid expense category
 * @param {string} category - Category to check
 * @returns {boolean} Whether the category is valid
 */
export function isValidExpenseCategory(category) {
  const result = validateData(expenseSchema.shape.category, category);
  return result.success;
}

// Export schemas for direct use
export {
  groupSchema,
  participantSchema,
  expenseSchema,
  expenseSplitSchema,
  settlementSchema,
  transferSchema,
  balanceCalculationSchema,
  userSettingsSchema,
  createGroupFormSchema,
  addExpenseFormSchema,
  editParticipantFormSchema,
};