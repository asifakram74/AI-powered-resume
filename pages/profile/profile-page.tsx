"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { useAppDispatch, useAppSelector } from "../../lib/redux/hooks"
import { updateProfile, fetchProfile, clearProfile } from "../../lib/redux/slices/authSlice" // Import clearProfile
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Loader2, Edit, Shield, Mail, Star, BadgeCheck, FileText, Target, UserCircle, TrendingUp } from "lucide-react"
import { Crown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { ChangePassword } from "./ChangePassword"
import { getPersonas } from "../../lib/redux/service/pasonaService"
import { getCVs } from "../../lib/redux/service/resumeService"
import { getCoverLetters } from "../../lib/redux/service/coverLetterService"
import { getATSResumes } from "../../lib/redux/service/atsResumeService"
import { showSuccessToast, showErrorToast } from "../../components/ui/toast"
import { useRouter } from "next/navigation"
import { createCheckoutSession } from "../../lib/redux/service/paymentService"

interface StatItem {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: string
}

interface ProfileFormData {
  name: string
  email: string
  // plan_type?: string
}

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { profile, user } = useAppSelector((state) => state.auth)
  const [stats, setStats] = useState<StatItem[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const hasLoaded = useRef(false)
  const [isSubscribing, setIsSubscribing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      // plan_type: profile?.plan_type || 'Free',
    }
  })

  useEffect(() => {
    const checkAndLoadProfile = async () => {
      try {
        // setIsLoading(true)

        if (profile && user && profile.email !== user.email) {
          dispatch(clearProfile())
          await dispatch(fetchProfile()).unwrap()
        } else if (!profile) {
          await dispatch(fetchProfile()).unwrap()
        }

        if (user?.id) {
          const [personas, cvs, coverLetters, atsResumes] = await Promise.all([
            getPersonas(user.id.toString()),
            getCVs(user.id.toString()),
            getCoverLetters(user.id.toString()),
            getATSResumes(),
          ])

          setStats([
            {
              label: "Resumes Created",
              value: cvs.length,
              icon: FileText,
              color: "text-blue-600",
            },
            {
              label: "Cover Letters",
              value: coverLetters.length,
              icon: Mail,
              color: "text-green-600",
            },
            {
              label: "ATS Checks",
              value: atsResumes.length,
              icon: Target,
              color: "text-orange-600",
            },
            {
              label: "Personas Generated",
              value: personas.length,
              icon: UserCircle,
              color: "text-purple-600",
            },
          ])
        }

        hasLoaded.current = true
      } finally {
        setIsLoading(false)
      }
    }

    checkAndLoadProfile()
  }, [profile, user, dispatch])


  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        email: profile.email,
        // plan_type: profile.plan_type,
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsUpdating(true)
      await dispatch(updateProfile({
        name: data.name,
      })).unwrap()
      await dispatch(fetchProfile()).unwrap()
      showSuccessToast("Profile updated successfully")
      setShowEditModal(false)
    } catch (error: any) {
      showErrorToast("Failed to update profile", error || "Failed to update profile. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (loadingError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert variant="destructive" className="w-auto">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{loadingError}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section with Profile Header */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
            {/* Profile Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-white dark:ring-gray-700 shadow-lg">
                <AvatarFallback className="resumaic-gradient-green hover:opacity-90 button-press text-white text-2xl sm:text-3xl font-bold">
                  {profile?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white truncate">
                    {profile.name}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
                      <span>{profile.plan_type}</span>
                    </Badge>

                    {profile.status === 'verified' && (
                      <Badge className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 font-medium">
                        <BadgeCheck className="h-4 w-4" />
                        <span>Verified</span>
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-md">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none sm:min-w-[140px] h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                className="flex-1 sm:flex-none sm:min-w-[160px] h-11 resumaic-gradient-green hover:opacity-90 button-press shadow-md transition-all" 
                onClick={() => setShowPasswordDialog(true)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${
                    stat.color === 'text-blue-600' ? 'from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30' :
                    stat.color === 'text-green-600' ? 'from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30' :
                    stat.color === 'text-orange-600' ? 'from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30' :
                    'from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30'
                  }`}>
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color} dark:opacity-90`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Personal Information Card */}
          <div className="xl:col-span-2">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                    <UserCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Your personal details and account information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <UserCircle className="h-4 w-4 text-gray-500" />
                      Full Name
                    </Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                        {profile.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      Email Address
                    </Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-all">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:col-span-2">
                    <Label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Star className="h-4 w-4 text-gray-500" />
                      Account Type
                    </Label>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                          {profile.plan_type}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Card */}
          <div className="xl:col-span-1">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    Quick Actions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setShowEditModal(true)}
                >
                  <Edit className="h-4 w-4 mr-3 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium">Edit Profile</p>
                    <p className="text-xs text-gray-500">Update your information</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  <Shield className="h-4 w-4 mr-3 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">Change Password</p>
                    <p className="text-xs text-gray-500">Update your security</p>
                  </div>
                </Button>

                {profile?.plan_type?.toLowerCase() !== 'pro' && user?.role?.toLowerCase() !== 'admin' && (
                  <Button
                    className="w-full justify-start h-12 resumaic-gradient-green hover:opacity-90 button-press"
                    onClick={async () => {
                      try {
                        setIsSubscribing(true)
                        await createCheckoutSession()
                      } catch (err: any) {
                        console.error("Checkout error:", err)
                        const message = err?.response?.data?.message || "Unable to create checkout session"
                        showErrorToast(message)
                      } finally {
                        setIsSubscribing(false)
                      }
                    }}
                    disabled={isSubscribing}
                  >
                    <Crown className="h-4 w-4 mr-3 text-white" />
                    <div className="text-left">
                      <p className="font-medium text-white">Upgrade Plan</p>
                      <p className="text-xs text-white/80">Unlock all features</p>
                    </div>
                  </Button>
                )}
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Account Status</p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      {/* Email verification indicator based on account status */}
                      {user?.status?.toLowerCase() === 'active' ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700">
                          <BadgeCheck className="h-4 w-4 text-green-600 dark:text-green-300" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">Email Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700">
                          <div className="h-4 w-4 rounded-full bg-yellow-400"></div>
                          <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Email Not Verified</span>
                        </div>
                      )}

                      {/* Role summary */}
                      {/* {user?.role && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700">
                          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Role: {user.role}</span>
                        </div>
                      )} */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showEditModal} onOpenChange={(open) => {
        if (!open) {
          reset({
            name: profile?.name || '',
            email: profile?.email || '',
            // plan_type: profile?.plan_type,
          });
        }
        setShowEditModal(open);
      }}>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters"
                    }
                  })}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  disabled
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Account Type</Label>
                <Input value={profile?.plan_type} disabled />
              </div>
            </div>

            <DialogFooter>
              {/* <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset({
                    name: profile?.name || '',
                    email: profile?.email || '',
                    plan_type: profile?.plan_type,
                  });
                  setShowEditModal(false);
                }}
              >
                Cancel
              </Button> */}
              <Button
                className="resumaic-gradient-green hover:opacity-90 button-press"
                type="submit"
                disabled={!isDirty || isUpdating}  // disable if no changes or updating
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>

            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ChangePassword
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />
    </div>
  )
}
export default ProfilePage
