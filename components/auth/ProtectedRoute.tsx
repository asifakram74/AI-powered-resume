"use client"

import { useAppSelector } from "@/lib/redux/hooks"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string // Optional role requirement
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAppSelector((state) => state.auth)
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Redirect if not authenticated
      if (!user) {
        router.push("/auth/signin")
        return
      }
      
      // Redirect if doesn't have required role
      if (requiredRole && user.role !== requiredRole) {
        router.push("/dashboard")
      }
    }
  }, [user, loading, router, requiredRole])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}