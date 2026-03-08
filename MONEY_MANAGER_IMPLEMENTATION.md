# Money Manager Module - Implementation Guide

## Overview

The Money Manager module is a comprehensive financial management system for the UniVerse platform. It helps students track income, manage expenses, create budgets, and gain financial insights.

## Architecture

### Directory Structure

```
src/app/components/MoneyManager/
├── index.ts                      # Main exports
├── types.ts                      # TypeScript interfaces
├── MoneyManager.tsx              # Main component (entry point)
├── SetupWizard.tsx               # First-time setup flow
├── WalletManager.tsx             # Multiple wallet management
├── AddTransactionForm.tsx        # Transaction creation form
├── TransactionList.tsx           # Display transactions
├── BudgetTracker.tsx             # Budget monitoring & alerts
├── InsightsEngine.tsx            # Smart financial insights
├── SearchTransactions.tsx        # Transaction search & filter
├── ReportsDashboard.tsx          # Analytics & charts
└── MoneyWidget.tsx               # Dashboard widget

src/app/hooks/
└── useMoneyManager.ts            # State management hook

```

## Core Features

### 1. First-Time Setup Wizard

When users access Money Manager for the first time, they complete a 3-step wizard:

1. **Monthly Income** - Define total expected income
2. **Monthly Budget** - Set maximum spending limit
3. **Allocation Mode** - Choose budget distribution:
   - **Recommended (default):** 65% Needs, 25% Wants, 10% Savings
   - **Classic:** 50% Needs, 30% Wants, 20% Savings
   - **Custom:** User-defined percentages

The wizard can be opened again later via the **Edit Budget** button on the Money Manager header. When editing an existing budget, the form is pre‑populated and changes update all metrics and charts immediately. The system ensures the allocation total equals 100% before allowing completion, but sliders remain editable throughout.
**Location:** `SetupWizard.tsx`

### 2. Wallet Management

Users can create and manage multiple wallets:

**Wallet Types:**

- Cash
- Debit Card
- Credit Card
- Savings Account
- Digital Wallet

**Wallet Data Structure:**

```typescript
interface Wallet {
  id: string;
  name: string;
  balance: number;
  createdDate: string;
  type: "cash" | "debit" | "credit" | "savings" | "digital";
}
```

**Location:** `WalletManager.tsx`

### 3. Transaction Management

**Transaction Fields:**

- Type: Income or Expense
- Amount: Numerical value
- Category: Pre-defined categories
- Wallet: Which wallet was used
- Description: Optional notes
- Date: Transaction date

**Expense Categories:**

- Food, Dining Out
- Transportation
- Rent / Accommodation
- Education
- Shopping
- Entertainment
- Health
- Clothing
- Bills
- Other

**Income Categories:**

- Allowance
- Salary
- Freelance
- Scholarship
- Business
- Dividends
- Investments
- Tips
- Other

**Location:** `AddTransactionForm.tsx`, `TransactionList.tsx`

### 4. Smart Budget Engine

**Features:**

- Dynamic budget calculations
- Daily allowance calculation: `Remaining Budget / Remaining Days`
- Automatic balance updates
- Budget tracking and warnings

**Example:**

```
Monthly Budget: LKR 30,000
Current Spending: LKR 12,000
Days Passed: 10
Days Left: 20
Remaining: LKR 18,000
Daily Allowance: LKR 900
```

**Location:** `BudgetTracker.tsx`

### 5. Smart Alerts System

Automatic alerts when:

- Budget exceeds 80% utilization
- Budget is exceeded
- Daily spending exceeds daily allowance
- Wants allocation exceeded
- Significant spending changes detected

**Location:** `InsightsEngine.tsx`

### 6. Financial Insights

Smart insights include:

- Month-to-month comparison analysis
- Spending trend detection
- High spending category alerts
- Savings achievement recognition
- Overspending warnings
- Category-based recommendations

**Severity Levels:**

- Low (informational)
- Medium (warning)
- High (critical)

**Types:**

- Alert (immediate action needed)
- Warning (caution advised)
- Insight (analytical observation)
- Achievement (positive recognition)

**Location:** `InsightsEngine.tsx`

### 7. Search & Filter

Users can search transactions by:

- Transaction name/description
- Category
- Amount
- Wallet

**Location:** `SearchTransactions.tsx`

### 8. Reports Dashboard

Comprehensive analytics with charts:

- **Pie Chart:** Expense breakdown by category
- **Bar Chart:** Top spending categories
- **Line Chart:** Income vs Expense trends
- **Pie Chart:** Wallet distribution

**Report Types:**

- Weekly report (last 7 days)
- Monthly report (current month)
- Custom date range

