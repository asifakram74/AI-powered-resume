import { api } from "../../api"

export type User = {
  id: number
  name: string
  email: string
  otp: string | null
  otp_expiry: string | null
  otp_count: number | null
  role: string
  status: string
  plan: string
  email_verified_at: string | null
  plan_type: string
  created_at: string
  updated_at: string
  dark_mode: string
  language: string
  push_notifications: string
  email_updates: string
  source?: string
  provider_name?: string
  provider_id?: string
  is_verified?: boolean
  reset_token?: string | null
  reset_token_expiry?: string | null
  last_login?: string
  is_active?: boolean
}

export type ProfileResponse = {
  name: string
  email: string
  phone?: string
  plan_type: string
  status: string
  cvs_count: number
  cover_letters_count: number
  ats_resumes_count: number
}

export type RegisterResponse = {
  userInfo: Omit<
    User,
    | "otp"
    | "otp_expiry"
    | "otp_count"
    | "role"
    | "status"
    | "plan"
    | "email_verified_at"
    | "plan_type"
    | "dark_mode"
    | "language"
    | "push_notifications"
    | "email_updates"
    | "source"
    | "provider_name"
    | "provider_id"
  >
  status: number
  message: string
}

export type AuthResponse = {
  user: User
  token: string
}

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterData = {
  name: string
  email: string

    password: string
  source?: "Webiste" | "Google" | "Linkedin"
}

export type UpdateProfileData = {
  name?: string
  email?: string
  plan_type?: string
}

export type ForgotPasswordResponse = {
  message: string
}

export type VerifyOTPResponse = {
  message: string
  token: string
}

export type ResetPasswordData = {
  email: string
  otp: string
  password: string
}

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post("/login", credentials)
    return response.data
  },

  register: async (userData: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post("/register", userData)
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post("/logout")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  },

  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get("/profile")
    return response.data
  },

  updateProfile: async (data: Partial<UpdateProfileData>): Promise<ProfileResponse> => {
    const response = await api.put("/profile", data)
    return response.data
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await api.post("/change-password", { old_password: oldPassword, new_password: newPassword })
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete("/me")
  },

linkedinLogin: async (code: string): Promise<AuthResponse> => {
  const redirectUri = window.location.origin + window.location.pathname;
  const response = await api.post("/linkedin/token", { code, redirect_uri: redirectUri });
  return response.data;
},


  googleLogin: async (code: string): Promise<AuthResponse> => {
    const response = await api.post("/google-login", { code })
    return response.data
  },

  // Forgot Password Flow
  verifyEmail: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await api.post("/verify-email", { email })
    return response.data
  },

  verifyOTP: async (email: string, otp: string): Promise<VerifyOTPResponse> => {
    const response = await api.post("/verify-otp", { email, otp })
    return response.data
  },

  resetPassword: async (data: ResetPasswordData): Promise<ForgotPasswordResponse> => {
    console.log("AuthService resetPassword called with:", data)
    console.log("OTP value in service:", data.otp)
    console.log("OTP type in service:", typeof data.otp)
    
    const payload = {
      email: data.email,
      otp: data.otp,
      password: data.password
    }
    
    console.log("Sending payload to API:", payload)
    
    const response = await api.post("/reset-password", payload)
    return response.data
  },

  // Resend Email Verification (Login/Account verification)
  resendEmailVerification: async (email: string): Promise<{ message: string }> => {
    const response = await api.post("/resend-email-verification", { email })
    return response.data
  },
}
