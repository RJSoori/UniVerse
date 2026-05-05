import { useState, useEffect, useMemo } from "react";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card";
import { Badge } from "../../shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shared/ui/table";
import {
  AlertCircle,
  Plus,
  Trash2,
  Target,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { useGpaCalculator } from "./hooks/useGpaCalculator";
import {
  assignCategory,
  analyzePastPerformance,
} from "./utils/performance";
import { type PlannerSubject } from "./types";
import {
  buildRecommendations,
  type CombinationResult,
} from "./utils/gpaPlannerUtils";
import { getTargetGpaResult } from "./utils/targetGpaCalculator";
import { getEffectiveGpaScale } from "./utils/gpaPrediction";
import {
  getAllowedGrades,
  roundGpa,
  safeCompare,
  validatePlannerInputs,
  validatePlannerSubject,
  validateRecommendationFeasibility,
} from "../../shared/validation";

type Step = "goal" | "subjects" | "generate" | "results";

export function AcademicGoalPlanner() {
  const { semesters, getCgpa, getGpaCredits, settings } = useGpaCalculator();

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>("goal");

  // Goal setup
  const [targetCgpa, setTargetCgpa] = useState("");
  const [nextCredits, setNextCredits] = useState("");

  // Subject management
  const [subjectName, setSubjectName] = useState("");
  const [subjectCredits, setSubjectCredits] = useState("");
  const [subjects, setSubjects] = useState<PlannerSubject[]>([]);
  const [goalErrors, setGoalErrors] = useState<Record<string, string>>({});
  const [subjectErrors, setSubjectErrors] = useState<Record<string, string>>(
    {},
  );

  // Results
  const [targetResult, setTargetResult] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<CombinationResult[]>(
    [],
  );

  const gpaScale = getEffectiveGpaScale(settings);
  const allowedGrades = useMemo(() => getAllowedGrades(gpaScale), [gpaScale]);
  const currentCgpa = getCgpa();
  const completedCredits = getGpaCredits();
  const nextCreditsValue = Number(nextCredits) || 0;
  const usedCredits = roundGpa(
    subjects.reduce((sum, subject) => sum + subject.credits, 0),
  );
  const remainingCredits = roundGpa(nextCreditsValue - usedCredits);

  const performance = analyzePastPerformance(semesters, gpaScale);

  // Auto-trigger generation when entering "generate" step
  useEffect(() => {
    if (currentStep === "generate" && targetResult && subjects.length > 0) {
      handleGenerate();
    }
  }, [currentStep]);

  // Step 1: Goal Setup
  const handleGoalSetup = () => {
    setGoalErrors({});
    const validation = validatePlannerInputs(
      { targetCgpa, nextCredits },
      gpaScale,
    );
    if (!validation.ok) {
      setTargetResult(null);
      setGoalErrors(validation.errors);
      return;
    }

    const result = getTargetGpaResult(
      currentCgpa,
      completedCredits,
      validation.value.nextCredits,
      validation.value.targetCgpa,
      gpaScale,
    );
    const feasibility = validateRecommendationFeasibility(
      result.requiredSgpa,
      gpaScale,
    );
    if (!feasibility.ok) {
      setGoalErrors(feasibility.errors);
    }
    setTargetResult(result);
    setCurrentStep("subjects");
  };

  // Step 2: Subject Management
  const handleAddSubject = () => {
    setSubjectErrors({});
    const validation = validatePlannerSubject(
      { name: subjectName, credits: subjectCredits, grade: allowedGrades[0] },
      subjects.map((subject) => subject.name),
      remainingCredits,
      gpaScale,
    );
    if (!validation.ok) {
      setSubjectErrors(validation.errors);
      return;
    }

    setSubjects([
      ...subjects,
      {
        id: Date.now().toString(),
        name: validation.value.name,
        credits: validation.value.credits,
        grade: allowedGrades[0],
        category: assignCategory(subjectName),
        gradeModified: false,
      },
    ]);
    setSubjectName("");
    setSubjectCredits("");
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects(subjects.filter((subject) => subject.id !== id));
  };

  const handleUpdateSubjectGrade = (id: string, grade: string) => {
    setSubjects(
      subjects.map((subject) =>
        subject.id === id ? { ...subject, grade, gradeModified: true } : subject,
      ),
    );
  };

  // Step 3: Generate Recommendations
  const handleGenerate = () => {
    if (!targetResult || subjects.length === 0) return;
    if (safeCompare(remainingCredits, 0) !== 0) {
      setGoalErrors({
        nextCredits:
          remainingCredits > 0
            ? `Add ${remainingCredits.toFixed(1)} more credits or reduce next semester credits.`
            : `Reduce subjects by ${Math.abs(remainingCredits).toFixed(1)} credits to match the semester total.`,
      });
      return;
    }

    const requiredSgpa = targetResult.requiredSgpa;
    const plans = buildRecommendations(
      subjects,
      requiredSgpa,
      gpaScale,
      performance,
      semesters, // Pass semesters for probability model building
    );
    setRecommendations(plans);
    setCurrentStep("results");
  };

  // Navigation
  const canProceedToSubjects =
    targetCgpa &&
    nextCredits &&
    !goalErrors.targetCgpa &&
    !goalErrors.nextCredits;

  const canProceedToGenerate =
    subjects.length > 0 &&
    targetResult?.isFeasible &&
    safeCompare(remainingCredits, 0) === 0;

  const canProceedToResults = recommendations.length > 0;

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        <div
          className={`flex items-center space-x-2 ${currentStep === "goal" ? "text-primary" : currentStep !== "goal" ? "text-green-600" : "text-muted-foreground"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "goal" ? "bg-primary text-primary-foreground" : currentStep !== "goal" ? "bg-green-600 text-white" : "bg-muted"}`}
          >
            {currentStep !== "goal" ? <CheckCircle className="w-4 h-4" /> : "1"}
          </div>
          <span className="text-sm font-medium">Set Goal</span>
        </div>
        <div className="w-8 h-0.5 bg-muted" />
        <div
          className={`flex items-center space-x-2 ${currentStep === "subjects" ? "text-primary" : currentStep === "generate" || currentStep === "results" ? "text-green-600" : "text-muted-foreground"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "subjects" ? "bg-primary text-primary-foreground" : currentStep === "generate" || currentStep === "results" ? "bg-green-600 text-white" : "bg-muted"}`}
          >
            {currentStep === "generate" || currentStep === "results" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              "2"
            )}
          </div>
          <span className="text-sm font-medium">Add Subjects</span>
        </div>
        <div className="w-8 h-0.5 bg-muted" />
        <div
          className={`flex items-center space-x-2 ${currentStep === "results" ? "text-green-600" : "text-muted-foreground"}`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "results" ? "bg-green-600 text-white" : "bg-muted"}`}
          >
            {currentStep === "results" ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              "3"
            )}
          </div>
          <span className="text-sm font-medium">Get Plans</span>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === "goal" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Set Your Academic Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetCgpa">Target CGPA</Label>
                <Input
                  id="targetCgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max={gpaScale}
                  value={targetCgpa}
                  onChange={(e) => {
                    setTargetCgpa(e.target.value);
                    if (goalErrors.targetCgpa) {
                      setGoalErrors((prev) => ({ ...prev, targetCgpa: "" }));
                    }
                  }}
                  placeholder={`e.g., ${currentCgpa.toFixed(2)}`}
                  className={goalErrors.targetCgpa ? "border-red-500" : ""}
                />
                {goalErrors.targetCgpa && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {goalErrors.targetCgpa}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="nextCredits">Next Semester Credits</Label>
                <Input
                  id="nextCredits"
                  type="number"
                  min="1"
                  value={nextCredits}
                  onChange={(e) => {
                    setNextCredits(e.target.value);
                    if (goalErrors.nextCredits) {
                      setGoalErrors((prev) => ({ ...prev, nextCredits: "" }));
                    }
                  }}
                  placeholder="e.g., 15"
                  className={goalErrors.nextCredits ? "border-red-500" : ""}
                />
                {goalErrors.nextCredits && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {goalErrors.nextCredits}
                  </p>
                )}
              </div>
            </div>

            {targetCgpa && nextCredits && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Goal Analysis</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    Current CGPA:{" "}
                    <span className="font-medium">
                      {currentCgpa.toFixed(2)}
                    </span>
                  </p>
                  <p>
                    Completed Credits:{" "}
                    <span className="font-medium">{completedCredits}</span>
                  </p>
                  <p>
                    Next Semester Credits:{" "}
                    <span className="font-medium">{nextCredits}</span>
                  </p>
                  {(() => {
                    const target = parseFloat(targetCgpa);
                    const credits = parseFloat(nextCredits);
                    if (!isNaN(target) && !isNaN(credits)) {
                      const result = getTargetGpaResult(
                        currentCgpa,
                        completedCredits,
                        credits,
                        target,
                        gpaScale,
                      );
                      return (
                        <>
                          <p>
                            Required SGPA:{" "}
                            <span className="font-medium">
                              {result.requiredSgpa.toFixed(2)}
                            </span>
                          </p>
                          <p>
                            Difficulty:{" "}
                            <Badge
                              variant={
                                result.difficulty === "ACHIEVABLE"
                                  ? "default"
                                  : result.difficulty === "CHALLENGING"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {result.difficulty}
                            </Badge>
                          </p>
                          {result.message && (
                            <p
                              className={
                                result.isFeasible
                                  ? "text-muted-foreground"
                                  : "text-red-600"
                              }
                            >
                              {result.message}
                            </p>
                          )}
                        </>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            )}

            <Button
              onClick={handleGoalSetup}
              disabled={!canProceedToSubjects}
              className="w-full"
            >
              Continue to Add Subjects
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === "subjects" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Add Your Subjects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="subjectName">Subject Name</Label>
                <Input
                  id="subjectName"
                  value={subjectName}
                  onChange={(e) => {
                    setSubjectName(e.target.value);
                    if (subjectErrors.name) {
                      setSubjectErrors((prev) => ({ ...prev, name: "" }));
                    }
                  }}
                  placeholder="e.g., Data Structures"
                  className={subjectErrors.name ? "border-red-500" : ""}
                />
                {subjectErrors.name && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {subjectErrors.name}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="subjectCredits">Credits</Label>
                <Input
                  id="subjectCredits"
                  type="number"
                  min="1"
                  value={subjectCredits}
                  onChange={(e) => {
                    setSubjectCredits(e.target.value);
                    if (subjectErrors.credits) {
                      setSubjectErrors((prev) => ({ ...prev, credits: "" }));
                    }
                  }}
                  placeholder="e.g., 3"
                  className={subjectErrors.credits ? "border-red-500" : ""}
                />
                {subjectErrors.credits && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {subjectErrors.credits}
                  </p>
                )}
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAddSubject}
                  className="w-full"
                  disabled={
                    !targetResult?.isFeasible ||
                    safeCompare(remainingCredits, 0) <= 0
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span>Remaining credits</span>
                <span
                  className={`font-semibold ${
                    safeCompare(remainingCredits, 0) === 0
                      ? "text-emerald-600"
                      : safeCompare(remainingCredits, 0) === 1
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {remainingCredits.toFixed(1)}
                </span>
              </div>
              {safeCompare(remainingCredits, 0) === 1 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Add {remainingCredits.toFixed(1)} more credits or reduce next
                  semester credits.
                </p>
              )}
            </div>

            {subjects.length > 0 && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Expected Grade</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.credits}</TableCell>
                        <TableCell>
                          <Select
                            value={item.grade}
                            onValueChange={(grade) =>
                              handleUpdateSubjectGrade(item.id, grade)
                            }
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {allowedGrades.map((grade) => (
                                <SelectItem key={grade} value={grade}>
                                  {grade}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveSubject(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentStep("goal")}>
                Back to Goal Setup
              </Button>
              <Button
                onClick={() => setCurrentStep("generate")}
                disabled={!canProceedToGenerate}
                className="flex-1"
              >
                Generate Recommendations
              </Button>
            </div>
            {!canProceedToGenerate && subjects.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Add subjects and match the semester credit total to generate
                plans.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === "generate" && (
        <Card>
          <CardHeader>
            <CardTitle>Generating Personalized Plans...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Analyzing your academic history and generating optimal grade
                combinations...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "results" && (
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Academic Plans</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {recommendations.map((plan, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Plan {index + 1}</h4>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      SGPA {plan.sgpa.toFixed(2)}
                    </Badge>
                    <Badge
                      variant={
                        plan.difficulty === "ACHIEVABLE"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {plan.difficulty}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {plan.combination.map((entry, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-2 bg-muted rounded"
                    >
                      <span className="text-sm">{entry.subject.name}</span>
                      <Badge variant="outline">{entry.grade}</Badge>
                    </div>
                  ))}
                </div>

              </div>
            ))}

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("subjects")}
              >
                Modify Subjects
              </Button>
              <Button
                onClick={() => {
                  setCurrentStep("goal");
                  setSubjects([]);
                  setRecommendations([]);
                  setTargetResult(null);
                }}
              >
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
