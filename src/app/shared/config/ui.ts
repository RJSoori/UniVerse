/**
 * Shared UI / time / validation configuration constants.
 */

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
