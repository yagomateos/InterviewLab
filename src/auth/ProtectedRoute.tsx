import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Loading } from "@/components/ui";

// Gates interview routes behind a login — interviews are the one thing in
// this app that belong to a specific user (see the /api/interviews auth
// requirement in the backend). Everything else (questions, stats, the
// simulation) stays open.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
