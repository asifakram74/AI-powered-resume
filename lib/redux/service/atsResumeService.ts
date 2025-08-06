import { api } from "../../api"

export interface ATSResume {
  id: string
  user_id: number
  resume_file_path: string
  job_description: string
  analysis_result?: string
  created_at: string
  updated_at: string
}

export interface CreateATSResumeData {
  resume_file_path: string
  job_description: string
  analysis_result?: string
}

export const getATSResumes = async (): Promise<ATSResume[]> => {
  try {
    const response = await api.get("/ats-resumes")
    return response.data
  } catch (error) {
    console.error("Error fetching ATS resumes:", error)
    throw error
  }
}

export const getATSResumeById = async (id: string): Promise<ATSResume> => {
  try {
    const response = await api.get(`/ats-resumes/${id}`)
    return response.data
  } catch (error) {
    console.error(`Error fetching ATS resume ${id}:`, error)
    throw error
  }
}

export const createATSResume = async (data: CreateATSResumeData): Promise<ATSResume> => {
  try {
    console.log("Sending ATS resume data to API:", JSON.stringify(data, null, 2))
    const response = await api.post("/ats-resumes", data)
    console.log("Received ATS resume response from API:", JSON.stringify(response.data, null, 2))
    return response.data
  } catch (error) {
    console.error("Error creating ATS resume:", error)
    throw error
  }
}

export const updateATSResume = async (id: string, data: Partial<CreateATSResumeData>): Promise<ATSResume> => {
  try {
    const response = await api.put(`/ats-resumes/${id}`, data)
    return response.data
  } catch (error) {
    console.error(`Error updating ATS resume ${id}:`, error)
    throw error
  }
}

export const deleteATSResume = async (id: string): Promise<void> => {
  try {
    await api.delete(`/ats-resumes/${id}`)
  } catch (error) {
    console.error(`Error deleting ATS resume ${id}:`, error)
    throw error
  }
}
