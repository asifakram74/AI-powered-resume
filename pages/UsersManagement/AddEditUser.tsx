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
        // If onSave callback is provided, use it
        onSave(formData)
      } else {
        // Otherwise use the API calls directly
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {mode === "create" ? "Create User" : "Edit User"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-row-1 lg:grid-cols-2 gap-6">
          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          <Card>
            <CardHeader>
              <CardTitle>Subscription & Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan">Plan *</Label>
                <select
                  id="plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <Label htmlFor="plan_type">Plan Type *</Label>
                <select
                  id="plan_type"
                  name="plan_type"
                  value={formData.plan_type}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <Label htmlFor="language">Language *</Label>
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div className="flex items-center space-x-2 pt-2">
                <input
                  id="dark_mode"
                  name="dark_mode"
                  type="checkbox"
                  checked={formData.dark_mode === 1}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    dark_mode: e.target.checked ? 1 : 0
                  }))}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="dark_mode" className="!mt-0">
                  Enable Dark Mode
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="push_notifications"
                  name="push_notifications"
                  type="checkbox"
                  checked={formData.push_notifications === 1}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    push_notifications: e.target.checked ? 1 : 0
                  }))}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="push_notifications" className="!mt-0">
                  Enable Push Notifications
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="email_updates"
                  name="email_updates"
                  type="checkbox"
                  checked={formData.email_updates === 1}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    email_updates: e.target.checked ? 1 : 0
                  }))}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="email_updates" className="!mt-0">
                  Subscribe to Email Updates
                </Label>
              </div>*/}
            </CardContent>
          </Card>
        </div> 

        <div className="mt-6 flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
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