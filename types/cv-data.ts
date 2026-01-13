export type CVSectionId =
  | "personalInfo"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications"
  | "languages"
  | "interests"

export type PersonalInfoFieldId =
  | "fullName"
  | "jobTitle"
  | "email"
  | "phone"
  | "address"
  | "location"
  | "linkedin"
  | "github"
  | "summary"

export interface CVData {
  id: string
  sectionOrder?: CVSectionId[]
  hiddenSections?: CVSectionId[]
  personalInfoFieldOrder?: PersonalInfoFieldId[]
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
