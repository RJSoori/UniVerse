import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { AlertCircle, Target, TrendingUp } from "lucide-react";
import { useGpaCalculator } from "../../hooks/useGpaCalculator";
import { getTargetGpaResult } from "./utils/targetGpaCalculator";
import { getEffectiveGpaScale } from "./utils/gpaPrediction";
import {
  validatePlannerInputs,
  validateRecommendationFeasibility,
} from "../../utils/validation";

export function TargetGpaPlanner() {
  const { getCgpa, getGpaCredits, settings } = useGpaCalculator();
  const [targetCgpa, setTargetCgpa] = useState<string>("");
  const [nextCredits, setNextCredits] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentCgpa = getCgpa();
  const completedCredits = getGpaCredits();
  const maxGpa = getEffectiveGpaScale(settings);

  const handleCalculate = () => {
    setErrors({});
    const validation = validatePlannerInputs({ targetCgpa, nextCredits }, maxGpa);
    if (!validation.ok) {
      setResult(null);
      setErrors(validation.errors);
      return;
    }

    const calculationResult = getTargetGpaResult(
      currentCgpa,
      completedCredits,
      validation.value.nextCredits,
      validation.value.targetCgpa,
      maxGpa,
    );
    const feasibility = validateRecommendationFeasibility(
      calculationResult.requiredSgpa,
      maxGpa,
    );
    if (!feasibility.ok) {
      setErrors(feasibility.errors);
    }
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
              <Label>Completed GPA Credits</Label>
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
                onChange={(e) => {
                  setTargetCgpa(e.target.value);
                  if (errors.targetCgpa) {
                    setErrors((prev) => ({ ...prev, targetCgpa: "" }));
                  }
                }}
                placeholder={`e.g., 3.75`}
                className={errors.targetCgpa ? "border-red-500" : ""}
              />
              {errors.targetCgpa && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.targetCgpa}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextCredits">Next Semester Credits</Label>
              <Input
                id="nextCredits"
                type="number"
                min="1"
                value={nextCredits}
                onChange={(e) => {
                  setNextCredits(e.target.value);
                  if (errors.nextCredits) {
                    setErrors((prev) => ({ ...prev, nextCredits: "" }));
                  }
                }}
                placeholder="e.g., 18"
                className={errors.nextCredits ? "border-red-500" : ""}
              />
              {errors.nextCredits && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.nextCredits}
                </p>
              )}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Result</Label>
                <p className="text-sm">{result.message}</p>
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <p className="text-sm font-medium">{result.difficulty}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Insight</Label>
              <p
                className={`text-sm ${result.isFeasible ? "text-muted-foreground" : "text-red-600"}`}
              >
                {result.insight}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
