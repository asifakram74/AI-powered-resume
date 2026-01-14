"use client"

import { Button } from "../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu"
import { Palette, SlidersHorizontal } from "lucide-react"

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
}: Props) {
  return (
    <div className="flex items-center gap-3">
      {!isViewMode && aiResponse && (
        <>
          {onChangeDesign && (
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
              onClick={onChangeDesign}
            >
              <Palette className="h-4 w-4" />
              Design
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <SlidersHorizontal className="h-4 w-4" />
                Customize
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              {onChangeTemplate && (
                <DropdownMenuItem onClick={onChangeTemplate}>
                  Change Template
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={onEdit}>
                Edit Details
              </DropdownMenuItem>

              {onChangeSettings && (
                <DropdownMenuItem onClick={onChangeSettings}>
                  Arrange Sections
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  )
}
