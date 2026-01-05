"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react"

function useSafeSearchParams() {
  try {
    return useSearchParams()
  } catch {
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
      setMessage("Invalid or expired verification link.")
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(`https://backendcv.onlinetoolpot.com/public/api/verify-email-address?token=${token}`)
        // const res = await fetch(`https://stagingbackend.resumaic.com/public/api/verify-email-address?token=${token}`)
        const data = await res.json()
        if (data && (data.status === true || data.success === true)) {
          setSuccess(true)
          setMessage("Your email has been verified. Redirecting to sign in...")
          setTimeout(() => router.push("/auth/signin"), 2500)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Link href="/">
              <Image src="/Resumic.png" alt="Resumic" width={200} height={90} className="cursor-pointer" />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            <span className="text-xs font-medium text-gray-600">Secure Verification</span>
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">{message}</CardTitle>
        </CardHeader>
        <CardContent>
          {!loading && success === false && (
            <div className="space-y-3 mb-4">
              <p className="text-sm text-gray-600">Try the following:</p>
              <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                <li>Open the latest verification email from Resumic.</li>
                <li>If you can't find it, check your spam folder.</li>
                <li>Sign in to request a new verification link.</li>
              </ul>
            </div>
          )}

          {!loading && (
            <div className="flex gap-3">
              <Link href="/auth/signin">
                <Button className="resumaic-gradient-green text-white hover:opacity-90">Go to Sign In</Button>
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