**Report Components:**

- Total income/expense
- Savings percentage
- Category breakdown
- Needs vs Wants vs Savings allocation
- Wallet balance distribution

**Location:** `ReportsDashboard.tsx`

### 9. Dashboard Widget

Compact Money Manager widget for the main dashboard showing:

- Current balance
- Budget remaining
- Top spending category
- Savings rate

**Location:** `MoneyWidget.tsx`

## Data Storage

### Local Storage Keys

```typescript
money - transactions; // Array<Transaction>
money - wallets; // Array<Wallet>
money - budgets; // Array<Budget>
money - settings; // MoneyManagerSettings
```

### Custom Event System

The module dispatches custom events for real-time updates:

```typescript
// Fired whenever data changes
window.dispatchEvent(new CustomEvent("local-storage-update"));
```

This ensures the dashboard and other components update in real-time.

## The useMoneyManager Hook

Core state management hook that provides:

### Wallet Operations

```typescript
createWallet(name, initialBalance, type);
updateWalletBalance(walletId, newBalance);
deleteWallet(walletId);
```

### Transaction Operations

```typescript
addTransaction(transaction);
updateTransaction(id, updates);
deleteTransaction(id);
```

### Budget Operations

```typescript
getCurrentMonthBudget();
createOrUpdateBudget(budgetData);
```

### Calculations

```typescript
getTotalIncome(); // Sum of all income
getTotalExpenses(); // Sum of all expenses
getBalance(); // Income - Expenses
getDailyAllowance(); // Smart daily budget calculation
```

### Reporting

```typescript
generateReport(period, startDate?, endDate?)
```

### Insights

```typescript
generateInsights(); // Array<FinancialInsight>
```

### Search

```typescript
searchTransactions(query);
```

### Settings

```typescript
completeFirstTimeSetup();
```

**Location:** `src/app/hooks/useMoneyManager.ts`

## Component Integration

### App.tsx

Money Manager is integrated into the main router:

```typescript
import { MoneyManager } from "./components/MoneyManager/MoneyManager";

// In renderContent():
case "money":
  return <MoneyManager />;
```

### WidgetDashboard.tsx

The MoneyWidget is displayed in the dashboard sidebar:

```typescript
import { MoneyWidget } from "../MoneyManager/MoneyWidget";

// In JSX:
<MoneyWidget onNavigate={onNavigate} compact />
```

## Category Classification

### Automatic Category Mapping

The system automatically classifies expenses for budget tracking:

**Needs (65% recommended):**

- Food
- Transportation
- Rent / Accommodation
- Education
- Health
- Bills

**Wants (25% recommended):**

- Dining Out
- Entertainment
- Shopping
- Clothing

**Smart Allocation:**

- Income is tracked separately
- Savings is calculated as remaining balance
- System warns if Wants exceed allocation

## TypeScript Types

### Main Types

```typescript
// Wallet
interface Wallet {
  id: string;
  name: string;
  balance: number;
  createdDate: string;
  type: "cash" | "debit" | "credit" | "savings" | "digital";
}

// Transaction
interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: ExpenseCategory | IncomeCategory;
  walletId: string;
  description?: string;
  date: string;
  time?: string;
}

// Budget
interface Budget {
  monthlyIncome: number;
  monthlyBudget: number;
  allocationMode: "recommended" | "classic" | "custom";
  allocation: { needs: number; wants: number; savings: number };
  month: string;
  totalSpent: number;
  lastUpdated: string;
}

// Daily Allowance
interface DailyAllowance {
  dailyBudget: number;
  remainingBudget: number;
  daysLeft: number;
  todaySpending: number;
  isWarning: boolean;
}

// Financial Report
interface FinancialReport {
  period: "weekly" | "monthly" | "custom";
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsPercentage: number;
  byCategory: CategorySpending[];
  trends: SpendingTrend[];
  walletBreakdown: WalletBreakdown[];
  needsVsWantsVsSavings: BudgetAllocation;
}

// Insight
interface FinancialInsight {
  id: string;
  type: "warning" | "achievement" | "insight" | "alert";
  title: string;
  message: string;
  severity: "low" | "medium" | "high";
  actionable: boolean;
  createdAt: string;
}
```

## UI Components Used

The module leverages existing shadcn/ui components:

- `Card` - Container for sections
- `Button` - Interactive elements
- `Input` - Form inputs
- `Label` - Form labels
- `Badge` - Status indicators
- `Dialog` - Modal dialogs
- `Tabs` - Tab navigation
- `Progress` - Progress bars
- `Checkbox` - Checkboxes
- `Select` - Dropdown selects

