"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserCircle, Edit, FileText, Mail, Target, Calendar, TrendingUp } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { fetchProfile, updateProfile } from "@/lib/redux/slices/authSlice"

const recentActivity = [
  { action: "Created new resume", item: "Software Engineer Resume", time: "2 hours ago", type: "resume" },
  { action: "Generated cover letter", item: "Frontend Developer Position", time: "1 day ago", type: "cover-letter" },
  { action: "ATS check completed", item: "Full Stack Developer CV", time: "2 days ago", type: "ats" },
  { action: "Created persona", item: "Senior Developer Persona", time: "3 days ago", type: "persona" },
]

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const { profile, loading, error, user } = useAppSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    plan_type: ""
  })
  const [isEditing, setIsEditing] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

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
      })).unwrap()

      setSuccess("Profile updated successfully")
      setIsEditing(false)
    } catch (err) {
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        plan_type: profile.plan_type || "",
      })
    }
    setIsEditing(false)
  }

  if (!profile && loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-gray-500" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">Failed to load profile data</p>
      </div>
    )
  }


  const stats = [
    { label: "Resumes Created", value: profile.cvs_count, icon: FileText, color: "text-blue-600" },
    { label: "Cover Letters", value: profile.cover_letters_count, icon: Mail, color: "text-green-600" },
    { label: "ATS Checks", value: profile.ats_resumes_count, icon: Target, color: "text-orange-600" },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
          <UserCircle className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account and view your activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert variant="default">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg?height=64&width=64" />
                  <AvatarFallback>
                    {profile.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
                  <p className="text-gray-600">{profile.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {profile.plan_type || "Free Member"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                {isEditing ? (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Name</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <Input
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Plan Type</Label>
                      <Input
                        value={formData.plan_type}
                        onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleSave} disabled={loading} className="flex-1">
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                      <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <p className="text-sm text-gray-600">{profile.email}</p>
                    </div>
                    {/* <div>
                      <Label className="text-sm font-medium text-gray-700">Member Since</Label>
                      <p className="text-sm text-gray-600">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Recently"}
                      </p>
                    </div> */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Plan Type</Label>
                      <p className="text-sm text-gray-600">{profile.plan_type}</p>
                    </div>
                    <Button className="w-full bg-transparent" variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900">{profile.cvs_count}</div>
                  <div className="text-xs text-gray-600">Resumes Created</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-gray-900">{profile.cover_letters_count}</div>
                  <div className="text-xs text-gray-600">Cover Letters</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold text-gray-900">{profile.ats_resumes_count}</div>
                  <div className="text-xs text-gray-600">ATS Checks</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <UserCircle className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-gray-900">5</div>
                  <div className="text-xs text-gray-600">Personas Generated</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your recent actions and generated content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="rounded-full bg-white p-2">
                      {activity.type === "resume" && <FileText className="h-4 w-4 text-blue-600" />}
                      {activity.type === "cover-letter" && <Mail className="h-4 w-4 text-green-600" />}
                      {activity.type === "ats" && <Target className="h-4 w-4 text-orange-600" />}
                      {activity.type === "persona" && <UserCircle className="h-4 w-4 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.item}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <FileText className="h-6 w-6" />
                  <span className="text-xs">New Resume</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Mail className="h-6 w-6" />
                  <span className="text-xs">Cover Letter</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Target className="h-6 w-6" />
                  <span className="text-xs">ATS Check</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <UserCircle className="h-6 w-6" />
                  <span className="text-xs">New Persona</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}