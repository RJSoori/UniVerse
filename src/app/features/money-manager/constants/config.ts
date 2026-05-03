/**
 * Money Manager Configuration Constants
 */

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
