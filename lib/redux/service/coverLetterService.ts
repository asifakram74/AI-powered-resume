import { api } from "../../api"

export interface CoverLetter {
  id: string
  user_id: number
  job_description: string
  tone: string
  generated_letter: string
  created_at: string
  updated_at: string
}

export interface CreateCoverLetterData {
  job_description: string
  tone: string
  generated_letter: string
}

export const getCoverLetters = async (userId: string): Promise<CoverLetter[]> => {
  try {
    const response = await api.get(`/cover-letters?user_id=${userId}`, {
      timeout: 10000
    });
    return response.data
  } catch (error) {
    console.error("Error fetching cover letters:", error)
    throw error
  }
}

export const getCoverLetterById = async (id: string): Promise<CoverLetter> => {
  try {
    const response = await api.get(`/cover-letters/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching cover letter ${id}:`, error)
    throw error
  }
}

export const createCoverLetter = async (data: CreateCoverLetterData): Promise<CoverLetter> => {
  try {
    console.log("Sending cover letter data to API:", JSON.stringify(data, null, 2))
    const response = await api.post("/cover-letters", data)
    console.log("Received cover letter response from API:", JSON.stringify(response.data, null, 2))
    return response.data
  } catch (error) {
    console.error("Error creating cover letter:", error)
    throw error
  }
}

export const updateCoverLetter = async (id: string, data: Partial<CreateCoverLetterData>): Promise<CoverLetter> => {
  try {
    const response = await api.put(`/cover-letters/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating cover letter ${id}:`, error)
    throw error
  }
}

export const deleteCoverLetter = async (id: string): Promise<void> => {
  try {
    await api.delete(`/cover-letters/${id}`)
  } catch (error) {
    console.error(`Error deleting cover letter ${id}:`, error)
    throw error
  }
}
