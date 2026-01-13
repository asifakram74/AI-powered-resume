import { api } from "../../api"
import axios from "axios"

export interface CV {
  id: string
  user_id: string 
  personas_id: string
  layout_id: string
  title: string
  job_description: string
  created_at: string
  updated_at: string
  generated_content?: string
}

export interface CreateCVData {
  user_id: string
  personas_id: string
  layout_id: string
  title: string
  job_description: string
  generated_content?: string
}

export const getAllCVs = async (): Promise<CV[]> => {
  try {
    const response = await api.get(`/cvs`);
    return response.data
  } catch (error) {
    console.error("Error fetching CVs:", error)
    throw error
  }
}

export const getCVs = async (userId: string): Promise<CV[]> => {
  try {
    const response = await api.get(`/cvs?user_id=${userId}`);
    return response.data
  } catch (error) {
    console.error("Error fetching CVs:", error)
    throw error
  }
}

export const getCVById = async (id: string): Promise<CV> => {
  try {
    const response = await api.get(`/cvs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching CV ${id}:`, error);
    throw error;
  }
};

export const updateCV = async (id: string, cvData: Partial<CreateCVData>): Promise<CV> => {
  try {
    const response = await api.put(`/cvs/${id}`, cvData);
    return response.data;
  } catch (error) {
    console.error(`Error updating CV ${id}:`, error);
    throw error;
  }
};
export const createCV = async (cvData: CreateCVData): Promise<CV> => {
  try {
    console.log("Sending CV data to API:", JSON.stringify(cvData, null, 2))
    const response = await api.post("/cvs", cvData)
    console.log("Received CV response from API:", JSON.stringify(response.data, null, 2))
    return response.data
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const data = error.response?.data as any;
      const backendMsg = data?.message || data?.error || error.message;

      if (status >= 500) {
        console.error("Server error creating CV:", error);
      }

      const customError = new Error(backendMsg || "Failed to create resume");
      (customError as any).response = error.response;
      throw customError;
    }

    console.error("Unexpected error creating CV:", error);
    throw error
  }
}

// export const updateCV = async (id: string, cvData: Partial<CreateCVData>): Promise<CV> => {
//   try {
//     const response = await api.put(`/cvs/${id}`, cvData)
//     return response.data
//   } catch (error) {
//     console.error(`Error updating CV ${id}:`, error)
//     throw error
//   }
// }

export const deleteCV = async (id: string): Promise<void> => {
  try {
    await api.delete(`/cvs/${id}`)
  } catch (error) {
    console.error(`Error deleting CV ${id}:`, error)
    throw error
  }
}