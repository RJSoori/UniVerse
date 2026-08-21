import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import SleepSuggestionCard from "./SleepSuggestionCard";
import ProductivityGapCard from "./ProductivityGapCard";
import { MoneyWidget } from "./MoneyWidget";
import { TodoList } from "../todo/TodoList";
import {
  StatTasksCard,
  StatEventsCard,
  StatHabitsCard,
  StatGpaCard,
} from "./widgets/StatCards";
import { TodayAgendaCard } from "./widgets/TodayAgendaCard";
import { QuickAccessRow } from "./widgets/QuickAccessCard";

const sectionToPath: Record<string, string> = {
  todo: "/todo",
  schedule: "/schedule",
  money: "/money",
  habits: "/habits",
  jobs: "/jobs",
  marketplace: "/marketplace",
  gpa: "/gpa",
  timer: "/timer",
};

function TodoListWidget() {
  return <TodoList compact maxItems={5} />;
}

function MoneyWidgetWidget() {
  const navigate = useNavigate();
  return (
    <MoneyWidget
      compact
      onNavigate={(section) => navigate(sectionToPath[section] ?? "/dashboard")}
    />
  );
}

export interface WidgetSize {
  w: number;
  h: number;
  minW: number;
  minH: number;
}

export interface WidgetDef {
  id: string;
  title: string;
  Component: ComponentType;
  size: WidgetSize;
}

export const WIDGETS: WidgetDef[] = [
  {
    id: "sleep-suggestion",
    title: "Sleep Suggestion",
    Component: SleepSuggestionCard,
    size: { w: 6, h: 4, minW: 4, minH: 3 },
  },
  {
    id: "productivity-gap",
    title: "Productivity Gap",
    Component: ProductivityGapCard,
    size: { w: 6, h: 4, minW: 4, minH: 3 },
  },
  {
    id: "stat-tasks",
    title: "Active Tasks",
    Component: StatTasksCard,
    size: { w: 3, h: 3, minW: 2, minH: 2 },
  },
  {
    id: "stat-events",
    title: "Total Events",
    Component: StatEventsCard,
    size: { w: 3, h: 3, minW: 2, minH: 2 },
  },
  {
    id: "stat-habits",
    title: "Active Habits",
    Component: StatHabitsCard,
    size: { w: 3, h: 3, minW: 2, minH: 2 },
  },
  {
    id: "stat-gpa",
    title: "Current GPA",
    Component: StatGpaCard,
    size: { w: 3, h: 3, minW: 2, minH: 2 },
  },
  {
    id: "todo-list",
    title: "To-Do List",
    Component: TodoListWidget,
    size: { w: 4, h: 7, minW: 3, minH: 4 },
  },
  {
    id: "agenda",
    title: "Today's Agenda",
    Component: TodayAgendaCard,
    size: { w: 4, h: 7, minW: 3, minH: 4 },
  },
  {
    id: "money-widget",
    title: "Money Manager",
    Component: MoneyWidgetWidget,
    size: { w: 4, h: 7, minW: 3, minH: 4 },
  },
  {
    id: "quick-access",
    title: "Quick Access",
    Component: QuickAccessRow,
    size: { w: 12, h: 3, minW: 6, minH: 3 },
  },
];

export const WIDGET_MAP: Record<string, WidgetDef> = Object.fromEntries(
  WIDGETS.map((w) => [w.id, w]),
);

export const DEFAULT_VISIBLE_WIDGET_IDS = WIDGETS.map((w) => w.id);
