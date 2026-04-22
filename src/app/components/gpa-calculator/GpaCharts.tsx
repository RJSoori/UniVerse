import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useGpaCalculator } from "../../hooks/useGpaCalculator";

export function GpaCharts() {
  const { semesters, getSemesterGpa, getCgpa } = useGpaCalculator();

  const semesterData = useMemo(
    () =>
      semesters.map((sem) => ({
        semester: `${sem.year} ${sem.semester}`,
        gpa: getSemesterGpa(sem.id),
      })),
    [semesters, getSemesterGpa],
  );

  const gradeData = useMemo(() => {
    const distribution: Record<string, number> = {};
    semesters.forEach((sem) => {
      sem.subjects.forEach((subject) => {
        distribution[subject.grade] = (distribution[subject.grade] || 0) + 1;
      });
    });
    return Object.entries(distribution).map(([grade, count]) => ({
      grade,
      count,
    }));
  }, [semesters]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            GPA Trend Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={semesterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis domain={[0, 4.2]} />
                <Tooltip
                  formatter={(value: number) => [value.toFixed(2), "GPA"]}
                  labelFormatter={(label) => `Semester: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="gpa"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [value, "Subjects"]}
                  labelFormatter={(label) => `Grade: ${label}`}
                />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current CGPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {getCgpa().toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Based on {semesters.length} semester
              {semesters.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Latest Semester GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {semesters.length > 0
                ? getSemesterGpa(semesters[semesters.length - 1].id).toFixed(2)
                : "0.00"}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {semesters.length > 0
                ? `${semesters[semesters.length - 1].year} ${semesters[semesters.length - 1].semester}`
                : "No semesters"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
