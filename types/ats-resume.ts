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

export interface ATSAnalysisResult {
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  keywords: {
    matched: string[]
    missing: string[]
  }
  sections: {
    [key: string]: {
      score: number
      feedback: string
    }
  }
}
