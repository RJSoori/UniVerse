import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { GraduationCap, Lightbulb } from "lucide-react";
import { useGpaCalculator } from "../../hooks/useGpaCalculator";
import { SemesterManager } from "./SemesterManager";
import { GpaCharts } from "./GpaCharts";
import { DegreeClassification } from "./DegreeClassification";
import { GpaProjectionTool } from "./GpaProjectionTool";
import { TargetGpaPlanner } from "./TargetGpaPlanner";

export function GpaCalculator() {
  const {
    getCgpa,
    getDegreeClass,
    getTotalCredits,
    semesters,
    getInsightMessage,
  } = useGpaCalculator();

  const [activeTab, setActiveTab] = useState("overview");

  const cgpa = getCgpa();
  const degreeClass = getDegreeClass();
  const totalCredits = getTotalCredits();
  const insightMessage = getInsightMessage();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current CGPA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{cgpa.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Degree Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-sm">
              {degreeClass}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{totalCredits}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Semesters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{semesters.length}</span>
          </CardContent>
        </Card>
      </div>

      {/* Insight Message */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Academic Insight
              </h4>
              <p className="text-sm text-blue-800">{insightMessage}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="semesters">Semesters</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="projection">Projection</TabsTrigger>
          <TabsTrigger value="planner">Academic Goal Planner</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <SemesterManager />
          <DegreeClassification />
        </TabsContent>

        <TabsContent value="semesters">
          <SemesterManager showAll={true} />
        </TabsContent>

        <TabsContent value="charts">
          <GpaCharts />
        </TabsContent>

        <TabsContent value="projection">
          <GpaProjectionTool />
        </TabsContent>

        <TabsContent value="planner">
          <TargetGpaPlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
}
