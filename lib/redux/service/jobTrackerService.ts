import { api } from "../../api"
import { store } from "../store"

export type JobSearchResult = Record<string, any>

export type Pipeline = {
  id: number | string
  name: string
  color?: string | null
}

export type JobApplication = {
  id: number | string
  company_name: string
  job_title: string
  application_date: string
  pipeline_id: number | string
  cv_id?: number | string | null
}

export type CreatePipelinePayload = {
  name: string
  color?: string
}

export type CreateJobApplicationPayload = {
  company_name: string
  job_title: string
  application_date: string
  pipeline_id: number | string
  cv_id?: number | string | null
}

export interface JobSearchFilters {
  what?: string
  where?: string
  page?: number
  results_per_page?: number
  sort_by?: "salary" | "date" | "relevance"
  salary_min?: number
  salary_max?: number
  full_time?: boolean
  part_time?: boolean
  permanent?: boolean
  contract?: boolean
  temp?: boolean
  what_exclude?: string
}

function toArray<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.jobs)) return data.jobs
  if (Array.isArray(data?.results)) return data.results
  return []
}

export async function searchJobs(filters: JobSearchFilters | string): Promise<JobSearchResult[]> {
  const params: any = typeof filters === "string" ? { what: filters } : { ...filters }

  // Clean up params: only send '1' for true, remove false/0/undefined/null
  if (typeof params !== "string") {
    // Helper to process boolean fields
    const processBool = (key: string) => {
      if (params[key]) {
        params[key] = 1
      } else {
        delete params[key]
      }
    }

    processBool('full_time')
    processBool('part_time')
    processBool('permanent')
    processBool('contract')
    processBool('temp')

    // Remove empty strings or undefined for other fields
    Object.keys(params).forEach(key => {
      if (params[key] === "" || params[key] === undefined || params[key] === null) {
        delete params[key]
      }
    })
  }

  const config: any = { params }
  
  // Try to get token from localStorage or Redux store
  let token: string | null = null
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token")
  }
  
  if (!token) {
    const state = store.getState()
    token = state.auth.token
  }

  console.log("JobSearch: Retrieved token for searchJobs:", token ? `Yes (Length: ${token.length})` : "No")

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    }
  }

  const response = await api.get(`/jobs/search`, config)
  return toArray<JobSearchResult>(response.data)
}

export async function googleSearchJobs(query: string): Promise<JobSearchResult[]> {
  const config: any = { params: { q: query } }
  
  // Try to get token from localStorage or Redux store
  let token: string | null = null
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token")
  }
  
  if (!token) {
    const state = store.getState()
    token = state.auth.token
  }

  console.log("JobSearch: Retrieved token for googleSearchJobs:", token ? `Yes (Length: ${token.length})` : "No")

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    }
  }

  const response = await api.get(`/jobs/google-search`, config)
  return toArray<JobSearchResult>(response.data)
}

export async function listPipelines(): Promise<Pipeline[]> {
  const response = await api.get(`/pipelines`)
  return toArray<Pipeline>(response.data)
}

export async function createPipeline(payload: CreatePipelinePayload): Promise<Pipeline> {
  const response = await api.post(`/pipelines`, payload)
  return response.data
}

export async function updatePipeline(id: number | string, payload: Partial<CreatePipelinePayload>): Promise<Pipeline> {
  const response = await api.put(`/pipelines/${id}`, payload)
  return response.data
}

export async function deletePipeline(id: number | string): Promise<void> {
  await api.delete(`/pipelines/${id}`)
}

export async function listJobApplications(pipelineId?: number | string): Promise<JobApplication[]> {
  const response = await api.get(`/job-applications`, {
    params: pipelineId ? { pipeline_id: pipelineId } : undefined,
  })
  return toArray<JobApplication>(response.data)
}

export async function getJobApplication(id: number | string): Promise<JobApplication> {
  const response = await api.get(`/job-applications/${id}`)
  return response.data
}

export async function createJobApplication(payload: CreateJobApplicationPayload): Promise<JobApplication> {
  const response = await api.post(`/job-applications`, payload)
  return response.data
}

export async function updateJobApplication(
  id: number | string,
  payload: Partial<Pick<JobApplication, "pipeline_id" | "company_name" | "job_title" | "application_date" | "cv_id">>,
): Promise<JobApplication> {
  const response = await api.put(`/job-applications/${id}`, payload)
  return response.data
}

export async function deleteJobApplication(id: number | string): Promise<void> {
  await api.delete(`/job-applications/${id}`)
}
