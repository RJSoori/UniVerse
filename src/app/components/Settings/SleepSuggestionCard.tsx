import { Card, CardContent } from "../ui/card";
import { Moon, Sparkles } from "lucide-react";

export default function SleepSuggestionCard() {
  return (
    /* We use max-w-[450px] or similar to ensure it only takes up half the row space */
    <Card className="relative overflow-hidden border-none shadow-sm bg-[#0f172a] text-white w-full max-w-md h-full min-h-[180px]">
      {/* Background Decorative Sparkle Icon (Top Right) */}
      <Sparkles className="absolute top-4 right-4 size-8 text-slate-700 opacity-50" />
      
      <CardContent className="p-6 space-y-4">
        {/* Header Tag */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Moon className="size-3.5 text-blue-400 fill-blue-400/20" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              Recovery Analysis
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold tracking-tight text-white leading-tight">
          Sleep Schedule Optimization
        </h3>

        {/* Time Grid */}
        <div className="flex gap-8 pt-1">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Sleep</p>
            <p className="text-2xl font-mono font-medium text-blue-400">11:30 PM</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Wake</p>
            <p className="text-2xl font-mono font-medium text-blue-400">6:30 AM</p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}