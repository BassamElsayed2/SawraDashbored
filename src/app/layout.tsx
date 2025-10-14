import "material-symbols";
import "remixicon/fonts/remixicon.css";
import "react-calendar/dist/Calendar.css";
import "swiper/css";
import "swiper/css/bundle";

// globals
import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

import QueryProvider from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";

import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ENS - CMS",
  description: "CMS for ENS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="rtl">
      <body className={`${inter.variable} antialiased`}>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
