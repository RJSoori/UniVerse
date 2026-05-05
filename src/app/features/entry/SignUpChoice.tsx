import { Button } from "../../shared/ui/button";
import { useNavigate } from "react-router-dom";

export default function SignUpChoice() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground text-center">
      <h2 className="text-2xl font-bold mb-12">Start your journey as</h2>

      {/* Cards + Buttons aligned */}
      <div className="flex flex-row gap-12">
        {/* Student Column */}
        <div className="flex flex-col items-center gap-6 w-64">
          <div className="bg-card border border-border rounded-lg shadow-md p-6 w-full h-40 flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div>
              <h3 className="text-xl font-semibold text-primary mb-2">Student</h3>
              <p className="text-muted-foreground text-sm">
                Learn, grow, and connect with opportunities tailored for students.
              </p>
            </div>
          </div>
          <Button
            className="bg-primary w-full py-3 text-lg shadow-md hover:scale-105 transition-transform"
            onClick={() => navigate("/signup/student")}
          >
            Student
          </Button>
        </div>

        {/* Seller Column */}
        <div className="flex flex-col items-center gap-6 w-64">
          <div className="bg-card border border-border rounded-lg shadow-md p-6 w-full h-40 flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div>
              <h3 className="text-xl font-semibold text-primary mb-2">Seller</h3>
              <p className="text-muted-foreground text-sm">
                Showcase your products or services and reach the UniVerse community.
              </p>
            </div>
          </div>
          <Button
            className="bg-primary w-full py-3 text-lg shadow-md hover:scale-105 transition-transform"
            onClick={() => navigate("/seller/register")}
          >
            Seller
          </Button>
        </div>

        {/* Job Poster Column */}
        <div className="flex flex-col items-center gap-6 w-64">
          <div className="bg-card border border-border rounded-lg shadow-md p-6 w-full h-40 flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div>
              <h3 className="text-xl font-semibold text-primary mb-2">Job Poster</h3>
              <p className="text-muted-foreground text-sm">
                Post opportunities and connect with talent across UniVerse.
              </p>
            </div>
          </div>
          <Button
            className="bg-primary w-full py-3 text-lg shadow-md hover:scale-105 transition-transform"
            onClick={() => navigate("/recruiter/register")}
          >
            Job Poster
          </Button>
        </div>
      </div>
    </div>
  );
}
