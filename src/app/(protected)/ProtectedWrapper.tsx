// app/(protected)/ProtectedWrapper.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ProtectedWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/");
        return;
      }

      // ✅ التحقق من وجود المستخدم في admin_profiles
      const { data: adminProfile, error } = await supabase
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", session.user.id)
        .single();

      // ❌ إذا المستخدم غير موجود في admin_profiles، منعه من الدخول
      if (error || !adminProfile) {
        router.replace("/?error=unauthorized");
        return;
      }

      setLoading(false);
    };

    checkSession();
  }, [router, supabase]);

  if (loading) return <div className="p-4">جارٍ التحقق من الجلسة...</div>;

  return <>{children}</>;
}
