import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Trash2, Calculator } from "lucide-react";

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

const gradePoints: { [key: string]: number } = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  F: 0.0,
};

export function GPACalculator() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState({
    name: "",
    credits: "3",
    grade: "A",
  });

  const addCourse = () => {
    if (!newCourse.name) return;

    const course: Course = {
      id: Date.now().toString(),
      name: newCourse.name,
      credits: parseInt(newCourse.credits) || 3,
      grade: newCourse.grade,
    };

    setCourses([...courses, course]);
    setNewCourse({
      name: "",
      credits: "3",
      grade: "A",
    });
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const calculateGPA = () => {
    if (courses.length === 0) return "0.00";

    const totalPoints = courses.reduce((sum, course) => {
      return sum + gradePoints[course.grade] * course.credits;
    }, 0);

    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  const getTotalCredits = () => {
    return courses.reduce((sum, course) => sum + course.credits, 0);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Add Course</CardTitle>
            <CardDescription>Enter your course details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Course Name</Label>
              <Input
                placeholder="e.g., Introduction to Computer Science"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Credits</Label>
                <Input
                  type="number"
                  min="1"
                  max="6"
                  value={newCourse.credits}
                  onChange={(e) => setNewCourse({ ...newCourse, credits: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Grade</Label>
                <Select
                  value={newCourse.grade}
                  onValueChange={(v) => setNewCourse({ ...newCourse, grade: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(gradePoints).map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade} ({gradePoints[grade].toFixed(1)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={addCourse} className="w-full">
              <Plus className="mr-2 size-4" />
              Add Course
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="size-5" />
              GPA Results
            </CardTitle>
            <CardDescription>Your calculated GPA</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Cumulative GPA</p>
              <p className="text-6xl font-semibold">{calculateGPA()}</p>
              <p className="text-sm text-muted-foreground">Out of 4.00</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-semibold">{courses.length}</p>
                <p className="text-sm text-muted-foreground">Courses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">{getTotalCredits()}</p>
                <p className="text-sm text-muted-foreground">Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course List</CardTitle>
          <CardDescription>Your added courses</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No courses added yet. Add your first course above.
            </p>
          ) : (
            <div className="space-y-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{course.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{course.credits} credits</span>
                      <span>•</span>
                      <span>Grade: {course.grade}</span>
                      <span>•</span>
                      <span>Points: {gradePoints[course.grade].toFixed(1)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCourse(course.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
