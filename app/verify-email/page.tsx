"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

function useSafeSearchParams() {
  try {
    return useSearchParams()
  } catch (error) {
    return null
  }
}

export default function VerifyEmailPage() {
  const searchParams = useSafeSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState<boolean | null>(null)
  const [message, setMessage] = useState("Verifying your email...")

  useEffect(() => {
    const tokenFromHook = searchParams ? searchParams.get("token") : null
    const tokenFallback = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("token") : null
    const token = tokenFromHook ?? tokenFallback
    if (!token) {
      setLoading(false)
      setSuccess(false)
      setMessage("Invalid verification link.")
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(`https://backendcv.onlinetoolpot.com/public/api/verify-email-address?token=${token}`)
        const data = await res.json()
        if (data && (data.status === true || data.success === true)) {
          setSuccess(true)
          setMessage("Your email has been successfully verified.")
          setTimeout(() => router.push("/auth/signin"), 3000)
        } else {
          setSuccess(false)
          setMessage(data?.message || "Verification failed. Please try again.")
        }
      } catch {
        setSuccess(false)
        setMessage("Something went wrong. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [searchParams, router])

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {loading && "Please wait while we verify your email."}
            {!loading && success && "Verification complete. Redirecting to sign in..."}
            {!loading && success === false && "We were unable to verify your email."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            {loading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
            {!loading && success && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            {!loading && success === false && <AlertCircle className="h-5 w-5 text-red-600" />}
            <p className="text-sm text-gray-700">{message}</p>
          </div>

          {!loading && (
            <div className="flex gap-3">
              <Link href="/auth/signin">
                <Button variant="default">Go to Sign In</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}