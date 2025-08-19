import type React from "react"
import type { Metadata } from "next"
import { Rubik, Inter } from "next/font/google"
import "./globals.css"
import { ReduxProvider } from "@/lib/redux/provider"
import { Toaster } from "sonner"
import HydrateAuth from "@/components/auth/HydrateAuth"

const rubik = Rubik({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-rubik",
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Resumaic - AI-Powered Resume Builder",
  description: "Create professional resumes with AI technology",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${rubik.variable} ${inter.variable} antialiased`}>
      <body className="font-sans">
        <ReduxProvider>
          <HydrateAuth />
          <Toaster position="top-right" richColors />
          {children}
        </ReduxProvider>
      </body>
    </html>
  )
}
