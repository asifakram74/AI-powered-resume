"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { Eye, EyeOff, Loader2, Shield } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../../components/ui/dialog"
import { changePassword, type ChangePasswordData } from "../../lib/api/settings"
import { toast } from "sonner"
import { useForm } from "react-hook-form"

interface ChangePasswordProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel?: () => void  // Made optional
}

export function ChangePassword({
  open,
  onOpenChange,
  onCancel = () => { },  // Default empty function
}: ChangePasswordProps) {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    clearErrors,
  } = useForm<ChangePasswordData>({
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    }
  })

  const newPassword = watch("new_password")
  const confirmPassword = watch("new_password_confirmation")

  const resetForm = () => {
    reset()
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    })
    clearErrors()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }
  const handleCancel = () => {
    resetForm()
    onOpenChange(false) // This will close the dialog
    onCancel?.() // Optional callback if provided
  }

  const onSubmit = async (data: ChangePasswordData) => {
    if (data.new_password !== data.new_password_confirmation) {
      setError("new_password_confirmation", {
        type: "manual",
        message: "New passwords do not match"
      })
      return
    }

    if (data.new_password.length < 8) {
      setError("new_password", {
        type: "manual",
        message: "Password must be at least 8 characters long"
      })
      return
    }

    setIsLoading(true)
    try {
      await changePassword(data)
      handleOpenChange(false)
      toast.success("Password changed successfully")
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message ||
        err?.message ||
        "Failed to change password. Please try again."
      toast.error("Failed to change password", {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2  ">
              <Shield className="h-5 w-5" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your current password and set a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password *</Label>
              <div className="relative">
                <Input
                  id="current_password"
                  type={showPasswords.current ? "text" : "password"}
                  {...register("current_password", {
                    required: "Current password is required"
                  })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2.5"
                  onClick={() => setShowPasswords(prev => ({
                    ...prev,
                    current: !prev.current
                  }))}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
              {errors.current_password && (
                <p className="text-sm text-red-600">
                  {errors.current_password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password *</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showPasswords.new ? "text" : "password"}
                  {...register("new_password", {
                    required: "New password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters"
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2.5"
                  onClick={() => setShowPasswords(prev => ({
                    ...prev,
                    new: !prev.new
                  }))}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
              {errors.new_password && (
                <p className="text-sm text-red-600">
                  {errors.new_password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password_confirmation">Confirm New Password *</Label>
              <div className="relative">
                <Input
                  id="new_password_confirmation"
                  type={showPasswords.confirm ? "text" : "password"}
                  {...register("new_password_confirmation", {
                    required: "Please confirm your new password",
                    validate: value =>
                      value === newPassword || "Passwords do not match"
                  })}
                />
                <button
                  type="button"
                  className="absolute right-2 top-2.5"
                  onClick={() => setShowPasswords(prev => ({
                    ...prev,
                    confirm: !prev.confirm
                  }))}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
              {errors.new_password_confirmation && (
                <p className="text-sm text-red-600">
                  {errors.new_password_confirmation.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="resumaic-gradient-green hover:opacity-90  button-press"
              type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
export default ChangePassword
