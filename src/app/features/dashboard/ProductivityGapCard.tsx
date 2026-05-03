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

const timeToMinutes = (t: string | undefined) =>
  (t ?? "").split(":").reduce((h, m) => +h * 60 + +m, 0);
const formatDuration = (mins: number) =>
  mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;

export default function ProductivityGapCard() {
  const [events] = useUniStorage<ScheduleEvent[]>("schedule-events", []);
  const [todos] = useUniStorage<TodoItem[]>("todos", []);

  const suggestion = useMemo<{ message: string; type: "gap" | "busy" } | null>(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentMin = now.getHours() * 60 + now.getMinutes();
    const lookAheadLimit = currentMin + 5 * 60;

    const busyBlocks: { start: number; end: number; title: string }[] = [];

    events
      .filter((e) => e.date === todayStr && e.startTime)
      .forEach((e) => {
        busyBlocks.push({
          start: timeToMinutes(e.startTime),
          end: timeToMinutes(e.endTime || e.startTime) + 15,
          title: e.title ?? "event",
        });
      });

    todos
      .filter((t) => t.dueDate === todayStr && t.dueTime && !t.completed)
      .forEach((t) => {
        const start = timeToMinutes(t.dueTime);
        busyBlocks.push({ start, end: start + 45, title: t.title ?? "task" });
      });

    busyBlocks.sort((a, b) => a.start - b.start);

    if (busyBlocks.length > 0) {
      const firstEvent = busyBlocks[0];
      if (firstEvent.start > currentMin + 40) {
        const gapDuration = firstEvent.start - currentMin;
        return {
          message: `You're free for the next ${formatDuration(gapDuration)} before your ${firstEvent.title}. Time for a quick task?`,
          type: "gap",
        };
      }
    }

    for (let i = 0; i < busyBlocks.length - 1; i++) {
      const gapStart = busyBlocks[i].end;
      const gapEnd = busyBlocks[i + 1].start;
      const gapDuration = gapEnd - gapStart;
      if (gapStart >= currentMin && gapStart < lookAheadLimit && gapDuration >= 45) {
        return {
          message: `Nice! You'll have ${formatDuration(gapDuration)} free after this session. Plan your next study block?`,
          type: "gap",
        };
      }
    }

    return {
      message: "Your upcoming window looks focused. Keep up the great momentum!",
      type: "busy",
    };
  }, [events, todos]);

  if (!suggestion) return null;

  return (
    <Card className="relative overflow-hidden border-none h-full min-h-[180px] rounded-2xl group transition-all duration-300 hover:shadow-lg">
      {/* Dynamic Background Gradient based on type */}
      <div className={`absolute inset-0 z-0 transition-all duration-500 ${
        suggestion.type === 'gap' 
        ? 'bg-gradient-to-br from-indigo-600 via-blue-500 to-sky-400' 
        : 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900'
      }`} />

      {/* Glossy Overlay Decorations */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl" />
      </div>

      <CardContent className="relative z-20 p-6 flex flex-col h-full text-white">
        {/* Header Section */}
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

        {/* Content Section */}
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