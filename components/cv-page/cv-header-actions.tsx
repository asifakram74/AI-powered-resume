"use client"
import { Button } from "../../components/ui/button"
import { Edit, RefreshCw, Loader2, Save } from "lucide-react"

type Props = {
  isViewMode: boolean
  aiResponse: any
  isRegenerating: boolean
  isSaving: boolean
  existingCV: any
  onEdit: () => void
  onRegenerate: () => void
  onSave: () => void
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
}: Props) {
  return (
    <div className="flex items-center gap-3">
      {!isViewMode && aiResponse && (
        <>
          <Button onClick={onEdit} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Edit className="h-4 w-4" />
            Edit Details
          </Button>

          <Button
            onClick={onRegenerate}
            disabled={isRegenerating}
            variant="outline"
            className={`flex items-center gap-2 bg-transparent transition-all duration-200 ${
              isRegenerating ? "bg-blue-50 border-blue-200 text-blue-700 shadow-md" : "hover:bg-gray-50"
            }`}
          >
            {isRegenerating ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </Button>
        </>
      )}

      {!isViewMode && (
        <Button onClick={onSave} disabled={isSaving || !aiResponse} className="flex items-center gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : existingCV ? "Update CV" : "Save CV"}
        </Button>
      )}
    </div>
  )
}
