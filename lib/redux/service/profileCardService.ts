import { api } from "../../api"

export interface ProfileCardLink {
  label: string
  url: string
}

export interface ProfileCardAttachments {
  cv_id?: string | number
  cover_letter_id?: string | number
}

export interface ProfileCard {
  id: string | number
  slug: string
  display_name: string
  headline?: string
  bio?: string
  avatar_url?: string
  is_listed: boolean
  attachments?: ProfileCardAttachments
  links?: ProfileCardLink[]
  created_at?: string
  updated_at?: string
}

export interface CreateProfileCardData {
  slug: string
  display_name: string
  headline?: string
  bio?: string
  avatar_url?: string
  is_listed?: boolean
  attachments?: ProfileCardAttachments
  links?: ProfileCardLink[]
}

export interface UpdateProfileCardData {
  slug?: string
  display_name?: string
  headline?: string
  bio?: string
  avatar_url?: string
  is_listed?: boolean
  attachments?: ProfileCardAttachments
  links?: ProfileCardLink[]
}

export const getProfileCards = async (): Promise<ProfileCard[]> => {
  try {
    const response = await api.get("/profiles")
    return response.data
  } catch (error) {
    console.error("Error fetching profile cards:", error)
    throw error
  }
}

export const getProfileCardById = async (id: string | number): Promise<ProfileCard> => {
  try {
    const response = await api.get(`/profiles/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching profile card ${id}:`, error)
    throw error
  }
}

export const createProfileCard = async (data: CreateProfileCardData): Promise<ProfileCard> => {
  try {
    const response = await api.post("/profiles", data)
    return response.data
  } catch (error) {
    console.error("Error creating profile card:", error)
    throw error
  }
}

export const updateProfileCard = async (id: string | number, data: UpdateProfileCardData): Promise<ProfileCard> => {
  try {
    const response = await api.put(`/profiles/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating profile card ${id}:`, error)
    throw error
  }
}

export const deleteProfileCard = async (id: string | number): Promise<void> => {
  try {
    await api.delete(`/profiles/${id}`)
  } catch (error) {
    console.error(`Error deleting profile card ${id}:`, error)
    throw error
  }
}
