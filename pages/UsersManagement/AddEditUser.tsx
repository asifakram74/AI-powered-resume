"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { 
  createUser, 
  updateUser, 
  getUserById, 
  type CreateUserData, 
  type UpdateUserData, 
  type User 
} from "@/lib/redux/service/userService"
import {
  User as UserIcon,
  Mail,
  Shield,
  TrendingUp,
  Briefcase,
  Target,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface UserFormProps {
  userId?: number
  mode: "create" | "edit"
  onSave?: (userData: CreateUserData | UpdateUserData) => void
  onCancel?: () => void
  initialData?: {
    name: string
    email: string
    role: string
    status: string
    plan: string
    plan_type: string
    dark_mode: number
    language: string
    push_notifications: number
    email_updates: number
  }
}

const roles = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
]

const statuses = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
]

const plans = [
  { value: "free", label: "Free" },
  { value: "basic", label: "Basic" },
  { value: "premium", label: "Premium" },
]

const planTypes = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
]

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
]

export function UserForm({ userId, mode, onSave, onCancel, initialData }: UserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    status: "active",
    plan: "free",
    plan_type: "monthly",
    dark_mode: 0,
    language: "en",
    push_notifications: 1,
    email_updates: 1,
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else if (mode === "edit" && userId) {
      loadUserData()
    }
  }, [mode, userId, initialData])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      const user: User = await getUserById(userId as number)
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        plan: user.plan,
        plan_type: user.plan_type,
        dark_mode: user.dark_mode,
        language: user.language,
        push_notifications: user.push_notifications,
        email_updates: user.email_updates,
      })
    } catch (error) {
      console.error("Error loading user data:", error)
      toast.error("Failed to load user data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked ? 1 : 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      if (onSave) {
        onSave(formData)
      } else {
        if (mode === "create") {
          await createUser(formData as CreateUserData)
          toast.success("User created successfully")
        } else if (userId) {
          await updateUser(userId, formData as UpdateUserData)
          toast.success("User updated successfully")
        }
        
        router.push("/admin/users")
        router.refresh()
      }
    } catch (error) {
      console.error("Error saving user:", error)
      toast.error(`Failed to ${mode === "create" ? "create" : "update"} user`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push("/admin/users")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#70E4A8]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg resumaic-gradient-green text-white">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#2D3639] font-rubik">
              {mode === "create" ? "Create User" : "Edit User"}
            </h1>
            <p className="text-gray-600 font-inter">
              {mode === "create" ? "Add a new user to the system" : "Update user information"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-transparent hover:border-[#70E4A8]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-rubik text-[#2D3639]">
                <UserIcon className="h-5 w-5 text-[#70E4A8]" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-rubik text-[#2D3639]">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  className="font-inter border-[#70E4A8]/30 focus:border-[#70E4A8]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-rubik text-[#2D3639]">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  className="font-inter border-[#70E4A8]/30 focus:border-[#70E4A8]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="font-rubik text-[#2D3639]">Role *</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-[#70E4A8]/30 bg-background px-3 py-2 text-sm font-inter ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70E4A8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="font-rubik text-[#2D3639]">Status *</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-[#70E4A8]/30 bg-background px-3 py-2 text-sm font-inter ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70E4A8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Subscription & Preferences Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-transparent hover:border-[#70E4A8]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-rubik text-[#2D3639]">
                <Briefcase className="h-5 w-5 text-[#70E4A8]" />
                Subscription & Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan" className="font-rubik text-[#2D3639]">Plan *</Label>
                <select
                  id="plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-[#70E4A8]/30 bg-background px-3 py-2 text-sm font-inter ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70E4A8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  {plans.map(plan => (
                    <option key={plan.value} value={plan.value}>
                      {plan.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan_type" className="font-rubik text-[#2D3639]">Plan Type *</Label>
                <select
                  id="plan_type"
                  name="plan_type"
                  value={formData.plan_type}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-[#70E4A8]/30 bg-background px-3 py-2 text-sm font-inter ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70E4A8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  {planTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language" className="font-rubik text-[#2D3639]">Language *</Label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-[#70E4A8]/30 bg-background px-3 py-2 text-sm font-inter ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70E4A8] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <Card className="animate-slide-up-delay-3 hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#70E4A8]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-rubik text-[#2D3639]">
              <div className="p-2 bg-gradient-to-br from-[#70E4A8] to-[#EA580C] rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              User Management Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 animate-fade-in-stagger" style={{ animationDelay: "100ms" }}>
                <div className="rounded-full bg-[#70E4A8]/20 p-3 animate-float" style={{ animationDelay: "0s" }}>
                  <Shield className="h-5 w-5 text-[#70E4A8]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#2D3639] font-rubik">Role Assignment</h4>
                  <p className="text-sm text-gray-600 font-inter">Assign admin roles only to trusted users who need system-wide access</p>
                </div>
              </div>

              <div className="flex items-start gap-4 animate-fade-in-stagger" style={{ animationDelay: "200ms" }}>
                <div className="rounded-full bg-[#EA580C]/20 p-3 animate-float" style={{ animationDelay: "0.5s" }}>
                  <Target className="h-5 w-5 text-[#EA580C]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#2D3639] font-rubik">Plan Selection</h4>
                  <p className="text-sm text-gray-600 font-inter">Choose appropriate plans based on user needs and feature requirements</p>
                </div>
              </div>

              <div className="flex items-start gap-4 animate-fade-in-stagger" style={{ animationDelay: "300ms" }}>
                <div className="rounded-full bg-[#70E4A8]/20 p-3 animate-float" style={{ animationDelay: "1s" }}>
                  <CheckCircle className="h-5 w-5 text-[#70E4A8]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#2D3639] font-rubik">Active Status</h4>
                  <p className="text-sm text-gray-600 font-inter">Keep users active to ensure they can access all system features</p>
                </div>
              </div>

              <div className="flex items-start gap-4 animate-fade-in-stagger" style={{ animationDelay: "400ms" }}>
                <div className="rounded-full bg-[#EA580C]/20 p-3 animate-float" style={{ animationDelay: "1.5s" }}>
                  <XCircle className="h-5 w-5 text-[#EA580C]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#2D3639] font-rubik">Suspension</h4>
                  <p className="text-sm text-gray-600 font-inter">Suspend users temporarily if needed, rather than deleting accounts</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="border-[#70E4A8]/30 hover:border-[#70E4A8]/50 text-[#2D3639] font-inter"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="resumaic-gradient-green hover:opacity-90 button-press font-inter"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === "create" ? "Creating..." : "Updating..."}
              </>
            ) : (
              <>{mode === "create" ? "Create User" : "Update User"}</>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}