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

// For Getting All data
export const getAllPersonas = async (): Promise<PersonaResponse[]> => {
  try {
    const response = await api.get(`/personas`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching personas:", error);
    throw new Error("Failed to fetch personas. Please try again later.");
  }
};

export const getPersonas = async (userId: string): Promise<PersonaResponse[]> => {
  try {
    const response = await api.get(`/personas?user_id=${userId}`, {
      timeout: 10000
    });
    return response.data.data;
  } catch (error) {
    console.error("Error fetching personas:", error);
    throw new Error("Failed to fetch personas. Please try again later.");
  }
};

export const getPersonaById = async (id: number): Promise<PersonaResponse> => {
  try {
    const response = await api.get(`/personas/${id}`)
    return response.data
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
        profilePicture: personaData.personalInfo.profilePicture || "",
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
    console.error("Error creating persona:", error)
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || "Server error occurred"
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