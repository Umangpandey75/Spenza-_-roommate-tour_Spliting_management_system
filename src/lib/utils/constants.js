// Application constants

export const CURRENCIES = [
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

export const EXPENSE_CATEGORIES = [
  'Grocery',
  'Electricity',
  'LPG/Gas',
  'Rent',
  'Household Essentials',
  'Transport',
  'Others',
];

export const STORAGE_KEYS = {
  GROUPS: 'group-expense-splitter-groups',
  SETTINGS: 'group-expense-splitter-settings',
  THEME: 'group-expense-splitter-theme',
};

export const PERFORMANCE_TARGETS = {
  EXPENSE_ADD_TIME: 30000, // 30 seconds in milliseconds
  ANIMATION_DURATION: 180, // 180ms for drawer animations
  CALCULATION_TIME: 100, // 100ms for settlement calculations
};

export const DEFAULT_SETTINGS = {
  theme: 'system',
  currency: 'INR',
  reducedMotion: false,
  highContrast: false,
};