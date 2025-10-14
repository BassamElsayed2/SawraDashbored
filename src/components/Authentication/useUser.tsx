"use client";

import { useAuth } from "../../providers/AuthProvider";

export function useUser() {
  const { user, loading } = useAuth();

  return {
    user,
    isLoading: loading,
    isAuthenticated:
      !!user && ["admin", "super_admin", "manager"].includes(user.role || ""),
  };
}
