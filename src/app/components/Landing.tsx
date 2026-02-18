import { Button } from "./ui/button";

export default function Landing({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen 
                    bg-gradient-to-b from-blue-900 via-indigo-900 to-black 
                    text-center relative overflow-hidden">
      {/* Headings */}
      <h2 className="text-5xl font-semibold text-blue-300 mb-4">Welcome to</h2>
      <h1 className="text-8xl font-extrabold tracking-tight text-white mb-28">
        UniVerse
      </h1>

      {/* Buttons */}
      <div className="flex flex-col gap-12 w-full max-w-sm">
        <Button
          className="w-full py-4 text-lg 
                     bg-gradient-to-r from-cyan-500 to-blue-600 
                     text-white shadow-lg hover:scale-105 hover:shadow-xl transition-transform"
          onClick={() => onNavigate("signup")}
        >
          Sign Up
        </Button>
        <Button
          className="w-full py-4 text-lg 
                     bg-gradient-to-r from-blue-500 to-blue-700 
                     text-white shadow-lg hover:scale-105 hover:shadow-xl transition-transform"
          onClick={() => onNavigate("signin")}
        >
          Sign In
        </Button>
      </div>

      {/* Optional starfield overlay */}
      <div className="absolute inset-0 bg-[url('/galaxy-blue.jpg')] bg-cover bg-center opacity-20 pointer-events-none"></div>
    </div>
  );
}
