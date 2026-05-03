import { useMemo, useState } from "react";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/ui/select";
import { Checkbox } from "../../shared/ui/checkbox";
import { AlertCircle, Plus } from "lucide-react";
import { useGpaCalculator } from "./hooks/useGpaCalculator";
import { getEffectiveGpaScale } from "./utils/gpaPrediction";
import { getAllowedGrades } from "../../shared/validation";

interface SubjectFormProps {
  semesterId: string;
  onSubjectAdded?: () => void;
}

export function SubjectForm({ semesterId, onSubjectAdded }: SubjectFormProps) {
  const { addSubject, settings } = useGpaCalculator();
  const gpaScale = getEffectiveGpaScale(settings);
  const allowedGrades = useMemo(() => getAllowedGrades(gpaScale), [gpaScale]);
  const [subject, setSubject] = useState({
    name: "",
    credits: "",
    grade: allowedGrades[0] ?? "A",
    isGpa: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});

    const result = addSubject(semesterId, {
      name: subject.name,
      credits: subject.credits,
      grade: subject.grade,
      isGpa: subject.isGpa,
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
    onSubjectAdded?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1 space-y-2">
        <Label className="text-xs">Subject Name</Label>
        <Input
          placeholder="e.g. Mathematics"
          value={subject.name}
          onChange={(e) => {
            setSubject({ ...subject, name: e.target.value });
            if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
          }}
          className={`text-sm ${errors.name ? "border-red-500" : ""}`}
          required
        />
        {errors.name && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.name}
          </p>
        )}
      </div>
      <div className="w-20 space-y-2">
        <Label className="text-xs">Credits</Label>
        <Input
          type="number"
          placeholder="3"
          value={subject.credits}
          onChange={(e) => {
            setSubject({ ...subject, credits: e.target.value });
            if (errors.credits) setErrors((prev) => ({ ...prev, credits: "" }));
          }}
          className={`text-sm ${errors.credits ? "border-red-500" : ""}`}
          min="0.5"
          step="0.5"
          required
        />
        {errors.credits && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.credits}
          </p>
        )}
      </div>
      <div className="w-20 space-y-2">
        <Label className="text-xs">Grade</Label>
        <Select
          value={subject.grade}
          onValueChange={(value) => {
            setSubject({ ...subject, grade: value });
            if (errors.grade) setErrors((prev) => ({ ...prev, grade: "" }));
          }}
        >
          <SelectTrigger className="text-sm">
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
        {errors.grade && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.grade}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={subject.isGpa}
          onCheckedChange={(checked) =>
            setSubject({ ...subject, isGpa: checked as boolean })
          }
        />
        <Label className="text-xs">GPA</Label>
      </div>
      <Button type="submit" size="sm">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
}
