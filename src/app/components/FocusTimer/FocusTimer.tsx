import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Play, Pause, RotateCcw, Maximize, Minimize, BarChart2, Target, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import FocusTrendChart from "./FocusTrendChart";
import { useGpaCalculator } from "../../hooks/useGpaCalculator";

export function FocusTimer({ compact = false }: { compact?: boolean }) {
  const { getCgpa } = useGpaCalculator();
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // GPA Logic
  const currentCgpa = getCgpa();
  const targetGpa = 3.80; 
  const gpaGap = Math.max(0, targetGpa - currentCgpa);
  const suggestedHours = gpaGap > 0 ? (2 + gpaGap * 4).toFixed(1) : "2.0";

  const weeklyData = [
    { date: "Mon", minutes: 120 }, { date: "Tue", minutes: 90 },
    { date: "Wed", minutes: 150 }, { date: "Thu", minutes: 80 },
    { date: "Fri", minutes: 200 }, { date: "Sat", minutes: 100 },
    { date: "Sun", minutes: 60 },
  ];

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => (prev <= 1 ? (setIsRunning(false), 0) : prev - 1));
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  // Listen for escape key or browser exit to sync state
  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => { setIsRunning(false); setTimeLeft(duration * 60); };
  
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  // --- ZEN MODE / FULLSCREEN OVERLAY ---
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999] animate-in fade-in duration-300">
        <div className="text-center space-y-12 w-full max-w-5xl px-10">
          {/* Huge Countdown Display */}
          <div className="text-[15rem] md:text-[22rem] font-mono tabular-nums text-slate-900 leading-none tracking-tighter">
            {formatTime(timeLeft)}
          </div>
          
          <div className="w-full max-w-3xl mx-auto">
             <Progress value={progress} className="h-3 bg-slate-100" />
          </div>

          <div className="flex gap-6 justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Button onClick={toggleTimer} variant="outline" size="lg" className="rounded-full h-20 w-20 border-slate-200">
              {isRunning ? <Pause className="size-8" /> : <Play className="size-8 fill-slate-900" />}
            </Button>
            <Button onClick={resetTimer} variant="outline" size="lg" className="rounded-full h-20 w-20 border-slate-200">
              <RotateCcw className="size-8 text-slate-600" />
            </Button>
            <Button onClick={toggleFullscreen} variant="outline" size="lg" className="rounded-full h-20 w-20 border-slate-200">
              <Minimize className="size-8 text-slate-600" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW (COMPACT) ---
  if (compact) {
    return (
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
              {isRunning ? <><Pause className="mr-2 size-5" /> Pause</> : <><Play className="mr-2 size-5" /> Start</>}
            </Button>
            <Button onClick={resetTimer} size="lg" variant="outline"><RotateCcw className="size-5" /></Button>
            <Button onClick={toggleFullscreen} size="lg" variant="outline"><Maximize className="size-5" /></Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- FULL FEATURE VIEW ---
  return (
    <div className="space-y-6">
      {/* GPA REMINDER CARD */}
      <Card className="border-blue-100 bg-blue-50/20 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-500">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="size-4 text-blue-600" />
              <h3 className="text-[12px] font-bold text-blue-600 uppercase tracking-[0.2em] font-mono">GPA Focus Goal</h3>
            </div>
            <div className="px-4 py-1.5 bg-white border border-blue-100 rounded-full">
              <span className="text-[12px] font-mono font-bold text-slate-500 uppercase">
                Current CGPA: <span className="text-blue-600 text-[14px]">{currentCgpa.toFixed(2)}</span>
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono tabular-nums font-medium text-slate-900 leading-none">{suggestedHours}</span>
                <span className="text-sm font-bold text-slate-400 uppercase font-sans">Hrs / Day</span>
              </div>
              <p className="text-[12px] font-mono text-slate-500 uppercase mt-2 tracking-tighter">
                Targeting <span className="text-blue-600 font-black text-[14px]">{targetGpa.toFixed(2)}</span>
              </p>
            </div>
            <div className="bg-white/60 border border-blue-100/50 p-4 rounded-xl flex gap-3 items-start">
              <TrendingUp className="size-5 text-emerald-500 mt-0.5 shrink-0" />
              <p className="text-[13px] font-sans text-slate-700 leading-relaxed">
                <span className="font-semibold text-slate-900">To reach your goal,</span> dedicate <span className="font-bold text-blue-600">{suggestedHours} hours</span> today.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FOCUS TIMER CARD */}
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
              {isRunning ? <><Pause className="mr-2 size-5" /> Pause</> : <><Play className="mr-2 size-5" /> Start</>}
            </Button>
            <Button onClick={resetTimer} size="lg" variant="outline"><RotateCcw className="size-5" /></Button>
            <Button onClick={toggleFullscreen} size="lg" variant="outline"><Maximize className="size-5" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* TIMER SETTINGS & ANALYSIS CARD */}
      <Card>
        <CardHeader><CardTitle>Timer Settings</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Select value={duration.toString()} onValueChange={(v) => { const m = parseInt(v); setDuration(m); if (!isRunning) setTimeLeft(m * 60); }} disabled={isRunning}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{[15, 25, 30, 45, 60].map((m) => (<SelectItem key={m} value={m.toString()}>{m} minutes</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:text-blue-600 flex items-center justify-center gap-2" onClick={() => setShowAnalysis(!showAnalysis)}>
            <BarChart2 className="size-4" /> {showAnalysis ? "Hide Analysis" : "View Analysis"}
          </Button>

          {showAnalysis && (
            <div className="mt-12 space-y-12 animate-in fade-in slide-in-from-top-4 duration-500 font-mono">
              <div className="bg-blue-50/20 p-6 pb-12 rounded-2xl border border-blue-100/50 shadow-sm">
                <div className="flex items-center gap-2 mb-8">
                  <BarChart2 className="size-4 text-blue-500" />
                  <h2 className="text-[14px] font-bold text-blue-600 uppercase tracking-[0.2em] tabular-nums">Weekly Focus Trend</h2>
                </div>
                <div className="h-[240px] w-full px-2"><FocusTrendChart data={weeklyData} /></div>
              </div>

              <div className="pt-4 space-y-8">
                <h2 className="text-[14px] font-bold text-blue-600 uppercase tracking-[0.2em] ml-1 tabular-nums">Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white border border-blue-100/50 p-6 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Today</p>
                    <div className="text-4xl font-mono tabular-nums font-medium text-slate-900 leading-none">60<span className="text-base ml-1 text-slate-300 font-sans font-normal">m</span></div>
                  </div>
                  <div className="bg-white border border-blue-100/50 p-6 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Avg Session</p>
                    <div className="text-4xl font-mono tabular-nums font-medium text-slate-900 leading-none">54<span className="text-base ml-1 text-slate-300 font-sans font-normal">m</span></div>
                  </div>
                  <div className="bg-white border border-blue-100/50 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center min-h-[160px]">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">Weekly Diff</p>
                    <div className="relative size-20">
                      <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" className="text-blue-50" strokeWidth="3" stroke="currentColor" />
                        <circle cx="18" cy="18" r="16" fill="none" className="text-emerald-500" strokeWidth="3" strokeDasharray="35, 100" strokeLinecap="round" stroke="currentColor" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-emerald-600 font-mono font-bold text-sm">↑35%</div>
                    </div>
                  </div>
                  <div className="bg-white border border-blue-100/50 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center min-h-[160px]">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">Monthly Diff</p>
                    <div className="relative size-20">
                      <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" className="text-blue-50" strokeWidth="3" stroke="currentColor" />
                        <circle cx="18" cy="18" r="16" fill="none" className="text-emerald-500" strokeWidth="3" strokeDasharray="57, 100" strokeLinecap="round" stroke="currentColor" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-emerald-600 font-mono font-bold text-sm">↑57%</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <div className="bg-white border border-blue-100/50 p-2 px-5 rounded-full inline-flex items-center gap-3 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-[11px] font-mono text-blue-600 uppercase tracking-widest">Current Trend: Sustained Growth</p>
                  </div>
                  <div className="bg-emerald-50/40 border border-emerald-100/50 p-5 rounded-2xl flex items-center gap-4">
                    <span className="text-2xl">🔥</span>
                    <p className="text-[15px] font-sans text-emerald-900 leading-tight">
                      <span className="font-bold">Great job!</span> You've already exceeded last month's focus time. Keep up the momentum!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}