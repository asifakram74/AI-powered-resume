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
