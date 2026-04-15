/**
 * Application Configuration Constants
 *
 * This file contains all hardcoded values and configuration constants
 * that were previously scattered throughout the codebase. Centralizing
 * these values here makes the code more maintainable and easier to
 * modify for different environments or requirements.
 */

// GPA Calculator Constants
export const GPA_CONFIG = {
  // Total semesters in a typical degree program
  // This represents the standard duration for most undergraduate programs
  TOTAL_SEMESTERS: 8,

  // Default GPA scale (4.0 for standard, 4.2 for extended)
  DEFAULT_GPA_SCALE: 4.0,

  // Extended GPA scale used in some institutions
  EXTENDED_GPA_SCALE: 4.2,

  // Degree classification thresholds (GPA boundaries)
  DEGREE_CLASSIFICATIONS: {
    firstClass: 3.7,      // First Class Honours
    secondUpper: 3.3,    // Second Class Upper Division
    secondLower: 3.0,    // Second Class Lower Division
    general: 2.0         // General Degree
  }
} as const;

// Money Manager Constants
export const MONEY_CONFIG = {
  // Currency symbol and formatting
  CURRENCY: 'LKR',

  // Default budget allocation percentages (Needs/Wants/Savings)
  DEFAULT_BUDGET_ALLOCATION: {
    needs: 65,    // Essential expenses (food, rent, transport, etc.)
    wants: 25,    // Discretionary spending (entertainment, dining out, etc.)
    savings: 10   // Savings and investments
  },

  // Classic 50/30/20 budget rule
  CLASSIC_BUDGET_ALLOCATION: {
    needs: 50,
    wants: 30,
    savings: 20
  },

  // Transaction categories
  EXPENSE_CATEGORIES: [
    'Food',
    'Dining Out',
    'Transportation',
    'Rent / Accommodation',
    'Education',
    'Shopping',
    'Entertainment',
    'Health',
    'Clothing',
    'Bills',
    'Other'
  ],

  INCOME_CATEGORIES: [
    'Allowance',
    'Salary',
    'Freelance',
    'Scholarship',
    'Business',
    'Dividends',
    'Investments',
    'Tips',
    'Other'
  ]
} as const;

// Timezone and Date Constants
export const TIME_CONFIG = {
  // IST timezone offset in milliseconds (GMT+5:30)
  IST_OFFSET_MS: 5.5 * 60 * 60 * 1000,

  // Default time format
  DEFAULT_TIME_FORMAT: 'HH:mm'
} as const;

// UI Constants
export const UI_CONFIG = {
  // Default number of items to show in lists
  DEFAULT_LIST_LIMIT: 10,

  // Animation durations in milliseconds
  ANIMATION_DURATION: {
    fast: 200,
    normal: 300,
    slow: 500
  },

  // Success message display duration
  SUCCESS_MESSAGE_DURATION: 2000
} as const;

// Validation Constants
export const VALIDATION_CONFIG = {
  // Maximum lengths for input fields
  MAX_LENGTHS: {
    transactionDescription: 200,
    walletName: 50,
    categoryName: 30
  },

  // Minimum values
  MIN_VALUES: {
    transactionAmount: 0.01,
    budgetAmount: 1000
  }
} as const;