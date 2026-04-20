import { Badge } from "../ui/badge";

interface GpaDisplayProps {
  label: string;
  value: number;
  maxValue?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GpaDisplay({
  label,
  value,
  maxValue = 4.0,
  size = "md",
  className = "",
}: GpaDisplayProps) {
  const percentage = ((value / maxValue) * 100).toFixed(0);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const getColorClass = () => {
    const ratio = value / maxValue;
    if (ratio >= 0.9) return "text-emerald-600";
    if (ratio >= 0.7) return "text-blue-600";
    if (ratio >= 0.5) return "text-amber-600";
    return "text-destructive";
  };

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <div className={`font-bold ${getColorClass()} ${sizeClasses[size]}`}>
        {value.toFixed(2)} / {maxValue.toFixed(2)}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
        <div
          className={`h-2 rounded-full ${getColorClass().replace("text-", "bg-")}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
