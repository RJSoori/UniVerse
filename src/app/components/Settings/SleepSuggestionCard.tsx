import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Moon } from "lucide-react";

export default function SleepSuggestionCard() {
  return (
    <Card className="relative overflow-hidden border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
      
      <CardHeader className="pb-0 pt-4 px-6">
        <div className="flex items-center gap-3">
          {/* Logo-matched Blue and crisp icon */}
          <Moon className="size-6 text-blue-600 fill-blue-600/10" />
          <CardTitle className="text-[22px] font-bold text-black ">
            Sleep Suggestion
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-1 pb-3 px-6">
        <div className="space-y-1">
          {/* Increased size and black/blue contrast to match dashboard headers */}
          <p className="text-xl  text-black ">
            Aim for <span className="text-blue-600 font-extrabold">7–9 hours</span> of sleep tonight.
          </p>
          <p className="text-[16px] text-slate-500 font-medium leading-snug">
            Proper rest improves focus, memory, and productivity for tomorrow.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}