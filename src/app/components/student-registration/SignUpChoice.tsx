import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { GraduationCap, Store, Briefcase } from "lucide-react";

export default function SignUpChoice({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Start your journey</h2>
          <p className="text-muted-foreground">Select your role to join the UniVerse ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {/* Student Column */}
          <Card className="flex flex-col hover:border-primary transition-all group">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="text-primary size-8" />
              </div>
              <CardTitle>Student</CardTitle>
              <CardDescription>
                Access productivity tools, GPA calculators, and student resources.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                  className="w-full"
                  onClick={() => onNavigate("student-auth-choice")}
              >
                Join as Student
              </Button>
            </CardContent>
          </Card>

          {/* Seller Column */}
          <Card className="flex flex-col hover:border-primary transition-all group">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <Store className="text-primary size-8" />
              </div>
              <CardTitle>Seller</CardTitle>
              <CardDescription>
                Showcase your products or services to the UniVerse community.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => onNavigate("seller-register")}
              >
                Join as Seller
              </Button>
            </CardContent>
          </Card>

          {/* Job Poster Column */}
          <Card className="flex flex-col hover:border-primary transition-all group">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                <Briefcase className="text-primary size-8" />
              </div>
              <CardTitle>Job Poster</CardTitle>
              <CardDescription>
                Post opportunities and connect with talent across the university.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onNavigate("jobposter-register")}
              >
                Join as Recruiter
              </Button>
            </CardContent>
          </Card>
        </div>

        <Button
            variant="ghost"
            className="mt-8 text-muted-foreground"
            onClick={() => onNavigate("landing")}
        >
          Back to Home
        </Button>
      </div>
  );
}