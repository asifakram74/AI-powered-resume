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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div className="flex items-top gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="resumaic-gradient-green hover:opacity-90  button-press text-white text-2xl font-medium">
              {profile?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex gap-2 item-center">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={profile.plan_type === 'Premium' ? 'default' : 'secondary'}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${profile.plan_type === 'Premium'
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                    }`}
                >
                  {profile.plan_type === 'Premium' ? (
                    <>
                      <Star className="h-4 w-4 fill-blue-200 text-blue-200" />
                      <span>Premium Member</span>
                    </>
                  ) : (
                    <span>Free Member</span>
                  )}
                </Badge>

                {profile.status === 'verified' && (
                  <Badge
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full 
                bg-blue-50 dark:bg-blue-900/30 
                border border-blue-200 dark:border-blue-700
                text-blue-600 dark:text-blue-300"
                  >
                    <BadgeCheck className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    <span>Verified</span>
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="w-50" onClick={() => setShowEditModal(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button className="w-50 resumaic-gradient-green hover:opacity-90  button-press" onClick={() => setShowPasswordDialog(true)}>
            <Shield className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</CardTitle>
              <CardDescription>
                Your personal details and account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">Full Name</Label>
                  <p className="text-sm text-gray-500">{profile.name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 dark:text-white">Account Type</Label>
                  <p className="text-sm capitalize text-gray-500">{profile.plan_type || 'Free'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-900 dark:text-white" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                    <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showEditModal} onOpenChange={(open) => {
        if (!open) {
          reset({
            name: profile?.name || '',
            email: profile?.email || '',
            // plan_type: profile?.plan_type || 'Free',
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
                <Input value={profile?.plan_type || 'Free'} disabled />
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
                    plan_type: profile?.plan_type || 'Free',
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
