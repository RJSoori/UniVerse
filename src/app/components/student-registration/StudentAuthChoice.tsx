import { Button } from "../ui/button";

export default function StudentAuthChoice({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    // Background: Deep grey to black gradient for a premium feel
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 px-4">
      
      {/* Main Container Card */}
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-200 text-center">
        
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">UniVerse</h2>
          <p className="text-slate-500 mt-2">Your academic journey starts here.</p>
        </div>

        <div className="space-y-10">
          {/* Sign Up Section - The Primary Action */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-full">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">New here?</h3>
              <Button
                className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all duration-200 active:scale-95"
                onClick={() => onNavigate("student-register")}
              >
                Create Account
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-sm">or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Sign In Section - The Secondary Action */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-full">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Returning Student?</h3>
              <Button
                variant="outline"
                className="w-full py-6 text-lg font-semibold border-2 border-slate-200 hover:bg-slate-50 text-slate-700 transition-all duration-200 active:scale-95"
                onClick={() => onNavigate("signin")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-12 text-xs text-slate-400">
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
