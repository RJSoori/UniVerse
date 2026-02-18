import { Button } from "./ui/button";

export default function Landing({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen 
                    bg-gradient-to-b from-indigo-900 via-purple-900 to-black 
                    text-center relative overflow-hidden">
      {/* Headings */}
      <h2 className="text-4xl font-semibold text-indigo-300 mb-4">Welcome to</h2>
      <h1 className="text-7xl font-extrabold tracking-tight text-white mb-24">
        UniVerse
      </h1>

      {/* Buttons */}
      <div className="flex flex-col gap-10 w-full max-w-sm">
        <Button
          className="w-full py-4 text-lg 
                     bg-gradient-to-r from-blue-500 to-indigo-600 
                     text-white shadow-lg hover:scale-105 transition-transform"
          onClick={() => onNavigate("signup")}
        >
          Sign Up
        </Button>
        <Button
          className="w-full py-4 text-lg 
                     bg-gradient-to-r from-purple-500 to-pink-600 
                     text-white shadow-lg hover:scale-105 transition-transform"
          onClick={() => onNavigate("signin")}
        >
          Sign In
        </Button>
      </div>

      {/* Background stars (optional) */}
      <div className="absolute inset-0 bg-[url('/galaxy.jpg')] bg-cover bg-center opacity-20 pointer-events-none"></div>
    </div>
  );
}
