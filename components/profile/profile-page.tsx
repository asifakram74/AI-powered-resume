"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Edit, Shield, Mail, Star, BadgeCheck, FileText, Target, UserCircle, TrendingUp } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { fetchProfile, updateProfile } from "@/lib/redux/slices/authSlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ChangePassword } from "./ChangePassword"
import { getPersonas } from "@/lib/redux/service/pasonaService"
import { getCVs } from "@/lib/redux/service/cvService"
import { getCoverLetters } from "@/lib/redux/service/coverLetterService"
import { getATSResumes } from "@/lib/redux/service/atsResumeService"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { showSuccessToast, showErrorToast } from "@/components/ui/toast"

interface StatItem {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const { profile, loading: authLoading, error, user } = useAppSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    plan_type: "",
    status: ""
  })
  const [stats, setStats] = useState<StatItem[]>([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEverything = async () => {
      try {
        setIsLoading(true)
        setLoadingError(null)
        
        const profileData = await dispatch(fetchProfile()).unwrap()
        
        setFormData({
          name: profileData.name,
          email: profileData.email,
          plan_type: profileData.plan_type || "",
          status: profileData.status || "",
        })

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
              value: profileData?.cvs_count || cvs.length,
              icon: FileText,
              color: "text-blue-600",
            },
            {
              label: "Cover Letters",
              value: profileData?.cover_letters_count || coverLetters.length,
              icon: Mail,
              color: "text-green-600",
            },
            {
              label: "ATS Checks",
              value: profileData?.ats_resumes_count || atsResumes.length,
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
      } catch (err) {
        console.error("Error fetching data:", err)
        setLoadingError("Failed to load profile data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEverything()
  }, [dispatch, user?.id])

  const handleSave = async () => {
    try {
      await dispatch(updateProfile({
        name: formData.name,
        email: formData.email,
        plan_type: formData.plan_type,
        status: formData.status,
      })).unwrap()
      await dispatch(fetchProfile()).unwrap()
      showSuccessToast("Profile updated successfully")
      setShowEditModal(false)
    } catch (err) {
      showErrorToast("Failed to update profile", error || "Failed to update profile. Please try again.")
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

  if (loadingError || !profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert variant="destructive" className="w-auto">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{loadingError || "Failed to load profile data"}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div className="flex items-top gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-2xl font-medium">
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
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile?.name}</h1>
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
          <Button className="w-50" onClick={() => setShowPasswordDialog(true)}>
            <Shield className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Personal Information</CardTitle>
              <CardDescription>
                Your personal details and account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                    <p className="text-sm font-medium">{profile.name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-sm font-medium">{profile.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Account Type</Label>
                    <p className="text-sm font-medium capitalize">{profile.plan_type || 'Free'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Account Status</Label>
                    <p className="text-sm font-medium capitalize">{profile.status}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                    <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[600px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update your personal information and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email address"
              />
            </div>
            <div className="space-y-2">
              <Label>Account Type</Label>
              <Input
                value={formData.plan_type}
                onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Account Status</Label>
              <Input
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                disabled
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={authLoading} className="cursor-pointer">
                {authLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ChangePassword
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />
    </div>
  )
}