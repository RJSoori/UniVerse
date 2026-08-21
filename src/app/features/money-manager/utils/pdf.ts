/**
 * Money Manager PDF Export Utilities
 *
 * Renders the same report content produced for CSV export (summary,
 * wallets, transactions, recurring expenses, category budgets) as a
 * downloadable, paginated PDF document, followed by a Charts & Insights
 * page mirroring the most important visuals from the Reports dashboard.
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  CHART_PALETTE,
  drawBarChart,
  drawLineChart,
  drawPieChart,
  type LineSeries,
  type PieChartDatum,
} from "./pdfCharts";

export interface MoneyManagerPdfSection {
  title: string;
  head: string[];
  rows: (string | number)[][];
}

export interface MoneyManagerPdfChartsData {
  categoryBreakdown: { category: string; amount: number }[];
  needsVsWantsVsSavings: { needs: number; wants: number; savings: number };
  trend: { date: string; income: number; expense: number }[];
  walletBreakdown: { walletName: string; balance: number }[];
}

export interface MoneyManagerPdfData {
  studentName: string;
  degree: string;
  dateGenerated: string;
  summary: { label: string; value: string }[];
  sections: MoneyManagerPdfSection[];
  charts?: MoneyManagerPdfChartsData;
}

const MARGIN = 14;
const HEADER_FILL: [number, number, number] = [59, 130, 246];

/**
 * Build a jsPDF document for the given report data. Each section is
 * rendered as its own labelled table; empty sections are skipped, and a
 * new page is started whenever a section heading would not fit above the
 * bottom margin. A final Charts & Insights page is appended when chart
 * data is supplied and at least one chart has data to show.
 */
export function buildMoneyManagerPdf(data: MoneyManagerPdfData): jsPDF {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFontSize(16);
  doc.text("Money Manager Report", MARGIN, 18);

  doc.setFontSize(10);
  doc.text(`Student: ${data.studentName}`, MARGIN, 26);
  doc.text(`Degree: ${data.degree}`, MARGIN, 32);
  doc.text(`Generated: ${data.dateGenerated}`, MARGIN, 38);

  autoTable(doc, {
    startY: 44,
    head: [["Summary", "Value"]],
    body: data.summary.map((item) => [item.label, item.value]),
    theme: "grid",
    headStyles: { fillColor: HEADER_FILL },
    margin: { left: MARGIN, right: MARGIN },
  });

  for (const section of data.sections) {
    if (section.rows.length === 0) {
      continue;
    }

    const previousTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
    let startY = previousTable ? previousTable.finalY + 10 : 44;

    if (startY + 14 > pageHeight - MARGIN) {
      doc.addPage();
      startY = 20;
    }

    doc.setFontSize(12);
    doc.text(section.title, MARGIN, startY);

    autoTable(doc, {
      startY: startY + 4,
      head: [section.head],
      body: section.rows.map((row) => row.map((cell) => (cell === null || cell === undefined ? "" : String(cell)))),
      theme: "striped",
      headStyles: { fillColor: HEADER_FILL },
      styles: { fontSize: 8 },
      margin: { left: MARGIN, right: MARGIN },
    });
  }

  if (data.charts) {
    drawChartsPage(doc, data.charts);
  }

  return doc;
}

function drawChartsPage(doc: jsPDF, charts: MoneyManagerPdfChartsData): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const categoryData = charts.categoryBreakdown
    .slice()
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)
    .map((c) => ({ label: c.category, value: c.amount }));

  const needsWantsData: PieChartDatum[] = [
    { label: "Needs", value: Math.max(charts.needsVsWantsVsSavings.needs, 0), color: CHART_PALETTE[0] },
    { label: "Wants", value: Math.max(charts.needsVsWantsVsSavings.wants, 0), color: CHART_PALETTE[1] },
    { label: "Savings", value: Math.max(charts.needsVsWantsVsSavings.savings, 0), color: CHART_PALETTE[4] },
  ];

  const trendSeries: LineSeries[] = [
    { label: "Income", color: CHART_PALETTE[4], points: charts.trend.map((t) => t.income) },
    { label: "Expense", color: [239, 68, 68], points: charts.trend.map((t) => t.expense) },
  ];
  const trendLabels = charts.trend.map((t) => t.date.slice(5));

  const walletData: PieChartDatum[] = charts.walletBreakdown
    .filter((w) => w.balance > 0)
    .map((w, i) => ({ label: w.walletName, value: w.balance, color: CHART_PALETTE[i % CHART_PALETTE.length] }));

  const hasAnyChart =
    categoryData.length > 0 ||
    needsWantsData.some((d) => d.value > 0) ||
    trendSeries.some((s) => s.points.some((v) => v !== 0)) ||
    walletData.length > 0;

  if (!hasAnyChart) {
    return;
  }

  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Charts & Insights", MARGIN, 18);

  const colWidth = (pageWidth - MARGIN * 2 - 8) / 2;
  const rowHeight = 78;
  let rowTop = 28;

  if (categoryData.length > 0) {
    drawBarChart(doc, {
      x: MARGIN,
      y: rowTop,
      width: colWidth,
      height: rowHeight,
      title: "Expenses by Category",
      data: categoryData,
      color: CHART_PALETTE[0],
    });
  }
  if (needsWantsData.some((d) => d.value > 0)) {
    drawPieChart(doc, {
      x: MARGIN + colWidth + 8,
      y: rowTop,
      width: colWidth,
      height: rowHeight,
      title: "Needs vs Wants vs Savings",
      data: needsWantsData,
    });
  }

  rowTop += rowHeight + 12;
  if (trendSeries.some((s) => s.points.some((v) => v !== 0))) {
    if (rowTop + rowHeight > pageHeight - MARGIN) {
      doc.addPage();
      rowTop = 20;
    }
    drawLineChart(doc, {
      x: MARGIN,
      y: rowTop,
      width: pageWidth - MARGIN * 2,
      height: rowHeight,
      title: "Income vs Expense Trend (last 30 days)",
      series: trendSeries,
      xLabels: trendLabels,
    });
    rowTop += rowHeight + 12;
  }

  if (walletData.length > 0) {
    if (rowTop + rowHeight > pageHeight - MARGIN) {
      doc.addPage();
      rowTop = 20;
    }
    drawPieChart(doc, {
      x: MARGIN,
      y: rowTop,
      width: colWidth,
      height: rowHeight,
      title: "Wallet Distribution",
      data: walletData,
    });
  }
}

/** Convenience wrapper returning the rendered PDF as a downloadable Blob. */
export function generateMoneyManagerPdfBlob(data: MoneyManagerPdfData): Blob {
  return buildMoneyManagerPdf(data).output("blob");
}
