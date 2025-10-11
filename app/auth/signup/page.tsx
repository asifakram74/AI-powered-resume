"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "../../../lib/redux/hooks"
import { registerUser, clearError, loginWithLinkedIn, loginWithGoogle, setCredentials } from "../../../lib/redux/slices/authSlice"
import { validateEmailAPI } from "../../../lib/utils/email-validation"
import { showSuccessToast, showErrorToast } from "../../../components/ui/toast"
import Image from "next/image"
function useSafeSearchParams() {
  try {
    return useSearchParams()
  } catch (error) {
    // Return null during server rendering
    return null
  }
}
export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [apiError, setApiError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [linkedInLoading, setLinkedInLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const router = useRouter()
  const dispatch = useAppDispatch()
  const { loading, error, token } = useAppSelector((state) => state.auth)

  const searchParams = useSafeSearchParams()
  const safeSearchParams = searchParams || new URLSearchParams();

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError("Passwords do not match")
    } else {
      setPasswordError("")
    }
  }, [password, confirmPassword])

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        const user = JSON.parse(storedUser)
        if (user.source && user.source !== 'website') {
          router.push("/dashboard")
        }
      } catch (e) {
        console.error('Error parsing stored user:', e)
      }
    }
  }, [token, router])

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.id && window.location.pathname !== '/dashboard') {
            console.log('Force redirecting to dashboard');
            router.push('/dashboard');
          }
        } catch (e) {
          console.error('Error parsing user:', e);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  // For LinkedIn login
  const handleLinkedInSignUp = () => {
    localStorage.setItem("oauth_provider", "linkedin");
    const randomState = `secureRandom${Math.floor(Math.random() * 10000)}${Date.now()}`;
    localStorage.setItem('linkedin_oauth_state', randomState);

    const redirectUri = window.location.origin + window.location.pathname;

    const linkedInAuthUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=77980o5hpyil05&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email&state=${randomState}`;
    window.location.href = linkedInAuthUrl;
  }

  // For Google login
  const handleGoogleSignUp = () => {
    localStorage.setItem("oauth_provider", "google");
    const randomState = `secureRandom${Math.floor(Math.random() * 10000)}${Date.now()}`;
    localStorage.setItem("google_oauth_state", randomState);

    const redirectUri = window.location.origin + window.location.pathname;
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://cffdcbd648f6.ngrok-free.app/api";
    window.location.href = `${API_BASE}/auth/google/redirect?state=${randomState}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  useEffect(() => {
    const provider = localStorage.getItem("oauth_provider");
    if (provider === "linkedin") {
      const handleLinkedInCallback = async () => {
        const code = safeSearchParams.get('code');
        const state = safeSearchParams.get('state');

        if (code && state) {
          setLinkedInLoading(true);

          const storedState = localStorage.getItem('linkedin_oauth_state');

          if (state !== storedState) {
            console.error('Invalid state parameter - possible CSRF attack');
            setLinkedInLoading(false);

            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            return;
          }

          localStorage.removeItem('linkedin_oauth_state');

          try {
            console.log('Calling loginWithLinkedIn with code:', code);
            const result = await dispatch(loginWithLinkedIn(code));
            console.log('LinkedIn login result:', result);

            if (loginWithLinkedIn.fulfilled.match(result)) {
              console.log('LinkedIn login successful');
              console.log('User ID from backend:', result.payload.user.id);
              console.log('Token in localStorage:', localStorage.getItem('token'));
              console.log('User in localStorage:', localStorage.getItem('user'));
              // Show success toast for LinkedIn registration
              showSuccessToast("Registration successful", "Signed up with LinkedIn");
              router.push('/dashboard');
            } else {
              console.error('LinkedIn login failed:', result.payload);
            }
          } catch (error) {
            console.error('Error during LinkedIn authentication:', error);
          } finally {
            setLinkedInLoading(false);

            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }
      };

      handleLinkedInCallback();
    } else if (provider === "google") {
      const handleGoogleCallback = async () => {
        const code = safeSearchParams.get("code");
        const token = safeSearchParams.get("token");
        const state = safeSearchParams.get("state");

        if (token) {
          setGoogleLoading(true);

          try {
            const storedState = localStorage.getItem("google_oauth_state");
            if (state && state !== storedState) {
              console.error("Invalid state parameter - possible CSRF attack");
              return;
            }

            // Clear the stored state
            localStorage.removeItem("google_oauth_state");

            const userParam = safeSearchParams.get("user");
            if (userParam) {
              try {
                const user = JSON.parse(decodeURIComponent(userParam));
                localStorage.setItem("token", token);
                localStorage.setItem("user", JSON.stringify(user));
                dispatch(setCredentials({ token, user }));
              } catch (e) {
                console.error("Failed to parse user data from callback:", e);
                throw e;
              }
            } else {
              const id = safeSearchParams.get("id");
              const name = safeSearchParams.get("name");
              const email = safeSearchParams.get("email");

              localStorage.setItem("token", token);

              if (id || name || email) {
                const user = {
                  id: id ? Number(id) : undefined,
                  name: name ?? undefined,
                  email: email ?? undefined,
                  source: "google",
                };
                localStorage.setItem("user", JSON.stringify(user));
                dispatch(setCredentials({ token,user }));
              }
            }
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            // Show success toast for Google registration via token callback
            showSuccessToast("Registration successful", "Signed up with Google");
            router.push("/dashboard");
          } catch (err) {
            console.error("Error during Google login:", err);
          } finally {
            setGoogleLoading(false);
          }
          return;
        }

        if (code) {
          setGoogleLoading(true);

          try {
            const result = await dispatch(loginWithGoogle(code));

            if (loginWithGoogle.fulfilled.match(result)) {
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
              // Show success toast for Google registration via code exchange
              showSuccessToast("Registration successful", "Signed up with Google");
              router.push("/dashboard");
            } else {
            }
          } catch (err) {
            console.error("Error during Google login:", err);
          } finally {
            setGoogleLoading(false);
          }
        }
      };

      handleGoogleCallback();
    }
  }, [safeSearchParams, router, dispatch]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    setPasswordError("")
    setApiError("")
    setFieldErrors({})

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    // Validate email before proceeding with registration
    try {
      const emailValidation = await validateEmailAPI(email)
      
      if (!emailValidation.success) {
        setEmailError("Please enter a valid email address")
        showErrorToast("Email validation failed. Please enter your valid email address.")
        return
      }
    } catch (error) {
      console.error("Email validation error:", error)
      setEmailError("Unable to verify email")
      showErrorToast("Unable to verify email. Please try again.")
      return
    }

    const result = await dispatch(registerUser({
      name,
      email,
      password,
      source: "Webiste"
    }))

    if (registerUser.fulfilled.match(result)) {
      // Show success toast for browser registration
      showSuccessToast("Registration successful", "Please sign in to continue");
      router.push("/auth/signin")
    } else if (registerUser.rejected.match(result)) {
      // Handle validation errors from backend
      if (result.payload && typeof result.payload === 'object' && 'errors' in result.payload) {
        const payload = result.payload as { message: string; errors: Record<string, string[]> }
        setFieldErrors(payload.errors)
        
        // Handle specific email error with user-friendly message
        if (payload.errors.email && payload.errors.email.includes("The email has already been taken.")) {
          setEmailError("This email is already registered. Please log in instead.")
          showErrorToast("This email is already registered. Please log in instead.")
        } else {
          setApiError("Please fix the validation errors below")
        }
      } else {
        // Handle other errors
        const errorMessage = typeof result.payload === 'string' ? result.payload : 'Registration failed'
        setApiError(errorMessage)
        showErrorToast(errorMessage)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center mx-auto mb-4">
            <Link href="/" >
              <Image src="/Resumic.png" alt="Logo" width={200} height={90} className="cursor-pointer" />
            </Link>
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">Create Your Account</CardTitle>
          <CardDescription>Join CV Builder AI to get started</CardDescription>
        </CardHeader>
        <CardContent>
          {linkedInLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Completing LinkedIn authentication...</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (emailError) setEmailError("")
                      }}
                      placeholder="john@example.com"
                      className={`pl-10 ${emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full resumaic-gradient-green hover:opacity-90 button-press"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleGoogleSignUp}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.8 12.18c0-.65-.06-1.3-.18-1.93H12v3.64h5.5a4.4 4.4 0 0 1-1.9 2.9v2.4h3.1c1.8-1.7 2.8-4.2 2.8-7.01z" fill="#4285F4" />
                        <path d="M12 22c2.6 0 4.8-.86 6.4-2.32l-3.1-2.4c-.86.58-2 .92-3.3.92-2.5 0-4.6-1.7-5.4-4.1H3.4v2.5C5 19.5 8.3 22 12 22z" fill="#34A853" />
                        <path d="M6.6 13.1c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7H3.4A9.99 9.99 0 0 0 2 12c0 1.6.4 3.2 1.4 4.5l3.2-2.4z" fill="#FBBC05" />
                        <path d="M12 6.4c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.8 3.4 14.6 2.5 12 2.5 8.7 2.5 5.8 4.6 4.4 7.5l3.2 2.5c.8-2.4 3-4.1 5.4-4.1z" fill="#EA4335" />
                      </svg>
                      Google
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLinkedInSignUp}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
