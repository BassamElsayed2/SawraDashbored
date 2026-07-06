// globals - must load before other styles
import "./globals.css";

import "material-symbols";
import "remixicon/fonts/remixicon.css";
import "react-calendar/dist/Calendar.css";
import "swiper/css";
import "swiper/css/bundle";

import type { Metadata } from "next";
import { Cairo } from "next/font/google";

import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";

import { Toaster } from "react-hot-toast";

const cairo = Cairo({
  variable: "--font-body",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "ENS - لوحة التحكم",
  description: "نظام إدارة المطاعم - تسجيل الدخول للمسؤولين",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl">
      <body className={`${cairo.variable} antialiased`}>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
