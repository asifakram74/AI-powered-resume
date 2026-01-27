"use client"

import { Button } from "../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu"
import { 
  Download, 
  FileText, 
  LayoutGrid, 
  Wand2, 
  Sparkles, 
  MoreVertical,
  ChevronDown,
  FileDown,
  ArrowLeft,
  Share2
} from "lucide-react"
import { toast } from "sonner"

type Props = {
  isViewMode: boolean
  aiResponse: any
  isRegenerating: boolean
  isSaving: boolean
  existingCV: any
  onEdit: () => void
  onRegenerate?: () => Promise<void> | void
  onSave?: (isAutoSave?: boolean) => Promise<void> | void
  onChangeTemplate?: () => void
  onChangeSettings?: () => void
  onChangeDesign?: () => void
  onExportPDF?: () => void
  onExportDOCX?: () => void
  onExportPNG?: () => void

  activeTab?: 'overview' | 'content' | 'customize' | 'ai-tools'
  onTabChange?: (tab: 'overview' | 'content' | 'customize' | 'ai-tools') => void
}

import { useRouter } from "next/navigation"

export function CVHeaderActions({
  isViewMode,
  aiResponse,
  isRegenerating,
  isSaving,
  existingCV,
  onEdit,
  onRegenerate,
  onSave,
  onChangeTemplate,
  onChangeSettings,
  onChangeDesign,
  onExportPDF,
  onExportDOCX,
  onExportPNG,
  activeTab = 'content',
  onTabChange,
}: Props) {
  const router = useRouter()
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'customize', label: 'Customize', icon: Wand2 },
    // { id: 'ai-tools', label: 'AI Tools', icon: Sparkles },
  ]

  const handleShare = () => {
    if (!existingCV?.public_slug) {
      toast.error("Public link not available", {
        description: "This CV hasn't been published yet or is missing a public link."
      })
      return
    }
    
    const url = `${window.location.origin}/cv-card?slug=${existingCV.public_slug}`
    navigator.clipboard.writeText(url)
    toast.success("Public link copied!", {
      description: "The public link has been copied to your clipboard."
    })
  }

  return (
    <div className="flex items-center justify-between w-full bg-white dark:bg-gray-900 px-3 md:px-6 py-2 rounded-b-xl shadow-sm border border-gray-200/80 dark:border-gray-800">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gray-100/50 hover:bg-gray-200/80 dark:bg-gray-800/50 dark:hover:bg-gray-700/80 text-gray-600 dark:text-gray-300 transition-all active:scale-95"
          onClick={() => router.push('/dashboard/resumes')}
          title="Back to Resumes"
        >
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
        </Button>

        {/* Navigation Tabs - Segmented Style on Mobile, Ghost Style on Desktop */}
        <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/80 md:bg-transparent md:dark:bg-transparent p-1 md:p-0 rounded-lg md:rounded-none gap-1 md:gap-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          if (item.id === 'customize') {
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`
                  relative flex items-center justify-center md:justify-start gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-md md:rounded-lg transition-all duration-200
                  ${isActive 
                    ? "bg-white dark:bg-gray-950 text-emerald-600 shadow-sm md:bg-emerald-50 md:text-emerald-600 md:shadow-none md:hover:bg-emerald-100 md:dark:bg-emerald-900/20 md:dark:text-emerald-400" 
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 md:text-gray-700 md:hover:bg-gray-100 md:hover:text-gray-900 md:dark:text-gray-300 md:dark:hover:bg-gray-800 md:dark:hover:text-gray-100"
                  }
                `}
                onClick={() => {
                  onTabChange?.('customize');
                  onChangeDesign?.();
                }}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "currentColor md:text-gray-500 md:dark:text-gray-400"}`} />
                <span className="hidden md:inline font-medium text-sm">{item.label}</span>
              </Button>
            )
          }

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`
                relative flex items-center justify-center md:justify-start gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-md md:rounded-lg transition-all duration-200
                ${isActive 
                  ? "bg-white dark:bg-gray-950 text-emerald-600 shadow-sm md:bg-emerald-50 md:text-emerald-600 md:shadow-none md:hover:bg-emerald-100 md:dark:bg-emerald-900/20 md:dark:text-emerald-400" 
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 md:text-gray-700 md:hover:bg-gray-100 md:hover:text-gray-900 md:dark:text-gray-300 md:dark:hover:bg-gray-800 md:dark:hover:text-gray-100"
                }
              `}
              onClick={() => onTabChange?.(item.id as any)}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "currentColor md:text-gray-500 md:dark:text-gray-400"}`} />
              <span className="hidden md:inline font-medium text-sm">{item.label}</span>
            </Button>
          )
        })}
</div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Resume Selector */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 bg-[#f8f9fa] border-gray-200 rounded-lg px-4 h-9">
              <span className="text-gray-700 font-medium">{existingCV?.title || "Resume 1"}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Rename Resume</DropdownMenuItem>
            <DropdownMenuItem>Duplicate Resume</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}

        {/* Download Button - Icon only on mobile */}
        {(onExportPDF || onExportDOCX) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="flex items-center gap-2 resumaic-gradient-green hover:opacity-90 text-white rounded-lg px-3 md:px-4 h-9 shadow-sm transition-transform active:scale-95">
                <span className="hidden md:inline font-semibold">Download</span>
                <FileDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-200 dark:border-gray-800">
              {onExportPDF && (
                <DropdownMenuItem onClick={onExportPDF} className="cursor-pointer py-2.5">
                  <FileText className="mr-2 h-4 w-4 text-red-500" />
                  <span>Export PDF</span>
                </DropdownMenuItem>
              )}
              {onExportPNG && (
                <DropdownMenuItem onClick={onExportPNG} className="cursor-pointer py-2.5">
                  <FileText className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Export PNG</span>
                </DropdownMenuItem>
              )}
              {onExportDOCX && (
                <DropdownMenuItem onClick={onExportDOCX} className="cursor-pointer py-2.5">
                  <FileText className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Export DOCX</span>
                </DropdownMenuItem>
              )}
              
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg md:border md:border-gray-200 md:dark:border-gray-700 md:bg-white md:dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 md:text-gray-700 dark:text-gray-400 md:dark:text-gray-200">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 md:w-48 rounded-xl shadow-xl border-gray-200 dark:border-gray-800 p-1.5 md:p-1">
            <DropdownMenuItem onClick={handleShare} className="cursor-pointer py-3 md:py-2 px-3 text-sm font-medium">
              <Share2 className="mr-3 h-4 w-4 text-blue-500" />
              <span>Share Public Link</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onChangeTemplate} className="cursor-pointer py-3 md:py-2 px-3 text-sm font-medium">
              <LayoutGrid className="mr-3 h-4 w-4 text-gray-500" />
              <span>Change Template</span>
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={onChangeDesign}>Design Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={onChangeSettings}>Arrange Sections</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}