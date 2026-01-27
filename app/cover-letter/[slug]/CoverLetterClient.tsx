"use client"

import { useEffect, useState } from "react"
import { getCoverLetterBySlug, CoverLetter } from "../../../lib/redux/service/coverLetterService"
import { Loader2 } from "lucide-react"

interface CoverLetterClientProps {
  slug: string
}

export default function CoverLetterClient({ slug }: CoverLetterClientProps) {
  const [letter, setLetter] = useState<CoverLetter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLetter = async () => {
      if (!slug) return
      try {
        setLoading(true)
        const data = await getCoverLetterBySlug(slug)
        setLetter(data)
      } catch (err) {
        console.error(err)
        setError("Failed to load cover letter")
      } finally {
        setLoading(false)
      }
    }

    fetchLetter()
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#70E4A8]" />
      </div>
    )
  }

  if (error || !letter) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Cover Letter Not Found</h1>
        <p className="text-gray-500">The cover letter you are looking for does not exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-[210mm] bg-white shadow-lg p-8 md:p-12 rounded-lg">
        <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
          {letter.generated_letter}
        </div>
      </div>
    </div>
  )
}
