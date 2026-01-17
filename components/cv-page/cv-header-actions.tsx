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
  FileDown
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
    // { id: 'ai-tools', label: 'AI Tools', icon: Sparkles },
  ]

  return (
    <div className="flex items-center justify-between w-full bg-white dark:bg-gray-900 px-6 py-2 rounded-b-xl shadow-sm border border-gray-200/80 dark:border-gray-800">
      <div className="flex items-center gap-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          if (item.id === 'customize') {
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                }`}
                onClick={() => {
                  onTabChange?.('customize');
                  onChangeDesign?.();
                }}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-gray-500 dark:text-gray-400"}`} />
                <span className="font-medium">{item.label}</span>
              </Button>
            )
          }

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive 
                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400" 
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
              }`}
              onClick={() => onTabChange?.(item.id as any)}
            >
              <item.icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-gray-500 dark:text-gray-400"}`} />
              <span className="font-medium">{item.label}</span>
            </Button>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        {/* Resume Selector */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-[#f8f9fa] border-gray-200 rounded-lg px-4 h-9">
              <span className="text-gray-700 font-medium">{existingCV?.title || "Resume 1"}</span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Rename Resume</DropdownMenuItem>
            <DropdownMenuItem>Duplicate Resume</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}

        {/* Download Button */}
        {(onExportPDF || onExportDOCX) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="flex items-center gap-2 resumaic-gradient-green hover:opacity-90 text-white rounded-lg px-4 h-9">
                <span className="font-semibold">Download</span>
                <FileDown className="h-4 w-4" />
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
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
              <MoreVertical className="h-4 w-4 text-gray-700 dark:text-gray-200" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onChangeTemplate}>Change Template</DropdownMenuItem>
            {/* <DropdownMenuItem onClick={onChangeDesign}>Design Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={onChangeSettings}>Arrange Sections</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}