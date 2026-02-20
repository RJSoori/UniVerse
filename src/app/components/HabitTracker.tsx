import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AlertTriangle, Lightbulb, Plus, Target } from "lucide-react";
import { GroupHabits } from "./habits/GroupHabits";
import { PersonalHabits } from "./habits/PersonalHabits";

export function HabitTracker() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Habit Tracker</h2>
        <p className="text-muted-foreground text-sm">Build consistency in your daily routine</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Lightbulb className="h-4 w-4" />
              Lifestyle Insight: Suggested Habits
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Early Morning Focus</p>
              <p className="text-xs text-muted-foreground">
                Based on your 8:00 AM lectures on Monday/Tuesday
              </p>
            </div>
            <Button variant="secondary" size="sm">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Pattern Alert: Habits to Break
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Late Night Screen Time</p>
              <p className="text-xs text-muted-foreground">
                Detected high activity after 12:00 AM which impacts recovery
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:text-amber-700">
              <Target className="h-4 w-4" /> Track Break
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="group">Groups</TabsTrigger>
        </TabsList>
        <TabsContent value="personal">
          <PersonalHabits />
        </TabsContent>
        <TabsContent value="group">
          <GroupHabits />
        </TabsContent>
      </Tabs>
    </div>
  );
}