import { api } from "../../api"

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
  cv_id: number | string
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
  cv_id: number | string
}

function toArray<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.jobs)) return data.jobs
  if (Array.isArray(data?.results)) return data.results
  return []
}

export async function searchJobs(query: string): Promise<JobSearchResult[]> {
  const response = await api.get(`/jobs/search`, { params: { q: query } })
  return toArray<JobSearchResult>(response.data)
}

export async function googleSearchJobs(query: string): Promise<JobSearchResult[]> {
  const response = await api.get(`/jobs/google-search`, { params: { q: query } })
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
