import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";

export function FocusTimer({ compact = false }: { compact?: boolean }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(25);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Focus Session Complete!", {
                body: "Great job! Time for a break.",
              });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const toggleTimer = () => {
    if (!isRunning && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
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
        <CardHeader>
          <CardTitle>Focus Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-mono tabular-nums">{formatTime(timeLeft)}</div>
            <Progress value={progress} className="h-2 mt-3" />
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
          <CardDescription>Stay focused with timed study sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-7xl font-mono tabular-nums">{formatTime(timeLeft)}</div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex justify-center gap-3">
            <Button onClick={toggleTimer} size="lg" className="w-32">
              {isRunning ? (
                <>
                  <Pause className="mr-2 size-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 size-5" />
                  Start
                </>
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
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Focus Duration (minutes)</Label>
            <Select
              value={duration.toString()}
              onValueChange={(value) => {
                setDuration(parseInt(value));
                if (!isRunning) {
                  setTimeLeft(parseInt(value) * 60);
                }
              }}
              disabled={isRunning}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="25">25 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
