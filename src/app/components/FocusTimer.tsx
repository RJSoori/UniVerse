import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";

export function FocusTimer({ compact = false }: { compact?: boolean }) {
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Trigger browser notification if allowed
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Focus Session Complete!", {
                body: "Time for a break, UniVerse user!",
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const toggleTimer = () => {
    if (!isRunning && "Notification" in window && Notification.permission === "default") {
      // Handling the promise properly
      Notification.requestPermission()
          .then((permission) => {
            if (permission === "granted") {
              console.log("Notification permission granted.");
            }
          })
          .catch((err) => {
            console.error("Notification permission request failed:", err);
          });
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  if (compact) {
    return (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Focus Timer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-mono tabular-nums">{formatTime(timeLeft)}</div>
              <Progress value={progress} className="h-1.5 mt-2" />
            </div>
            <div className="flex gap-2">
              <Button onClick={toggleTimer} className="flex-1" size="sm">
                {isRunning ? <Pause className="size-4" /> : <Play className="size-4" />}
              </Button>
              <Button onClick={resetTimer} variant="outline" size="sm">
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
    );
  }

  return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Focus Timer</CardTitle>
            <CardDescription>Timed study sessions for your university work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="text-7xl font-mono tabular-nums">{formatTime(timeLeft)}</div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex justify-center gap-3">
              <Button onClick={toggleTimer} size="lg" className="w-32">
                {isRunning ? (
                    <><Pause className="mr-2 size-5" /> Pause</>
                ) : (
                    <><Play className="mr-2 size-5" /> Start</>
                )}
              </Button>
              <Button onClick={resetTimer} size="lg" variant="outline">
                <RotateCcw className="size-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timer Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Select
                  value={duration.toString()}
                  onValueChange={(value) => {
                    const mins = parseInt(value);
                    setDuration(mins);
                    if (!isRunning) setTimeLeft(mins * 60);
                  }}
                  disabled={isRunning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {[15, 25, 30, 45, 60].map((m) => (
                      <SelectItem key={m} value={m.toString()}>{m} minutes</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}