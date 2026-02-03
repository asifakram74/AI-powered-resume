import React from "react"
import { Button } from "../../components/ui/button"
import { Edit2, ChevronUp, ChevronDown } from "lucide-react"
import { SectionKey } from "../../lib/profile-card/profile-card.shared"

interface ProfileSectionProps {
    sectionId: SectionKey
    title: string
    icon: React.ElementType
    isExpanded: boolean
    onToggleExpand: () => void
    onEdit: () => void
    previewContent?: React.ReactNode
    children?: React.ReactNode
}

export function ProfileSection({
    sectionId,
    title,
    icon: Icon,
    isExpanded,
    onToggleExpand,
    onEdit,
    previewContent,
    children
}: ProfileSectionProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-200">
            {/* Header */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={onToggleExpand}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center">
                        <span className="font-bold text-gray-700 dark:text-gray-200 tracking-wide uppercase text-sm">
                            {title}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit()
                        }}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    )}
                </div>
            </div>

            {/* Preview Content (when collapsed) */}
            {!isExpanded && previewContent && (
                <div className="px-4 pb-4">
                    {previewContent}
                </div>
            )}

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4 border-t border-gray-50 dark:border-gray-800">
                    {children}
                </div>
            )}
        </div>
    )
}
