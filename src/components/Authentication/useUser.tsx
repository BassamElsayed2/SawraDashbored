"use client";

import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../../../services/apiauth";

export function useUser() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: user?.role === "authenticated",
  };
}
