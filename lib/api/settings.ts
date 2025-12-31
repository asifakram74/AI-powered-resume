import { api } from "./index"

export interface UserSettings {
  dark_mode: boolean
  language: string
  push_notifications: boolean
  email_updates: boolean
}

export interface UpdateSettingsData {
  dark_mode?: boolean
  language?: string
  push_notifications?: boolean
  email_updates?: boolean
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export interface SetPasswordData {
  password: string
  password_confirmation: string
}

// 🟢 GET user settings
export const getSettings = async (): Promise<UserSettings> => {
  try {
    const response = await api.get("/settings")
    return response.data
  } catch (error) {
    console.error("Error fetching settings:", error)
    throw error
  }
}

// 🟡 UPDATE user settings
export const updateSettings = async (data: UpdateSettingsData): Promise<{ message: string }> => {
  try {
    const response = await api.put("/settings", data)
    return response.data
  } catch (error) {
    console.error("Error updating settings:", error)
    throw error
  }
}

// 🟡 CHANGE password
export const changePassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  try {
    const response = await api.post("/settings/change-password", data)
    return response.data
  } catch (error) {
    console.error("Error changing password:", error)
    throw error
  }
}

// � SET password
export const setPassword = async (data: SetPasswordData): Promise<{ message: string }> => {
  try {
    const response = await api.post("/settings/set-password", data)
    return response.data
  } catch (error) {
    console.error("Error setting password:", error)
    throw error
  }
}

// �🟢 EXPORT account data
export const exportAccountData = async (): Promise<{ message: string; download_url: string }> => {
  try {
    const response = await api.post("/settings/export-data")
    return response.data
  } catch (error) {
    console.error("Error exporting account data:", error)
    throw error
  }
}

// 🔴 DELETE account
export const deleteAccount = async (): Promise<{ message: string }> => {
  try {
    const response = await api.delete("/settings/delete-account")
    return response.data
  } catch (error) {
    console.error("Error deleting account:", error)
    throw error
  }
}
