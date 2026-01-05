"use client"

import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Eye, EyeOff, Loader2, Shield } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../../components/ui/dialog"
import { setUserPassword } from "../../lib/redux/slices/authSlice"
import { type SetPasswordData } from "../../lib/api/settings"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { useAppDispatch } from "../../lib/redux/hooks"

interface SetPasswordProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel?: () => void
}

// Change this to be the default export
export default function SetPassword({
  open,
  onOpenChange,
  onCancel = () => { },
}: SetPasswordProps) {
  const dispatch = useAppDispatch()
  const [showPasswords, setShowPasswords] = useState({
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
  } = useForm<SetPasswordData>({
    defaultValues: {
      password: "",
      password_confirmation: "",
    }
  })

  const newPassword = watch("password")

  const resetForm = () => {
    reset()
    setShowPasswords({
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
    onOpenChange(false)
    onCancel?.()
  }

  const onSubmit = async (data: SetPasswordData) => {
    if (data.password !== data.password_confirmation) {
      setError("password_confirmation", {
        type: "manual",
        message: "Passwords do not match"
      })
      return
    }

    if (data.password.length < 8) {
      setError("password", {
        type: "manual",
        message: "Password must be at least 8 characters long"
      })
      return
    }

    setIsLoading(true)
    try {
      await dispatch(setUserPassword(data)).unwrap()
      handleOpenChange(false)
      toast.success("Password set successfully")
    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : (err?.message || "Failed to set password. Please try again.")
      toast.error("Failed to set password", {
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
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Create Password
            </DialogTitle>
            <DialogDescription>
              Create a password to secure your account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <div className="relative">
                <Input
                  id="new_password"
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Enter new password"
                  {...register("password", { required: "New password is required" })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password_confirmation">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="new_password_confirmation"
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  {...register("password_confirmation", { required: "Please confirm your password" })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {errors.password_confirmation && (
                <p className="text-sm text-red-500">{errors.password_confirmation.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="resumaic-gradient-green text-white hover:opacity-90">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}