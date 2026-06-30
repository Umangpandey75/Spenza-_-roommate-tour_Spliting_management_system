import { z } from 'zod';
import { CURRENCIES, EXPENSE_CATEGORIES } from '../utils/constants.js';

// Helper schemas
const currencyCodeSchema = z.enum(CURRENCIES.map(c => c.code));
const expenseCategorySchema = z.string();

// Core data model schemas
export const participantSchema = z.object({
  id: z.string().min(1, 'Participant ID is required'),
  name: z.string().min(1, 'Participant name is required').max(100, 'Name too long'),
  avatar: z.string().url().optional(),
  active: z.boolean().default(true),
  defaultWeight: z.coerce.number().min(0, 'Weight must be non-negative').default(1),
});

export const expenseSplitSchema = z.object({
  participantId: z.string().min(1, 'Participant ID is required'),
  weight: z.coerce.number().min(0, 'Weight must be non-negative'),
  included: z.boolean().default(true),
});

export const expenseSchema = z.object({
  id: z.string().min(1, 'Expense ID is required'),
  groupId: z.string().min(1, 'Group ID is required'),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  amount: z.coerce.number().positive('Amount must be positive'),
  currency: currencyCodeSchema,
  date: z.coerce.date(),
  category: expenseCategorySchema,
  payerId: z.string().min(1, 'Payer ID is required'),
  split: z.array(expenseSplitSchema).min(1, 'At least one participant must be included'),
});

export const groupSchema = z.object({
  id: z.string().min(1, 'Group ID is required'),
  name: z.string().min(1, 'Group name is required').max(100, 'Name too long'),
  currency: currencyCodeSchema,
  createdAt: z.date(),
  participants: z.array(participantSchema).default([]),
  expenses: z.array(expenseSchema).default([]),
});

export const transferSchema = z.object({
  fromId: z.string().min(1, 'From participant ID is required'),
  toId: z.string().min(1, 'To participant ID is required'),
  amount: z.coerce.number().positive('Transfer amount must be positive'),
});

export const settlementSchema = z.object({
  id: z.string().min(1, 'Settlement ID is required'),
  groupId: z.string().min(1, 'Group ID is required'),
  transfers: z.array(transferSchema),
  createdAt: z.date(),
});

export const balanceCalculationSchema = z.object({
  participantId: z.string().min(1, 'Participant ID is required'),
  totalPaid: z.coerce.number().min(0, 'Total paid must be non-negative'),
  totalOwed: z.coerce.number().min(0, 'Total owed must be non-negative'),
  netBalance: z.coerce.number(),
});

export const userSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  currency: currencyCodeSchema.default('INR'),
  reducedMotion: z.boolean().default(false),
  highContrast: z.boolean().default(false),
});

// Form schemas for user input validation
export const createGroupFormSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Name too long'),
  currency: currencyCodeSchema,
  participantNames: z.array(z.string().min(1, 'Participant name is required')).min(1, 'At least one participant is required'),
});

export const addExpenseFormSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, 'Amount must be a positive number'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  category: expenseCategorySchema,
  payerId: z.string().min(1, 'Payer is required'),
  split: z.array(z.object({
    participantId: z.string(),
    weight: z.number().min(0),
    included: z.boolean(),
  })).min(1),
});

export const editParticipantFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  defaultWeight: z.number().min(0, 'Weight must be non-negative'),
  active: z.boolean(),
});