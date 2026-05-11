import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ResponsiveContainer } from "recharts";
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, Calendar, ChevronLeft } from "lucide-react";
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

export default function FocusTrendChart({ data = [], onBack, isFullPage }: FocusTrendChartProps) {
  
  const comparisons = useMemo(() => {
    const now = new Date();
    
    const getSumForRange = (start: Date, end: Date) => {
      return data
        .filter(d => {
          const dDate = new Date(d.date);
          return dDate >= start && dDate < end;
        })
        .reduce((sum, d) => sum + d.minutes, 0);
    };

    const thisWeekStart = new Date();
    thisWeekStart.setDate(now.getDate() - 7);
    const lastWeekStart = new Date();
    lastWeekStart.setDate(now.getDate() - 14);

    const thisWeekTotal = getSumForRange(thisWeekStart, now);
    const lastWeekTotal = getSumForRange(lastWeekStart, thisWeekStart);
    
    const weekDiff = thisWeekTotal - lastWeekTotal;
    const weekPercent = lastWeekTotal > 0 ? Math.round((weekDiff / lastWeekTotal) * 100) : 0;

    const thisMonthTotal = data
      .filter(d => {
        const dDate = new Date(d.date);
        return dDate.getMonth() === now.getMonth() && dDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, d) => sum + d.minutes, 0);

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthTotal = data
      .filter(d => {
        const dDate = new Date(d.date);
        return dDate.getMonth() === lastMonthDate.getMonth() && dDate.getFullYear() === lastMonthDate.getFullYear();
      })
      .reduce((sum, d) => sum + d.minutes, 0);

    const monthDiff = thisMonthTotal - lastMonthTotal;
    const monthPercent = lastMonthTotal > 0 ? Math.round((monthDiff / lastMonthTotal) * 100) : 0;

    return {
      week: {
        total: thisWeekTotal,
        avg: Math.round(thisWeekTotal / 7),
        percent: weekPercent,
        diff: weekDiff,
        status: weekDiff > 0 ? "increase" : weekDiff < 0 ? "decrease" : "stable",
        msg: weekDiff > 0 ? `Up ${weekPercent}% from last week.` : weekDiff < 0 ? `Down ${Math.abs(weekPercent)}% from last week.` : "No change."
      },
      month: {
        total: thisMonthTotal,
        avg: Math.round(thisMonthTotal / 30),
        percent: monthPercent,
        diff: monthDiff,
        status: monthDiff > 0 ? "increase" : monthDiff < 0 ? "decrease" : "stable",
        msg: monthDiff > 0 ? `Monthly growth of ${monthPercent}%!` : monthDiff < 0 ? `Focus dipped by ${Math.abs(monthPercent)}%.` : "Consistent."
      }
    };
  }, [data]);

  const weeklyViewData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const now = new Date();
    const dayOfWeek = now.getDay(); 
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    return days.map((dayName, index) => {
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + index);
      const dateStr = targetDate.toISOString().split('T')[0];
      const record = data.find(d => d.date === dateStr);
      return { 
        day: dayName, 
        minutes: record ? Number(record.minutes) : 0 
      };
    });
  }, [data]);

  if (!isFullPage) return null;

  return (
    <div className="absolute inset-0 bg-background text-foreground z-[999] flex flex-col transition-colors duration-200">
      {/* HEADER */}
      <div className="px-8 py-6 flex items-center justify-between border-b border-border/40">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Performance Analytics</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">UniVerse Data Engine</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-12 space-y-8">
        
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
            <h3 className="text-3xl font-bold">{comparisons.month.avg} <span className="text-sm font-normal text-muted-foreground">min</span></h3>
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

function TrendCard({ title, msg, percent, status, diff }: any) {
  const isIncrease = status === "increase";
  const isStable = status === "stable";
  const Icon = isIncrease ? ArrowUpRight : isStable ? Minus : ArrowDownRight;
  
  const getCardStyles = () => {
    if (isIncrease) return "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
    if (isStable) return "bg-muted border-border text-muted-foreground";
    return "bg-destructive/5 dark:bg-destructive/10 border-destructive/20 text-destructive";
  };

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
          {isIncrease ? '+' : ''}{percent}%
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