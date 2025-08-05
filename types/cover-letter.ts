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

export interface CoverLetterTone {
  id: string
  name: string
  description: string
  example: string
}
