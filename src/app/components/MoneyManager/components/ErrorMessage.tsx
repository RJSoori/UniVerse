import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message?: string;
  className?: string;
}

export function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <p
      className={`text-xs text-destructive flex items-center gap-1 ${className}`}
    >
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      <span>{message}</span>
    </p>
  );
}
