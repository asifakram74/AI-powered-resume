export interface CVData {
  id: string
  personalInfo: {
    fullName: string
    jobTitle: string
    email: string
    phone: string
    address: string
    city: string
    country: string
    profilePicture: string
    summary: string
    linkedin?: string
    github?: string
  }
  experience: Array<{
    id: string
    jobTitle: string
    companyName: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    responsibilities: string[]
  }>
  education: Array<{
    id: string
    degree: string
    institutionName: string
    location: string
    graduationDate: string
    gpa: string
    honors: string
    additionalInfo: string
  }>
  skills: {
    technical: string[]
    soft: string[]
  }
  languages: Array<{
    id: string
    name: string
    proficiency: "Native" | "Fluent" | "Advanced" | "Intermediate" | "Basic"
  }>
  certifications: Array<{
    id: string
    title: string
    issuingOrganization: string
    dateObtained: string
    verificationLink: string
  }>
  projects: Array<{
    id: string
    name: string
    role: string
    description: string
    technologies: string[]
    liveDemoLink: string
    githubLink: string
  }>
  additional: {
    interests: string[]
  }
  createdAt: string
  generatedPersona?: string
}
