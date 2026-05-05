import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import RequireAuth from "./RequireAuth";
import { clearAuthStorage, setToken, setUser } from "./tokenStore";

const user = {
  id: 1,
  username: "student",
  name: "Student One",
  email: "student@example.com",
  degree: "Computer Science",
  role: "STUDENT" as const,
};

function renderProtected(initialPath = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/signin" element={<div>Sign in page</div>} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <div>Protected dashboard</div>
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("auth route guards", () => {
  beforeEach(() => {
    clearAuthStorage();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    clearAuthStorage();
    vi.unstubAllGlobals();
  });

  it("redirects unauthenticated users to signin", async () => {
    renderProtected();

    expect(await screen.findByText("Sign in page")).toBeInTheDocument();
  });

  it("keeps a protected page after remount when the stored token is valid", async () => {
    setToken("valid-token");
    setUser(user);
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(user), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    renderProtected();

    await waitFor(() => expect(fetch).toHaveBeenCalledWith("http://localhost:8080/api/auth/me", expect.any(Object)));
    expect(await screen.findByText("Protected dashboard")).toBeInTheDocument();
  });
});
