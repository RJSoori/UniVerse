import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { GraduationCap, Building2, ShoppingBag, ArrowRight } from "lucide-react";

interface SignUpChoiceProps {
  onNavigate: (section: string) => void;
}

export function SignUpChoice({ onNavigate }: SignUpChoiceProps) {
  return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Path 01: Students (Handled by Registration Team) */}
          <Card className="relative overflow-hidden group hover:border-primary transition-all duration-300">
            <CardHeader className="space-y-1">
              <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <GraduationCap className="size-6" />
              </div>
              <CardTitle className="text-xl">I am a Student</CardTitle>
              <CardDescription className="text-sm">
                Access your dashboard to manage academic progress, finances, and habits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => onNavigate("student-choice")}>
                Student Portal <ArrowRight className="ml-2 size-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Path 02: Job Recruiters (YOUR RESPONSIBILITY) */}
          <Card className="relative overflow-hidden group hover:border-primary transition-all duration-300 border-2 border-transparent">
            <CardHeader className="space-y-1">
              <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <Building2 className="size-6" />
              </div>
              <CardTitle className="text-xl">I am a Recruiter</CardTitle>
              <CardDescription className="text-sm">
                Register your organization and post job opportunities for undergraduates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-white transition-all"
                  onClick={() => onNavigate("post-jobs")}
              >
                Partner Portal <ArrowRight className="ml-2 size-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Path 03: External Sellers (Handled by Marketplace Team) */}
          <Card className="relative overflow-hidden group hover:border-primary transition-all duration-300">
            <CardHeader className="space-y-1">
              <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <ShoppingBag className="size-6" />
              </div>
              <CardTitle className="text-xl">I am a Seller</CardTitle>
              <CardDescription className="text-sm">
                List academic materials, electronics, or services for the campus community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-white transition-all"
                  onClick={() => onNavigate("seller-reg")}
              >
                Seller Portal <ArrowRight className="ml-2 size-4" />
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
  );
}