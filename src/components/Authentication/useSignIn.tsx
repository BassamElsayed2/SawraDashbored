"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login as loginApi } from "../../../services/apiauth";
import { toast } from "react-hot-toast";

export function useSignIn() {
  const router = useRouter();

  const {
    mutate: login,
    isPending,
    error,
  } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginApi({ email, password }),
    onSuccess: () => {
      toast.success("تم تسجيل الدخول بنجاح");
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast.error("خطأ في تسجيل الدخول");
    },
  });

  return { login, isPending, isError: !!error };
}
