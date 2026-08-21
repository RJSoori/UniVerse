import { useCallback, useEffect, useRef, useState } from "react";
import type { Layout } from "react-grid-layout";
import { useUniStorage } from "../../../shared/hooks/useUniStorage";
import { DEFAULT_VISIBLE_WIDGET_IDS } from "../widgetRegistry";
import { buildDefaultLayouts } from "../utils/layoutDefaults";
import { getDashboardPreferences, saveDashboardPreferences } from "../utils/api";

export interface DashboardLayoutState {
  visibleWidgets: string[];
  layouts: Record<string, Layout[]>;
}

const DEFAULT_STATE: DashboardLayoutState = {
  visibleWidgets: DEFAULT_VISIBLE_WIDGET_IDS,
  layouts: buildDefaultLayouts(DEFAULT_VISIBLE_WIDGET_IDS),
};

function isValidState(value: unknown): value is DashboardLayoutState {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<DashboardLayoutState>;
  return Array.isArray(v.visibleWidgets) && typeof v.layouts === "object" && v.layouts !== null;
}

/**
 * Loads the dashboard layout, preferring the backend copy (synced across
 * devices) but painting instantly from the local per-user cache while that
 * request is in flight. Edits are saved locally right away and pushed to the
 * backend on an 800ms debounce (same pattern as useMoneyManager.ts) so
 * continuous drag/resize doesn't spam the API.
 */
export function useDashboardPreferences() {
  const [state, setStateRaw] = useUniStorage<DashboardLayoutState>(
    "dashboard-layout",
    DEFAULT_STATE,
  );
  const hasHydratedFromBackend = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDashboardPreferences()
      .then((prefs) => {
        if (cancelled || !prefs.layoutJson) return;
        try {
          const parsed = JSON.parse(prefs.layoutJson);
          if (isValidState(parsed)) {
            setStateRaw(parsed);
          }
        } catch (err) {
          console.error("Failed to parse dashboard layout from backend:", err);
        }
      })
      .catch((err) => {
        console.error("Failed to load dashboard preferences:", err);
      })
      .finally(() => {
        if (!cancelled) {
          hasHydratedFromBackend.current = true;
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasHydratedFromBackend.current) return;

    if (syncTimeoutRef.current !== null) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      syncTimeoutRef.current = null;
      void saveDashboardPreferences(JSON.stringify(state)).catch((err) => {
        console.error("Failed to sync dashboard layout to backend:", err);
      });
    }, 800);

    return () => {
      if (syncTimeoutRef.current !== null) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [state]);

  const setState = useCallback(
    (updater: DashboardLayoutState | ((prev: DashboardLayoutState) => DashboardLayoutState)) => {
      setStateRaw(updater);
    },
    [setStateRaw],
  );

  const resetToDefault = useCallback(() => {
    setStateRaw(DEFAULT_STATE);
  }, [setStateRaw]);

  return { state, setState, isLoading, resetToDefault };
}
