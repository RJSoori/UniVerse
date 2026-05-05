import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card";
import { Badge } from "../../shared/ui/badge";
import { GraduationCap, TrendingUp } from "lucide-react";
import { useGpaCalculator } from "../gpa-calculator/hooks/useGpaCalculator";

interface GpaWidgetProps {
  onNavigate: (section: string) => void;
  compact?: boolean;
}

export function GpaWidget({ onNavigate, compact = false }: GpaWidgetProps) {
  const { getCgpa, getDegreeClass, semesters, getSemesterGpa } =
    useGpaCalculator();

  const cgpa = getCgpa();
  const degreeClass = getDegreeClass();
  const latestSemester = semesters[semesters.length - 1];
  const latestGpa = latestSemester ? getSemesterGpa(latestSemester.id) : 0;

  if (compact) {
    return (
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onNavigate("gpa")}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">GPA</span>
            </div>
            <span className="text-lg font-bold">{cgpa.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{degreeClass}</span>
            <span>{semesters.length} sem</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onNavigate("gpa")}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="h-5 w-5 text-primary" />
          Academic Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {cgpa.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">CGPA</p>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold">{latestGpa.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Last Semester</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {degreeClass}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {semesters.length} semester{semesters.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>Click to view detailed analytics</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
