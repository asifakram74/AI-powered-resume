export interface CV {
  id: string
  user_id: number
  personas_id: string
  layout_id: string
  title: string
  job_description: string
  type?: 'job_based' | 'general'
  created_at: string
  updated_at: string
}

export interface CVContent {
  personalInfo?: {
    summary?: string
    linkedin?: string
    github?: string
    website?: string
  }
  experience?: Array<{
    id: string
    jobTitle: string
    companyName: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    responsibilities: string[]
  }>
  education?: Array<{
    id: string
    degree: string
    institutionName: string
    location: string
    graduationDate: string
    gpa?: string
    honors?: string
  }>
  skills?: {
    technical: string[]
    soft: string[]
  }
  languages?: Array<{
    id: string
    name: string
    proficiency: "Native" | "Fluent" | "Advanced" | "Intermediate" | "Basic"
  }>
  certifications?: Array<{
    id: string
    title: string
    issuingOrganization: string
    dateObtained: string
    verificationLink?: string
  }>
  projects?: Array<{
    id: string
    name: string
    role: string
    description: string
    technologies: string[]
    liveDemoLink?: string
    githubLink?: string
  }>
  additional?: {
    interests?: string[]
    awards?: string[]
    publications?: string[]
  }
}

export interface CVTemplate {
  id: string
  name: string
  description: string
  preview: string
  category: "modern" | "classic" | "creative" | "minimal"
}

export interface CreateCVData {
  user_id: number
  personas_id: string
  layout_id: string
  title: string
  job_description: string
  type?: 'job_based' | 'general'
}
