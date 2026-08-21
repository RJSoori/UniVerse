import { useMemo } from "react";
import { Card, CardContent } from "../../shared/ui/card";
import { Clock, Zap, BrainCircuit } from "lucide-react";
import { useSchedule } from "../../shared/hooks/useSchedule";
import { useTodos } from "../../shared/hooks/useTodos";

const formatDuration = (mins: number) => {
  // Format minutes into a human-readable "Xd Yh Zm" string
  if (mins <= 0) return "less than a minute";
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const minutes = mins % 60;
  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes && !days) parts.push(`${minutes}m`);
  return parts.join(" ");
};

export default function ProductivityGapCard() {
  const { events } = useSchedule();
  const { todos } = useTodos();

  const suggestion = useMemo<{ message: string; type: "upcoming" | "clear" } | null>(() => {
    // Find the single nearest upcoming item across both the scheduler and the todo list,
    // then report the time left until it, whichever source it comes from.
    const now = new Date();

    type Candidate = { when: Date; title: string; todoId?: string };
    const candidates: Candidate[] = [];

    events.forEach((e) => {
      if (!e.date || !e.startTime) return;
      const when = new Date(`${e.date}T${e.startTime}`);
      if (!isNaN(when.getTime())) candidates.push({ when, title: e.title || "event" });
    });

    todos.forEach((t) => {
      if (t.completed || !t.dueDate) return;
      // Default to end-of-day when a todo has a due date but no specific due time.
      const when = new Date(`${t.dueDate}T${t.dueTime || "23:59"}`);
      if (!isNaN(when.getTime())) candidates.push({ when, title: t.title || "task", todoId: t.id });
    });

    const next = candidates
      .filter((c) => c.when.getTime() >= now.getTime())
      .sort((a, b) => a.when.getTime() - b.when.getTime())[0];

    if (!next) {
      return {
        message: "Your schedule looks wide open! A perfect time to get ahead on your goals.",
        type: "clear",
      };
    }

    const diffMins = Math.round((next.when.getTime() - now.getTime()) / 60000);
    let message = `${formatDuration(diffMins)} left until "${next.title}".`;

    // While waiting, suggest another pending todo that isn't the one we're already
    // counting down to — prefer one whose estimated duration fits in the gap, and
    // among those, the one due soonest.
    const fillerWhen = (t: (typeof todos)[number]) => {
      if (!t.dueDate) return Infinity;
      const d = new Date(`${t.dueDate}T${t.dueTime || "23:59"}`);
      return isNaN(d.getTime()) ? Infinity : d.getTime();
    };
    const filler = todos
      .filter((t) => !t.completed && t.id !== next.todoId)
      .sort((a, b) => fillerWhen(a) - fillerWhen(b))
      .find((t) => {
        const estimatedMins = parseInt(t.reservedMinutes, 10);
        return isNaN(estimatedMins) || estimatedMins <= 0 || estimatedMins <= diffMins;
      });

    if (filler) {
      message += ` Want to knock out "${filler.title}" while you wait?`;
    }

    return { message, type: "upcoming" };
  }, [events, todos]);

  if (!suggestion) return null;

  return (
    <Card className="relative overflow-hidden border-none h-full min-h-[180px] rounded-2xl group transition-all duration-300 hover:shadow-lg">
      {/* Dynamic Background Gradient based on type */}
      <div className={`absolute inset-0 z-0 transition-all duration-500 ${
        suggestion.type === 'upcoming'
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
            <Zap className={`size-3.5 ${suggestion.type === 'upcoming' ? 'text-yellow-300' : 'text-slate-300'}`} fill="currentColor" />
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
                {suggestion.type === 'upcoming' ? 'Optimized Gap Found' : 'All Clear'}
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