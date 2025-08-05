import { api } from "./index"

export interface CV {
  id: string
  user_id: number
  layout_id: string
  title: string
  name: string
  email: string
  phone?: string
  address?: string
  content: any
  created_at: string
  updated_at: string
}

export interface CreateCVData {
  layout_id: string
  title: string
  name: string
  email: string
  phone?: string
  address?: string
  content: any
}

// 🟢 GET all CVs
export const getCVs = async (): Promise<CV[]> => {
  try {
    const response = await api.get("/cvs")
    return response.data
  } catch (error) {
    console.error("Error fetching CVs:", error)
    throw error
  }
}

// 🟢 GET a single CV
export const getCVById = async (id: string): Promise<CV> => {
  try {
    const response = await api.get(`/cvs/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching CV ${id}:`, error)
    throw error
  }
}

// 🟢 CREATE CV
export const createCV = async (cvData: CreateCVData): Promise<CV> => {
  try {
    console.log("Sending CV data to API:", JSON.stringify(cvData, null, 2))
    const response = await api.post("/cvs", cvData)
    console.log("Received CV response from API:", JSON.stringify(response.data, null, 2))
    return response.data
  } catch (error) {
    console.error("Error creating CV:", error)
    throw error
  }
}

// 🟡 UPDATE CV
export const updateCV = async (id: string, cvData: Partial<CreateCVData>): Promise<CV> => {
  try {
    const response = await api.put(`/cvs/${id}`, cvData)
    return response.data
  } catch (error) {
    console.error(`Error updating CV ${id}:`, error)
    throw error
  }
}

// 🔴 DELETE CV
export const deleteCV = async (id: string): Promise<void> => {
  try {
    await api.delete(`/cvs/${id}`)
  } catch (error) {
    console.error(`Error deleting CV ${id}:`, error)
    throw error
  }
}
