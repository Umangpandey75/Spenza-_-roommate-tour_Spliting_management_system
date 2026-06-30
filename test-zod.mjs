import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Accommodation',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Other',
];

const currencyCodeSchema = z.enum(CURRENCIES.map(c => c.code));
const expenseCategorySchema = z.enum(EXPENSE_CATEGORIES);

const participantSchema = z.object({
  id: z.string().min(1, 'Participant ID is required'),
  name: z.string().min(1, 'Participant name is required').max(100, 'Name too long'),
  avatar: z.string().url().optional(),
  active: z.boolean().default(true),
  defaultWeight: z.number().min(0, 'Weight must be non-negative').default(1),
  createdAt: z.date().optional(),
});

const expenseSplitSchema = z.object({
  participantId: z.string().min(1, 'Participant ID is required'),
  weight: z.number().min(0, 'Weight must be non-negative'),
  included: z.boolean().default(true),
  amount: z.number().optional(),
});

const expenseSchema = z.object({
  id: z.string().min(1, 'Expense ID is required'),
  groupId: z.string().min(1, 'Group ID is required'),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  amount: z.number().positive('Amount must be positive'),
  currency: currencyCodeSchema,
  date: z.date(),
  category: expenseCategorySchema,
  payerId: z.string().min(1, 'Payer ID is required'),
  split: z.array(expenseSplitSchema).min(1, 'At least one participant must be included'),
});

const groupSchema = z.object({
  id: z.string().min(1, 'Group ID is required'),
  name: z.string().min(1, 'Group name is required').max(100, 'Name too long'),
  currency: currencyCodeSchema,
  createdAt: z.date(),
  participants: z.array(participantSchema).default([]),
  expenses: z.array(expenseSchema).default([]),
});

function normalizeGroupData(group) {
  const normalized = { ...group };

  if (normalized.expenses) {
    normalized.expenses = normalized.expenses.map(expense => {
      const normalizedExpense = { ...expense };
      if (normalizedExpense.paidBy && !normalizedExpense.payerId) {
        normalizedExpense.payerId = normalizedExpense.paidBy;
        delete normalizedExpense.paidBy;
      }
      if (!normalizedExpense.currency) {
        normalizedExpense.currency = normalized.currency || 'USD';
      }
      if (!normalizedExpense.split || normalizedExpense.split.length === 0) {
        normalizedExpense.split = (normalized.participants || []).map(participant => ({
          participantId: participant.id,
          weight: participant.defaultWeight || 1,
          included: true
        }));
      }
      if (typeof normalizedExpense.date === 'string') {
        normalizedExpense.date = new Date(normalizedExpense.date);
      }
      if (!normalizedExpense.id) {
        normalizedExpense.id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      }
      if (!normalizedExpense.groupId) {
        normalizedExpense.groupId = normalized.id;
      }
      return normalizedExpense;
    });
  }

  if (normalized.participants) {
    normalized.participants = normalized.participants.map(participant => ({
      ...participant,
      active: participant.active !== false,
      defaultWeight: participant.defaultWeight || 1,
      createdAt: participant.createdAt ? new Date(participant.createdAt) : new Date()
    }));
  }

  if (typeof normalized.createdAt === 'string') {
    normalized.createdAt = new Date(normalized.createdAt);
  }

  return normalized;
}

const supabaseUrl = 'https://stpmcaqsqzdvcwsedcya.supabase.co';
const supabaseKey = 'sb_publishable_smggZq2rH99drKSOAy85wQ_4lvV6yT2';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: groups, error } = await supabase
    .from('groups')
    .select(`
      *,
      participants (*),
      expenses (*)
    `)
    .limit(1);

  if (error) {
    console.error('Supabase error:', error);
    return;
  }

  if (groups.length === 0) {
    console.log('No groups found');
    return;
  }

  const dbGroup = groups[0];
  
  const group = {
    id: dbGroup.id,
    name: dbGroup.name,
    currency: dbGroup.currency,
    createdAt: new Date(dbGroup.created_at),
    participants: (dbGroup.participants || []).map(participant => ({
      id: participant.id,
      name: participant.name,
      defaultWeight: participant.weight || 1.0,
      active: true,
      createdAt: new Date(participant.created_at)
    })),
    expenses: (dbGroup.expenses || []).map(expense => {
      const split = (dbGroup.participants || []).map(participant => ({
        participantId: participant.id,
        weight: participant.weight || 1.0,
        included: true,
        amount: parseFloat(expense.amount) / (dbGroup.participants || []).length
      }));
      
      return {
        id: expense.id,
        description: expense.description,
        amount: parseFloat(expense.amount),
        payerId: expense.paid_by,
        date: new Date(expense.date),
        category: expense.category,
        split: split
      };
    })
  };

  const normalizedGroup = normalizeGroupData(group);
  try {
    groupSchema.parse(normalizedGroup);
    console.log('Validation successful');
  } catch (err) {
    console.log('Validation failed!');
    console.log(JSON.stringify(err.errors, null, 2));
  }
}

run();
