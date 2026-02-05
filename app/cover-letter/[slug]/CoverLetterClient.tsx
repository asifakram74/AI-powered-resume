"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getCoverLetterBySlug, CoverLetter } from "../../../lib/redux/service/coverLetterService"
import { getCVById } from "../../../lib/redux/service/resumeService"
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
import { useCVExport } from "../../../components/cv-page/use-cv-export"
import { Logo } from "../../../components/ui/logo"

const PublicFooter = () => (
  <div className="w-full py-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black mt-auto">
    <p>&copy; {new Date().getFullYear()} Resumaic. All rights reserved.</p>
  </div>
)

interface CoverLetterClientProps {
  slug: string
}

export default function CoverLetterClient({ slug }: CoverLetterClientProps) {
  const [letter, setLetter] = useState<CoverLetter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    const fetchLetter = async () => {
      if (!slug) return
      try {
        setLoading(true)
        const data = await getCoverLetterBySlug(slug)
        setLetter(data)
        
        // Try to get name from letter relations immediately
        const user = (data as any).user
        const cv = (data as any).cv
        
        if (user?.name) {
            setUserName(user.name)
        } else if (cv?.generated_content) {
             try {
                  const content = JSON.parse(cv.generated_content)
                  const name = content.personalInfo?.fullName || content.personalInfo?.name
                  if (name) setUserName(name)
             } catch (e) {}
        } else if (data.cv_id) {
            // Fallback: try to fetch linked CV (works if logged in)
            try {
                const cvData = await getCVById(data.cv_id)
                if (cvData?.generated_content) {
                     const content = JSON.parse(cvData.generated_content)
                     const name = content.personalInfo?.fullName || content.personalInfo?.name
                     if (name) setUserName(name)
                }
            } catch (err) {
                console.log("Failed to fetch linked CV (likely public view)", err)
            }
        }

      } catch (err) {
        console.error(err)
        setError('Failed to load cover letter')
      } finally {
        setLoading(false)
      }
    }
    fetchLetter()
  }, [slug])

  const getFilenameBase = () => {
    if (!letter) return "cover-letter"
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
    return `${safeBase}${idPart}`
  }

  const { handleExport } = useCVExport({
    resourceKey: slug,
    resourceType: 'cover_letter',
    filenameOverride: getFilenameBase()
  })

  const handleDownloadTxt = () => {
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
    element.download = `${getFilenameBase()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("Cover letter downloaded!", {
      description: "The file has been saved to your downloads folder.",
    })
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center">
       {/* Header with Download Button */}
      <div className="w-full bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <Link href="/">
              <Logo width={150} height={45} className="cursor-pointer" />
            </Link>
          </div>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden md:block" />
          <h1 className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px] md:max-w-md capitalize">
            {/* Display User Name or 'Cover Letter' */}
            {userName ? `${userName}'s Cover Letter` : 'Cover Letter'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
       
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="flex items-center gap-2 resumaic-gradient-green hover:opacity-90 text-white rounded-lg px-3 md:px-4 h-9 shadow-sm transition-transform active:scale-95">
                <span className="hidden md:inline font-semibold">Download</span>
                <FileDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-200 dark:border-gray-800">
              <DropdownMenuItem onClick={handleDownloadTxt} className="cursor-pointer py-2.5">
                <FileText className="mr-2 h-4 w-4 text-gray-500" />
                <span>Text (.txt)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")} className="cursor-pointer py-2.5">
                <FileText className="mr-2 h-4 w-4 text-red-500" />
                <span>Export PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("png")} className="cursor-pointer py-2.5">
                <FileText className="mr-2 h-4 w-4 text-blue-500" />
                <span>Export PNG</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("docx")} className="cursor-pointer py-2.5">
                <FileText className="mr-2 h-4 w-4 text-blue-500" />
                <span>Export DOCX</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 w-full flex justify-center">
        <div id="cv-preview-content" className="w-full max-w-[210mm] bg-white shadow-lg p-8 md:p-12 rounded-lg">
          <div className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
            {letter.generated_letter}
          </div>
        </div>
      </div>

      <PublicFooter />

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        publicSlug={slug}
      />
    </div>
  )
}
