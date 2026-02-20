import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toDateKey } from "./utils";

type CalendarModalProps = {
  open: boolean;
  completedDates: string[];
  onDateClick: (dateStr: string) => void;
  onOpenChange: (open: boolean) => void;
  habitName: string;
  color: string;
};

export function CalendarModal({
  open,
  completedDates,
  onDateClick,
  onOpenChange,
  habitName,
  color,
}: CalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days: (number | null)[] = Array(firstDay).fill(null);

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Only allow marking dates up to today
    if (date > today) {
      return;
    }
    
    const dateStr = toDateKey(date);
    onDateClick(dateStr);
  };

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{habitName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold">{monthName}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground">
                {day}
              </div>
            ))}

            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-10 w-10" />;
              }

              const date = new Date(year, month, day);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isFuture = date > today;
              
              const dateStr = toDateKey(date);
              const isDone = completedDates.includes(dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(day)}
                  disabled={isFuture}
                  className={`h-10 w-10 rounded-md border font-medium text-sm transition-all ${
                    isFuture ? "cursor-not-allowed opacity-30" : "hover:scale-105 cursor-pointer"
                  }`}
                  style={{
                    backgroundColor: isDone ? color : "transparent",
                    borderColor: isFuture ? "hsl(var(--muted-foreground))" : isDone ? color : "hsl(var(--border))",
                    color: isDone ? "white" : "inherit",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
