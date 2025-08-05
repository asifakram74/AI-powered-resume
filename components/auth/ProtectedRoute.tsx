"use client"

import type React from "react"
import { useAppSelector } from "@/lib/redux/hooks"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((state) => state.auth.token)
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      router.push("/auth/signin")
    }
  }, [token, router])

  if (!token) return null

  return <>{children}</>
}
