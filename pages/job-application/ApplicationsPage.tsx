
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAppSelector } from "../../lib/redux/hooks"
import type { RootState } from "../../lib/redux/store"
import { Button } from "../../components/ui/button"
import { useTheme } from "next-themes"
import { getCVs, type CV } from "../../lib/redux/service/resumeService"
import {
  createPipeline,
  listJobApplications,
  listPipelines,
  reorderPipelines,
  updateJobApplication,
  type JobApplication,
  type Pipeline,
} from "../../lib/redux/service/jobTrackerService"
import {
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react"
import { showErrorToast, showSuccessToast } from "../../components/ui/toast"

import { ApplicationStats } from "../../components/job-application/ApplicationStats"
import { ApplicationBoard } from "../../components/job-application/ApplicationBoard"
import { ApplicationTips } from "../../components/job-application/ApplicationTips"
import { AddApplicationDialog } from "../../components/job-application/AddApplicationDialog"
import { EditApplicationDialog } from "../../components/job-application/EditApplicationDialog"
import { DeleteApplicationDialog } from "../../components/job-application/DeleteApplicationDialog"
import { 
  CreatePipelineDialog, 
  EditPipelineDialog, 
  DeletePipelineDialog, 
  MovePipelineDialog, 
  pipelinePalette 
} from "../../components/job-application/PipelineDialogs"

function normalizePipelineColor(p: Pipeline, index: number) {
  const c = (p as any)?.color
  if (typeof c === "string" && c.trim()) return c.trim()
  return pipelinePalette[index % pipelinePalette.length]
}

function nameEquals(p: Pipeline, name: string) {
  return (p.name || "").trim().toLowerCase() === name.toLowerCase()
}

export default function ApplicationsPage() {
  const { user } = useAppSelector((state: RootState) => state.auth)
  const userId = user?.id
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [cvs, setCvs] = useState<CV[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [orderByPipeline, setOrderByPipeline] = useState<Record<string, string[]>>({})

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false)
  
  const [isCreatePipelineOpen, setIsCreatePipelineOpen] = useState(false)
  const [isCreatingPipeline, setIsCreatingPipeline] = useState(false)

  const [isEditApplicationOpen, setIsEditApplicationOpen] = useState(false)
  const [editingApplicationId, setEditingApplicationId] = useState<string | null>(null)

  const [isDeleteApplicationOpen, setIsDeleteApplicationOpen] = useState(false)
  const [deletingApplicationId, setDeletingApplicationId] = useState<string | null>(null)

  const [isEditPipelineOpen, setIsEditPipelineOpen] = useState(false)
  const [editingPipelineId, setEditingPipelineId] = useState<string | null>(null)

  const [isDeletePipelineOpen, setIsDeletePipelineOpen] = useState(false)
  const [deletingPipelineId, setDeletingPipelineId] = useState<string | null>(null)

  const [isMovePipelineDialogOpen, setIsMovePipelineDialogOpen] = useState(false)

  const refreshAll = useCallback(async () => {
    try {
      setIsLoading(true)
      const [pipelinesRes, applicationsRes, cvsRes] = await Promise.all([
        listPipelines().catch(() => [] as Pipeline[]),
        listJobApplications().catch(() => [] as JobApplication[]),
        userId ? getCVs(String(userId)).catch(() => [] as CV[]) : (Promise.resolve([]) as Promise<CV[]>),
      ])
      
      // Sort pipelines by position
      const sortedPipelines = pipelinesRes.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      setPipelines(sortedPipelines)
      
      setApplications(applicationsRes)
      setCvs(cvsRes)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  useEffect(() => {
    const next: Record<string, string[]> = {}
    for (const pipeline of pipelines) {
      const pid = String(pipeline.id)
      const currentApps = applications
        .filter((a) => String(a.pipeline_id) === pid)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      next[pid] = currentApps.map((a) => String(a.id))
    }
    setOrderByPipeline(next)
  }, [applications, pipelines])

  const stats = useMemo(() => {
    const total = applications.length
    const wishlist = pipelines.find((p) => nameEquals(p, "Wishlist"))
    const applied = pipelines.find((p) => nameEquals(p, "Applied"))
    const interview = pipelines.find((p) => nameEquals(p, "Interview"))
    const offer = pipelines.find((p) => nameEquals(p, "Offer"))
    const rejected = pipelines.find((p) => nameEquals(p, "Rejected"))

    const countByPipeline = (pipeline?: Pipeline) => {
      if (!pipeline?.id) return 0
      return applications.filter((a) => String(a.pipeline_id) === String(pipeline.id)).length
    }

    return {
      total,
      wishlist: countByPipeline(wishlist),
      applied: countByPipeline(applied),
      interview: countByPipeline(interview),
      offer: countByPipeline(offer),
      rejected: countByPipeline(rejected),
    }
  }, [applications, pipelines])

  const appById = useMemo(() => {
    const map = new Map<string, JobApplication>()
    for (const a of applications) map.set(String(a.id), a)
    return map
  }, [applications])

  const getOrderedApps = useCallback(
    (pipelineId: string) => {
      const ids = orderByPipeline[pipelineId] || []
      return ids.map((id) => appById.get(id)).filter(Boolean) as JobApplication[]
    },
    [appById, orderByPipeline],
  )

  const movePipeline = useCallback((fromPipelineId: string, toPipelineId: string | null) => {
    setPipelines((prev) => {
      const fromId = String(fromPipelineId)
      const toId = toPipelineId ? String(toPipelineId) : null
      const fromIndex = prev.findIndex((p) => String(p.id) === fromId)
      if (fromIndex < 0) return prev

      const next = prev.slice()
      const [moved] = next.splice(fromIndex, 1)

      let targetIndex = next.length
      if (toId) {
        const toIndex = next.findIndex((p) => String(p.id) === toId)
        if (toIndex >= 0) {
          targetIndex = toIndex
        }
      }

      next.splice(targetIndex, 0, moved)

      // Recalculate positions for all pipelines
      const reordered = next.map((p, index) => ({
        ...p,
        position: index + 1,
      }))

      // Update backend with new order
      const updatePayload = reordered.map(p => ({
        id: p.id,
        position: p.position!
      }))
      
      reorderPipelines(updatePayload).catch(console.error)

      return reordered
    })
  }, [])

  const moveInOrder = useCallback(
    async (payload: any, toPipelineId: string, beforeId?: string | null) => {
      const appId = payload?.id !== undefined && payload?.id !== null ? String(payload.id) : null
      if (!appId) return

      const current = appById.get(appId)
      const fromPipelineId = current ? String(current.pipeline_id) : String(payload?.fromPipelineId || "")
      if (!fromPipelineId) return

      const targetPid = String(toPipelineId)
      
      // Calculate new position using orderByPipeline to find neighbors
      const targetIds = orderByPipeline[targetPid] || []
      const filteredIds = targetIds.filter(id => id !== appId)
      
      let insertIndex = filteredIds.length
      if (beforeId) {
        const idx = filteredIds.indexOf(String(beforeId))
        if (idx >= 0) insertIndex = idx
      }

      // We still use floating point for apps unless backend changes for apps too.
      // Assuming backend ONLY changed for pipelines as per user input.
      const prevId = insertIndex > 0 ? filteredIds[insertIndex - 1] : null
      const nextId = insertIndex < filteredIds.length ? filteredIds[insertIndex] : null
      
      const prevApp = prevId ? appById.get(prevId) : null
      const nextApp = nextId ? appById.get(nextId) : null
      
      const p1 = prevApp?.position ?? 0
      const p2 = nextApp?.position ?? (p1 + 60000)
      const newPos = (p1 + p2) / 2

      // Update local state
      setApplications((all) => all.map((a) => (String(a.id) === appId ? { ...a, pipeline_id: targetPid, position: newPos } : a)))

      try {
        await updateJobApplication(appId, { pipeline_id: targetPid, position: newPos })
        showSuccessToast("Application updated", "Moved to new stage")
      } catch (e: any) {
        showErrorToast("Failed to move application", e?.message || "Please try again")
        await refreshAll()
      }
    },
    [appById, refreshAll, orderByPipeline],
  )

  const createDefaultPipelines = async () => {
    try {
      setIsCreatingPipeline(true)
      const defaults = [
        { name: "Wishlist", color: pipelinePalette[0] },
        { name: "Applied", color: pipelinePalette[1] },
        { name: "Interview", color: pipelinePalette[2] },
        { name: "Offer", color: pipelinePalette[3] },
        { name: "Rejected", color: pipelinePalette[4] },
      ]
      for (let i = 0; i < defaults.length; i++) {
        const p = defaults[i]
        const exists = pipelines.some((x) => nameEquals(x, p.name))
        // We let backend handle positions for new default pipelines
        if (!exists) await createPipeline({ ...p })
      }
      showSuccessToast("Pipelines created")
      await refreshAll()
    } catch (e: any) {
      showErrorToast("Failed to create default pipelines", e?.message || "Please try again")
    } finally {
      setIsCreatingPipeline(false)
    }
  }

  // Handlers for Dialogs
  const handleEditAppSuccess = async (updatedApp: JobApplication) => {
      const previous = appById.get(String(updatedApp.id))
      const prevPipelineId = previous ? String(previous.pipeline_id) : null
      
      setApplications((all) =>
        all.map((a) =>
          String(a.id) === String(updatedApp.id) ? updatedApp : a
        )
      )

      if (prevPipelineId && prevPipelineId !== String(updatedApp.pipeline_id)) {
        setOrderByPipeline((prev) => {
          const next: Record<string, string[]> = { ...prev }
          const fromArr = (next[prevPipelineId] || []).filter((id) => id !== String(updatedApp.id))
          const toArr = (next[String(updatedApp.pipeline_id)] || []).filter((id) => id !== String(updatedApp.id))
          next[prevPipelineId] = fromArr
          next[String(updatedApp.pipeline_id)] = [...toArr, String(updatedApp.id)]
          return next
        })
      }
  }

  const handleDeleteAppSuccess = async (appId: string) => {
      setApplications((all) => all.filter((a) => String(a.id) !== appId))
      setOrderByPipeline((prev) => {
        const next: Record<string, string[]> = { ...prev }
        for (const k of Object.keys(next)) {
          next[k] = (next[k] || []).filter((id) => id !== appId)
        }
        return next
      })
  }

  const handleEditPipelineSuccess = (updatedPipeline: Pipeline) => {
    setPipelines((all) =>
        all.map((p) =>
          String(p.id) === String(updatedPipeline.id)
            ? updatedPipeline
            : p,
        ),
      )
  }

  const handleDeletePipelineSuccess = (pid: string) => {
      setPipelines((all) => all.filter((p) => String(p.id) !== pid))
      setApplications((all) => all.filter((a) => String(a.pipeline_id) !== pid))
      setOrderByPipeline((prev) => {
        const next: Record<string, string[]> = { ...prev }
        delete next[pid]
        return next
      })
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg resumaic-gradient-green text-white transition-transform hover:scale-105 duration-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Application Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-md">
              Track and manage all your job applications
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {pipelines.length === 0 ? (
            <Button
              className="resumaic-gradient-green text-white hover:opacity-90 hover-lift button-press shadow-md shadow-[#70E4A8]/20 w-full sm:w-auto"
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
          ) : null}

          <Button
            className="resumaic-gradient-green text-white hover:opacity-90 hover-lift button-press shadow-md shadow-[#70E4A8]/20 w-full sm:w-auto"
            onClick={() => setIsAddOpen(true)}
            disabled={pipelines.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Application
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <ApplicationStats stats={stats} />

      {/* Pipeline Board */}
      <ApplicationBoard
        pipelines={pipelines}
        applications={applications}
        cvs={cvs}
        getOrderedApps={getOrderedApps}
        movePipeline={movePipeline}
        moveInOrder={moveInOrder}
        openCreatePipeline={() => setIsCreatePipelineOpen(true)}
        openEditPipeline={(p, color) => {
          setEditingPipelineId(String(p.id))
          setIsEditPipelineOpen(true)
        }}
        openDeletePipeline={(id) => {
          setDeletingPipelineId(id)
          setIsDeletePipelineOpen(true)
        }}
        openMovePipelineDialog={() => setIsMovePipelineDialogOpen(true)}
        openEditApplication={(app) => {
          setEditingApplicationId(String(app.id))
          setIsEditApplicationOpen(true)
        }}
        openDeleteApplication={(appId) => {
          setDeletingApplicationId(appId)
          setIsDeleteApplicationOpen(true)
        }}
        isCreatingPipeline={isCreatingPipeline}
        createDefaultPipelines={createDefaultPipelines}
      />

      {/* Tips Section */}
      {applications.length > 0 && <ApplicationTips />}

      {/* Dialogs */}
      <AddApplicationDialog 
        isOpen={isAddOpen} 
        setIsOpen={setIsAddOpen} 
        pipelines={pipelines}
        applications={applications}
        cvs={cvs}
        onSuccess={refreshAll}
      />

      <CreatePipelineDialog 
        isOpen={isCreatePipelineOpen} 
        setIsOpen={setIsCreatePipelineOpen} 
        pipelines={pipelines}
        onSuccess={refreshAll}
      />

      <EditApplicationDialog 
        isOpen={isEditApplicationOpen} 
        setIsOpen={setIsEditApplicationOpen} 
        application={applications.find(a => String(a.id) === editingApplicationId) || null}
        pipelines={pipelines}
        cvs={cvs}
        onSuccess={handleEditAppSuccess}
      />

      <DeleteApplicationDialog 
        isOpen={isDeleteApplicationOpen} 
        setIsOpen={setIsDeleteApplicationOpen} 
        applicationId={deletingApplicationId}
        onSuccess={handleDeleteAppSuccess}
      />

      <EditPipelineDialog 
        isOpen={isEditPipelineOpen} 
        setIsOpen={setIsEditPipelineOpen} 
        pipeline={pipelines.find(p => String(p.id) === editingPipelineId) || null}
        onSuccess={handleEditPipelineSuccess}
        onError={refreshAll}
      />

      <DeletePipelineDialog 
        isOpen={isDeletePipelineOpen} 
        setIsOpen={setIsDeletePipelineOpen} 
        pipelineId={deletingPipelineId}
        onSuccess={handleDeletePipelineSuccess}
        onError={refreshAll}
      />

      <MovePipelineDialog 
        isOpen={isMovePipelineDialogOpen} 
        setIsOpen={setIsMovePipelineDialogOpen} 
        pipelines={pipelines}
        movePipeline={movePipeline}
        normalizePipelineColor={normalizePipelineColor}
      />
    </div>
  )
}
