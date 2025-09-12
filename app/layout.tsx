import type React from "react";
import type { Metadata } from "next";
import "../styles/globals.css";
import "./globals.css";
import { ReduxProvider } from "../lib/redux/provider";
import { Toaster } from "sonner";
import HydrateAuth from "../components/auth/HydrateAuth";

export const metadata: Metadata = {
  title: "Resumaic - AI-Powered Resume Builder",
  description: "Create professional resumes with AI technology",
  icons: {
    icon: "/favicon.png",          // favicon in browser tab
    shortcut: "/favicon.png",      // legacy support
    apple: "/favicon.png",         // iOS home screen icon
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="antialiased">
      <body className="font-sans">
        <ReduxProvider>
          <HydrateAuth />
          <Toaster position="top-right" richColors />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
