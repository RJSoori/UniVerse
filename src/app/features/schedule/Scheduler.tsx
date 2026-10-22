import { useState } from "react";
import { useSchedule, type ScheduleEvent } from "../../shared/hooks/useSchedule";
import { getTodayIsoDate, isTodayOrFuture } from "../../shared/validation/dateValidation";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../shared/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  Users,
  Briefcase,
} from "lucide-react";

const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Displays a calendar scheduler for students.
 * Lets students add, view, and delete events in week or month view.
 */
export function Scheduler() {
  const { events, loading, error, createEvent, removeEvent } = useSchedule();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<ScheduleEvent, "id">>({
    title: "",
    date: formatDateLocal(new Date()),
    startTime: "",
    endTime: "",
    description: "",
    type: "class",
  });

  /**
   * Saves a new event to the calendar and database.
   * Clears the form when done.
   */
  const addEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      setFeedbackMsg({ type: 'error', text: 'Title and date are required' });
      return;
    }
    if (!isTodayOrFuture(newEvent.date)) {
      setFeedbackMsg({ type: 'error', text: 'Events can only be scheduled for today or a future date.' });
      return;
    }
    try {
      const result = await createEvent(newEvent);
      if (!result) {
        setFeedbackMsg({ type: 'error', text: 'Failed to create event. Check that you are logged in.' });
        return;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setFeedbackMsg({ type: 'error', text: `Error: ${errMsg}` });
      console.error('createEvent failed:', err);
    }
    setNewEvent({
      title: "",
      date: formatDateLocal(new Date()),
      startTime: "",
      endTime: "",
      description: "",
      type: "class",
    });
    setShowAddForm(false);
  };

  /**
   * Removes an event from the calendar and database.
   * Shows an error message if deletion fails.
   */
  const deleteEvent = async (id: string) => {
    try {
      const result = await removeEvent(id);
      if (!result) {
        setFeedbackMsg({ type: 'error', text: 'Failed to delete event.' });
        return;
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setFeedbackMsg({ type: 'error', text: `Delete error: ${errMsg}` });
      console.error('removeEvent failed:', err);
    }
  };

  const handleDateClick = (dateStr: string) => {
    if (!isTodayOrFuture(dateStr)) {
      setFeedbackMsg({ type: 'error', text: 'Events can only be scheduled for today or a future date.' });
      return;
    }
    setNewEvent({ ...newEvent, date: dateStr });
    setShowAddForm(true);
  };

  const navigateWeek = (dir: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };

  const navigateMonth = (dir: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "class":
        return <BookOpen className="size-3" />;
      case "study":
        return <Clock className="size-3" />;
      case "meeting":
        return <Users className="size-3" />;
      default:
        return <Briefcase className="size-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "class":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "study":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      case "meeting":
        return "bg-purple-500/10 text-purple-600 border-purple-200";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200";
    }
  };

  const weekDays = getWeekDays();

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div className="space-y-1">
          <h2 className="app-page-title">Schedule</h2>
          <p className="app-page-subtitle">Organize your lectures and sessions</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Event
        </Button>
      </div>

      {feedbackMsg && (
        <Card className={feedbackMsg.type === 'error' ? 'border-destructive bg-destructive/5' : 'border-green-500 bg-green-500/5'}>
          <CardContent className={`p-3 text-sm ${feedbackMsg.type === 'error' ? 'text-destructive' : 'text-green-700'}`}>
            {feedbackMsg.text}
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-3 text-sm text-destructive">
            Hook error: {error}
          </CardContent>
        </Card>
      )}

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Schedule New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Event Title</Label>
                <Input
                  placeholder="e.g. IT & Management Lecture"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addEvent()}
                />
              </div>
              <div className="space-y-2">
                <Label>Event Type</Label>
                <select
                  className="w-full p-2 border rounded-md bg-background text-sm"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as ScheduleEvent["type"] })}
                >
                  <option value="class">Class/Lecture</option>
                  <option value="study">Self Study</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  min={getTodayIsoDate()}
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={newEvent.startTime} onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={newEvent.endTime} onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={addEvent} className="flex-1">Save Event</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="week" className="w-full space-y-4">
        <TabsList className="grid grid-cols-2 gap-2 w-fit">
          <TabsTrigger value="week" className="text-xs px-3 py-1">Week</TabsTrigger>
          <TabsTrigger value="month" className="text-xs px-3 py-1">Month</TabsTrigger>
        </TabsList>

        <TabsContent value="week" className="space-y-4">
          <Card className="app-surface">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-sm font-medium">
                  {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
                  <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-4">
                {weekDays.map((day, idx) => {
                  const dateStr = formatDateLocal(day);
                  const dayEvents = events.filter((e) => e.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
                  const isToday = formatDateLocal(new Date()) === dateStr;

                  return (
                    <div key={dateStr} className="space-y-3">
                      <div
                        className={`text-center p-2 rounded-lg cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 ${isToday ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                        onClick={() => handleDateClick(dateStr)}
                      >
                        <p className="text-[10px] uppercase font-bold opacity-80">{day.toLocaleDateString("en-US", { weekday: "short" })}</p>
                        <p className="text-lg font-bold">{day.getDate()}</p>
                      </div>
                      <div className="space-y-2">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`p-2 rounded border text-[10px] flex flex-col gap-1 group relative transition-all hover:shadow-sm ${getTypeColor(event.type)}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold truncate pr-4">{event.title}</span>
                              <button
                                onClick={() => deleteEvent(event.id)}
                                className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-1 opacity-80">
                              {getTypeIcon(event.type)}
                              <span>{event.startTime}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          <Card className="app-surface">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-sm font-medium">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
                  <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-xs font-bold uppercase p-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {getMonthDays().map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="aspect-square" />;
                  }

                  const dateStr = formatDateLocal(day);
                  const dayEvents = events.filter((e) => e.date === dateStr);
                  const isToday = formatDateLocal(new Date()) === dateStr;

                  return (
                    <div
                      key={dateStr}
                      className={`aspect-square p-2 rounded-lg border transition-all hover:shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/50 flex flex-col overflow-hidden ${
                        isToday ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"
                      }`}
                      onClick={() => handleDateClick(dateStr)}
                    >
                      <p className={`text-xs font-bold mb-1 ${isToday ? "" : "text-muted-foreground"}`}>{day.getDate()}</p>
                      <div className="space-y-1 overflow-y-auto flex-1 min-h-0">
                        {dayEvents.slice(0, 4).map((event) => (
                          <div
                            key={event.id}
                            className={`text-[9px] px-1.5 py-0.5 rounded truncate flex items-center justify-between gap-1 group ${getTypeColor(event.type)}`}
                            title={event.title}
                          >
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              {getTypeIcon(event.type)}
                              <span className="truncate flex-1">{event.title}</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEvent(event.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            >
                              <Trash2 className="size-2.5" />
                            </button>
                          </div>
                        ))}
                        {dayEvents.length > 4 && (
                          <p className="text-[8px] text-muted-foreground px-1">
                            +{dayEvents.length - 4} more
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
