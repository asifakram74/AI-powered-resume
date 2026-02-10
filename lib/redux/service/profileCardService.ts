import { api } from "../../api"

export interface AttachedLink {
  id: string
  type: 'cv' | 'cover_letter' | 'custom'
  title: string
  url: string
  platformId?: string
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
  public_slug?: string
}

// Helper to construct full storage URL
const getStorageUrl = (path: string | undefined) => {
  if (!path) return undefined
  // If it's a full URL or a data URI, return as is
  if (path.startsWith('http') || path.startsWith('data:')) return path
  
  // If it's a frontend asset (like the default profile image), return as is
  if (path === '/profile-img.png' || path === 'profile-img.png') return path
  
  const baseURL = api.defaults.baseURL || ""
  // Remove /api or /public/api from the end to get the root URL
  // Example: https://stagingbackend.resumaic.com/api -> https://stagingbackend.resumaic.com
  const rootURL = baseURL.replace(/\/api\/?$/, "").replace(/\/public\/?$/, "")
  
  // Ensure path starts with /
  let cleanPath = path.startsWith('/') ? path : `/${path}`
  
  // Fix for internal storage paths
  if (cleanPath.includes('/storage/app/public/')) {
    cleanPath = cleanPath.replace('/storage/app/public/', '/storage/')
  }
  
  // Fix for missing /storage prefix for media files
  // If it starts with /media/ and doesn't have /storage/ prefix, add it
  if (cleanPath.startsWith('/media/')) {
    cleanPath = `/storage${cleanPath}`
  }
  
  return `${rootURL}${cleanPath}`
}

// Helper to transform profile card data
const transformProfileCard = (card: ProfileCard): ProfileCard => {
  return {
    ...card,
    profile_picture: getStorageUrl(card.profile_picture)
  }
}

// Get all profile cards for the current user
export const getProfileCards = async (): Promise<ProfileCard[]> => {
  try {
    const response = await api.get("/profile-card")
    return Array.isArray(response.data) ? response.data.map(transformProfileCard) : []
  } catch (error) {
    console.error("Error fetching profile cards:", error)
    throw error
  }
}

// Get a single profile card by ID
export const getProfileCardById = async (id: string | number): Promise<ProfileCard> => {
  try {
    const response = await api.get(`/profile-card/${id}`)
    return transformProfileCard(response.data)
  } catch (error) {
    console.error(`Error fetching profile card ${id}:`, error)
    throw error
  }
}

// Get public profile by slug
export const getPublicProfileBySlug = async (slug: string): Promise<ProfileCard> => {
  try {
    const response = await api.get(`/profiles-card/${slug}`)
    return transformProfileCard(response.data)
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

    return transformProfileCard(response.data)
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      throw new Error("This username is already taken. Please choose a different one.")
    }
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

    return transformProfileCard(response.data)
  } catch (error: any) {
    if (error.response && error.response.status === 422) {
      throw new Error("This username is already taken. Please choose a different one.")
    }
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

// Upload profile picture
export const uploadProfilePicture = async (id: string | number, file: File): Promise<{ status: boolean; message: string; data: { profile_picture_url: string } }> => {
  try {
    const formData = new FormData()
    formData.append("profile_picture", file)

    const response = await api.post(`/profile-card/${id}/profile-picture`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    
    // Transform the returned URL
    if (response.data?.data?.profile_picture_url) {
      response.data.data.profile_picture_url = getStorageUrl(response.data.data.profile_picture_url) || ""
    }
    
    return response.data
  } catch (error) {
    console.error(`Error uploading profile picture for card ${id}:`, error)
    throw error
  }
}