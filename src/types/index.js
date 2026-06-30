// Core data model types for the Group Expense Splitter

/**
 * @typedef {Object} Group
 * @property {string} id - Unique identifier for the group
 * @property {string} name - Display name of the group
 * @property {string} currency - Currency code (e.g., 'USD', 'EUR')
 * @property {Date} createdAt - When the group was created
 * @property {Participant[]} participants - Array of group participants
 * @property {Expense[]} expenses - Array of group expenses
 */

/**
 * @typedef {Object} Participant
 * @property {string} id - Unique identifier for the participant
 * @property {string} name - Display name of the participant
 * @property {string} [avatar] - Optional avatar URL
 * @property {boolean} active - Whether the participant is active
 * @property {number} defaultWeight - Default weight for expense splits
 */

/**
 * @typedef {Object} Expense
 * @property {string} id - Unique identifier for the expense
 * @property {string} groupId - ID of the group this expense belongs to
 * @property {string} description - Description of the expense
 * @property {number} amount - Amount of the expense
 * @property {string} currency - Currency code
 * @property {Date} date - Date of the expense
 * @property {string} category - Category of the expense
 * @property {string} payerId - ID of the participant who paid
 * @property {ExpenseSplit[]} split - How the expense is split
 */

/**
 * @typedef {Object} ExpenseSplit
 * @property {string} participantId - ID of the participant
 * @property {number} weight - Weight for this participant's share
 * @property {boolean} included - Whether this participant is included in the split
 */

/**
 * @typedef {Object} Settlement
 * @property {string} id - Unique identifier for the settlement
 * @property {string} groupId - ID of the group
 * @property {Transfer[]} transfers - Array of transfers needed to settle
 * @property {Date} createdAt - When the settlement was calculated
 */

/**
 * @typedef {Object} Transfer
 * @property {string} fromId - ID of participant who owes money
 * @property {string} toId - ID of participant who should receive money
 * @property {number} amount - Amount to transfer
 */

/**
 * @typedef {Object} BalanceCalculation
 * @property {string} participantId - ID of the participant
 * @property {number} totalPaid - Total amount paid by this participant
 * @property {number} totalOwed - Total amount owed by this participant
 * @property {number} netBalance - Net balance (positive = owed money, negative = owes money)
 */

/**
 * @typedef {Object} UserSettings
 * @property {'light' | 'dark' | 'system'} theme - Theme preference
 * @property {string} currency - Default currency
 * @property {boolean} reducedMotion - Whether to reduce animations
 * @property {boolean} highContrast - Whether to use high contrast mode
 */

export {};