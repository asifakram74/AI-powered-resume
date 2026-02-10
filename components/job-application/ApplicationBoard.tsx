
import { useState } from "react"
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Loader2, Briefcase, Plus } from "lucide-react"
import { JobApplication, Pipeline } from "../../lib/redux/service/jobTrackerService"
import { CV } from "../../lib/redux/service/resumeService"
import { ApplicationColumn } from "./ApplicationColumn"
import { Badge } from "../../components/ui/badge"

interface ApplicationBoardProps {
  pipelines: Pipeline[]
  applications: JobApplication[]
  cvs: CV[]
  getOrderedApps: (pid: string) => JobApplication[]
  movePipeline: (fromId: string, toId: string | null) => void
  moveInOrder: (payload: any, toPipelineId: string, beforeId?: string | null) => void
  openCreatePipeline: () => void
  openEditPipeline: (p: Pipeline, color: string) => void
  openDeletePipeline: (id: string) => void
  openMovePipelineDialog: () => void
  openEditApplication: (app: JobApplication) => void
  openDeleteApplication: (appId: string) => void
  isCreatingPipeline: boolean
  createDefaultPipelines: () => Promise<void>
}

export function ApplicationBoard({
  pipelines,
  applications,
  cvs,
  getOrderedApps,
  movePipeline,
  moveInOrder,
  openCreatePipeline,
  openEditPipeline,
  openDeletePipeline,
  openMovePipelineDialog,
  openEditApplication,
  openDeleteApplication,
  isCreatingPipeline,
  createDefaultPipelines,
}: ApplicationBoardProps) {
  const [dragOverPipelineId, setDragOverPipelineId] = useState<string | null>(null)
  const [dragOverApplicationId, setDragOverApplicationId] = useState<string | null>(null)

  if (pipelines.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-gray-100 dark:bg-gray-900 p-6 mb-4">
            <Briefcase className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No pipelines yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
            Create pipelines to start tracking your job applications
          </p>
          <Button
            className="resumaic-gradient-green text-white hover:opacity-90 button-press shadow-md shadow-[#70E4A8]/20"
            onClick={createDefaultPipelines}
            disabled={isCreatingPipeline}
          >
            {isCreatingPipeline ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating…
              </>
            ) : (
              "Create Default Stages"
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Application Pipeline
        </h2>
        <Badge variant="outline" className="border-[#70E4A8]/30 text-[#70E4A8]">
          {applications.length} Applications
        </Badge>
      </div>

      <div
        className="flex gap-4 overflow-x-auto custom-scrollbar pb-4"
        onDragOver={(e) => {
          e.preventDefault()
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDragOverPipelineId(null)
          setDragOverApplicationId(null)
          try {
            const payload = JSON.parse(e.dataTransfer.getData("text/plain") || "{}")
            if (payload?.type === "pipeline" && payload?.id !== undefined && payload?.id !== null) {
              movePipeline(String(payload.id), null)
            }
          } catch { }
        }}
      >
        {pipelines.map((pipeline, index) => {
          const pid = String(pipeline.id)
          const items = getOrderedApps(pid)

          return (
            <ApplicationColumn
              key={pid}
              pipeline={pipeline}
              index={index}
              applications={items}
              cvs={cvs}
              isDragOver={dragOverPipelineId === pid}
              dragOverApplicationId={dragOverApplicationId}
              setDragOverPipelineId={setDragOverPipelineId}
              setDragOverApplicationId={setDragOverApplicationId}
              movePipeline={movePipeline}
              moveInOrder={moveInOrder}
              openEditPipeline={openEditPipeline}
              openDeletePipeline={openDeletePipeline}
              openMovePipelineDialog={openMovePipelineDialog}
              openEditApplication={openEditApplication}
              openDeleteApplication={openDeleteApplication}
            />
          )
        })}

        {/* Add Pipeline Button */}
        <button
          type="button"
          className="min-w-[280px] w-[280px] rounded-xl border-2 border-dashed border-[#70E4A8]/50 bg-emerald-50/20 dark:bg-gray-900/30 hover:border-[#70E4A8] hover:bg-emerald-50/40 dark:hover:bg-gray-900/50 transition-all duration-300 flex flex-col items-center justify-center group"
          onClick={openCreatePipeline}
        >
          <div className="flex flex-col items-center gap-3 text-gray-600 dark:text-gray-400">
            <div className="w-12 h-12 rounded-full bg-[#70E4A8]/10 group-hover:bg-[#70E4A8]/20 flex items-center justify-center transition-colors">
              <Plus className="h-6 w-6 text-[#70E4A8]" />
            </div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">Add Pipeline</div>
            <p className="text-sm text-center px-4">
              Create a new stage for your applications
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}
