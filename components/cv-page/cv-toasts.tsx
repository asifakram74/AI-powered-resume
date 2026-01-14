import { toast } from "sonner"
import { CheckCircle, AlertCircle, Brain, Loader2 } from "lucide-react"
import React from "react"

export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 4000,
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    style: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
    },
  })
}

export const showErrorToast = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: 5000,
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    style: {
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
    },
  })
}
export const showInfoToast = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 4000,
    icon: <Brain className="h-5 w-5 text-blue-500" />,
    style: {
      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
    },
  })
}

export const showLoadingToast = (message: string, description?: string) => {
  return toast.loading(message, {
    description,
    icon: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
    style: {
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      color: "#1e293b",
      border: "1px solid #cbd5e1",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
    },
  })
}
