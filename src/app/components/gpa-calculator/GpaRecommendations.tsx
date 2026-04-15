import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { useGpaCalculator } from "../../hooks/useGpaCalculator";
import {
  assignCategory,
  analyzePastPerformance,
  buildRecommendations,
  buildRecommendationsV2,
  PlannerSubject,
  CombinationResult,
  PlannerGrade,
} from "./utils/gpaPlannerUtils";
import { getTargetGpaResult } from "./utils/targetGpaCalculator";
import { getEffectiveGpaScale } from "./utils/gpaPrediction";
import {
  validateTargetCgpa,
  validateCreditLimit,
  validateSubjectCredits,
  validateSubjectUniqueness,
  validatePlannerGrade,
  validateSemesterCredits,
  validateSubjectName,
  validateRequiredInputs,
} from "../../utils/validation";

export function GpaRecommendations() {
  const { semesters, getCgpa, getGpaCredits, settings } = useGpaCalculator();
  const [targetCgpa, setTargetCgpa] = useState("");
  const [nextCredits, setNextCredits] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectCredits, setSubjectCredits] = useState("");
  const [subjects, setSubjects] = useState<PlannerSubject[]>([]);
  const [recommendations, setRecommendations] = useState<CombinationResult[]>(
    [],
  );
  const [creditWarning, setCreditWarning] = useState<string>("");
  const [infeasibleMessage, setInfeasibleMessage] = useState<string>("");

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [subjectValidationErrors, setSubjectValidationErrors] = useState<
    Record<string, string>
  >({});

  const gpaScale = getEffectiveGpaScale(settings);
  const currentCgpa = getCgpa();
  const completedCredits = getGpaCredits();

  const performance = useMemo(
    () => analyzePastPerformance(semesters, gpaScale),
    [semesters, gpaScale],
  );

  const handleAddSubject = () => {
    // Clear previous validation errors
    setSubjectValidationErrors({});

    // Validate subject name
    const nameError = validateSubjectName(subjectName);
    if (nameError) {
      setSubjectValidationErrors((prev) => ({ ...prev, name: nameError }));
      return;
    }

    // Validate subject credits
    const creditsError = validateSubjectCredits(subjectCredits);
    if (creditsError) {
      setSubjectValidationErrors((prev) => ({
        ...prev,
        credits: creditsError,
      }));
      return;
    }

    // Check for duplicate subject names
    const existingNames = subjects.map((s) => s.name);
    const uniquenessError = validateSubjectUniqueness(
      existingNames,
      subjectName,
    );
    if (uniquenessError) {
      setSubjectValidationErrors((prev) => ({
        ...prev,
        name: uniquenessError,
      }));
      return;
    }

    const credits = parseFloat(subjectCredits);
    setSubjects([
      ...subjects,
      {
        id: Date.now().toString(),
        name: subjectName.trim(),
        credits,
        category: assignCategory(subjectName),
      },
    ]);
    setSubjectName("");
    setSubjectCredits("");
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects(subjects.filter((subject) => subject.id !== id));
  };

  const handleUpdateSubjectGrade = (id: string, grade: string) => {
    // Validate grade if one is selected
    if (grade) {
      const gradeError = validatePlannerGrade(grade, gpaScale);
      if (gradeError) {
        // Could show a toast or inline error, but for now just prevent the update
        return;
      }
    }

    setSubjects(
      subjects.map((subject) =>
        subject.id === id
          ? { ...subject, lockedGrade: grade as PlannerGrade }
          : subject,
      ),
    );
  };

  const handleGenerate = () => {
    // Clear previous validation errors
    setValidationErrors({});
    setCreditWarning("");
    setInfeasibleMessage("");

    // Validate target CGPA
    const targetCgpaError = validateTargetCgpa(targetCgpa, gpaScale);
    if (targetCgpaError) {
      setValidationErrors((prev) => ({ ...prev, targetCgpa: targetCgpaError }));
      return;
    }

    // Validate semester credits
    const semesterCreditsError = validateSemesterCredits(nextCredits);
    if (semesterCreditsError) {
      setValidationErrors((prev) => ({
        ...prev,
        nextCredits: semesterCreditsError,
      }));
      return;
    }

    const target = parseFloat(targetCgpa);
    const credits = parseFloat(nextCredits);

    // Check credit limit against subjects
    const subjectCredits = subjects.map((s) => s.credits);
    const creditLimitError = validateCreditLimit(subjectCredits, credits);
    if (creditLimitError) {
      setCreditWarning(creditLimitError);
      return;
    }

    // Validate that subjects exist
    if (subjects.length === 0) {
      setValidationErrors((prev) => ({
        ...prev,
        subjects: "Add at least one subject before generating recommendations",
      }));
      return;
    }

    // Validate required inputs for calculation
    const requiredInputsError = validateRequiredInputs(
      { targetCgpa, nextCredits, subjects: subjects.length > 0 },
      ["targetCgpa", "nextCredits", "subjects"],
    );
    if (requiredInputsError) {
      setValidationErrors((prev) => ({
        ...prev,
        general: requiredInputsError,
      }));
      return;
    }

    const result = getTargetGpaResult(
      currentCgpa,
      completedCredits,
      credits,
      target,
      gpaScale,
    );

    const requiredSgpa = result.requiredSgpa;
    if (requiredSgpa > gpaScale + 0.001) {
      setRecommendations([]);
      setInfeasibleMessage(
        `Even a perfect semester (SGPA ${gpaScale.toFixed(1)}) cannot bring your CGPA to ${target.toFixed(2)}. 
        Consider a longer-term plan across multiple semesters.`,
      );
      return;
    }

    // Use Phase 4 architecture (buildRecommendationsV2) with best-first search
    const plans = buildRecommendationsV2(
      subjects,
      requiredSgpa,
      gpaScale,
      performance,
      semesters,
    );
    setRecommendations(plans);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Target CGPA</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={gpaScale}
                value={targetCgpa}
                onChange={(e) => {
                  setTargetCgpa(e.target.value);
                  // Clear validation error when user starts typing
                  if (validationErrors.targetCgpa) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      targetCgpa: "",
                    }));
                  }
                }}
                placeholder="e.g. 3.75"
                className={validationErrors.targetCgpa ? "border-red-500" : ""}
              />
              {validationErrors.targetCgpa && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.targetCgpa}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Next Semester Credits</Label>
              <Input
                type="number"
                min="1"
                value={nextCredits}
                onChange={(e) => {
                  setNextCredits(e.target.value);
                  // Clear validation error when user starts typing
                  if (validationErrors.nextCredits) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      nextCredits: "",
                    }));
                  }
                }}
                placeholder="e.g. 18"
                className={validationErrors.nextCredits ? "border-red-500" : ""}
              />
              {validationErrors.nextCredits && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.nextCredits}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Current GPA Credits</Label>
              <div className="text-lg font-semibold">{completedCredits}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={subjectName}
                onChange={(e) => {
                  setSubjectName(e.target.value);
                  // Clear validation error when user starts typing
                  if (subjectValidationErrors.name) {
                    setSubjectValidationErrors((prev) => ({
                      ...prev,
                      name: "",
                    }));
                  }
                }}
                placeholder="e.g. Mathematics"
                className={subjectValidationErrors.name ? "border-red-500" : ""}
              />
              {subjectValidationErrors.name && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {subjectValidationErrors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Credits</Label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={subjectCredits}
                onChange={(e) => {
                  setSubjectCredits(e.target.value);
                  // Clear validation error when user starts typing
                  if (subjectValidationErrors.credits) {
                    setSubjectValidationErrors((prev) => ({
                      ...prev,
                      credits: "",
                    }));
                  }
                }}
                placeholder="3"
                className={
                  subjectValidationErrors.credits ? "border-red-500" : ""
                }
              />
              {subjectValidationErrors.credits && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {subjectValidationErrors.credits}
                </p>
              )}
            </div>
            <div className="flex items-end gap-2 lg:col-span-2">
              <Button onClick={handleAddSubject} className="w-full">
                <Plus className="h-4 w-4" />
                Add Course
              </Button>
            </div>
          </div>
          {validationErrors.subjects && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.subjects}
              </p>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Lock grade (optional)</TableHead>
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
                        value={item.lockedGrade || ""}
                        onValueChange={(grade) =>
                          handleUpdateSubjectGrade(item.id, grade)
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="C+">C+</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="C-">C-</SelectItem>
                          <SelectItem value="D+">D+</SelectItem>
                          <SelectItem value="D">D</SelectItem>
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

          {creditWarning && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {creditWarning}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={!targetCgpa || !nextCredits || subjects.length === 0}
            className="w-full"
          >
            Generate Recommendations
          </Button>
        </CardContent>
      </Card>

      {!recommendations.length ? (
        infeasibleMessage ? (
          <Card>
            <CardContent>
              <p className="text-sm text-red-600">{infeasibleMessage}</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add next semester subjects and a target CGPA to generate
                recommended grade plans.
              </p>
            </CardContent>
          </Card>
        )
      ) : (
        (() => {
          const subjectCreditsTotal = subjects.reduce(
            (sum, s) => sum + s.credits,
            0,
          );
          return recommendations.map((plan, index) => {
            const projectedCgpa =
              (currentCgpa * completedCredits +
                plan.sgpa * subjectCreditsTotal) /
              (completedCredits + subjectCreditsTotal);
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-sm">
                        Recommendation {index + 1}
                      </CardTitle>
                      <div className="text-xs text-muted-foreground">
                        Difficulty: {plan.difficulty}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">
                        SGPA {plan.sgpa.toFixed(2)}
                      </Badge>
                      <Badge variant="outline">
                        CGPA {projectedCgpa.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {plan.combination.map((entry) => (
                      <div
                        key={entry.subject.id}
                        className="rounded-lg border border-border p-3"
                      >
                        <p className="font-medium">{entry.subject.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Credits: {entry.subject.credits}
                        </p>
                        <p className="text-sm">Grade: {entry.grade}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Why this plan?</p>
                    <p className="text-sm text-muted-foreground">
                      {plan.explanation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          });
        })()
      )}
    </div>
  );
}
