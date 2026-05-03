import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "../ui/utils";

type Theme = "light" | "dark";

function readTheme(): Theme {
  return (localStorage.getItem("theme") as Theme) || "light";
}

/**
 * Global light/dark toggle. Persists to `localStorage.theme` and dispatches
 * `theme-update` so the App-level effect (in App.tsx) re-applies the class on
 * `<html>`. Stays in sync with theme changes from other tabs/components via
 * the same event + the native `storage` event.
 */
export function ThemeToggle({
  className,
  variant = "ghost",
}: {
  className?: string;
  /** "ghost" — bare round button (sidebar). "floating" — pill on a translucent backdrop (entry pages). */
  variant?: "ghost" | "floating";
}) {
  const [theme, setTheme] = useState<Theme>(() => readTheme());

  useEffect(() => {
    const sync = () => setTheme(readTheme());
    window.addEventListener("theme-update", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("theme-update", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    window.dispatchEvent(new Event("theme-update"));
  };

  const isDark = theme === "dark";
  const Icon = isDark ? Sun : Moon;
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  if (variant === "floating") {
    return (
      <button
        type="button"
        onClick={toggle}
        title={label}
        aria-label={label}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full",
          "bg-card/80 text-foreground shadow-md ring-1 ring-border backdrop-blur-sm",
          "transition-colors hover:bg-card hover:text-primary",
          className,
        )}
      >
        <Icon className="size-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl",
        "text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground",
        className,
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}

export default ThemeToggle;
