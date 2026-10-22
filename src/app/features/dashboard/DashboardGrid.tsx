import { useState } from "react";
import * as ReactGridLayout from "react-grid-layout";
import { GripVertical, X, RotateCcw, Pencil, Check } from "lucide-react";
import { Button } from "../../shared/ui/button";
import { useDashboardPreferences } from "./hooks/useDashboardPreferences";
import { WIDGET_MAP } from "./widgetRegistry";
import { GRID_BREAKPOINTS, GRID_COLS, removeWidgetFromLayouts } from "./utils/layoutDefaults";

const { Responsive, WidthProvider } = ReactGridLayout;
const ResponsiveGridLayout = WidthProvider(Responsive);

type Layout = ReactGridLayout.Layout;

export function DashboardGrid() {
  const { state, setState, isLoading, resetToDefault } = useDashboardPreferences();
  const [editMode, setEditMode] = useState(false);

  const handleLayoutChange = (_current: Layout[], allLayouts: Record<string, Layout[]>) => {
    setState((prev) => ({ ...prev, layouts: allLayouts }));
  };

  const handleRemove = (id: string) => {
    setState((prev) => ({
      visibleWidgets: prev.visibleWidgets.filter((w) => w !== id),
      layouts: removeWidgetFromLayouts(prev.layouts, id),
    }));
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground py-10 text-center">
        Loading your dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2">
        {editMode && (
          <Button variant="outline" size="sm" onClick={resetToDefault}>
            <RotateCcw className="size-4" /> Reset to Default
          </Button>
        )}
        <Button
          variant={editMode ? "default" : "outline"}
          size="sm"
          onClick={() => setEditMode((v) => !v)}
        >
          {editMode ? (
            <>
              <Check className="size-4" /> Done
            </>
          ) : (
            <>
              <Pencil className="size-4" /> Customize
            </>
          )}
        </Button>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={state.layouts}
        breakpoints={GRID_BREAKPOINTS}
        cols={GRID_COLS}
        rowHeight={32}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable={editMode}
        isResizable={editMode}
        draggableHandle=".widget-drag-handle"
        onLayoutChange={handleLayoutChange}
        compactType="vertical"
      >
        {state.visibleWidgets.map((id) => {
          const widget = WIDGET_MAP[id];
          if (!widget) return null;
          const Component = widget.Component;
          return (
            <div key={id} className="relative">
              {editMode && (
                <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1">
                  <div className="widget-drag-handle cursor-move p-1 rounded bg-background/90 border shadow-sm">
                    <GripVertical className="size-3.5 text-muted-foreground" />
                  </div>
                  <button
                    onClick={() => handleRemove(id)}
                    className="p-1 rounded bg-background/90 border shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    aria-label={`Remove ${widget.title}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}
              <div className={editMode ? "h-full pointer-events-none" : "h-full"}>
                <Component />
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}
