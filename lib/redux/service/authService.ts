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
}

export type ProfileResponse = {
  name: string
  email: string
  plan_type: string
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
}

export type UpdateProfileData = {
  name?: string
  email?: string
  plan_type?: string
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
    await api.post("/change-password", { oldPassword, newPassword })
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete("/me")
  },
}
