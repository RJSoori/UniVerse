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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { useGpaCalculator } from "../../hooks/useGpaCalculator";
import { SubjectForm } from "./SubjectForm";
import { GRADES, YEARS, SEMESTERS } from "./constants";

interface SemesterManagerProps {}

export function SemesterManager(/* props removed, showAll unused */): JSX.Element {
  const {
    semesters,
    addSemester,
    updateSemester,
    deleteSemester,
    updateSubject,
    getSemesterGpa,
  } = useGpaCalculator();

  const [showAddSemester, setShowAddSemester] = useState(false);
  const [editingSemester, setEditingSemester] = useState<string | null>(null);
  const [newSemester, setNewSemester] = useState({ year: "", semester: "" });
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<{
    name: string;
    credits: string;
    grade: string;
  } | null>(null);

  const handleAddSemester = () => {
    if (newSemester.year && newSemester.semester) {
      addSemester(newSemester.year, newSemester.semester);
      setNewSemester({ year: "", semester: "" });
      setShowAddSemester(false);
    }
  };

  const handleEditSemester = (id: string) => {
    const sem = semesters.find((s) => s.id === id);
    if (sem) {
      setNewSemester({ year: sem.year, semester: sem.semester });
      setEditingSemester(id);
      setShowAddSemester(true);
    }
  };

  const handleUpdateSemester = () => {
    if (editingSemester && newSemester.year && newSemester.semester) {
      updateSemester(editingSemester, {
        year: newSemester.year,
        semester: newSemester.semester,
      });
      setNewSemester({ year: "", semester: "" });
      setEditingSemester(null);
      setShowAddSemester(false);
    }
  };

  // showing all semesters unconditionally
  const displayedSemesters = semesters;

  return (
    <div className="space-y-6">
      {/* Add Semester Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Academic Semesters</h3>
        <Dialog open={showAddSemester} onOpenChange={setShowAddSemester}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Semester
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSemester ? "Edit Semester" : "Add New Semester"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select
                  value={newSemester.year}
                  onValueChange={(value) =>
                    setNewSemester({ ...newSemester, year: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select
                  value={newSemester.semester}
                  onValueChange={(value) =>
                    setNewSemester({ ...newSemester, semester: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((sem) => (
                      <SelectItem key={sem} value={sem}>
                        {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={
                    editingSemester ? handleUpdateSemester : handleAddSemester
                  }
                  className="flex-1"
                >
                  {editingSemester ? "Update" : "Add"} Semester
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddSemester(false);
                    setEditingSemester(null);
                    setNewSemester({ year: "", semester: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Semesters List */}
      <div className="grid gap-4">
        {displayedSemesters.map((sem) => (
          <Card key={sem.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  {sem.year} - {sem.semester}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    GPA: {getSemesterGpa(sem.id).toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSemester(sem.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSemester(sem.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sem.subjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No subjects added yet.
                </p>
              ) : (
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
                    {sem.subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        {editingSubjectId === subject.id && editingSubject ? (
                          <>
                            <TableCell>
                              <Input
                                size="sm"
                                value={editingSubject.name}
                                onChange={(e) =>
                                  setEditingSubject({
                                    ...editingSubject,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                size="sm"
                                type="number"
                                value={editingSubject.credits}
                                onChange={(e) =>
                                  setEditingSubject({
                                    ...editingSubject,
                                    credits: e.target.value,
                                  })
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                size="sm"
                                value={editingSubject.grade}
                                onValueChange={(value) =>
                                  setEditingSubject({
                                    ...editingSubject,
                                    grade: value,
                                  })
                                }
                              >
                                <SelectTrigger className="w-20 text-sm">
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
                            <TableCell className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (editingSubject) {
                                    updateSubject(sem.id, subject.id, {
                                      name: editingSubject.name,
                                      credits: parseFloat(
                                        editingSubject.credits,
                                      ),
                                      grade: editingSubject.grade,
                                    });
                                  }
                                  setEditingSubjectId(null);
                                  setEditingSubject(null);
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingSubjectId(null);
                                  setEditingSubject(null);
                                }}
                              >
                                Cancel
                              </Button>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{subject.name}</TableCell>
                            <TableCell>{subject.credits}</TableCell>
                            <TableCell>{subject.grade}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingSubjectId(subject.id);
                                  setEditingSubject({
                                    name: subject.name,
                                    credits: subject.credits.toString(),
                                    grade: subject.grade,
                                  });
                                }}
                              >
                                Edit
                              </Button>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="mt-4">
                <SubjectForm semesterId={sem.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
