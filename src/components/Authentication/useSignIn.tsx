"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signIn } from "@/services/apiAuth";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export function useSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  const {
    mutate: login,
    isPending,
    error,
  } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      signIn({ email, password }),
    onSuccess: async (data) => {
      try {
        const user = data.data.user;

        // ✅ التحقق من صلاحيات Admin
        const adminRoles = ["admin", "super_admin", "manager"];
        if (!user.role || !adminRoles.includes(user.role)) {
          toast.error("عذراً، ليس لديك صلاحيات للوصول إلى لوحة التحكم");

          // Invalidate queries and redirect
          queryClient.clear();
          setTimeout(() => {
            router.replace("/?error=unauthorized");
          }, 1000);
          return;
        }

        // ✅ المستخدم لديه صلاحيات Admin - متابعة تسجيل الدخول
        toast.success("تم تسجيل الدخول بنجاح");

        // تحديث حالة المستخدم في AuthProvider
        await refreshUser();

        // Invalidate auth queries to refresh user state
        queryClient.invalidateQueries({ queryKey: ["user"] });

        // الانتظار قليلاً للسماح للـ AuthProvider بتحديث الحالة
        // ثم سيتم التحويل التلقائي عن طريق useEffect في page.tsx
        setTimeout(() => {
          router.refresh();
        }, 100);
      } catch {
        // تنظيف حالة React Query عند حدوث خطأ
        queryClient.clear();
        toast.error("حدث خطأ أثناء تسجيل الدخول");
      }
    },
    onError: (error: Error) => {
      // تنظيف حالة React Query عند فشل تسجيل الدخول
      queryClient.clear();
      toast.error(
        error.message || "البريد الإلكتروني أو كلمة المرور غير صحيحة"
      );
    },
  });

  return { login, isPending, isError: !!error };
}
