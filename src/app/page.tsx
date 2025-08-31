"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "../../services/apiauth";
import DarkMode from "@/components/Authentication/DarkMode";
import SignInForm from "@/components/Authentication/SignInForm";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error checking user:", error);
      }
    };

    checkUser();
  }, [router]);

  return (
    <>
      <DarkMode />
      <SignInForm />
    </>
  );
}
