"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  login as loginApi,
  getAdminProfileById,
} from "../../../services/apiauth";
import { toast } from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function useSignIn() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const {
    mutate: login,
    isPending,
    error,
  } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi({ email, password }),
    onSuccess: async (data) => {
      try {
        // ✅ التحقق من وجود المستخدم في admin_profiles
        const { data: adminProfile } = await supabase
          .from("admin_profiles")
          .select("user_id")
          .eq("user_id", data.user.id)
          .single();

        // ❌ إذا المستخدم غير موجود في admin_profiles
        if (!adminProfile) {
          // تسجيل الخروج فوراً
          await supabase.auth.signOut();
          toast.error("عذراً، ليس لديك صلاحيات للوصول إلى لوحة التحكم");
          router.push("/?error=unauthorized");
          return;
        }

        // ✅ المستخدم لديه صلاحيات - متابعة تسجيل الدخول
        toast.success("تم تسجيل الدخول بنجاح");
        router.push("/dashboard");
      } catch (error) {
        console.error("Error checking admin profile:", error);
        await supabase.auth.signOut();
        toast.error("حدث خطأ أثناء التحقق من الصلاحيات");
        router.push("/?error=unauthorized");
      }
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    },
  });

  return { login, isPending, isError: !!error };
}
