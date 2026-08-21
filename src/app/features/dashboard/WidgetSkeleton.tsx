import { Card, CardContent, CardHeader } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface WidgetErrorProps {
  message: string;
  onRetry: () => void;
  compact?: boolean;
}

export function WidgetError({ message, onRetry, compact = false }: WidgetErrorProps) {
  return (
    <Card>
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-xs text-muted-foreground">{message}</p>
          <Button variant="ghost" size="sm" onClick={onRetry} className="h-7 text-xs gap-1">
            <RefreshCw className="h-3 w-3" /> Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function GpaWidgetSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-16 rounded bg-muted animate-pulse" />
            <div className="h-5 w-10 rounded bg-muted animate-pulse" />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            <div className="h-3 w-12 rounded bg-muted animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="h-5 w-40 rounded bg-muted animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-1">
            <div className="h-8 w-16 rounded bg-muted animate-pulse mx-auto" />
            <div className="h-3 w-10 rounded bg-muted animate-pulse mx-auto" />
          </div>
          <div className="text-center space-y-1">
            <div className="h-6 w-14 rounded bg-muted animate-pulse mx-auto" />
            <div className="h-3 w-20 rounded bg-muted animate-pulse mx-auto" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 rounded-full bg-muted animate-pulse" />
          <div className="h-3 w-16 rounded bg-muted animate-pulse" />
        </div>
        <div className="pt-2 border-t">
          <div className="h-3 w-36 rounded bg-muted animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MoneyWidgetSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : ""}>
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className={`space-y-4 ${compact ? "space-y-2" : ""}`}>
        <div className="space-y-1">
          <div className="h-3 w-24 rounded bg-muted animate-pulse" />
          <div className={`rounded bg-muted animate-pulse ${compact ? "h-5 w-20" : "h-7 w-28"}`} />
        </div>
        <div className="space-y-1 pt-2 border-t">
          <div className="h-3 w-28 rounded bg-muted animate-pulse" />
          <div className="h-2 w-full rounded bg-muted animate-pulse" />
          <div className="h-3 w-20 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-12 w-full rounded-lg bg-muted animate-pulse" />
      </CardContent>
    </Card>
  );
}

export function SleepSuggestionCardSkeleton() {
  return (
    <Card className="h-full min-h-[180px] rounded-2xl border-none bg-[#0f172a]">
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
        <div className="h-5 w-32 rounded-full bg-white/10 animate-pulse" />
        <div className="h-5 w-4/5 rounded bg-white/10 animate-pulse" />
        <div className="flex gap-6 border-t border-white/5 pt-3">
          <div className="h-8 w-16 rounded bg-white/10 animate-pulse" />
          <div className="h-8 w-16 rounded bg-white/10 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductivityGapCardSkeleton() {
  return (
    <Card className="h-full min-h-[180px] rounded-2xl border-none bg-slate-800">
      <CardContent className="p-6 flex flex-col h-full space-y-6">
        <div className="h-6 w-28 rounded-full bg-white/10 animate-pulse" />
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-xl bg-white/10 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-white/10 animate-pulse" />
            <div className="h-3 w-full rounded bg-white/10 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
