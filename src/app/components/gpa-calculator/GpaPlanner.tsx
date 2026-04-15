import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { TargetGpaPlanner } from "./TargetGpaPlanner";
import { GpaSimulator } from "./GpaSimulator";
import { GpaRecommendations } from "./GpaRecommendations";

export function GpaPlanner() {
  const [activeTab, setActiveTab] = useState("target");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>GPA Planner</CardTitle>
          </CardHeader>
          <CardContent>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="target">Target Planner</TabsTrigger>
              <TabsTrigger value="simulator">Grade Simulator</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        <TabsContent value="target">
          <TargetGpaPlanner />
        </TabsContent>
        <TabsContent value="simulator">
          <GpaSimulator />
        </TabsContent>
        <TabsContent value="recommendations">
          <GpaRecommendations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
