import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Badge } from "../../shared/ui/badge";
import { Settings, Award } from "lucide-react";
import { useGpaCalculator } from "./hooks/useGpaCalculator";

export function DegreeClassification() {
  const { settings, updateSettings, getCgpa, getDegreeClass } =
    useGpaCalculator();
  const [isEditing, setIsEditing] = useState(false);
  const [tempThresholds, setTempThresholds] = useState(settings.degreeClasses);

  const cgpa = getCgpa();
  const currentClass = getDegreeClass();

  const handleSave = async () => {
    const ok = await updateSettings({ degreeClasses: tempThresholds });
    if (ok) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempThresholds(settings.degreeClasses);
    setIsEditing(false);
  };

  const getClassColor = (className: string) => {
    switch (className) {
      case "First Class":
        return "bg-yellow-100 text-yellow-800";
      case "Second Upper":
        return "bg-green-100 text-green-800";
      case "Second Lower":
        return "bg-blue-100 text-blue-800";
      case "General Degree":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Degree Classification
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel" : "Customize"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-muted/50 rounded-lg">
          <div className="text-2xl font-bold mb-2">
            Current CGPA: {cgpa.toFixed(2)}
          </div>
          <Badge className={getClassColor(currentClass)}>{currentClass}</Badge>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Class (≥)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={tempThresholds.firstClass}
                  onChange={(e) =>
                    setTempThresholds({
                      ...tempThresholds,
                      firstClass: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Second Upper (≥)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={tempThresholds.secondUpper}
                  onChange={(e) =>
                    setTempThresholds({
                      ...tempThresholds,
                      secondUpper: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Second Lower (≥)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={tempThresholds.secondLower}
                  onChange={(e) =>
                    setTempThresholds({
                      ...tempThresholds,
                      secondLower: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>General Degree (≥)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={tempThresholds.general}
                  onChange={(e) =>
                    setTempThresholds({
                      ...tempThresholds,
                      general: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">First Class</span>
              <span className="text-sm text-muted-foreground">
                ≥ {settings.degreeClasses.firstClass}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Second Upper</span>
              <span className="text-sm text-muted-foreground">
                ≥ {settings.degreeClasses.secondUpper}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Second Lower</span>
              <span className="text-sm text-muted-foreground">
                ≥ {settings.degreeClasses.secondLower}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">General Degree</span>
              <span className="text-sm text-muted-foreground">
                ≥ {settings.degreeClasses.general}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="font-medium">Academic Warning</span>
              <span className="text-sm text-muted-foreground">
                &lt; {settings.degreeClasses.general}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
