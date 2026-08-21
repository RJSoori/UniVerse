import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../auth/AuthContext";
import { clearAuthStorage } from "../../auth/tokenStore";
import { DashboardGrid } from "./DashboardGrid";

vi.mock("./widgetRegistry", () => {
  const WIDGETS = [
    {
      id: "widget-a",
      title: "Widget A",
      Component: () => <div>Content A</div>,
      size: { w: 4, h: 3, minW: 2, minH: 2 },
    },
    {
      id: "widget-b",
      title: "Widget B",
      Component: () => <div>Content B</div>,
      size: { w: 4, h: 3, minW: 2, minH: 2 },
    },
  ];
  return {
    WIDGETS,
    WIDGET_MAP: Object.fromEntries(WIDGETS.map((w) => [w.id, w])),
    DEFAULT_VISIBLE_WIDGET_IDS: WIDGETS.map((w) => w.id),
  };
});

vi.mock("./utils/api", () => ({
  getDashboardPreferences: vi.fn().mockResolvedValue({ layoutJson: null }),
  saveDashboardPreferences: vi.fn().mockResolvedValue({ layoutJson: null }),
}));

function renderDashboardGrid() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <DashboardGrid />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("DashboardGrid add/remove", () => {
  beforeEach(() => {
    clearAuthStorage();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    clearAuthStorage();
    vi.unstubAllGlobals();
  });

  it("lets a removed widget be restored via Reset to Default", async () => {
    renderDashboardGrid();

    await waitFor(() =>
      expect(screen.queryByText("Loading your dashboard…")).not.toBeInTheDocument(),
    );

    expect(screen.getByText("Content A")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /customize/i }));

    fireEvent.click(screen.getByRole("button", { name: /remove widget a/i }));

    expect(screen.queryByText("Content A")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reset to default/i }));

    await waitFor(() => expect(screen.getByText("Content A")).toBeInTheDocument());
  });
});
