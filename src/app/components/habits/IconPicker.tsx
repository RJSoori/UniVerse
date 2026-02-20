import { useState } from "react";
import {
  Activity,
  Apple,
  Bike,
  Book,
  Brain,
  Coffee,
  Dumbbell,
  Flame,
  Leaf,
  Lightbulb,
  Moon,
  Pill,
  Smile,
  Zap,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../ui/utils";

export const HABIT_ICONS = [
  { id: "activity", label: "Activity", icon: Activity },
  { id: "bike", label: "Cycling", icon: Bike },
  { id: "dumbbell", label: "Strength", icon: Dumbbell },
  { id: "apple", label: "Diet", icon: Apple },
  { id: "coffee", label: "Coffee", icon: Coffee },
  { id: "water", label: "Hydration", icon: Leaf },
  { id: "book", label: "Reading", icon: Book },
  { id: "brain", label: "Learning", icon: Brain },
  { id: "lightbulb", label: "Creativity", icon: Lightbulb },
  { id: "moon", label: "Sleep", icon: Moon },
  { id: "pill", label: "Health", icon: Pill },
  { id: "smile", label: "Wellness", icon: Smile },
  { id: "zap", label: "Energy", icon: Zap },
  { id: "flame", label: "Motivation", icon: Flame },
];

interface IconPickerProps {
  selectedIconId?: string;
  onSelect: (iconId: string) => void;
}

export function IconPicker({ selectedIconId, onSelect }: IconPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
      {HABIT_ICONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          title={label}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all",
            selectedIconId === id
              ? "border-primary bg-primary/10"
              : "border-muted hover:border-primary/50 hover:bg-accent",
          )}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}

interface IconBadgeProps {
  iconId?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function IconBadge({ iconId, size = "md", color }: IconBadgeProps) {
  const habit = HABIT_ICONS.find((h) => h.id === iconId);
  const Icon = habit?.icon;

  if (!Icon) return null;

  const sizeClass = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }[size];

  return (
    <div
      className="flex items-center justify-center rounded-lg"
      style={{
        backgroundColor: color ? `${color}20` : "var(--color-primary)/10",
        padding: size === "sm" ? "4px" : size === "lg" ? "8px" : "6px",
      }}
    >
      <Icon className={sizeClass} style={{ color: color || "var(--color-primary)" }} />
    </div>
  );
}
