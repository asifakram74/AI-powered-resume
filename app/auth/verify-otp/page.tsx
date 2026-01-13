"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { ArrowLeft, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { verifyOTPForReset, verifyEmailForReset } from "../../../lib/redux/slices/authSlice"
import type { RootState, AppDispatch } from "../../../lib/redux/store"
import { Alert, AlertDescription } from "../../../components/ui/alert"
import Image from "next/image"

// Add this line to force dynamic rendering
export const dynamic = 'force-dynamic'

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState("")
  
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Client-side only approach using window.location
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const emailParam = searchParams.get("email") || ""
      
      setEmail(emailParam)
      setIsLoading(false)

      if (!emailParam) {
        toast.error("Email parameter is missing")
        router.push("/auth/verify-email")
        return
      }

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [router])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code")
      return
    }

    try {
      console.log("Verifying OTP:", otpCode)
      console.log("OTP type:", typeof otpCode)
      console.log("OTP length:", otpCode.length)
      console.log("Email:", email)
      
      const result = await dispatch(verifyOTPForReset({ email, otp: otpCode }))
      
      console.log("Verify OTP result:", result)
      
      if (verifyOTPForReset.fulfilled.match(result)) {
        toast.success("OTP verified successfully")
        
        // Check if backend returned a token, otherwise use the OTP code as token
        const resetToken = result.payload.token || otpCode
        console.log("Backend response:", result.payload)
        console.log("Using token for reset:", resetToken)
        
        // Navigate to reset password page with email and otp
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&otp=${resetToken}`)
      } else {
        console.log("OTP verification failed:", result)
        toast.error(error || "Invalid OTP code")
        // Clear OTP inputs on error
        setOtp(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      }
    } catch (error) {
      console.error("OTP verification error:", error)
      toast.error("Network error. Please try again.")
    }
  }

  const handleResendCode = async () => {
    setResendLoading(true)

    try {
      const result = await dispatch(verifyEmailForReset(email))
      
      if (verifyEmailForReset.fulfilled.match(result)) {
        toast.success("New verification code sent to your email")
        setCountdown(60)
        setCanResend(false)
        setOtp(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()
      } else {
        toast.error(error || "Failed to resend code")
      }
    } catch (error) {
      toast.error("Network error. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  // Show redirect state or invalid params
  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
          <p className="text-gray-600 dark:text-gray-300">Invalid or missing email parameter</p>
          <Button onClick={() => router.push("/auth/verify-email")}>
            Go to Verify Email
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center mx-auto mb-4">
            <Link href="/">
              <Image src="/Resumic.png" alt="Logo" width={200} height={90} className="cursor-pointer" />
            </Link>
          </div>
          <div className="flex items-center gap-2 mb-2 justify-center">
            <Link href="/auth/verify-email">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Verify Code</CardTitle>
          </div>
          <CardDescription>
            Enter the 6-digit verification code sent to{" "}
            <span className="font-medium text-gray-700 dark:text-gray-200">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-200">Verification Code</Label>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-semibold border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                ))}
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full resumaic-gradient-green text-white hover:opacity-90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Didn't receive the code?
            </p>
            {canResend ? (
              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="text-blue-600 hover:text-blue-500 hover:bg-blue-50"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Code
                  </>
                )}
              </Button>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Resend code in {countdown}s
              </p>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Wrong email?{" "}
              <Link href="/auth/verify-email" className="text-blue-600 hover:text-blue-500 font-medium">
                Change email
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
