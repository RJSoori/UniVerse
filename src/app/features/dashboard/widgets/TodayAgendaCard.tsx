import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";
import { useSchedule } from "../../../shared/hooks/useSchedule";
import { Clock, ArrowRight } from "lucide-react";

export function TodayAgendaCard() {
  const navigate = useNavigate();
  const { events } = useSchedule();

  const todayEvents = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return events
      .filter((e) => e.date === todayStr)
      .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
  }, [events]);

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="pb-3 border-b mb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="size-4 text-primary" /> Today's Agenda
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">
            {todayEvents.length} Events
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {todayEvents.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-xs text-muted-foreground italic">
                Nothing on the schedule today.
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate("/schedule")}
                className="text-[10px]"
              >
                Add a lecture?
              </Button>
            </div>
          ) : (
            todayEvents.map((event) => (
              <div
                key={event.id ?? `${event.date}-${event.startTime}-${event.title}`}
                className="flex items-center gap-3 p-2 rounded-lg border bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <div className="text-[10px] font-bold text-primary w-14 text-center border-r border-primary/20">
                  {event.startTime}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{event.title}</p>
                  <p className="text-[9px] text-muted-foreground uppercase">
                    {event.type}
                  </p>
                </div>
              </div>
            ))
          )}
          {todayEvents.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[10px] h-8 mt-2"
              onClick={() => navigate("/schedule")}
            >
              View Full Timetable <ArrowRight className="ml-2 size-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
