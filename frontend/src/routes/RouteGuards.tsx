import { Navigate, Outlet } from "react-router";

import { useAuth } from "@/features/auth/auth.context";

import type { Permission } from "@/features/auth/auth.types";

export function RequireAuth() {
  const { state } = useAuth();

  if (state.status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

interface RequirePermissionProps {
  permission: Permission;
}

export function RequirePermission({
  permission,
}: RequirePermissionProps) {
  const { state } = useAuth();

  if (state.status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  if (!state.user.permissions.includes(permission)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}