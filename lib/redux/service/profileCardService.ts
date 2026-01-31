import { api } from "../../api"

export interface AttachedLink {
  id: string
  type: 'cv' | 'cover_letter' | 'custom'
  title: string
  url: string
}

export interface SocialLinks {
  linkedin?: string
  github?: string
  twitter?: string
  custom_links?: AttachedLink[]
}

export interface ProfileCard {
  id: string | number
  user_id: string | number
  full_name: string
  job_title?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  profile_picture?: string
  summary?: string
  social_links?: SocialLinks
  additional_link?: string
  public_slug: string
  created_at: string
  updated_at: string
}

export interface CreateProfileCardData {
  full_name: string
  job_title?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  profile_picture?: string
  summary?: string
  social_links?: SocialLinks
  additional_link?: string
}

export interface UpdateProfileCardData {
  full_name?: string
  job_title?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  profile_picture?: string
  summary?: string
  social_links?: SocialLinks
  additional_link?: string
}

// Get all profile cards for the current user
export const getProfileCards = async (): Promise<ProfileCard[]> => {
  try {
    const response = await api.get("/profile-card")
    return response.data
  } catch (error) {
    console.error("Error fetching profile cards:", error)
    throw error
  }
}

// Get a single profile card by ID
export const getProfileCardById = async (id: string | number): Promise<ProfileCard> => {
  try {
    const response = await api.get(`/profile-card/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching profile card ${id}:`, error)
    throw error
  }
}

// Get public profile by slug
export const getPublicProfileBySlug = async (slug: string): Promise<ProfileCard> => {
  try {
    const response = await api.get(`/profiles-card/${slug}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching public profile ${slug}:`, error)
    throw error
  }
}

// Create a new profile card
export const createProfileCard = async (data: CreateProfileCardData): Promise<ProfileCard> => {
  try {
    // Convert social_links object to string if it exists
    const payload = {
      ...data,
      social_links: data.social_links ? JSON.stringify(data.social_links) : undefined
    }
    
    const response = await api.post("/profile-card", payload)

    // Fallback: Ensure full_name is present in response
    if (!response.data.full_name && data.full_name) {
      response.data.full_name = data.full_name
    }

    return response.data
  } catch (error) {
    console.error("Error creating profile card:", error)
    throw error
  }
}

// Update an existing profile card
export const updateProfileCard = async (id: string | number, data: UpdateProfileCardData): Promise<ProfileCard> => {
  try {
    // Convert social_links object to string if it exists
    const payload = {
      ...data,
      social_links: data.social_links ? JSON.stringify(data.social_links) : undefined
    }
    
    const response = await api.put(`/profile-card/${id}`, payload)

    // Fallback: Ensure full_name is present in response
    if (!response.data.full_name && data.full_name) {
      response.data.full_name = data.full_name
    }

    return response.data
  } catch (error) {
    console.error(`Error updating profile card ${id}:`, error)
    throw error
  }
}

// Delete a profile card
export const deleteProfileCard = async (id: string | number): Promise<void> => {
  try {
    await api.delete(`/profile-card/${id}`)
  } catch (error) {
    console.error(`Error deleting profile card ${id}:`, error)
    throw error
  }
}