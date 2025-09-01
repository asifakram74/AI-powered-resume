import { api } from "../../api"

export interface UsersApiResponse {
  users: {
    current_page: number
    data: User[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: {
      url: string | null
      label: string
      active: boolean
    }[]
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
  }
}

export interface User {
  id: number
  name: string
  email: string
  otp: string | null
  otp_expiry: string | null
  otp_count: number | null
  role: string
  status: string
  
  plan: string
  email_verified_at: string
  plan_type: string
  created_at: string
  updated_at: string
  provider_id: string | null
  provider_name: string | null
  dark_mode: number
  language: string
  push_notifications: number
  email_updates: number
   source: string 
  
  
  
}

export interface CreateUserData {
  name: string
  email: string
  password: string
  role?: string
  status?: string
  plan?: string
  plan_type?: string
  provider_id?: string | null
  provider_name?: string | null
  dark_mode?: number
  language?: string
  push_notifications?: number
  email_updates?: number
   source: string
}

export interface UpdateUserData {
  name?: string
  email?: string
  role?: string
  status?: string
  plan?: string
  plan_type?: string
  dark_mode?: number
  language?: string
  push_notifications?: number
  email_updates?: number
   source: string
}

export const getUsers = async (page = 1): Promise<UsersApiResponse> => {
  try {
    const response = await api.get(`/users?page=${page}`)
    return response.data as UsersApiResponse
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

export const getUserById = async (id: number): Promise<User> => {
  try {
    const response = await api.get(`/users/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error)
    throw error
  }
}

export interface CreateUserResponse {
  userInfo: User
  status: number
  message: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

export interface ValidationError extends Error {
  message: string
  errors?: Record<string, string[]>
  isValidationError: boolean
}

export const createUser = async (data: CreateUserData): Promise<CreateUserResponse> => {
  try {
    console.log("Sending user data to API:", JSON.stringify(data, null, 2))
    const response = await api.post("/register", data)
    console.log("Received user response from API:", JSON.stringify(response.data, null, 2))

    // Handle successful response
    if (response.data.userInfo && response.data.status === 200) {
      return response.data
    }

    // If response doesn't match expected success format, throw error
    throw new Error("Unexpected response format from server")
  } catch (error: any) {
    console.error("Error creating user:", error)

    // Handle validation errors from server
    if (error.response?.data) {
      const errorData = error.response.data

      // Check if it's a validation error
      if (errorData.message === "Validation failed" && errorData.errors) {
        const validationError: ValidationError = new Error(errorData.message) as ValidationError
        validationError.errors = errorData.errors
        validationError.isValidationError = true
        throw validationError
      }

      // Handle other server errors
      if (errorData.message) {
        throw new Error(errorData.message)
      }

      // Forward the entire server error response for other cases
      throw errorData
    }

    // Handle network or other errors
    throw new Error(error.message || "Failed to create user")
  }
}

export const updateUser = async (id: number, data: UpdateUserData): Promise<User> => {
  try {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating user ${id}:`, error)
    throw error
  }
}

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await api.delete(`/users/${id}`)
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error)
    throw error
  }
}

export const verifyEmail = async (userId: number): Promise<User> => {
  try {
    const response = await api.post(`/users/${userId}/verify-email`)
    return response.data
  } catch (error) {
    console.error(`Error verifying email for user ${userId}:`, error)
    throw error
  }
}

export const updateUserPreferences = async (
  userId: number,
  preferences: {
    dark_mode?: number
    language?: string
    push_notifications?: number
    email_updates?: number
  },
): Promise<User> => {
  try {
    const response = await api.put(`/users/${userId}/preferences`, preferences)
    return response.data
  } catch (error) {
    console.error(`Error updating preferences for user ${userId}:`, error)
    throw error
  }
}
