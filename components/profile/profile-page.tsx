"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UserCircle, Edit, Shield, Mail, Star, BadgeCheck } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { fetchProfile, updateProfile } from "@/lib/redux/slices/authSlice"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ChangePassword } from "./ChangePassword"
import { StatsCard } from "./StatsCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const { profile, loading, error } = useAppSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    plan_type: "",
    status: ""
  })
  const [success, setSuccess] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfile())
    }
  }, [dispatch, profile])

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        plan_type: profile.plan_type || "",
        status: profile.status || "",
      })
    }
  }, [profile])

  const handleSave = async () => {
    try {
      setSuccess(null)
      await dispatch(updateProfile({
        name: formData.name,
        email: formData.email,
        plan_type: formData.plan_type,
        status: formData.status,
      })).unwrap()

      setSuccess("Profile updated successfully")
      setShowEditModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  if (!profile && loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert variant="destructive" className="w-auto">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load profile data</AlertDescription>
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
                {/* Premium/Free Member Badge */}
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

                {/* Verified Badge */}
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
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button onClick={() => setShowPasswordDialog(true)}>
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
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

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
          <StatsCard />
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
              <Button onClick={handleSave} disabled={loading} className="cursor-pointer">
                {loading ? (
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
        onSuccess={() => {
          setSuccess("Password changed successfully")
          setTimeout(() => setSuccess(null), 3000)
        }}
      />
    </div>
  )
}