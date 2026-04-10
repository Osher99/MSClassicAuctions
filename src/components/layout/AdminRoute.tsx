import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { Spinner } from "@/components/ui/Spinner";

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, profile, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
};
