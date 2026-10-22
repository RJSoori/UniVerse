import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, Calendar, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "../../shared/ui/button";

interface FocusData {
  date: string;
  minutes: number;
}

interface FocusTrendChartProps {
  data: FocusData[];
  onBack?: () => void;
  isFullPage?: boolean;
}

type TrendStatus = "increase" | "decrease" | "stable";

interface RangeSummary {
  percent: number | null; // null = no prior baseline to compare against
  status: TrendStatus;
  msg: string;
}

function getMondayOfWeek(date: Date): Date {
  const monday = new Date(date);
  const dayOfWeek = monday.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday (0) belongs to the previous Monday
  monday.setDate(monday.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// A literal percent-change from a zero baseline is undefined (division by zero).
// Following the common dashboard convention, any activity after a 0 baseline is
// reported as "+100%" (this period is entirely new relative to last period).
function summarizeRange(diff: number, baseline: number, unit: "week" | "month"): RangeSummary {
  const label = unit === "week" ? "last week" : "last month";
  if (baseline === 0) {
    if (diff === 0) {
      return { percent: null, status: "stable", msg: `No focus sessions logged yet ${unit === "week" ? "this week" : "this month"}.` };
    }
    return { percent: 100, status: "increase", msg: `First ${diff} min logged ${unit === "week" ? "this week" : "this month"}!` };
  }
  const percent = Math.round((diff / baseline) * 100);
  if (diff > 0) return { percent, status: "increase", msg: `Up ${percent}% from ${label}.` };
  if (diff < 0) return { percent, status: "decrease", msg: `Down ${Math.abs(percent)}% from ${label}.` };
  return { percent: 0, status: "stable", msg: "No change." };
}

export default function FocusTrendChart({ data = [], onBack, isFullPage }: FocusTrendChartProps) {
  const hasAnyData = data.some((d) => d.minutes > 0);

  const comparisons = useMemo(() => {
    const now = new Date();

    const getSumForRange = (start: Date, end: Date) =>
      data
        .filter((d) => {
          const dDate = new Date(d.date);
          return dDate >= start && dDate < end;
        })
        .reduce((sum, d) => sum + d.minutes, 0);

    // Aligned to the same Mon-Sun calendar week the bar chart below shows, so the
    // summary card and the chart always agree on what "this week" means.
    const mondayThisWeek = getMondayOfWeek(now);
    const mondayNextWeek = new Date(mondayThisWeek);
    mondayNextWeek.setDate(mondayThisWeek.getDate() + 7);
    const mondayLastWeek = new Date(mondayThisWeek);
    mondayLastWeek.setDate(mondayThisWeek.getDate() - 7);

    const thisWeekTotal = getSumForRange(mondayThisWeek, mondayNextWeek);
    const lastWeekTotal = getSumForRange(mondayLastWeek, mondayThisWeek);
    const weekDiff = thisWeekTotal - lastWeekTotal;

    const thisMonthTotal = data
      .filter((d) => {
        const dDate = new Date(d.date);
        return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, d) => sum + d.minutes, 0);

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthTotal = data
      .filter((d) => {
        const dDate = new Date(d.date);
        return dDate.getMonth() === lastMonthDate.getMonth() && dDate.getFullYear() === lastMonthDate.getFullYear();
      })
      .reduce((sum, d) => sum + d.minutes, 0);

    const monthDiff = thisMonthTotal - lastMonthTotal;
    // Average minutes/day so far this month, not a fixed 30-day divisor (which
    // understates the average early in the month and is wrong for Feb/31-day months).
    const daysElapsedThisMonth = now.getDate();

    return {
      week: { total: thisWeekTotal, diff: weekDiff, ...summarizeRange(weekDiff, lastWeekTotal, "week") },
      month: {
        total: thisMonthTotal,
        // Round to 1 decimal so small-but-real averages (e.g. 0.3 min/day) don't
        // display as a flat, misleading "0".
        avg: Math.round((thisMonthTotal / daysElapsedThisMonth) * 10) / 10,
        diff: monthDiff,
        ...summarizeRange(monthDiff, lastMonthTotal, "month"),
      },
    };
  }, [data]);

  const weeklyViewData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const monday = getMondayOfWeek(new Date());

    return days.map((dayName, index) => {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + index);
      const dateStr = targetDate.toISOString().split("T")[0];
      const record = data.find((d) => d.date === dateStr);
      return {
        day: dayName,
        minutes: record ? Number(record.minutes) : 0,
      };
    });
  }, [data]);

  if (!isFullPage) return null;

  return (
    <div className="absolute inset-0 bg-background text-foreground z-[999] flex flex-col transition-colors duration-200">
      {/* HEADER */}
      <div className="px-8 py-6 flex items-center justify-center border-b border-border/40">
        <div className="space-y-1">
          <h2 className="text-2xl justify-center font-bold tracking-tight">Performance Analytics</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ">UniVerse Data Engine</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-12 space-y-8">
        {!hasAnyData ? (
          <div className="flex flex-col items-center justify-center text-center gap-3 py-24">
            <div className="p-4 rounded-full bg-secondary border border-border">
              <Sparkles className="size-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold">No focus sessions yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Complete a focus session and your weekly and monthly trends will show up here.
            </p>
          </div>
        ) : (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-5 bg-secondary border border-border rounded-3xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} className="text-primary" />
                  <p className="text-[11px] font-bold text-primary uppercase">Weekly Total</p>
                </div>
                <h3 className="text-3xl font-bold">{comparisons.week.total} <span className="text-sm font-normal text-muted-foreground">min</span></h3>
              </div>
              <div className="p-5 bg-secondary border border-border rounded-3xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={14} className="text-primary" />
                  <p className="text-[11px] font-bold text-primary uppercase">Monthly Avg</p>
                </div>
                <h3 className="text-3xl font-bold">{comparisons.month.avg} <span className="text-sm font-normal text-muted-foreground">min/day</span></h3>
              </div>
            </div>

            {/* CHART SECTION */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center w-full">Study Intensity Trends</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyViewData} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="currentColor" className="opacity-[0.05]" />
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: '600'}}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{fontSize: 10, fill: 'var(--muted-foreground)'}}
                    />
                    <Tooltip
                      cursor={{fill: 'var(--muted)', opacity: 0.4}}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                        borderRadius: '15px',
                        color: 'var(--foreground)'
                      }}
                    />
                    {/* Dynamically color bars based on whether minutes > 0 */}
                    <Bar dataKey="minutes" radius={[10, 10, 0, 0]} barSize={40}>
                      {weeklyViewData.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={entry.minutes > 0 ? 'var(--primary)' : 'var(--muted)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* TREND ANALYSIS PANELS */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Trend Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TrendCard
                  title="Weekly Progress"
                  msg={comparisons.week.msg}
                  percent={comparisons.week.percent}
                  status={comparisons.week.status}
                  diff={comparisons.week.diff}
                />
                <TrendCard
                  title="Monthly Outlook"
                  msg={comparisons.month.msg}
                  percent={comparisons.month.percent}
                  status={comparisons.month.status}
                  diff={comparisons.month.diff}
                />
              </div>
            </div>
          </>
        )}

        {/* BACK TO TIMER BUTTON */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={onBack}
            variant="ghost"
            className="flex items-center gap-2 text-primary hover:bg-secondary rounded-full px-8 py-2 transition-all group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
            <span className="text-sm font-bold uppercase tracking-wide">Back to Timer</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface TrendCardProps {
  title: string;
  msg: string;
  percent: number | null;
  status: TrendStatus;
  diff: number;
}

//Trend Card Component
function TrendCard({ title, msg, percent, status, diff }: TrendCardProps) {
  const isIncrease = status === "increase";
  const isStable = status === "stable";
  const Icon = isIncrease ? ArrowUpRight : isStable ? Minus : ArrowDownRight;

  const getCardStyles = () => {
    if (isIncrease) return "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
    if (isStable) return "bg-muted border-border text-muted-foreground";
    return "bg-destructive/5 dark:bg-destructive/10 border-destructive/20 text-destructive";
  };

  //Badge styles
  const getBadgeStyles = () => {
    if (isIncrease) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
    if (isStable) return "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
    return "bg-destructive/10 text-destructive";
  };

  return (
    <div className={`p-6 rounded-[2rem] border transition-all hover:shadow-md ${getCardStyles()}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl flex items-center justify-center ${getBadgeStyles()}`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>

        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${getBadgeStyles()}`}>
          {percent === null ? "—" : `${isIncrease ? '+' : ''}${percent}%`}
        </span>
      </div>

      <div>
        <p className="text-[11px] font-black uppercase tracking-widest mb-1.5 opacity-90">{title}</p>
        <p className="text-sm font-semibold leading-snug text-foreground/80 dark:text-foreground/90">{msg}</p>

        <div className="mt-4 pt-3 border-t border-dashed border-current border-opacity-20">
          <p className="text-[10px] font-bold uppercase tracking-tighter opacity-60">
            Variance: {diff > 0 ? '+' : ''}{diff} min
          </p>
        </div>
      </div>
    </div>
  );
}
