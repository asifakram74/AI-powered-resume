
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Loader2 } from "lucide-react"
import { showErrorToast, showSuccessToast } from "../../components/ui/toast"
import { deleteJobApplication } from "../../lib/redux/service/jobTrackerService"

interface DeleteApplicationDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  applicationId: string | null
  onSuccess: (appId: string) => Promise<void>
}

export function DeleteApplicationDialog({ isOpen, setIsOpen, applicationId, onSuccess }: DeleteApplicationDialogProps) {
  const [isDeletingApplication, setIsDeletingApplication] = useState(false)

  const confirmDeleteApplication = async () => {
    if (!applicationId) return
    const appId = String(applicationId)
    try {
      setIsDeletingApplication(true)
      await deleteJobApplication(appId)
      showSuccessToast("Application deleted")
      setIsOpen(false)
      await onSuccess(appId)
    } catch (e: any) {
      showErrorToast("Failed to delete application", e?.message || "Please try again")
    } finally {
      setIsDeletingApplication(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] border-red-200/30 dark:border-red-900/30 dark:bg-[#0B0F1A]">
        <DialogHeader className="relative pb-4 mb-4 border-b dark:border-gray-800">
          <div className="absolute -left-6 -top-6 w-32 h-32 bg-red-500 opacity-10 blur-3xl -z-10" />
          <DialogTitle className="text-xl font-bold dark:text-gray-100">Delete Application</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            This action cannot be undone. The application will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeletingApplication} className="border-gray-300 dark:border-gray-700">
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDeleteApplication} disabled={isDeletingApplication}>
            {isDeletingApplication ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete Application"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
