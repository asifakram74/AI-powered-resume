"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Mail, ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { verifyEmailForReset } from "../../../lib/redux/slices/authSlice"
import type { RootState, AppDispatch } from "../../../lib/redux/store"
import { Alert, AlertDescription } from "../../../components/ui/alert"
import Image from "next/image"

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("")
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !isValidEmail(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    try {
      const result = await dispatch(verifyEmailForReset(email))
      
      if (verifyEmailForReset.fulfilled.match(result)) {
        toast.success("Verification code sent to your email!")
        // Navigate to OTP verification page
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}`)
      } else {
        toast.error(error || "Failed to send verification code")
      }
    } catch (error) {
      toast.error("Network error. Please try again.")
    }
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
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Forgot Password</CardTitle>
          </div>
          <CardDescription>
            Enter your email address and we'll send you a verification code to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
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
                  Sending Code...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Remember your password?{" "}
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
