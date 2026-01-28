"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Copy, ExternalLink, Share2, Link2, QrCode, Download } from "lucide-react"
import { toast } from "sonner"

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  publicSlug: string
}

export function ShareDialog({ isOpen, onClose, publicSlug }: ShareDialogProps) {
  const [publicUrl, setPublicUrl] = useState("")

  useEffect(() => {
    if (publicSlug && typeof window !== "undefined") {
      setPublicUrl(`${window.location.origin}/cover-letter/${publicSlug}`)
    }
  }, [publicSlug])

  const qrUrl = publicUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(publicUrl)}`
    : ""

  const handleCopyLink = async () => {
    if (!publicUrl) return
    try {
      await navigator.clipboard.writeText(publicUrl)
      toast.success("Public link copied!", {
        description: "The public link has been copied to your clipboard.",
      })
    } catch {
      toast.error("Copy failed", {
        description: "Please try again.",
      })
    }
  }

  const handleNativeShare = async () => {
    if (!publicUrl) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Cover Letter",
          url: publicUrl,
        })
      } catch {
        return
      }
    } else {
      await handleCopyLink()
    }
  }

  const handleDownloadQr = () => {
    if (!qrUrl) return
    const link = document.createElement("a")
    link.href = qrUrl
    link.download = "cover-letter-qr.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-3xl">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="text-xl">Share Cover Letter</DialogTitle>
            <DialogDescription>
              Share your public cover letter link or let others scan the QR code.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-6 pb-6 grid gap-6 md:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-4">
            {/* Public link section */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                <Link2 className="h-4 w-4 text-emerald-500" />
                Public link
              </div>
              <div className="mt-3 flex gap-2">
                <Input
                  readOnly
                  value={publicUrl}
                  className="bg-white dark:bg-gray-950 font-mono text-xs md:text-sm"
                />
                <Button variant="outline" onClick={handleCopyLink} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.open(publicUrl, "_blank")}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Button>
                <Button
                  className="gap-2 resumaic-gradient-green text-white hover:opacity-90"
                  onClick={handleNativeShare}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>

            {/* Share tips section */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                <Share2 className="h-4 w-4 text-blue-500" />
                Share tips
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Use the link for email, the Share button for mobile apps, and the QR for print or live demos.
              </div>
            </div>
          </div>

          {/* QR code section */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
              <QrCode className="h-4 w-4 text-purple-500" />
              QR code
            </div>
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="Cover Letter QR code"
                className="h-44 w-44 rounded-xl border border-gray-200 dark:border-gray-800 bg-white"
              />
            ) : (
              <div className="h-44 w-44 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-sm text-gray-500">
                QR unavailable
              </div>
            )}
            <Button
              variant="outline"
              onClick={handleDownloadQr}
              disabled={!qrUrl}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download QR
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
