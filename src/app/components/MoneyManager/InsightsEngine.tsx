import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useMoneyManager } from "../../hooks/useMoneyManager";
import { AlertCircle, TrendingUp, Zap, Award, Info, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

export function InsightsEngine() {
  const { generateInsights } = useMoneyManager();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const insights = generateInsights().filter((i) => !dismissedIds.has(i.id));

  const dismissInsight = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="h-4 w-4" />;
      case "warning":
        return <Zap className="h-4 w-4" />;
      case "achievement":
        return <Award className="h-4 w-4" />;
      case "insight":
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "alert":
        return "border-destructive/50 bg-destructive/5 text-destructive";
      case "warning":
        return "border-amber-500/50 bg-amber-50 text-amber-700";
      case "achievement":
        return "border-emerald-500/50 bg-emerald-50 text-emerald-700";
      case "insight":
      default:
        return "border-blue-500/50 bg-blue-50 text-blue-700";
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2 py-8">
            <Award className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm font-semibold text-muted-foreground">
              All Clear!
            </p>
            <p className="text-xs text-muted-foreground">
              No alerts or insights at the moment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Financial Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 border rounded-lg flex items-start gap-3 ${getColor(
                insight.type,
              )}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(insight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{insight.title}</h4>
                <p className="text-sm mt-1 opacity-90">{insight.message}</p>
                {insight.actionable && (
                  <p className="text-xs mt-2 opacity-75">
                    💡 Consider taking action on this
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissInsight(insight.id)}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
