import { useState } from "react";
import { useUniStorage } from "../hooks/useUniStorage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { Plus, Trash2, GraduationCap, Calculator} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

export function GPACalculator() {
  const [subjects, setSubjects] = useUniStorage<Subject[]>("university-grades", []);
  const [useExtraWeight, setUseExtraWeight] = useUniStorage<boolean>("gpa-use-extra-weight", true);

  const [newSubject, setNewSubject] = useState({
    name: "",
    credits: "",
    grade: "A",
  });

  // Dynamic Grade Points logic
  const getGradePoint = (grade: string): number => {
    const points: Record<string, number> = {
      "A+": useExtraWeight ? 4.2 : 4.0, // Toggleable A+ value
      "A": 4.0,
      "A-": 3.7,
      "B+": 3.3,
      "B": 3.0,
      "B-": 2.7,
      "C+": 2.3,
      "C": 2.0,
      "C-": 1.5,
      "D": 1.0,
      "F": 0.0,
    };
    return points[grade] || 0;
  };

  const addSubject = () => {
    if (!newSubject.name || !newSubject.credits) return;
    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubject.name,
      credits: parseFloat(newSubject.credits),
      grade: newSubject.grade,
    };
    setSubjects([...subjects, subject]);
    setNewSubject({ name: "", credits: "", grade: "A" });
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const calculateGPA = () => {
    if (subjects.length === 0) return "0.00";
    let totalPoints = 0;
    let totalCredits = 0;
    subjects.forEach((s) => {
      totalPoints += getGradePoint(s.grade) * s.credits;
      totalCredits += s.credits;
    });
    return (totalPoints / totalCredits).toFixed(2);
  };

  return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardDescription>Current GPA</CardDescription>
              <CardTitle className="text-4xl flex items-center gap-2">
                <GraduationCap className="size-8 text-primary" />
                {calculateGPA()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>A+ = {useExtraWeight ? "4.2" : "4.0"}</span>
                <div className="flex items-center gap-2">
                  <Label htmlFor="weight-toggle">Extra Weight</Label>
                  <Switch
                      id="weight-toggle"
                      checked={useExtraWeight}
                      onCheckedChange={setUseExtraWeight}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader><CardTitle>Add New Module</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="sm:col-span-2 space-y-2">
                  <Label>Module Name</Label>
                  <Input
                      placeholder="e.g. Software Engineering"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Credits</Label>
                  <Input
                      type="number"
                      value={newSubject.credits}
                      onChange={(e) => setNewSubject({...newSubject, credits: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grade</Label>
                  <Select value={newSubject.grade} onValueChange={(v) => setNewSubject({...newSubject, grade: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"].map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={addSubject} className="w-full mt-4">
                <Plus className="mr-2 size-4" /> Add Subject
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="size-5" />
              <CardTitle>Academic Records</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {subjects.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No records added yet.</p>
              ) : (
                  subjects.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                        <div>
                          <h4 className="font-medium">{s.name}</h4>
                          <p className="text-xs text-muted-foreground">{s.credits} Credits • Grade: {s.grade}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono font-semibold">{getGradePoint(s.grade).toFixed(1)}</span>
                          <Button variant="ghost" size="sm" onClick={() => deleteSubject(s.id)} className="text-destructive">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}