"use client"

import { useEffect, useState } from "react"
import { getCVBySlug, CV } from "../../../lib/redux/service/resumeService"
import { CVPreview } from "../../../pages/resume/CVPreview"
import { Loader2 } from "lucide-react"

interface CVCardClientProps {
  slug: string
}

export default function CVCardClient({ slug }: CVCardClientProps) {
  const [cv, setCV] = useState<CV | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCV = async () => {
      if (!slug) return
      try {
        setLoading(true)
        const data = await getCVBySlug(slug)
        setCV(data)
      } catch (err) {
        console.error(err)
        setError("Failed to load CV")
      } finally {
        setLoading(false)
      }
    }

    fetchCV()
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#70E4A8]" />
      </div>
    )
  }

  if (error || !cv) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">CV Not Found</h1>
        <p className="text-gray-500">The CV you are looking for does not exist or has been removed.</p>
      </div>
    )
  }

  let cvData = null
  try {
    cvData = cv.generated_content ? JSON.parse(cv.generated_content) : null
  } catch (e) {
    console.error("Failed to parse CV content", e)
  }

  if (!cvData) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Empty CV</h1>
        <p className="text-gray-500">This CV has no content.</p>
      </div>
    )
  }

  // Construct template object required by CVPreview
  const template = {
    id: cv.layout_id || "modern",
    name: cv.layout_id || "Modern",
    description: "",
    category: "modern"
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-[210mm] shadow-2xl">
        <CVPreview data={cvData} template={template as any} />
      </div>
    </div>
  )
}
