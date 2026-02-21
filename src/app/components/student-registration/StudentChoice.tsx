import { Button } from "../ui/button";

export default function StudentChoice({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-card text-center">
      <h2 className="text-2xl font-bold mb-12">Welcome, Student</h2>
      <p className="text-gray-600 mb-8">
        Choose whether to create a new account or sign in to your existing one.
      </p>

      <div className="flex flex-row gap-12">
        {/* Sign Up Card */}
        <div className="flex flex-col items-center gap-6 w-64">
          <div className="bg-white rounded-lg shadow-md p-6 w-full h-32 flex flex-col justify-center hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Sign Up</h3>
            <p className="text-gray-600 text-sm">
              Create your student profile and start your journey.
            </p>
          </div>
          <Button
            className="bg-primary w-full py-3 text-lg shadow-md hover:scale-105 transition-transform"
            onClick={() => onNavigate("student-auth-choice")}
          >
            Sign Up
          </Button>
        </div>

        {/* Sign In Card */}
        <div className="flex flex-col items-center gap-6 w-64">
          <div className="bg-white rounded-lg shadow-md p-6 w-full h-32 flex flex-col justify-center hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Sign In</h3>
            <p className="text-gray-600 text-sm">
              Access your existing student account.
            </p>
          </div>
          <Button
            className="bg-blue-600 text-white w-full py-3 text-lg shadow-md hover:scale-105 transition-transform"
            onClick={() => onNavigate("signin")}
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
}
