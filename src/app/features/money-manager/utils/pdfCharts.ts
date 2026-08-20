/**
 * Money Manager PDF Chart Primitives
 *
 * Small, dependency-free chart renderers built on jsPDF's own vector
 * drawing API (rects, lines, text) — no canvas/image rasterization, so
 * these work identically in the browser and in headless tests. Mirrors
 * the most important charts already shown on the Reports dashboard:
 * category spend, needs/wants/savings split, income vs expense trend,
 * and wallet distribution.
 */
import type jsPDF from "jspdf";

export type RGB = [number, number, number];

/** Shared palette matching the Reports dashboard's chart colors. */
export const CHART_PALETTE: RGB[] = [
  [59, 130, 246], // blue
  [139, 92, 246], // purple
  [236, 72, 153], // pink
  [245, 158, 11], // amber
  [16, 185, 129], // emerald
  [239, 68, 68], // red
  [6, 182, 212], // cyan
  [249, 115, 22], // orange
];

const NO_DATA_LABEL = "No data available";

function drawNoData(doc: jsPDF, x: number, y: number): void {
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(NO_DATA_LABEL, x, y + 10);
}

export interface BarChartDatum {
  label: string;
  value: number;
}

export interface BarChartOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  data: BarChartDatum[];
  color?: RGB;
}

/** Vertical bar chart with rotated category labels. */
export function drawBarChart(doc: jsPDF, opts: BarChartOptions): void {
  const { x, y, width, height, title, data, color = CHART_PALETTE[0] } = opts;

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(title, x, y);

  if (data.length === 0 || data.every((d) => d.value <= 0)) {
    drawNoData(doc, x, y);
    return;
  }

  const chartTop = y + 5;
  const labelAreaHeight = 14;
  const chartHeight = Math.max(10, height - labelAreaHeight);
  const chartBottom = chartTop + chartHeight;
  const maxValue = Math.max(...data.map((d) => Math.max(d.value, 0)), 1);
  const gap = 2;
  const barWidth = Math.max(3, (width - gap * (data.length - 1)) / data.length);

  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.2);
  doc.line(x, chartBottom, x + width, chartBottom);

  data.forEach((d, i) => {
    const value = Math.max(d.value, 0);
    const barHeight = (value / maxValue) * chartHeight;
    const barX = x + i * (barWidth + gap);
    const barY = chartBottom - barHeight;
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(barX, barY, barWidth, Math.max(barHeight, 0.2), "F");

    doc.setFontSize(6);
    doc.setTextColor(90, 90, 90);
    const label = d.label.length > 10 ? `${d.label.slice(0, 9)}…` : d.label;
    doc.text(label, barX + barWidth / 2, chartBottom + 4, {
      align: "center",
      angle: 40,
    });
  });
}

export interface PieChartDatum {
  label: string;
  value: number;
  color: RGB;
}

export interface PieChartOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  data: PieChartDatum[];
}

/** Pie chart with a color-swatch legend listing each slice's share. */
export function drawPieChart(doc: jsPDF, opts: PieChartOptions): void {
  const { x, y, width, height, title, data } = opts;

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(title, x, y);

  const total = data.reduce((sum, d) => sum + Math.max(d.value, 0), 0);
  if (data.length === 0 || total <= 0) {
    drawNoData(doc, x, y);
    return;
  }

  const legendHeight = data.length * 4.5;
  const radius = Math.max(4, Math.min(width / 2 - 4, height - legendHeight - 10));
  const cx = x + radius + 2;
  const cy = y + 6 + radius;

  let angle = -90;
  data.forEach((d) => {
    const value = Math.max(d.value, 0);
    const sweep = (value / total) * 360;
    if (sweep > 0) {
      drawPieSlice(doc, cx, cy, radius, angle, angle + sweep, d.color);
    }
    angle += sweep;
  });

  let legendY = cy + radius + 6;
  data.forEach((d) => {
    doc.setFillColor(d.color[0], d.color[1], d.color[2]);
    doc.rect(x, legendY - 2.5, 3, 3, "F");
    doc.setFontSize(7);
    doc.setTextColor(70, 70, 70);
    const pct = ((Math.max(d.value, 0) / total) * 100).toFixed(1);
    const label = d.label.length > 18 ? `${d.label.slice(0, 17)}…` : d.label;
    doc.text(`${label}: ${pct}%`, x + 5, legendY);
    legendY += 4.5;
  });
}

function drawPieSlice(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
  color: RGB,
): void {
  const sweep = endDeg - startDeg;
  const steps = Math.max(1, Math.ceil(sweep / 6));
  const points: [number, number][] = [[cx, cy]];
  for (let i = 0; i <= steps; i++) {
    const deg = startDeg + (sweep * i) / steps;
    const rad = (deg * Math.PI) / 180;
    points.push([cx + r * Math.cos(rad), cy + r * Math.sin(rad)]);
  }

  const lineDeltas: number[][] = [];
  for (let i = 1; i < points.length; i++) {
    lineDeltas.push([points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]]);
  }

  doc.setFillColor(color[0], color[1], color[2]);
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.15);
  doc.lines(lineDeltas, cx, cy, [1, 1], "FD", true);
}

export interface LineSeries {
  label: string;
  color: RGB;
  points: number[];
}

export interface LineChartOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  series: LineSeries[];
  xLabels: string[];
}

/** Multi-series line chart (e.g. income vs expense over time). */
export function drawLineChart(doc: jsPDF, opts: LineChartOptions): void {
  const { x, y, width, height, title, series, xLabels } = opts;

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(title, x, y);

  const hasData = xLabels.length > 1 && series.some((s) => s.points.some((v) => v !== 0));
  if (!hasData) {
    drawNoData(doc, x, y);
    return;
  }

  const chartTop = y + 6;
  const legendAreaHeight = 6;
  const labelAreaHeight = 8;
  const chartHeight = Math.max(10, height - legendAreaHeight - labelAreaHeight - 6);
  const chartBottom = chartTop + chartHeight;

  const maxValue = Math.max(...series.flatMap((s) => s.points), 1);
  const n = xLabels.length;
  const stepX = n > 1 ? width / (n - 1) : width;

  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.2);
  doc.line(x, chartBottom, x + width, chartBottom);
  doc.line(x, chartTop, x, chartBottom);

  series.forEach((s) => {
    doc.setDrawColor(s.color[0], s.color[1], s.color[2]);
    doc.setLineWidth(0.5);
    for (let i = 0; i < s.points.length - 1; i++) {
      const x1 = x + i * stepX;
      const y1 = chartBottom - (Math.max(s.points[i], 0) / maxValue) * chartHeight;
      const x2 = x + (i + 1) * stepX;
      const y2 = chartBottom - (Math.max(s.points[i + 1], 0) / maxValue) * chartHeight;
      doc.line(x1, y1, x2, y2);
    }
  });
  doc.setLineWidth(0.2);

  doc.setFontSize(6);
  doc.setTextColor(90, 90, 90);
  const tickIdxs = Array.from(new Set([0, Math.floor((n - 1) / 2), n - 1]));
  tickIdxs.forEach((i) => {
    doc.text(xLabels[i], x + i * stepX, chartBottom + 4, { align: "center" });
  });

  let legendX = x;
  const legendY = chartBottom + labelAreaHeight + 2;
  series.forEach((s) => {
    doc.setFillColor(s.color[0], s.color[1], s.color[2]);
    doc.rect(legendX, legendY - 2.5, 3, 3, "F");
    doc.setFontSize(7);
    doc.setTextColor(70, 70, 70);
    doc.text(s.label, legendX + 5, legendY);
    legendX += 35;
  });
}
