"use client"

import { useEffect, useState } from "react"
import { getCoverLetterBySlug, CoverLetter } from "../../../lib/redux/service/coverLetterService"
import { Loader2, FileDown, FileText, Share2, Copy } from "lucide-react"
import { Button } from "../../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"
import { toast } from "sonner"
import { trackEvent } from "../../../lib/redux/service/analyticsService"
import { ShareDialog } from "../../../components/cover-letter/share-dialog"
import { PublicPageLoading } from "../../../components/shared/public-page-loading"
interface CoverLetterClientProps {
  slug: string
}

export default function CoverLetterClient({ slug }: CoverLetterClientProps) {
  const [letter, setLetter] = useState<CoverLetter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  useEffect(() => {
    const fetchLetter = async () => {
      if (!slug) return
      try {
        setLoading(true)
        const data = await getCoverLetterBySlug(slug)
        setLetter(data)
      } catch (err) {
        console.error(err)
        setError('Failed to load cover letter')
      } finally {
        setLoading(false)
      }
    }
    fetchLetter()
  }, [slug])

  const getCoverLetterFilename = (
    letter: CoverLetter,
    format: 'txt' | 'pdf' | 'docx' | 'png' = 'txt'
  ) => {
    const baseName =
      (letter as any).title ||
      (letter as any).company_name ||
      (letter.job_description || '').slice(0, 30) ||
      'cover_letter'

    const safeBase = baseName
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const idPart = letter.id ? `-${letter.id}` : ''
    return `${safeBase}${idPart}.${format}`
  }

  const handleDownload = () => {
    if (!letter) return

    // Track download
    trackEvent({
      resource_type: 'cover_letter',
      resource_key: slug,
      event_type: 'download',
      meta: { format: 'txt' }
    })

    const element = document.createElement("a")
    const file = new Blob([letter.generated_letter], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = getCoverLetterFilename(letter, 'txt')
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("Cover letter downloaded!", {
      description: "The file has been saved to your downloads folder.",
    })
  }

  const handleExportCoverLetter = async (format: 'pdf' | 'docx' | 'png') => {
    if (!letter) return
    
    // Track download
    trackEvent({
      resource_type: 'cover_letter',
      resource_key: slug,
      event_type: 'download',
      meta: { format }
    })

    try {
      const filename = getCoverLetterFilename(letter, format)

      const response = await fetch(`https://stagingnode.resumaic.com/api/cover-letter-export/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: letter.generated_letter,
          filename: filename,
          letterData: {
            jobDescription: letter.job_description,
            tone: letter.tone,
            generatedLetter: letter.generated_letter
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to export ${format.toUpperCase()}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Cover letter exported as ${format.toUpperCase()}!`, {
        description: "The file has been saved to your downloads folder.",
      })
    } catch (error) {
      console.error(`Error exporting ${format}:`, error)
      toast.error(`Failed to export ${format.toUpperCase()}`, {
        description: "Please try again or contact support if the issue persists.",
      })
    }
  }

  if (loading) {
    return <PublicPageLoading type="cover-letter" />
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
       {/* Header with Download Button */}
       <div className="w-full bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <h1 className="font-semibold text-gray-900 truncate max-w-[200px] md:max-w-md capitalize">
          {/* Display User Name or 'Cover Letter' */}
          {(letter as any).user?.name ? `${(letter as any).user.name}'s Cover Letter` : 'Cover Letter'}
        </h1>
        <div className="flex items-center gap-2">
       
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="flex items-center gap-2 resumaic-gradient-green hover:opacity-90 text-white rounded-lg px-3 md:px-4 h-9 shadow-sm transition-transform active:scale-95">
                <span className="hidden md:inline font-semibold">Download</span>
                <FileDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-200 dark:border-gray-800">
              <DropdownMenuItem onClick={handleDownload} className="cursor-pointer py-2.5">
                <FileText className="mr-2 h-4 w-4 text-gray-500" />
                <span>Text (.txt)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportCoverLetter("pdf")} className="cursor-pointer py-2.5">
                <FileText className="mr-2 h-4 w-4 text-red-500" />
                <span>Export PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportCoverLetter("png")} className="cursor-pointer py-2.5">
                <FileText className="mr-2 h-4 w-4 text-blue-500" />
                <span>Export PNG</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportCoverLetter("docx")} className="cursor-pointer py-2.5">
                <FileText className="mr-2 h-4 w-4 text-blue-500" />
                <span>Export DOCX</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="p-4 md:p-8 w-full flex justify-center">
        <div className="w-full max-w-[210mm] bg-white shadow-lg p-8 md:p-12 rounded-lg">
          <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
            {letter.generated_letter}
          </div>
        </div>
      </div>

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        publicSlug={slug}
      />
    </div>
  )
}
