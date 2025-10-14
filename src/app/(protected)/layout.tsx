// app/(protected)/layout.tsx
import LayoutProvider from "@/providers/LayoutProvider";
import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import ProtectedWrapper from "./ProtectedWrapper";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedWrapper>
      <LayoutProvider>
        {children}
        <Toaster />
      </LayoutProvider>
    </ProtectedWrapper>
  );
}