Plus **Recharts** for data visualization:

- `BarChart`, `PieChart`, `LineChart`
- `AreaChart` for trend visualization

## Styling

All components use **TailwindCSS** for styling. The module:

- Respects the app's theme system
- Uses CSS variables for colors
- Implements responsive design (mobile-first)
- Includes hover and focus states
- Supports dark mode (via theme system)

## Usage Examples

### Using MoneyManager in Your Application

**Import:**

```typescript
import { MoneyManager } from "@/app/components/MoneyManager";
```

**Use in Router:**

```typescript
case "money":
  return <MoneyManager />;
```

### Using useMoneyManager Hook

```typescript
import { useMoneyManager } from "@/app/hooks/useMoneyManager";

export function MyComponent() {
  const {
    wallets,
    transactions,
    addTransaction,
    getBalance,
    generateReport,
    generateInsights,
  } = useMoneyManager();

  // Use hook data and methods
}
```

### Using MoneyWidget in Dashboard

```typescript
import { MoneyWidget } from "@/app/components/MoneyManager";

export function Dashboard({ onNavigate }) {
  return (
    <div>
      <MoneyWidget onNavigate={onNavigate} compact />
    </div>
  );
}
```

## Local Storage Structure

```json
{
  "money-transactions": [
    {
      "id": "1234567890",
      "type": "expense",
      "amount": 500,
      "category": "Food",
      "walletId": "wallet-1",
      "description": "Lunch",
      "date": "2026-03-08"
    }
  ],
  "money-wallets": [
    {
      "id": "wallet-1",
      "name": "My Debit Card",
      "balance": 15000,
      "createdDate": "2026-03-01",
      "type": "debit"
    }
  ],
  "money-budgets": [
    {
      "month": "2026-03",
      "monthlyIncome": 50000,
      "monthlyBudget": 30000,
      "allocationMode": "recommended",
      "allocation": {
        "needs": 65,
        "wants": 25,
        "savings": 10
      },
      "totalSpent": 12000,
      "lastUpdated": "2026-03-08T10:30:00Z"
    }
  ],
  "money-settings": {
    "firstTimeSetupCompleted": true,
    "currency": "LKR"
  }
}
```

## Responsive Design

The module is fully responsive:

- **Mobile (< 640px):** Single column, stacked layouts
- **Tablet (640px - 1024px):** 2 column grid for cards
- **Desktop (> 1024px):** 3+ column grid, sidebar layouts

## Accessibility

- Semantic HTML structure
- ARIA labels for screen readers
- Keyboard navigation support
- Color contrast compliance
- Focus indicators on interactive elements

## Performance Considerations

1. **Memoization:** Hook uses useCallback to prevent unnecessary re-renders
2. **Lazy Calculations:** Reports generated on-demand
3. **Efficient Filtering:** Search uses filtered arrays
4. **Local Storage:** Persisted data, no API calls
5. **Event System:** Custom event dispatching for updates

## Future Enhancement Opportunities

1. **Export/Import:** CSV export of transactions
2. **Recurring Transactions:** Automate regular payments
3. **Budget Categories:** User-defined category creation
4. **Spending Goals:** Track specific savings goals
5. **Analytics API:** Advanced data analysis
6. **Push Notifications:** Alert system extensions
7. **Multi-currency:** Support for different currencies
8. **Backup/Sync:** Cloud sync capabilities

## Troubleshooting

### Data Not Persisting

- Check browser's localStorage is enabled
- Verify `memory-*` keys exist in localStorage
- Check browser console for errors

### Setup Wizard Not Showing

- Manually reset: `localStorage.removeItem('money-settings')`
- Check console for JavaScript errors

### Charts Not Rendering

- Verify Recharts library is installed
- Check data format matches expected structure
- Ensure BarChart, PieChart, LineChart are properly imported

### Wallet Balance Issues

- Verify wallet's initial balance is entered correctly
- Check transaction deletions properly reverse balance
- Ensure manual balance edits create adjustment transactions

## Testing

Recommended test scenarios:

1. ✅ First-time setup flow
2. ✅ Create multiple wallets
3. ✅ Add income and expense transactions
4. ✅ Delete transactions and verify balance updates
5. ✅ View monthly budget and alerts
6. ✅ Generate reports and verify calculations
7. ✅ Search and filter transactions
8. ✅ Test responsive design on mobile
9. ✅ Verify localStorage persistence
10. ✅ Test insight generation

## Conclusion

The Money Manager module provides a complete financial management solution for university students. It combines intuitive UI with smart analytics to help students make better financial decisions.

For questions or issues, refer to the component documentation or create a GitHub issue.
