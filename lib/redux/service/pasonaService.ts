import { api } from "../../api"
import axios from "axios"

export interface PersonaData {
  personalInfo: {
    full_name: string
    jobTitle: string
    email: string
    phone?: string
    address?: string
    city?: string
    country?: string
    profilePicture?: string
    summary?: string
    linkedin?: string
    github?: string
  }
  experience: any[]
  education: any[]
  skills: {
    technical: string[]
    soft: string[]
  }
  languages: string[]
  certifications: any[]
  projects: any[]
  additional: {
    interests: string[]
  }
}

export interface PersonaResponse {
  id: string
  user_id?: number
  full_name: string
  job_title: string
  email: string
  phone?: string
  address?: string
  city?: string
  country?: string
  profile_picture?: string
  summary?: string
  linkedin?: string
  github?: string
  experience: any[]
  education: any[]
  skills: any
  languages: any[]
  certifications: any[]
  projects: any[]
  additional: any
  created_at: string
  updated_at?: string
  generatedPersona?: string
}

// Helper function to construct full profile picture URL
const constructProfilePictureUrl = (profilePicture: string | null | undefined): string | null => {
  if (!profilePicture) return null;
  if (profilePicture.startsWith('http://') || profilePicture.startsWith('https://')) {
    return profilePicture;
  }
  if (profilePicture.startsWith('media/')) {
    return `https://stagingbackend.resumaic.com/storage/app/public/${profilePicture}`;
  }
  return profilePicture;
};

export const getAllPersonas = async (): Promise<PersonaResponse[]> => {
  try {
    const response = await api.get(`/personas`);
    const personas = response.data.data;
    return personas.map((persona: PersonaResponse) => ({
      ...persona,
      profile_picture: constructProfilePictureUrl(persona.profile_picture)
    }));
  } catch (error) {
    console.error("Error fetching personas:", error);
    throw new Error("Failed to fetch personas. Please try again later.");
  }
};

export const getPersonas = async (userId: string): Promise<PersonaResponse[]> => {
  try {
    const response = await api.get(`/personas?user_id=${userId}`, { timeout: 10000 });
    const personas = response.data.data;
    return personas.map((persona: PersonaResponse) => ({
      ...persona,
      profile_picture: constructProfilePictureUrl(persona.profile_picture)
    }));
  } catch (error) {
    console.error("Error fetching personas:", error);
    throw new Error("Failed to fetch personas. Please try again later.");
  }
};

export const getPersonaById = async (id: number): Promise<PersonaResponse> => {
  try {
    const response = await api.get(`/personas/${id}`)
    const persona = response.data;
    return {
      ...persona,
      profile_picture: constructProfilePictureUrl(persona.profile_picture)
    };
  } catch (error) {
    console.error(`Error fetching persona ${id}:`, error)
    throw error
  }
}

export const createPersona = async (personaData: PersonaData): Promise<PersonaResponse> => {
  try {
    const validateUrl = (url: string, fieldName: string) => {
      if (!url || url.trim() === "") return ""
      try {
        new URL(url)
        return url
      } catch {
        throw new Error(`Invalid ${fieldName} URL: ${url}`)
      }
    }

    const payload = {
      personalInfo: {
        full_name: personaData.personalInfo.full_name,
        jobTitle: personaData.personalInfo.jobTitle,
        email: personaData.personalInfo.email,
        phone: personaData.personalInfo.phone || "",
        address: personaData.personalInfo.address || "",
        city: personaData.personalInfo.city || "",
        country: personaData.personalInfo.country || "",
        profilePicture: null, // Always set to null for initial creation
        summary: personaData.personalInfo.summary || "",
        linkedin: validateUrl(personaData.personalInfo.linkedin || "", "LinkedIn"),
        github: validateUrl(personaData.personalInfo.github || "", "GitHub"),
      },
      experience: personaData.experience || [],
      education: personaData.education || [],
      skills: {
        technical: personaData.skills?.technical || [],
        soft: personaData.skills?.soft || [],
      },
      languages: personaData.languages || [],
      certifications: personaData.certifications || [],
      projects: personaData.projects || [],
      additional: {
        interests: personaData.additional?.interests || [],
      },
    }

    const response = await api.post("/personas", payload)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const data = error.response?.data as any
      const backendMessage = data?.error || data?.message

      // For expected business/validation errors (4xx), do not log to console
      if (status && status >= 400 && status < 500) {
        throw new Error(backendMessage || "Request failed")
      }

      // Log only unexpected/server-side issues
      console.error("Error creating persona:", error)
      if (status && status >= 500) {
        const errorMessage = backendMessage || "Server error occurred"
        throw new Error(`Server Error: ${errorMessage}`)
      }
    }
    throw error
  }
}

export const updatePersona = async (id: number, personaData: Partial<PersonaData>): Promise<PersonaResponse> => {
  try {
    const response = await api.put(`/personas/${id}`, personaData)
    return response.data
  } catch (error) {
    console.error(`Error updating persona ${id}:`, error)
    throw error
  }
}

export const deletePersona = async (id: number): Promise<void> => {
  try {
    await api.delete(`/personas/${id}`)
  } catch (error) {
    console.error(`Error deleting persona ${id}:`, error)
    throw error
  }
}

export const uploadPersonaProfilePicture = async (personaId: string, file: File): Promise<PersonaResponse> => {
  try {
    const formData = new FormData()
    formData.append('profile_picture', file)

    const response = await api.post(`/personas/${personaId}/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error(`Error uploading profile picture for persona ${personaId}:`, error)
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || "Server error occurred"
        throw new Error(`Server Error: ${errorMessage}`)
      }
    }
    throw error
  }
}

export const getPersonaProfilePicture = async (personaId: string): Promise<string> => {
  try {
    const response = await api.get(`/personas/${personaId}/profile-picture`, {
      responseType: 'blob',
    })
    const imageUrl = URL.createObjectURL(response.data)
    return imageUrl
  } catch (error) {
    console.error(`Error getting profile picture for persona ${personaId}:`, error)
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Profile picture not found for persona ${personaId}`)
      }
      if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || "Server error occurred"
        throw new Error(`Server Error: ${errorMessage}`)
      }
    }
    throw error
  }
}

// New: delete persona profile picture
export const deletePersonaProfilePicture = async (personaId: string): Promise<void> => {
  try {
    await api.delete(`/personas/${personaId}/profile-picture`)
  } catch (error) {
    console.error(`Error deleting profile picture for persona ${personaId}:`, error)
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Profile picture not found for persona ${personaId}`)
      }
      if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || "Server error occurred"
        throw new Error(`Server Error: ${errorMessage}`)
      }
    }
    throw error
  }
}