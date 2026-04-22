import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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
import { Plus, Trash2, Target } from "lucide-react";
import { useGpaCalculator } from "../../hooks/useGpaCalculator";

import { GRADES } from "./constants";

export function GpaProjectionTool() {
  const {
    projection,
    addProjectionSubject,
    updateProjectionSubject,
    deleteProjectionSubject,
    clearProjection,
  } = useGpaCalculator();

  const [newSubject, setNewSubject] = useState({
    name: "",
    credits: "",
    grade: "A",
  });

  const handleAddSubject = () => {
    if (newSubject.name && newSubject.credits) {
      addProjectionSubject({
        name: newSubject.name,
        credits: parseFloat(newSubject.credits),
        grade: newSubject.grade,
      });
      setNewSubject({ name: "", credits: "", grade: "A" });
    }
  };

  const handleGradeChange = (id: string, grade: string) => {
    updateProjectionSubject(id, { grade });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            GPA Projection Simulator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Simulate your GPA for upcoming subjects. This is a temporary
            calculation and won't be saved.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Subject Form */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label>Subject Name</Label>
              <Input
                placeholder="e.g. Advanced Programming"
                value={newSubject.name}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, name: e.target.value })
                }
              />
            </div>
            <div className="w-20 space-y-2">
              <Label>Credits</Label>
              <Input
                type="number"
                placeholder="3"
                value={newSubject.credits}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, credits: e.target.value })
                }
              />
            </div>
            <div className="w-20 space-y-2">
              <Label>Expected Grade</Label>
              <Select
                value={newSubject.grade}
                onValueChange={(value) =>
                  setNewSubject({ ...newSubject, grade: value })
                }
              >
                <SelectTrigger>
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
            <Button onClick={handleAddSubject}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Projected GPA Display */}
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              Projected GPA: {projection.projectedGpa.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Based on {projection.subjects.length} subject
              {projection.subjects.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Subjects Table */}
          {projection.subjects.length > 0 && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projection.subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell>{subject.credits}</TableCell>
                      <TableCell>
                        <Select
                          value={subject.grade}
                          onValueChange={(value) =>
                            handleGradeChange(subject.id, value)
                          }
                        >
                          <SelectTrigger className="w-20">
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
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProjectionSubject(subject.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end">
                <Button variant="outline" onClick={clearProjection}>
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
