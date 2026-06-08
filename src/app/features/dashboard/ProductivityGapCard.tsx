import { useMemo } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Clock, Zap, BrainCircuit } from "lucide-react";
import { useUniStorage } from "../../shared/hooks/useUniStorage";

interface ScheduleEvent {
  date?: string;
  startTime?: string;
  endTime?: string;
  title?: string;
}

interface TodoItem {
  dueDate?: string;
  dueTime?: string;
  completed?: boolean;
  title?: string;
}

// Robust helper to convert "HH:MM" to total minutes
const timeToMinutes = (t: string | undefined): number => {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const formatDuration = (mins: number) =>
  mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;

export default function ProductivityGapCard() {
  const [events] = useUniStorage<ScheduleEvent[]>("schedule-events", []);
  const [todos] = useUniStorage<TodoItem[]>("todos", []);

  const suggestion = useMemo<{ message: string; type: "gap" | "clear" } | null>(() => {
    const now = new Date();
    // Using local date format to match YYYY-MM-DD storage
    const todayStr = now.toLocaleDateString('en-CA'); 
    const currentMin = now.getHours() * 60 + now.getMinutes();

    const busyBlocks: { start: number; end: number; title: string }[] = [];

    // Map events
    events
      .filter((e) => e.date === todayStr && e.startTime)
      .forEach((e) => {
        busyBlocks.push({
          start: timeToMinutes(e.startTime),
          end: timeToMinutes(e.endTime || e.startTime) + 15, // 15m buffer
          title: e.title ?? "Event",
        });
      });

    // Map uncompleted tasks
    todos
      .filter((t) => t.dueDate === todayStr && t.dueTime && !t.completed)
      .forEach((t) => {
        const start = timeToMinutes(t.dueTime);
        busyBlocks.push({ start, end: start + 45, title: t.title ?? "Task" });
      });

    busyBlocks.sort((a, b) => a.start - b.start);

    // Logic: Gap before first event
    if (busyBlocks.length > 0) {
      if (busyBlocks[0].start > currentMin + 30) {
        return {
          message: `You're free for ${formatDuration(busyBlocks[0].start - currentMin)} before your ${busyBlocks[0].title}. Perfect time to start!`,
          type: "gap",
        };
      }

      // Logic: Gap between blocks
      for (let i = 0; i < busyBlocks.length - 1; i++) {
        const gapStart = busyBlocks[i].end;
        const gapEnd = busyBlocks[i + 1].start;
        const duration = gapEnd - gapStart;

        if (gapStart > currentMin && duration >= 30) {
          return {
            message: `Nice! You have ${formatDuration(duration)} free after ${busyBlocks[i].title}. Time for a quick study session?`,
            type: "gap",
          };
        }
      }
    }

    return {
      message: "Your schedule is clear! A perfect time to get ahead on your long-term goals.",
      type: "clear",
    };
  }, [events, todos]);

  if (!suggestion) return null;

  return (
    <Card className="relative overflow-hidden border-none h-full min-h-[180px] rounded-2xl group transition-all duration-300 hover:shadow-lg">
      <div className={`absolute inset-0 z-0 transition-all duration-500 ${
        suggestion.type === 'gap' 
        ? 'bg-gradient-to-br from-indigo-600 via-blue-500 to-sky-400' 
        : 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900'
      }`} />

      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />
      </div>

      <CardContent className="relative z-20 p-6 flex flex-col h-full text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            <Zap className={`size-3.5 ${suggestion.type === 'gap' ? 'text-yellow-300' : 'text-slate-300'}`} fill="currentColor" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
              Live Insights
            </span>
          </div>
          <div className="flex items-center gap-1.5 opacity-60">
            <Clock className="size-3" />
            <span className="text-[10px] font-medium uppercase tracking-tighter">Real-time</span>
          </div>
        </div>

        <div className="flex flex-col flex-grow justify-center gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-xl">
              <BrainCircuit className="size-6 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold tracking-tight leading-none">
                {suggestion.type === 'gap' ? 'Optimized Gap Found' : 'Focused Window'}
              </h3>
              <p className="text-sm font-medium text-white/80 leading-snug max-w-[240px]">
                {suggestion.message}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}