import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Progress } from "../../shared/ui/progress";
import { Play, Pause, RotateCcw, Maximize, Minimize, BarChart2, Target, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../shared/ui/select";
import { Label } from "../../shared/ui/label";
import FocusTrendChart from "./FocusTrendChart";
import { useGpaCalculator } from "../gpa-calculator/hooks/useGpaCalculator";
import { focusApi } from "./focusApi";

export function FocusTimer() {
  const { getCgpa } = useGpaCalculator();

  /**
   * DYNAMIC USER AUTHENTICATION
   * Pulls the actual logged-in user from localStorage. 
   * This replaces "test_user" for your 4-credit project evaluation.
   */
  const userString = localStorage.getItem("user");
  const userData = userString ? JSON.parse(userString) : null;
  const currentUserId = userData?.username || userData?.id || "guest_student";

  // Timer State
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<number | null>(null);
  
  // State for Analytics
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [weeklyData, setWeeklyData] = useState([]);
  const [todayMinutes, setTodayMinutes] = useState(0);

  // GPA Goals Logic (Based on your Semester 1/2 GPA of 3.73/3.43)
  const currentCgpa = getCgpa();
  const targetGpa = 3.80;
  const gpaGap = Math.max(0, targetGpa - currentCgpa);
  const suggestedHours = gpaGap > 0 ? (2 + gpaGap * 4).toFixed(1) : "2.0";

  const loadData = async () => {
    if (!currentUserId || currentUserId === "guest_student") return;
    const data = await focusApi.getAnalytics(currentUserId);
    setWeeklyData(data);
    
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = data.find((item: any) => item.date === today);
    setTodayMinutes(todayRecord ? todayRecord.minutes : 0);
  };

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  const saveSession = async (mins: number) => {
    if (mins < 1 || currentUserId === "guest_student") return; 
    try {
      await focusApi.saveSession(mins, currentUserId);
      await loadData(); 
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            saveSession(duration); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, duration, currentUserId]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    if (isRunning || timeLeft < duration * 60) {
      const secondsPassed = (duration * 60) - timeLeft;
      const minutesToSave = Math.floor(secondsPassed / 60);
      
      if (minutesToSave >= 1) {
        saveSession(minutesToSave);
      }
    }
    setIsRunning(false); 
    setTimeLeft(duration * 60); 
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  
  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  const toggleFullscreen = () => {
    if (!isFullscreen) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  if (isFullscreen) {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-sm flex items-center justify-center p-10">
        <div className="text-center space-y-8 w-full max-w-6xl">
          <div className="text-[clamp(4.5rem,20vw,14rem)] font-mono tabular-nums text-slate-900 leading-none">
            {formatTime(timeLeft)}
          </div>
          <div className="w-full max-w-3xl mx-auto"><Progress value={progress} className="h-3" /></div>
          <div className="flex gap-4 justify-center">
            <Button onClick={toggleTimer} variant="outline" size="lg" className="rounded-full h-16 w-16">
              {isRunning ? <Pause className="size-8" /> : <Play className="size-8 fill-slate-900" />}
            </Button>
            <Button onClick={resetTimer} variant="outline" size="lg" className="rounded-full h-16 w-16"><RotateCcw className="size-8" /></Button>
            <Button onClick={toggleFullscreen} variant="outline" size="lg" className="rounded-full h-16 w-16"><Minimize className="size-8" /></Button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div className="p-8 w-full space-y-8">
      {showFullAnalysis && (
        <FocusTrendChart 
          data={weeklyData} 
          isFullPage={true} 
          onBack={() => setShowFullAnalysis(false)} 
        />
      )}

      <div className="app-page-header">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Focus Timer</h2>
            <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase tracking-widest">
              ID: {currentUserId}
            </span>
          </div>
          <p className="text-slate-500">Track study sessions for your IT degree goals</p>
        </div>
      </div>

      <Card className="border-blue-100 bg-blue-50/20 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-blue-700">GPA Focus Goal</h3>
            </div>
            <div className="px-4 py-1.5 bg-white border border-blue-100 rounded-full text-xs font-semibold">
              Current CGPA: <span className="text-blue-600">{currentCgpa.toFixed(2)}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-semibold text-slate-900">{suggestedHours}</span>
                <span className="text-sm font-semibold text-slate-500">hrs/day</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">Targeting <span className="text-blue-600 font-semibold">{targetGpa.toFixed(2)}</span></p>
            </div>
            <div className="bg-white/60 p-4 rounded-xl flex gap-3 items-start border border-blue-100/50">
              <TrendingUp className="size-5 text-emerald-500 mt-0.5" />
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Recommended:</span> Dedicate <span className="font-bold text-blue-600">{suggestedHours} hours</span> today.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Timer</CardTitle>
          <CardDescription>Click start to begin your focus block</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-semibold tracking-tight tabular-nums">{formatTime(timeLeft)}</div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex justify-center gap-3">
            <Button onClick={toggleTimer} size="lg" className="w-32">
              {isRunning ? <><Pause className="mr-2" /> Pause</> : <><Play className="mr-2" /> Start</>}
            </Button>
            <Button onClick={resetTimer} size="lg" variant="outline"><RotateCcw /></Button>
            <Button onClick={toggleFullscreen} size="lg" variant="outline"><Maximize /></Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Settings & Insights</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Session Length</Label>
            <Select value={duration.toString()} onValueChange={(v) => { setDuration(Number(v)); setTimeLeft(Number(v) * 60); }} disabled={isRunning}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{[1, 15, 25, 30, 45, 60].map(m => <SelectItem key={m} value={m.toString()}>{m} minute{m > 1 ? 's' : ''}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="w-full gap-2" onClick={() => setShowFullAnalysis(true)}>
            <BarChart2 className="size-4" /> View Analytics
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}