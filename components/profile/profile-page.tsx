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
import { getPersonas } from "@/lib/redux/service/pasonaService"
import { getCVs } from "@/lib/redux/service/cvService"
import { getCoverLetters } from "@/lib/redux/service/coverLetterService"
import { getATSResumes } from "@/lib/redux/service/atsResumeService"
import Link from "next/link"

interface ContentItem {
  id: string
  title: string
  type: "persona" | "cv" | "cover-letter" | "ats"
  createdAt: string
}

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
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loadingContent, setLoadingContent] = useState(false)

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

  useEffect(() => {
    const fetchUserContent = async () => {
      if (!user?.id) return
      
      try {
        setLoadingContent(true)
        
        // Fetch all content in parallel
        const [personas, cvs, coverLetters, atsResumes] = await Promise.all([
          getPersonas(user.id.toString()),
          getCVs(user.id.toString()),
          getCoverLetters(user.id.toString()),
          getATSResumes()
        ])

        // Transform all content into a unified format with unique keys
        const allContent: ContentItem[] = [
          ...personas.map(p => ({
            id: `persona-${p.id}`,
            title: p.full_name || `Persona ${p.id}`,
            type: "persona" as const,
            createdAt: p.created_at,
            originalId: p.id
          })),
          ...cvs.map(cv => ({
            id: `cv-${cv.id}`,
            title: cv.title || `CV ${cv.id}`,
            type: "cv" as const,
            createdAt: cv.created_at,
            originalId: cv.id
          })),
          ...coverLetters.map(cl => ({
            id: `cover-letter-${cl.id}`,
            title: `Cover Letter for ${cl.job_description?.substring(0, 30) || 'Untitled'}...`,
            type: "cover-letter" as const,
            createdAt: cl.created_at,
            originalId: cl.id
          })),
          ...atsResumes.map(ats => ({
            id: `ats-${ats.id}`,
            title: `ATS Check for ${ats.job_description?.substring(0, 30) || 'Untitled'}...`,
            type: "ats" as const,
            createdAt: ats.created_at,
            originalId: ats.id
          }))
        ]

        // Sort by creation date (newest first)
        allContent.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        setContentItems(allContent)
      } catch (err) {
        console.error("Failed to fetch user content:", err)
      } finally {
        setLoadingContent(false)
      }
    }

    if (user?.id) {
      fetchUserContent()
    }
  }, [user?.id])

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
      console.error(err)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getContentLink = (item: ContentItem) => {
    // Extract the original ID by removing the prefix
    const originalId = item.id.includes('-') ? item.id.split('-').slice(1).join('-') : item.id
    
    switch (item.type) {
      case "persona":
        return `/dashboard/personas/${originalId}`
      case "cv":
        return `/dashboard/cv/${originalId}`
      case "cover-letter":
        return `/dashboard/cover-letters/${originalId}`
      case "ats":
        return `/dashboard/ats/${originalId}`
      default:
        return "#"
    }
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
    { 
      label: "Resumes Created", 
      value: profile?.cvs_count || contentItems.filter(i => i.type === "cv").length, 
      icon: FileText, 
      color: "text-blue-600" 
    },
    { 
      label: "Cover Letters", 
      value: profile?.cover_letters_count || contentItems.filter(i => i.type === "cover-letter").length, 
      icon: Mail, 
      color: "text-green-600" 
    },
    { 
      label: "ATS Checks", 
      value: profile?.ats_resumes_count || contentItems.filter(i => i.type === "ats").length, 
      icon: Target, 
      color: "text-orange-600" 
    },
    { 
      label: "Personas Generated", 
      value: contentItems.filter(i => i.type === "persona").length, 
      icon: UserCircle, 
      color: "text-purple-600" 
    },
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
                  <p className="text-gray-600 text-xs">{profile.email}</p>
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

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Your Generated Content
              </CardTitle>
              <CardDescription>All your created personas, CVs, cover letters, and ATS checks</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingContent ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
                </div>
              ) : contentItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  You haven't created any content yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {contentItems.map((item) => (
                    <Link 
                      key={item.id} 
                      href={getContentLink(item)}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="rounded-full bg-white p-2">
                        {item.type === "cv" && <FileText className="h-4 w-4 text-blue-600" />}
                        {item.type === "cover-letter" && <Mail className="h-4 w-4 text-green-600" />}
                        {item.type === "ats" && <Target className="h-4 w-4 text-orange-600" />}
                        {item.type === "persona" && <UserCircle className="h-4 w-4 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {item.type === "cv" && "CV: "}
                          {item.type === "cover-letter" && "Cover Letter: "}
                          {item.type === "ats" && "ATS Check: "}
                          {item.type === "persona" && "Persona: "}
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
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
                <Link href="/dashboard?page=create-cv">
                  <Button variant="outline" className="h-20 w-full flex-col gap-2 bg-transparent">
                    <FileText className="h-6 w-6" />
                    <span className="text-xs">New Resume</span>
                  </Button>
                </Link>
                <Link href="/dashboard?page=create-cover-letter">
                  <Button variant="outline" className="h-20 w-full flex-col gap-2 bg-transparent">
                    <Mail className="h-6 w-6" />
                    <span className="text-xs">Cover Letter</span>
                  </Button>
                </Link>
                <Link href="/dashboard?page=create-ats">
                  <Button variant="outline" className="h-20 w-full flex-col gap-2 bg-transparent">
                    <Target className="h-6 w-6" />
                    <span className="text-xs">ATS Check</span>
                  </Button>
                </Link>
                <Link href="/dashboard?page=create-persona">
                  <Button variant="outline" className="h-20 w-full flex-col gap-2 bg-transparent">
                    <UserCircle className="h-6 w-6" />
                    <span className="text-xs">New Persona</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}