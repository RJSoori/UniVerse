import { Navigate, Outlet, useLocation } from "react-router-dom";
import type React from "react";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }: { children?: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  return children ? <>{children}</> : <Outlet />;
}
