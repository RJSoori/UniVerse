import { Button } from "../ui/button";

export default function Landing({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-center relative overflow-hidden">
      {/* Headings */}
      <h2 className="text-4xl text-blue-300 mb-3 font-sanserif">
        Welcome to
      </h2>
      <h1 className="text-8xl font-extrabold tracking-tight text-blue-900 mb-28 font-sans drop-shadow-lg">
        UniVerse
      </h1>

      {/* Buttons */}
      <div className="flex flex-col gap-12 w-full max-w-sm">
        <Button
          className="w-full py-4 text-lg 
                     bg-gradient-to-r from-blue-500 to-blue-700 
                     text-white shadow-md hover:scale-105 hover:shadow-xl transition-transform"
          onClick={() => onNavigate("signup")}
        >
          Sign Up
        </Button>
        <Button
          className="w-full py-4 text-lg 
                     bg-gradient-to-r from-cyan-400 to-blue-500 
                     text-white shadow-md hover:scale-105 hover:shadow-xl transition-transform"
          onClick={() => onNavigate("signin")}
        >
          Sign In
        </Button>
      </div>
    </div>
  );
}
