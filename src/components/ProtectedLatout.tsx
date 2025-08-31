"use client";

import React, { useEffect } from "react";
import { useUser } from "./Authentication/useUser";
import { useRouter } from "next/navigation";
import loading from "@/app/loading";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { isLoading, isAuthenticated } = useUser();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return loading();

  return <>{children}</>;
}
