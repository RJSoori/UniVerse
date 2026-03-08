import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Target, TrendingUp } from "lucide-react";
import { useGpaCalculator } from "../../hooks/useGpaCalculator";
import { getTargetGpaResult } from "./utils/targetGpaCalculator";

export function TargetGpaPlanner() {
  const { getCgpa, getTotalCredits, settings } = useGpaCalculator();
  const [targetCgpa, setTargetCgpa] = useState<string>("");
  const [nextCredits, setNextCredits] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  const currentCgpa = getCgpa();
  const completedCredits = getTotalCredits();
  const maxGpa = settings.gradingMode === "extended" ? 4.2 : 4.0;

  const handleCalculate = () => {
    const target = parseFloat(targetCgpa);
    const credits = parseFloat(nextCredits);

    if (
      isNaN(target) ||
      isNaN(credits) ||
      target < 0 ||
      target > maxGpa ||
      credits <= 0
    ) {
      return;
    }

    const calculationResult = getTargetGpaResult(
      currentCgpa,
      completedCredits,
      credits,
      target,
      maxGpa,
    );
    setResult(calculationResult);
  };

  const isValidInput =
    targetCgpa &&
    nextCredits &&
    parseFloat(targetCgpa) >= 0 &&
    parseFloat(targetCgpa) <= maxGpa &&
    parseFloat(nextCredits) > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Target GPA Planner
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Calculate the SGPA you need next semester to reach your target CGPA
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current CGPA</Label>
              <div className="text-2xl font-bold">{currentCgpa.toFixed(2)}</div>
            </div>
            <div className="space-y-2">
              <Label>Completed Credits</Label>
              <div className="text-2xl font-bold">{completedCredits}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetCgpa">Target CGPA</Label>
              <Input
                id="targetCgpa"
                type="number"
                step="0.01"
                min="0"
                max={maxGpa}
                value={targetCgpa}
                onChange={(e) => setTargetCgpa(e.target.value)}
                placeholder={`e.g., 3.75`}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextCredits">Next Semester Credits</Label>
              <Input
                id="nextCredits"
                type="number"
                min="1"
                value={nextCredits}
                onChange={(e) => setNextCredits(e.target.value)}
                placeholder="e.g., 18"
              />
            </div>
          </div>

          <Button
            onClick={handleCalculate}
            disabled={!isValidInput}
            className="w-full"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Calculate Required SGPA
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant={result.isFeasible ? "default" : "destructive"}>
                {result.isFeasible ? "Feasible" : "Not Feasible"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Required SGPA</Label>
                <div className="text-3xl font-bold text-primary">
                  {result.requiredSgpa.toFixed(2)}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Maximum Possible CGPA</Label>
                <div className="text-2xl font-semibold">
                  {result.maxPossibleCgpa.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Result</Label>
              <p className="text-sm">{result.message}</p>
            </div>

            <div className="space-y-2">
              <Label>Insight</Label>
              <p className="text-sm text-muted-foreground">{result.insight}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
