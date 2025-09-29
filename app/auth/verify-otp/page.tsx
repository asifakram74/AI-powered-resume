"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { verifyOTPForReset, verifyEmailForReset } from "../../../lib/redux/slices/authSlice"
import type { RootState, AppDispatch } from "../../../lib/redux/store"

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [resendLoading, setResendLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.auth)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams?.get("email") || ""
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!email) {
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
  }, [email, router])

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
        console.log("Navigating to reset-password with token:", result.payload.token)
        // Navigate to reset password page with email and token
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}&token=${result.payload.token}`)
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/auth/verify-email">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <CardTitle className="text-2xl font-bold">Verify Code</CardTitle>
          </div>
          <CardDescription>
            Enter the 6-digit verification code sent to{" "}
            <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Verification Code</Label>
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
                    className="w-12 h-12 text-center text-lg font-semibold"
                  />
                ))}
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
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
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            {canResend ? (
              <Button
                variant="ghost"
                onClick={handleResendCode}
                disabled={resendLoading}
                className="text-primary"
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
              <p className="text-sm text-muted-foreground">
                Resend code in {countdown}s
              </p>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Wrong email?{" "}
              <Link href="/auth/verify-email" className="text-primary hover:underline">
                Change email
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}