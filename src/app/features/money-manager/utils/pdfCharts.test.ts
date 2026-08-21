import { describe, expect, it } from "vitest";
import jsPDF from "jspdf";
import { CHART_PALETTE, drawBarChart, drawLineChart, drawPieChart } from "./pdfCharts";

function newDoc() {
  return new jsPDF();
}

describe("drawBarChart", () => {
  it("draws bars without throwing for normal data", () => {
    const doc = newDoc();
    expect(() =>
      drawBarChart(doc, {
        x: 10,
        y: 10,
        width: 80,
        height: 70,
        title: "Expenses by Category",
        data: [
          { label: "Food", value: 2500 },
          { label: "Rent / Accommodation", value: 15000 },
        ],
      }),
    ).not.toThrow();
  });

  it("handles an empty dataset gracefully", () => {
    const doc = newDoc();
    expect(() =>
      drawBarChart(doc, { x: 10, y: 10, width: 80, height: 70, title: "Empty", data: [] }),
    ).not.toThrow();
  });

  it("handles all-zero values without dividing by zero", () => {
    const doc = newDoc();
    expect(() =>
      drawBarChart(doc, {
        x: 10,
        y: 10,
        width: 80,
        height: 70,
        title: "Zeros",
        data: [{ label: "Food", value: 0 }],
      }),
    ).not.toThrow();
  });
});

describe("drawPieChart", () => {
  it("draws slices for a normal dataset", () => {
    const doc = newDoc();
    expect(() =>
      drawPieChart(doc, {
        x: 10,
        y: 10,
        width: 80,
        height: 70,
        title: "Needs vs Wants vs Savings",
        data: [
          { label: "Needs", value: 3000, color: CHART_PALETTE[0] },
          { label: "Wants", value: 1500, color: CHART_PALETTE[1] },
          { label: "Savings", value: 500, color: CHART_PALETTE[4] },
        ],
      }),
    ).not.toThrow();
  });

  it("handles an empty dataset gracefully", () => {
    const doc = newDoc();
    expect(() =>
      drawPieChart(doc, { x: 10, y: 10, width: 80, height: 70, title: "Empty", data: [] }),
    ).not.toThrow();
  });

  it("handles a single 100% slice", () => {
    const doc = newDoc();
    expect(() =>
      drawPieChart(doc, {
        x: 10,
        y: 10,
        width: 80,
        height: 70,
        title: "Single",
        data: [{ label: "Only", value: 100, color: CHART_PALETTE[0] }],
      }),
    ).not.toThrow();
  });
});

describe("drawLineChart", () => {
  it("draws two series without throwing", () => {
    const doc = newDoc();
    expect(() =>
      drawLineChart(doc, {
        x: 10,
        y: 10,
        width: 180,
        height: 70,
        title: "Income vs Expense Trend",
        series: [
          { label: "Income", color: CHART_PALETTE[4], points: [0, 500, 50000] },
          { label: "Expense", color: [239, 68, 68], points: [200, 300, 2000] },
        ],
        xLabels: ["08-16", "08-17", "08-18"],
      }),
    ).not.toThrow();
  });

  it("handles all-zero series gracefully", () => {
    const doc = newDoc();
    expect(() =>
      drawLineChart(doc, {
        x: 10,
        y: 10,
        width: 180,
        height: 70,
        title: "Empty",
        series: [{ label: "Income", color: CHART_PALETTE[4], points: [0, 0] }],
        xLabels: ["08-17", "08-18"],
      }),
    ).not.toThrow();
  });

  it("handles a single data point without dividing by zero", () => {
    const doc = newDoc();
    expect(() =>
      drawLineChart(doc, {
        x: 10,
        y: 10,
        width: 180,
        height: 70,
        title: "Single point",
        series: [{ label: "Income", color: CHART_PALETTE[4], points: [500] }],
        xLabels: ["08-18"],
      }),
    ).not.toThrow();
  });
});
