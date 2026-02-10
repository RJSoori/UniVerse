import { useState } from "react";
import { useUniStorage } from "../hooks/useUniStorage";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  BookOpen,
  Users,
  Briefcase
} from "lucide-react";

interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "class" | "study" | "meeting" | "other";
}

export function Scheduler() {
  const [events, setEvents] = useUniStorage<ScheduleEvent[]>("schedule-events", []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<ScheduleEvent, "id">>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    type: "class",
  });

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    const event: ScheduleEvent = {
      id: Date.now().toString(),
      ...newEvent,
    };
    setEvents([...events, event]);
    setNewEvent({ title: "", date: new Date().toISOString().split("T")[0], startTime: "", endTime: "", type: "class" });
    setShowAddForm(false);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const navigateWeek = (dir: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
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
      case "class": return <BookOpen className="size-3" />;
      case "study": return <Clock className="size-3" />;
      case "meeting": return <Users className="size-3" />;
      default: return <Briefcase className="size-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "class": return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "study": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      case "meeting": return "bg-purple-500/10 text-purple-600 border-purple-200";
      default: return "bg-slate-500/10 text-slate-600 border-slate-200";
    }
  };

  const weekDays = getWeekDays();

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Schedule</h2>
            <p className="text-muted-foreground text-sm">Organize your lectures and sessions</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="mr-2 h-4 w-4" /> New Event
          </Button>
        </div>

        {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule New Task</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Event Title</Label>
                    <Input
                        placeholder="e.g. IT & Management Lecture"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <select
                        className="w-full p-2 border rounded-md bg-background text-sm"
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
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
                    <Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="time" value={newEvent.startTime} onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input type="time" value={newEvent.endTime} onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={addEvent} className="flex-1">Add to Schedule</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <CardTitle className="text-base font-normal">
              {weekDays[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {weekDays[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
              <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day, idx) => {
                const dateStr = day.toISOString().split("T")[0];
                const dayEvents = events.filter(e => e.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
                const isToday = new Date().toISOString().split("T")[0] === dateStr;

                return (
                    <div key={idx} className="space-y-3">
                      <div className={`text-center p-2 rounded-lg ${isToday ? "bg-primary text-primary-foreground" : ""}`}>
                        <p className="text-[10px] uppercase font-bold opacity-80">{day.toLocaleDateString("en-US", { weekday: "short" })}</p>
                        <p className="text-lg font-bold">{day.getDate()}</p>
                      </div>
                      <div className="space-y-2">
                        {dayEvents.map(event => (
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
      </div>
  );
}