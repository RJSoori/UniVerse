import { describe, expect, it } from "vitest";
import {
  buildMoneyManagerPdf,
  generateMoneyManagerPdfBlob,
  type MoneyManagerPdfData,
} from "./pdf";

const baseData: MoneyManagerPdfData = {
  studentName: "Jane Student",
  degree: "BSc Computer Science",
  dateGenerated: "2026-08-18T00:00:00.000Z",
  summary: [
    { label: "Total Income", value: "50000" },
    { label: "Total Expenses", value: "32000" },
    { label: "Balance", value: "18000" },
    { label: "Included Wallet Balance", value: "18000" },
  ],
  sections: [
    {
      title: "Wallets",
      head: ["Name", "Balance", "Included in Total"],
      rows: [["Main Wallet", 18000, "Yes"]],
    },
    {
      title: "Transactions",
      head: ["Date", "Title", "Category", "Amount", "Wallet", "Type", "Recurring", "Recurring Id"],
      rows: [
        ["2026-08-01", "Groceries", "Food", 2500, "Main Wallet", "expense", "No", ""],
        ["2026-08-05", "Allowance", "Allowance", 50000, "Main Wallet", "income", "No", ""],
      ],
    },
    {
      title: "Recurring Expenses",
      head: ["Title", "Monthly Amount", "Category", "Wallet", "Duration", "Total"],
      rows: [],
    },
    {
      title: "Category Budgets",
      head: ["Category", "Limit", "Used", "Remaining"],
      rows: [["Food", 10000, 2500, 7500]],
    },
  ],
};

describe("buildMoneyManagerPdf", () => {
  it("produces a jsPDF document with at least one page", () => {
    const doc = buildMoneyManagerPdf(baseData);
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("skips sections with no rows", () => {
    const doc = buildMoneyManagerPdf(baseData);
    const text = doc.output("datauristring");
    expect(text.startsWith("data:application/pdf")).toBe(true);
  });

  it("handles an empty report without throwing", () => {
    const empty: MoneyManagerPdfData = {
      studentName: "No Data",
      degree: "N/A",
      dateGenerated: "2026-08-18T00:00:00.000Z",
      summary: [{ label: "Total Income", value: "0" }],
      sections: [
        { title: "Wallets", head: ["Name"], rows: [] },
        { title: "Transactions", head: ["Date"], rows: [] },
      ],
    };
    expect(() => buildMoneyManagerPdf(empty)).not.toThrow();
  });
});

describe("generateMoneyManagerPdfBlob", () => {
  it("returns a non-empty PDF blob", () => {
    const blob = generateMoneyManagerPdfBlob(baseData);
    expect(blob.type).toBe("application/pdf");
    expect(blob.size).toBeGreaterThan(0);
  });
});

describe("buildMoneyManagerPdf charts page", () => {
  const withCharts: MoneyManagerPdfData = {
    ...baseData,
    charts: {
      categoryBreakdown: [
        { category: "Food", amount: 2500 },
        { category: "Transportation", amount: 1200 },
      ],
      needsVsWantsVsSavings: { needs: 3000, wants: 1500, savings: 500 },
      trend: [
        { date: "2026-08-17", income: 0, expense: 500 },
        { date: "2026-08-18", income: 50000, expense: 2000 },
      ],
      walletBreakdown: [{ walletName: "Main Wallet", balance: 18000 }],
    },
  };

  it("appends a Charts & Insights page when chart data has content", () => {
    const withoutCharts = buildMoneyManagerPdf(baseData).getNumberOfPages();
    const with_ = buildMoneyManagerPdf(withCharts).getNumberOfPages();
    expect(with_).toBeGreaterThan(withoutCharts);
  });

  it("does not add an extra page when every chart series is empty", () => {
    const noChartData: MoneyManagerPdfData = {
      ...baseData,
      charts: {
        categoryBreakdown: [],
        needsVsWantsVsSavings: { needs: 0, wants: 0, savings: 0 },
        trend: [],
        walletBreakdown: [],
      },
    };
    const withoutCharts = buildMoneyManagerPdf(baseData).getNumberOfPages();
    const withEmptyCharts = buildMoneyManagerPdf(noChartData).getNumberOfPages();
    expect(withEmptyCharts).toBe(withoutCharts);
  });

  it("renders without throwing for a large transaction/category history", () => {
    const large: MoneyManagerPdfData = {
      ...withCharts,
      sections: [
        {
          title: "Transactions",
          head: ["Date", "Title", "Category", "Amount", "Wallet", "Type", "Recurring", "Recurring Id"],
          rows: Array.from({ length: 150 }, (_, i) => [
            `2026-08-${String((i % 28) + 1).padStart(2, "0")}`,
            `Transaction ${i}`,
            "Food",
            100 + i,
            "Main Wallet",
            i % 2 === 0 ? "expense" : "income",
            "No",
            "",
          ]),
        },
      ],
      charts: {
        ...withCharts.charts!,
        categoryBreakdown: Array.from({ length: 12 }, (_, i) => ({
          category: `Category ${i}`,
          amount: 100 * (i + 1),
        })),
      },
    };
    expect(() => buildMoneyManagerPdf(large)).not.toThrow();
    expect(buildMoneyManagerPdf(large).getNumberOfPages()).toBeGreaterThan(1);
  });
});
