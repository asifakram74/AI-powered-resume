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

export type CVFontFamilyId =
  | "inter"
  | "serif"
  | "system-sans"
  | "system-serif"
  | "mono"
  | "roboto"
  | "open-sans"
  | "lato"

export type CVSectionHeaderIconStyle = "none" | "dot" | "bar" | "square" | "circle-outline"

export type CVBulletStyle = "disc" | "hyphen" | "circle" | "square" | "none"

export type CVColorMode = "basic" | "advanced"
export type CVBorderMode = "none" | "single" | "multi" | "image"
export type CVCapitalization = "capitalize" | "uppercase"
export type CVAlign = "left" | "center" | "right"
export type CVIconFill = "none" | "outline" | "filled"
export type CVIconFrame =
  | "none"
  | "circle-filled"
  | "rounded-filled"
  | "square-filled"
  | "circle-outline"
  | "rounded-outline"
  | "square-outline"
export type CVIconSize = "xs" | "sm" | "md" | "lg" | "xl"
export type CVEntryListStyle = "bullet" | "hyphen"
export type CVDotsBarsBubbles = "dots" | "bars" | "bubbles"

export interface CVStyleSettings {
  bodyFontFamily: CVFontFamilyId
  headingFontFamily: CVFontFamilyId
  bodyFontSizePx: number
  headingFontSizePx: number
  lineHeight: number
  marginLeftRightMm: number
  marginTopBottomMm: number
  spaceBetweenEntriesPx: number
  textColor: string
  headingColor: string
  mutedColor: string
  accentColor: string
  borderColor: string
  backgroundColor: string
  backgroundImageUrl: string
  colorMode: CVColorMode
  borderMode: CVBorderMode
  applyAccentToName: boolean
  applyAccentToJobTitle: boolean
  applyAccentToHeadings: boolean
  applyAccentToHeadingsLine: boolean
  applyAccentToHeaderIcons: boolean
  applyAccentToDotsBarsBubbles: boolean
  applyAccentToDates: boolean
  applyAccentToLinkIcons: boolean
  datesOpacity: number
  locationOpacity: number
  align: CVAlign
  capitalization: CVCapitalization
  headingsLine: boolean
  headerIcons: CVIconFill
  linkIcons: CVIconFill
  iconFrame: CVIconFrame
  iconSize: CVIconSize
  dotsBarsBubbles: CVDotsBarsBubbles
  descriptionIndentPx: number
  entryListStyle: CVEntryListStyle
  showPageNumbers: boolean
  showEmail: boolean
  nameBold: boolean
  sectionHeaderIconStyle: CVSectionHeaderIconStyle
  bulletStyle: CVBulletStyle
}

export interface CVData {
  id: string
  sectionOrder?: CVSectionId[]
  hiddenSections?: CVSectionId[]
  personalInfoFieldOrder?: PersonalInfoFieldId[]
  styleSettings?: CVStyleSettings
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
