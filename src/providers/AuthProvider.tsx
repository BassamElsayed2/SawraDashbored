"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import * as apiAuth from "@/services/apiAuth";
import type { User } from "@/services/apiAuth";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const currentUser = await apiAuth.checkAuth();

      if (!currentUser) {
        setUser(null);
        return;
      }

      // Verify admin role
      const adminRoles = ["admin", "super_admin", "manager"];
      const isAdmin = adminRoles.includes(currentUser.role || "");

      if (!isAdmin) {
        setUser(null);

        // Only redirect if not on home page
        if (pathname !== "/") {
          router.replace("/?error=unauthorized");
        }
        return;
      }

      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiAuth.signIn({ email, password });
      const userData = response.data.user;

      // Verify admin role
      const adminRoles = ["admin", "super_admin", "manager"];
      const isAdmin = adminRoles.includes(userData.role || "");

      if (!isAdmin) {
        // تنظيف الحالة أولاً لتجنب Race Condition
        setUser(null);

        // ثم تسجيل الخروج من الخلفية
        try {
          await apiAuth.signOut();
        } catch {
          // Sign out error
        }

        throw new Error("ليس لديك صلاحيات الوصول للوحة التحكم");
      }

      setUser(userData);
      toast.success("تم تسجيل الدخول بنجاح");
      router.push("/dashboard/");
      router.refresh();
    } catch (error: unknown) {
      setUser(null);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await apiAuth.signOut();
      toast.success("تم تسجيل الخروج بنجاح");
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    } finally {
      setUser(null);
      router.push("/");
      router.refresh();
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
