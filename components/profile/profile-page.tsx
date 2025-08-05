"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Calendar, Crown, FileText, MessageSquare, CheckCircle, TrendingUp, Edit, Save, X } from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { updateProfile, fetchProfile } from "@/lib/redux/slices/authSlice"

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const { user, profile, loading } = useAppSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
  })

  useEffect(() => {
    if (user) {
      dispatch(fetchProfile())
      setEditForm({
        name: user.name || "",
        email: user.email || "",
      })
    }
  }, [dispatch, user])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      await dispatch(updateProfile(editForm))
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
    })
  }

  const getPlanBadgeColor = (planType: string) => {
    switch (planType?.toLowerCase()) {
      case "premium":
      case "pro":
        return "bg-gradient-to-r from-orange-500 to-red-500 text-white"
      case "basic":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            {!isEditing ? (
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback className="text-2xl">
                {user?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  {isEditing ? (
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-lg font-medium">{user?.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email Address</Label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p className="text-lg font-medium">{user?.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-600">Plan:</span>
                  <Badge className={getPlanBadgeColor(user?.plan_type || "free")}>
                    {user?.plan_type?.toUpperCase() || "FREE"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Member since {new Date(user?.created_at || "").toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Account Statistics
            </CardTitle>
            <CardDescription>Overview of your account usage and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">{profile.cvs_count || 0}</span>
                </div>
                <p className="text-sm text-gray-600">Resumes Created</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <span className="text-2xl font-bold text-purple-600">{profile.cover_letters_count || 0}</span>
                </div>
                <p className="text-sm text-gray-600">Cover Letters</p>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{profile.ats_resumes_count || 0}</span>
                </div>
                <p className="text-sm text-gray-600">ATS Analyses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <div>
              <h3 className="font-semibold text-gray-900">{user?.plan_type?.toUpperCase() || "FREE"} Plan</h3>
              <p className="text-sm text-gray-600">
                {user?.plan_type === "free"
                  ? "Limited features with basic functionality"
                  : "Full access to all premium features"}
              </p>
            </div>
            <div className="text-right">
              {user?.plan_type === "free" ? (
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  Upgrade Plan
                </Button>
              ) : (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium Active
                </Badge>
              )}
            </div>
          </div>

          {user?.plan_type === "free" && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Upgrade Benefits</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Unlimited resumes and cover letters</li>
                <li>• Premium CV templates</li>
                <li>• Advanced ATS optimization</li>
                <li>• Priority customer support</li>
                <li>• Export to multiple formats</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account settings and data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Change Password</h4>
                <p className="text-sm text-gray-600">Update your account password for security</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Export Account Data</h4>
                <p className="text-sm text-gray-600">Download all your account data and documents</p>
              </div>
              <Button variant="outline">Export Data</Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-medium text-red-900">Delete Account</h4>
                <p className="text-sm text-red-600">Permanently delete your account and all associated data</p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
