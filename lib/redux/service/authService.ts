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
  has_password?: boolean
}

export type ProfileResponse = {
  name: string
  email: string
  phone?: string
  plan_type: string
  role: string
  status: string
  cvs_count: number
  cover_letters_count: number
  ats_resumes_count: number
  first_login: number
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

export const markPasswordAsSet = (): void => {
  localStorage.setItem('password_set', 'true')
}

export const clearPasswordSetFlag = (): void => {
  localStorage.removeItem('password_set')
}

export const checkPasswordSetFlag = (): boolean => {
  return localStorage.getItem('password_set') === 'true'
}

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post("/login", credentials)
    
    // For social login users, check if they've set password before
    if (response.data.user.source && 
        (response.data.user.source === 'Google' || response.data.user.source === 'Linkedin')) {
      
      // Check localStorage for password set flag
      const passwordWasSet = checkPasswordSetFlag()
      
      // If we have no record, it's a new session - start fresh
      if (!passwordWasSet) {
        clearPasswordSetFlag()
      }
    }
    
    return response.data
  },

  register: async (userData: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post("/register", userData)
    
    // For social signups, don't mark password as set
    if (userData.source && userData.source !== 'Webiste') {
      clearPasswordSetFlag()
    }
    
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post("/logout")
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    // Optionally clear password_set flag on logout
    // clearPasswordSetFlag()
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
    await api.post("/settings/change-password", { current_password: oldPassword, new_password: newPassword, new_password_confirmation: newPassword })
  },

  setPassword: async (password: string): Promise<void> => {
    await api.post("/settings/set-password", { password, password_confirmation: password })
    
    // Mark password as set in localStorage
    markPasswordAsSet()
    
    // Also update user object in localStorage if exists
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      // We don't have has_set_password in User type, so just update localStorage user if needed
      // user.has_set_password = true 
      localStorage.setItem('user', JSON.stringify(user))
    }
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete("/me")
  },

  linkedinLogin: async (code: string): Promise<AuthResponse> => {
    const redirectUri = (window.location.origin + window.location.pathname).replace(/\/$/, "");
    const response = await api.post("/linkedin/token", { code, redirect_uri: redirectUri });
    
    // Clear password set flag for new LinkedIn login
    clearPasswordSetFlag()
    
    return response.data;
  },

  googleLogin: async (code: string): Promise<AuthResponse> => {
    const response = await api.post("/google-login", { code })
    
    // Clear password set flag for new Google login
    clearPasswordSetFlag()
    
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
