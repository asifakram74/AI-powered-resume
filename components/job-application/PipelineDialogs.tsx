
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Loader2, GripVertical } from "lucide-react"
import { showErrorToast, showSuccessToast } from "../../components/ui/toast"
import {
  createPipeline,
  updatePipeline,
  deletePipeline,
  type Pipeline,
} from "../../lib/redux/service/jobTrackerService"

export const pipelinePalette = [
  "#70E4A8", // Green
  "#EA580C", // Orange
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#10B981", // Emerald
  "#6366F1", // Indigo
]

interface CreatePipelineDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  pipelines: Pipeline[]
  onSuccess: () => Promise<void>
}

export function CreatePipelineDialog({ isOpen, setIsOpen, pipelines, onSuccess }: CreatePipelineDialogProps) {
  const [newPipelineName, setNewPipelineName] = useState("")
  const [newPipelineColor, setNewPipelineColor] = useState(pipelinePalette[0])
  const [isCreatingPipeline, setIsCreatingPipeline] = useState(false)

  const submitCreatePipeline = async () => {
    if (!newPipelineName.trim()) {
      showErrorToast("Pipeline name required")
      return
    }
    try {
      setIsCreatingPipeline(true)
      
      await createPipeline({ 
        name: newPipelineName.trim(), 
        color: newPipelineColor,
      })
      showSuccessToast("Pipeline created")
      setIsOpen(false)
      setNewPipelineName("")
      setNewPipelineColor(pipelinePalette[0])
      await onSuccess()
    } catch (e: any) {
      showErrorToast("Failed to create pipeline", e?.message || "Please try again")
    } finally {
      setIsCreatingPipeline(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[520px] border-[#70E4A8]/30 dark:bg-[#0B0F1A]">
        <DialogHeader className="relative pb-4 mb-4 border-b dark:border-gray-800">
          <div className="absolute -left-6 -top-6 w-32 h-32 resumaic-gradient-green opacity-10 blur-3xl -z-10" />
          <DialogTitle className="text-xl font-bold dark:text-gray-100">Create New Pipeline</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Add a new stage to track your applications
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Pipeline Name</Label>
            <Input
              value={newPipelineName}
              onChange={(e) => setNewPipelineName(e.target.value)}
              placeholder="e.g., Phone Screen, Technical Interview"
              className="dark:bg-gray-900 dark:border-gray-800"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Pipeline Color</Label>
            <div className="grid grid-cols-4 gap-3">
              {pipelinePalette.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-10 rounded-lg border-2 transition-all ${newPipelineColor === c
                      ? "border-gray-900 dark:border-gray-100 scale-105"
                      : "border-gray-200 dark:border-gray-800 hover:scale-105"
                    }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setNewPipelineColor(c)}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isCreatingPipeline}
            className="border-gray-300 dark:border-gray-700"
          >
            Cancel
          </Button>
          <Button
            className="resumaic-gradient-green text-white hover:opacity-90 button-press"
            onClick={submitCreatePipeline}
            disabled={isCreatingPipeline}
          >
            {isCreatingPipeline ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating…
              </>
            ) : (
              "Create Pipeline"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface EditPipelineDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  pipeline: Pipeline | null
  onSuccess: (updatedPipeline: Pipeline) => void
  onError: () => void
}

export function EditPipelineDialog({ isOpen, setIsOpen, pipeline, onSuccess, onError }: EditPipelineDialogProps) {
  const [editPipelineName, setEditPipelineName] = useState("")
  const [editPipelineColor, setEditPipelineColor] = useState(pipelinePalette[0])
  const [isSavingPipeline, setIsSavingPipeline] = useState(false)

  useEffect(() => {
    if (pipeline) {
      setEditPipelineName(pipeline.name || "")
      setEditPipelineColor((pipeline as any)?.color || pipelinePalette[0])
    }
  }, [pipeline])

  const submitEditPipeline = async () => {
    if (!pipeline) return
    if (!editPipelineName.trim()) {
      showErrorToast("Pipeline name required")
      return
    }
    try {
      setIsSavingPipeline(true)
      const updated = { ...pipeline, name: editPipelineName.trim(), color: editPipelineColor }
      await updatePipeline(String(pipeline.id), { name: editPipelineName.trim(), color: editPipelineColor })
      
      showSuccessToast("Pipeline updated")
      setIsOpen(false)
      onSuccess(updated as Pipeline)
    } catch (e: any) {
      showErrorToast("Failed to update pipeline", e?.message || "Please try again")
      onError()
    } finally {
      setIsSavingPipeline(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[520px] border-[#70E4A8]/30 dark:bg-[#0B0F1A]">
        <DialogHeader className="relative pb-4 mb-4 border-b dark:border-gray-800">
          <div className="absolute -left-6 -top-6 w-32 h-32 resumaic-gradient-green opacity-10 blur-3xl -z-10" />
          <DialogTitle className="text-xl font-bold dark:text-gray-100">Update Pipeline</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Rename or recolor this pipeline stage
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Pipeline Name</Label>
            <Input value={editPipelineName} onChange={(e) => setEditPipelineName(e.target.value)} placeholder="e.g., Phone Screen" className="dark:bg-gray-900 dark:border-gray-800" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Pipeline Color</Label>
            <div className="grid grid-cols-4 gap-3">
              {pipelinePalette.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-10 rounded-lg border-2 transition-all ${editPipelineColor === c
                      ? "border-gray-900 dark:border-gray-100 scale-105"
                      : "border-gray-200 dark:border-gray-800 hover:scale-105"
                    }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setEditPipelineColor(c)}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSavingPipeline} className="border-gray-300 dark:border-gray-700">
            Cancel
          </Button>
          <Button
            className="resumaic-gradient-green text-white hover:opacity-90 button-press"
            onClick={submitEditPipeline}
            disabled={isSavingPipeline}
          >
            {isSavingPipeline ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Pipeline"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface DeletePipelineDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  pipelineId: string | null
  onSuccess: (pid: string) => void
  onError: () => void
}

export function DeletePipelineDialog({ isOpen, setIsOpen, pipelineId, onSuccess, onError }: DeletePipelineDialogProps) {
  const [isDeletingPipeline, setIsDeletingPipeline] = useState(false)

  const confirmDeletePipeline = async () => {
    if (!pipelineId) return
    const pid = String(pipelineId)
    try {
      setIsDeletingPipeline(true)
      await deletePipeline(pid)
      
      showSuccessToast("Pipeline deleted")
      setIsOpen(false)
      onSuccess(pid)
    } catch (e: any) {
      showErrorToast("Failed to delete pipeline", e?.message || "Please try again")
      onError()
    } finally {
      setIsDeletingPipeline(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] border-red-200/30 dark:border-red-900/30 dark:bg-[#0B0F1A]">
        <DialogHeader className="relative pb-4 mb-4 border-b dark:border-gray-800">
          <div className="absolute -left-6 -top-6 w-32 h-32 bg-red-500 opacity-10 blur-3xl -z-10" />
          <DialogTitle className="text-xl font-bold dark:text-gray-100">Delete Pipeline</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Deleting this pipeline will remove all applications inside it. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeletingPipeline} className="border-gray-300 dark:border-gray-700">
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDeletePipeline} disabled={isDeletingPipeline}>
            {isDeletingPipeline ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete Pipeline"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface MovePipelineDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  pipelines: Pipeline[]
  movePipeline: (fromId: string, toId: string | null) => void
  normalizePipelineColor: (p: Pipeline, index: number) => string
}

export function MovePipelineDialog({ isOpen, setIsOpen, pipelines, movePipeline, normalizePipelineColor }: MovePipelineDialogProps) {
  const [movingPipelineId, setMovingPipelineId] = useState<string | null>(null)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] border-[#70E4A8]/30 dark:bg-[#0B0F1A]">
        <DialogHeader className="relative pb-4 mb-4 border-b dark:border-gray-800">
          <div className="absolute -left-6 -top-6 w-32 h-32 resumaic-gradient-green opacity-10 blur-3xl -z-10" />
          <DialogTitle className="text-xl font-bold dark:text-gray-100">Move Column</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Drag and drop to reorder columns
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
          {pipelines.map((p, index) => (
            <div
              key={String(p.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-move select-none ${movingPipelineId === String(p.id)
                  ? "bg-gray-100 dark:bg-gray-800 border-dashed border-[#70E4A8] opacity-50"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#70E4A8]/50 hover:shadow-sm"
                }`}
              draggable
              onDragStart={(e) => {
                setMovingPipelineId(String(p.id))
                e.dataTransfer.setData("text/plain", JSON.stringify({ type: "pipeline-reorder", id: p.id }))
                e.dataTransfer.effectAllowed = "move"
              }}
              onDragOver={(e) => {
                e.preventDefault()
              }}
              onDrop={(e) => {
                e.preventDefault()
                const payload = JSON.parse(e.dataTransfer.getData("text/plain") || "{}")
                if (payload.type === "pipeline-reorder" && payload.id !== undefined) {
                  movePipeline(String(payload.id), String(p.id))
                }
                setMovingPipelineId(null)
              }}
              onDragEnd={() => setMovingPipelineId(null)}
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
              <div className="flex-1 font-medium text-gray-900 dark:text-gray-100">{p.name}</div>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: normalizePipelineColor(p, index) }}
              />
            </div>
          ))}
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={() => setIsOpen(false)} className="resumaic-gradient-green text-white hover:opacity-90 button-press">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
