"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import toast from "react-hot-toast";

export function useSignIn() {
  const { signIn } = useAuth();
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setIsPending(true);
    setIsError(false);

    try {
      await signIn(email, password);
    } catch (error) {
      setIsError(true);
      toast.error(
        error instanceof Error
          ? error.message
          : "البريد الإلكتروني أو كلمة المرور غير صحيحة"
      );
    } finally {
      setIsPending(false);
    }
  };

  return { login, isPending, isError };
}
