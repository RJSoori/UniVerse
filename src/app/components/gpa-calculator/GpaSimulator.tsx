import { useMemo, useState, FormEvent } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AlertCircle, Trash2, Plus } from "lucide-react";
import { useGpaCalculator } from "../../hooks/useGpaCalculator";
import {
  calculateSemesterGpa,
  getEffectiveGpaScale,
} from "./utils/gpaPrediction";
import { assignCategory } from "../../utils/gpaPerformanceUtils";
import { getAllowedGrades } from "../../utils/validation";

export function GpaSimulator() {
  const {
    simulationSubjects,
    addSimulationSubject,
    deleteSimulationSubject,
    clearSimulationSubjects,
    getCgpa,
    getGpaCredits,
    settings,
  } = useGpaCalculator();

  const [subject, setSubject] = useState({
    name: "",
    credits: "",
    grade: "A",
    isGpa: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const gpaScale = getEffectiveGpaScale(settings);
  const allowedGrades = useMemo(() => getAllowedGrades(gpaScale), [gpaScale]);
  const completedGpaCredits = getGpaCredits();
  const currentCgpa = getCgpa();
  const projectionSgpa = calculateSemesterGpa(simulationSubjects, gpaScale);
  const simulationCredits = simulationSubjects.reduce(
    (sum, item) => sum + item.credits,
    0,
  );
  const projectedCgpa =
    simulationCredits > 0
      ? (currentCgpa * completedGpaCredits +
          projectionSgpa * simulationCredits) /
        (completedGpaCredits + simulationCredits)
      : currentCgpa;

  const handleAdd = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});

    const result = addSimulationSubject({
      name: subject.name,
      credits: subject.credits,
      grade: subject.grade,
      category: assignCategory(subject.name),
    });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setSubject({
      name: "",
      credits: "",
      grade: allowedGrades[0] ?? "A",
      isGpa: true,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Persistent Grade Simulator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={handleAdd}
            className="grid grid-cols-1 lg:grid-cols-4 gap-4"
          >
            <div className="space-y-2">
              <Label className="text-xs">Subject</Label>
              <Input
                value={subject.name}
                onChange={(e) => {
                  setSubject({ ...subject, name: e.target.value });
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="e.g. Data Structures"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Credits</Label>
              <Input
                type="number"
                value={subject.credits}
                onChange={(e) => {
                  setSubject({ ...subject, credits: e.target.value });
                  if (errors.credits) {
                    setErrors((prev) => ({ ...prev, credits: "" }));
                  }
                }}
                placeholder="3"
                min="0.5"
                step="0.5"
                className={errors.credits ? "border-red-500" : ""}
              />
              {errors.credits && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.credits}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Grade</Label>
              <Select
                value={subject.grade}
                onValueChange={(value) =>
                  setSubject({ ...subject, grade: value })
                }
              >
                <SelectTrigger>
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
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4" />
                Add Subject
              </Button>
              <Button
                variant="outline"
                onClick={() => clearSimulationSubjects()}
                className="w-full"
              >
                Clear
              </Button>
            </div>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Projected SGPA</p>
              <p className="text-2xl font-bold">{projectionSgpa.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Projected CGPA</p>
              <p className="text-2xl font-bold">{projectedCgpa.toFixed(2)}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">
                Simulation Credits
              </p>
              <p className="text-2xl font-bold">{simulationCredits}</p>
            </div>
          </div>

          {simulationSubjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add subjects with valid grades and credits to compute your
              projected GPA.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simulationSubjects.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.credits}</TableCell>
                    <TableCell>{item.grade}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSimulationSubject(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
