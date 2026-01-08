"use client"

import { useState, useEffect, useRef } from "react"
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar"
import { Sidebar } from "../../components/dashboard/sidebar"
import ProtectedRoute from "../../components/auth/ProtectedRoute"
import { RootState } from "../../lib/redux/store"
import { useAppSelector, useAppDispatch } from "../../lib/redux/hooks"
import { useRouter, usePathname } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { logoutUser, resendEmailVerification, refreshUserById, setPassword } from "../../lib/redux/slices/authSlice"
import { showSuccessToast, showErrorToast } from "../../components/ui/toast"
import { Menu } from "lucide-react"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { WelcomeTour } from "../../components/dashboard/WelcomeTour"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  const { user, requiresPasswordSetup, profile } = useAppSelector((state: RootState) => state.auth)
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const [resendLoading, setResendLoading] = useState(false)
  const [password, setPasswordState] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSettingPassword, setIsSettingPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    setLoginMethod(localStorage.getItem('loginMethod'))
  }, [])


  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/auth/signin');
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      if (!parsedUser.id) {
        router.push('/auth/signin');
      }
    } catch (e) {
      router.push('/auth/signin');
    }
  }, [router]);

  // const isEmailVerified = Boolean(user?.email_verified_at) || user?.status?.toLowerCase() === 'active'
  const isEmailVerified =
    Boolean(user?.email_verified_at && profile?.email_verified_at) ||
    user?.status?.toLowerCase() === 'active' ||
    profile?.status?.toLowerCase() === 'active'

  const isSocialLogin = loginMethod !== 'email' && (user?.source?.toLowerCase() === 'google' && profile?.source?.toLowerCase() === 'google' || user?.source?.toLowerCase() === 'linkedin' && profile?.source?.toLowerCase() === 'linkedin') 
  // const handleSetPassword = async () => {
  //   if (password !== confirmPassword) {
  //     showErrorToast("Error", "Passwords do not match")
  //     return
  //   }
  //   if (password.length < 8) {
  //     showErrorToast("Error", "Password must be at least 8 characters")
  //     return
  //   }

  //   try {
  //     setIsSettingPassword(true)
  //     await dispatch(setPassword(password)).unwrap()
  //     showSuccessToast("Success", "Password set successfully. Please login again.")

  //     await handleLogout()
  //   } catch (error) {
  //     showErrorToast("Error", typeof error === 'string' ? error : "Failed to set password")
  //   } finally {
  //     setIsSettingPassword(false)
  //   }
  // }
  const handleResendVerification = async () => {
    if (!user?.email) return
    try {
      setResendLoading(true)
      const result = await dispatch(resendEmailVerification(user.email))
      if (resendEmailVerification.fulfilled.match(result)) {
        showSuccessToast("Verification Email Sent", "Check your inbox to verify.")
      } else {
        const message = typeof result.payload === 'string' ? result.payload : 'Failed to resend verification'
        showErrorToast("Error", message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error'
      showErrorToast("Error", message)
    } finally {
      setResendLoading(false)
    }
  }
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser())
      router.push('/auth/signin')
    } catch {
      // noop
    }
  }

  // Refresh user logic
  const hasRefreshed = useRef(false)

  useEffect(() => {
    if (!hasRefreshed.current && user?.id && !user?.email_verified_at) {
      hasRefreshed.current = true
      dispatch(refreshUserById(Number(user.id)))
    }
  }, [dispatch, user?.id, user?.email_verified_at])

  useEffect(() => {
    const onVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        user?.id &&
        !user?.email_verified_at
      ) {
        dispatch(refreshUserById(Number(user.id)))
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [dispatch, user?.id, user?.email_verified_at])

  const getPageTitle = () => {
    if (pathname?.includes("persona")) return "Persona"
    if (pathname?.includes("resumes")) return "Resumes"
    if (pathname?.includes("cover-letter")) return "Cover Letters"
    if (pathname?.includes("ats-checker")) return "ATS Checker"
    if (pathname?.includes("profile")) return "Profile"
    if (pathname?.includes("users")) return "User Management"
    return "Persona" // Default
  }

  if (!isClient) return null // or loading spinner

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <WelcomeTour />
        <div className="flex min-h-screen w-full">
          <Sidebar user={profile as any} />
          <main className="flex-1 bg-gray-50 relative">
            {/* {requiresPasswordSetup && user?.role?.toLowerCase() !== 'admin' && 
              <Dialog open>
                <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-xl rounded-xl">
                  <div className="relative resumaic-gradient-green p-6 text-white rounded-t-xl animate-pulse-glow">
                    <div className="flex items-center gap-3">
                      <DialogTitle className="text-lg font-semibold text-white">
                        Set Password Required
                      </DialogTitle>
                    </div>
                    <DialogDescription className="mt-2 text-sm text-white/90">
                      You are logged in via {user?.source}. Please set a password to secure your account.
                    </DialogDescription>
                  </div>
                  <div className="p-6 bg-white space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPasswordState(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        className="flex-1 resumaic-gradient-green text-white hover:opacity-90 button-press"
                        onClick={handleSetPassword}
                        disabled={isSettingPassword}
                      >
                        {isSettingPassword ? 'Updating...' : 'Update Password'}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-2 border-gray-300 text-gray-800 bg-white hover:bg-gray-100 hover:text-gray-900"
                        onClick={handleLogout}
                        disabled={isSettingPassword}
                      >
                        Logout
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      You will be logged out after setting your password.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            )} */}

            {/* Blocking modal for unverified email */}
            {!isEmailVerified && !isSocialLogin && (
              <Dialog open>
                <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-xl rounded-xl">
                  <div className="relative resumaic-gradient-green p-6 text-white rounded-t-xl animate-pulse-glow">
                    <div className="flex items-center gap-3">
                      <DialogTitle className="text-lg font-semibold text-white">
                        Email Verification Required
                      </DialogTitle>
                    </div>
                    <DialogDescription className="mt-2 text-sm text-white/90">
                      Your email is not verified. Please verify to use Resumaic.
                    </DialogDescription>
                  </div>
                  <div className="p-6 bg-white">
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 resumaic-gradient-green text-white hover:opacity-90 button-press"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                      >
                        {resendLoading ? 'Sending…' : 'Resend Verification Link'}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-2 border-gray-300 text-gray-800 bg-white hover:bg-gray-100 hover:text-gray-900"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">
                      You cannot interact with other features until verification.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Mobile Header with Sidebar Trigger */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-40">
              <SidebarTrigger className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <h1 className="text-lg font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
              <div className="w-9" /> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <div className={`p-6 ${!isEmailVerified ? 'blur-sm pointer-events-none' : ''}`}>
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}