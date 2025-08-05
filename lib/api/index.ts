import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backendcv.onlinetoolpot.com/api"

// Define interfaces matching the exact API structure
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

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
})

// Interceptors
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
    return Promise.reject(error)
  },
)

// 🟢 GET all personas
export const getPersonas = async (): Promise<PersonaResponse[]> => {
  try {
    const response = await api.get("/personas")
    // Handle Laravel API response structure: { status: true, data: [...] }
    return response.data.data || response.data
  } catch (error) {
    console.error("Error fetching personas:", error)
    throw error
  }
}

// 🟢 GET a single persona
export const getPersonaById = async (id: number): Promise<PersonaResponse> => {
  try {
    const response = await api.get(`/personas/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching persona ${id}:`, error)
    throw error
  }
}

// 🟢 CREATE persona — matches your exact required API shape
export const createPersona = async (personaData: PersonaData): Promise<PersonaResponse> => {
  try {
    // Validate URLs before sending
    const validateUrl = (url: string, fieldName: string) => {
      if (!url || url.trim() === "") return "" // Empty is valid

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

    console.log("Sending persona data to API:", JSON.stringify(payload, null, 2))

    const response = await api.post("/personas", payload)
    console.log("Received response from API:", JSON.stringify(response.data, null, 2))
    return response.data
  } catch (error) {
    console.error("Error creating persona:", error)
    if (axios.isAxiosError(error)) {
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
      })

      // Log validation errors if they exist
      if (error.response?.data?.errors) {
        console.error("Validation errors:", error.response.data.errors)
      }

      // Provide more user-friendly error messages
      if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || "Server error occurred"
        throw new Error(`Server Error: ${errorMessage}`)
      }
    } else {
      console.error("Non-Axios error:", error)
    }
    throw error
  }
}

// 🟡 UPDATE persona
export const updatePersona = async (id: number, personaData: Partial<PersonaData>): Promise<PersonaResponse> => {
  try {
    const response = await api.put(`/personas/${id}`, personaData)
    return response.data
  } catch (error) {
    console.error(`Error updating persona ${id}:`, error)
    throw error
  }
}

// 🔴 DELETE persona
export const deletePersona = async (id: number): Promise<void> => {
  try {
    await api.delete(`/personas/${id}`)
  } catch (error) {
    console.error(`Error deleting persona ${id}:`, error)
    throw error
  }
}
