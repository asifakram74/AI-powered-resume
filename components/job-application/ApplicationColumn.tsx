
import { MoreHorizontal, Pencil, Move, Trash2, Briefcase, Plus } from "lucide-react"
import { Button } from "../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { JobApplication, Pipeline } from "../../lib/redux/service/jobTrackerService"
import { CV } from "../../lib/redux/service/resumeService"
import { ApplicationCard } from "./ApplicationCard"
import { pipelinePalette } from "./PipelineDialogs"

interface ApplicationColumnProps {
  pipeline: Pipeline
  index: number
  applications: JobApplication[]
  cvs: CV[]
  isDragOver: boolean
  dragOverApplicationId: string | null
  setDragOverPipelineId: (id: string | null) => void
  setDragOverApplicationId: (id: string | null) => void
  movePipeline: (fromId: string, toId: string | null) => void
  moveInOrder: (payload: any, toPipelineId: string, beforeId?: string | null) => void
  openEditPipeline: (p: Pipeline, color: string) => void
  openDeletePipeline: (id: string) => void
  openMovePipelineDialog: () => void
  openEditApplication: (app: JobApplication) => void
  openDeleteApplication: (appId: string) => void
}

function normalizePipelineColor(p: Pipeline, index: number) {
  const c = (p as any)?.color
  if (typeof c === "string" && c.trim()) return c.trim()
  return pipelinePalette[index % pipelinePalette.length]
}

export function ApplicationColumn({
  pipeline,
  index,
  applications,
  cvs,
  isDragOver,
  dragOverApplicationId,
  setDragOverPipelineId,
  setDragOverApplicationId,
  movePipeline,
  moveInOrder,
  openEditPipeline,
  openDeletePipeline,
  openMovePipelineDialog,
  openEditApplication,
  openDeleteApplication,
}: ApplicationColumnProps) {
  const pid = String(pipeline.id)
  const color = normalizePipelineColor(pipeline, index)

  return (
    <div
      className={`min-w-[320px] w-[320px] rounded-xl border-2 ${isDragOver
          ? "border-dashed border-[#70E4A8] shadow-lg"
          : "border-gray-200/60 dark:border-gray-800/60"
        } bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm transition-all duration-300`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOverPipelineId(pid)
        setDragOverApplicationId(null)
      }}
      onDragLeave={() => setDragOverPipelineId(null)} // This might be flickering if not careful
      onDrop={(e) => {
        e.preventDefault()
        setDragOverPipelineId(null)
        setDragOverApplicationId(null)
        try {
          const payload = JSON.parse(e.dataTransfer.getData("text/plain") || "{}")
          if (payload?.type === "pipeline" && payload?.id !== undefined && payload?.id !== null) {
            movePipeline(String(payload.id), pid)
            return
          }
          moveInOrder(payload, pid, null)
        } catch { }
      }}
    >
      {/* Pipeline Header */}
      <div className="p-4 border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2 flex-1 select-none group">
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span className="truncate">{pipeline.name}</span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <span>{applications.length} applications</span>
                  {applications.length > 0 && (
                    <span className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${color}20`, color: color }}>
                      {applications.length}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    openEditPipeline(pipeline, color)
                  }}
                  className="cursor-pointer"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    openMovePipelineDialog()
                  }}
                  className="cursor-pointer"
                >
                  <Move className="h-4 w-4 mr-2" />
                  Move Column
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => {
                    e.preventDefault()
                    openDeletePipeline(pid)
                  }}
                  className="cursor-pointer"
                  disabled={pipeline.is_default}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        {applications.map((app) => (
          <ApplicationCard
            key={String(app.id)}
            app={app}
            cvs={cvs}
            color={color}
            isDraggingOver={dragOverApplicationId === String(app.id)}
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", JSON.stringify({ id: app.id, fromPipelineId: pid }))
              e.dataTransfer.effectAllowed = "move"
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOverPipelineId(pid)
              setDragOverApplicationId(String(app.id))
            }}
            onDragLeave={() =>
              setDragOverApplicationId(null)
            }
            onDrop={(e) => {
              e.preventDefault()
              setDragOverPipelineId(null)
              setDragOverApplicationId(null)
              try {
                const payload = JSON.parse(e.dataTransfer.getData("text/plain") || "{}")
                if (payload?.type === "pipeline") return
                moveInOrder(payload, pid, String(app.id))
              } catch { }
            }}
            openEdit={openEditApplication}
            openDelete={openDeleteApplication}
          />
        ))}

        {applications.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <Briefcase className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No applications yet
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Drag & drop applications here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
