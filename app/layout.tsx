import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ReduxProvider } from "@/lib/redux/provider"
import HydrateAuth from "@/components/auth/HydrateAuth"
import { Toaster } from "sonner";


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CV Builder AI - Professional Resume Tool",
  description: "Create professional resumes and AI personas with our advanced CV builder",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <HydrateAuth />
          <Toaster position="top-right" richColors />
          {children}
        </ReduxProvider>
      </body>
    </html>
  )
}
