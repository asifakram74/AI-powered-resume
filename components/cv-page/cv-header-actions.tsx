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
  ChevronDown
} from "lucide-react"

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
  activeTab?: 'overview' | 'content' | 'customize' | 'ai-tools'
  onTabChange?: (tab: 'overview' | 'content' | 'customize' | 'ai-tools') => void
}

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
  activeTab = 'content',
  onTabChange,
}: Props) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'customize', label: 'Customize', icon: Wand2 },
    { id: 'ai-tools', label: 'AI Tools', icon: Sparkles },
  ]

  return (
    <div className="flex items-center justify-between w-full bg-white dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === item.id 
                ? "bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 dark:bg-red-900/20 dark:text-red-400" 
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
            onClick={() => onTabChange?.(item.id as any)}
          >
            <item.icon className="h-4 w-4" />
            <span className="font-medium">{item.label}</span>
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {/* Resume Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-gray-50 border-gray-200 rounded-lg px-4">
              <span className="text-gray-700 font-medium">{existingCV?.title || "Resume 1"}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Rename Resume</DropdownMenuItem>
            <DropdownMenuItem>Duplicate Resume</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Download Button */}
        {(onExportPDF || onExportDOCX) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="flex items-center gap-2 bg-[#2d3639] hover:bg-[#1a2022] text-white rounded-lg px-6 py-2">
                <span className="font-semibold">Download</span>
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {onExportPDF && (
                <DropdownMenuItem onClick={onExportPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export PDF
                </DropdownMenuItem>
              )}
              {onExportDOCX && (
                <DropdownMenuItem onClick={onExportDOCX}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export DOCX
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-gray-200">
              <MoreVertical className="h-4 w-4 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onChangeTemplate}>Change Template</DropdownMenuItem>
            <DropdownMenuItem onClick={onChangeDesign}>Design Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={onChangeSettings}>Arrange Sections</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
