import { useState } from "react";
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
import { Plus } from "lucide-react";
import { useGpaCalculator } from "../../hooks/useGpaCalculator";

interface SubjectFormProps {
  semesterId: string;
  onSubjectAdded?: () => void;
}

import { GRADES } from "./constants";

export function SubjectForm({ semesterId, onSubjectAdded }: SubjectFormProps) {
  const { addSubject } = useGpaCalculator();
  const [subject, setSubject] = useState({
    name: "",
    credits: "",
    grade: "A",
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subject.name.trim() || !subject.credits || !subject.grade) return;

    const creditsNum = parseFloat(subject.credits);
    if (isNaN(creditsNum) || creditsNum <= 0) return;

    addSubject(semesterId, {
      name: subject.name.trim(),
      credits: creditsNum,
      grade: subject.grade,
    });

    // Reset form
    setSubject({ name: "", credits: "", grade: "A" });
    onSubjectAdded?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1 space-y-2">
        <Label className="text-xs">Subject Name</Label>
        <Input
          placeholder="e.g. Mathematics"
          value={subject.name}
          onChange={(e) => setSubject({ ...subject, name: e.target.value })}
          className="text-sm"
          required
        />
      </div>
      <div className="w-20 space-y-2">
        <Label className="text-xs">Credits</Label>
        <Input
          type="number"
          placeholder="3"
          value={subject.credits}
          onChange={(e) => setSubject({ ...subject, credits: e.target.value })}
          className="text-sm"
          min="0.5"
          step="0.5"
          required
        />
      </div>
      <div className="w-20 space-y-2">
        <Label className="text-xs">Grade</Label>
        <Select
          value={subject.grade}
          onValueChange={(value) => setSubject({ ...subject, grade: value })}
        >
          <SelectTrigger className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GRADES.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" size="sm">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
}
