import { useMemo } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Moon, Sparkles, AlertTriangle } from "lucide-react";
import { useUniStorage } from "../../shared/hooks/useUniStorage";

export default function SleepSuggestionCard() {
  const [events] = useUniStorage<any[]>("schedule-events", []);
  const [todos] = useUniStorage<any[]>("todos", []);

  const analysis = useMemo(() => {
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA'); 
    const tomorrowStr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toLocaleDateString('en-CA');

    const toMins = (t: string | undefined) => {
      if (!t) return null;
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    // Helper to turn 1439 mins into "11:59 PM"
    const formatMinsToTime = (mins: number) => {
      let h = Math.floor(mins / 60) % 24;
      const m = mins % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `${h}:${m < 10 ? '0' + m : m} ${ampm}`;
    };

    // 1. Find boundaries
    let latestMinsToday = toMins("23:30")!; // Default sleep
    let earliestMinsTomorrow = toMins("06:30")!; // Default wake
    let lastAct = "Routine";
    let firstAct = "Morning Routine";

    events.forEach(e => {
      if (e.date === todayStr) {
        const m = toMins(e.endTime || e.startTime);
        if (m !== null && m > latestMinsToday) { latestMinsToday = m; lastAct = e.title || "Event"; }
      }
      if (e.date === tomorrowStr) {
        const m = toMins(e.startTime);
        if (m !== null && m < earliestMinsTomorrow) { earliestMinsTomorrow = m; firstAct = e.title || "Event"; }
      }
    });

    todos.forEach(t => {
      if (t.dueDate === todayStr && !t.completed) {
        const m = toMins(t.dueTime);
        if (m !== null && m > latestMinsToday) { latestMinsToday = m; lastAct = t.title || "Task"; }
      }
      if (t.dueDate === tomorrowStr && !t.completed) {
        const m = toMins(t.dueTime);
        if (m !== null && m < earliestMinsTomorrow) { earliestMinsTomorrow = m; firstAct = t.title || "Task"; }
      }
    });

    const gapHrs = (((1440 - latestMinsToday) + earliestMinsTomorrow) / 60).toFixed(1);
    const isRestricted = parseFloat(gapHrs) < 7;

    return {
      gapHrs,
      isRestricted,
      lastAct,
      firstAct,
      // REAL TIMES shown here
      displaySleep: formatMinsToTime(latestMinsToday),
      displayWake: formatMinsToTime(earliestMinsTomorrow),
      statusColor: isRestricted ? "text-amber-400" : "text-blue-400",
      bgColor: isRestricted ? "bg-amber-500/10" : "bg-blue-500/10",
    };
  }, [events, todos]);

  return (
    <Card className="relative overflow-hidden border-none bg-[#0f172a] text-white h-full min-h-[180px] rounded-2xl transition-all duration-300">
      <Sparkles className={`absolute top-3 right-3 size-6 opacity-20 ${analysis.statusColor}`} />
      
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 ${analysis.bgColor}`}>
            <Moon className={`size-3 ${analysis.statusColor} fill-current/20`} />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/80">Recovery Analysis</span>
          </div>
          {analysis.isRestricted && <AlertTriangle className="size-3.5 text-amber-500" />}
        </div>

        <p className="text-base font-semibold leading-snug tracking-tight">
          {analysis.isRestricted 
            ? `Only ${analysis.gapHrs}h left between ${analysis.lastAct} and ${analysis.firstAct}. Adjust your schedule to reach 7-9h sleep!`
            : `Healthy ${analysis.gapHrs}h recovery window available before ${analysis.firstAct}.`}
        </p>

        <div className="flex gap-6 border-t border-white/5 pt-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Sleep Time</span>
            <span className={`text-lg font-mono font-bold ${analysis.statusColor}`}>{analysis.displaySleep}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Wakeup Time</span>
            <span className={`text-lg font-mono font-bold ${analysis.statusColor}`}>{analysis.displayWake}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}