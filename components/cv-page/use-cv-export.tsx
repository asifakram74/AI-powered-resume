"use client"

import { toast } from "sonner"
import jsPDF from "jspdf"
import * as htmlToImage from "html-to-image"
import { showSuccessToast, showErrorToast, showLoadingToast } from "./cv-toasts"

interface UseCVExportProps {
  selectedTemplateId?: string
  personaFullName?: string
}

export function useCVExport({ selectedTemplateId, personaFullName }: UseCVExportProps) {
  const handleExport = async (format: "pdf" | "docx" | "png") => {
    try {
      const cvElement = document.getElementById("cv-preview-content")
      if (!cvElement) {
        showErrorToast("Export Failed", "CV preview not found. Please refresh and try again.")
        return
      }

      const loadingToastId = showLoadingToast(
        `Preparing ${format.toUpperCase()} export...`,
        "Processing your CV for download",
      )

      try {
        const filename =
          format === "png"
            ? `${selectedTemplateId || "resume"}.png`
            : `${personaFullName || "resume"}-cv.${format}`

        if (format === "pdf") {
          const pageEls = Array.from(cvElement.querySelectorAll('.a4-page')) as HTMLElement[]
          if (pageEls.length > 0) {
            const pdf = new jsPDF({
              orientation: 'p',
              unit: 'mm',
              format: 'a4',
              compress: true
            })
            const pageWidth = pdf.internal.pageSize.getWidth()

            for (let i = 0; i < pageEls.length; i++) {
              const pageEl = pageEls[i]
              const dataUrl = await htmlToImage.toJpeg(pageEl, {
                quality: 0.8,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                skipFonts: true,
              })
              const img = new Image()
              await new Promise<void>((resolve) => {
                img.onload = () => resolve()
                img.src = dataUrl
              })
              const mmPerPx = pageWidth / img.width
              const imgHeightMm = img.height * mmPerPx
              pdf.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, imgHeightMm)
              if (i < pageEls.length - 1) pdf.addPage()
            }

            pdf.save(filename)
          } else {
            const dataUrl = await htmlToImage.toJpeg(cvElement, {
              quality: 0.95,
              pixelRatio: 2,
              backgroundColor: '#ffffff',
              skipFonts: true,
            })
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pageWidth = pdf.internal.pageSize.getWidth()
            const img = new Image()
            await new Promise<void>((resolve) => {
              img.onload = () => resolve()
              img.src = dataUrl
            })
            const mmPerPx = pageWidth / img.width
            const imgHeightMm = img.height * mmPerPx
            pdf.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, imgHeightMm)
            pdf.save(filename)
          }
        } else if (format === "png") {
          const dataUrl = await htmlToImage.toPng(cvElement, {
            quality: 1,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            skipFonts: true,
          })
          const link = document.createElement('a')
          link.href = dataUrl
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } else if (format === "docx") {
          const response = await fetch(`https://stagingnode.resumaic.com/api/cv-export/docx`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ html: cvElement.outerHTML, filename }),
          })
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Failed to export ${format.toUpperCase()}`)
          }
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }

        toast.dismiss(loadingToastId)
        showSuccessToast(
          `${format.toUpperCase()} Downloaded! 📄`,
          `Your CV has been downloaded as ${format.toUpperCase()}`,
        )
      } catch (error) {
        console.error(`Error exporting as ${format}:`, error)
        toast.dismiss(loadingToastId)
        showErrorToast("Export Failed", `${format.toUpperCase()} export failed. Please try again.`)
      }
    } catch (error: any) {
      console.error("Export error:", error)
      showErrorToast("Export Failed", `Unable to export as ${format.toUpperCase()}. Please try again.`)
    }
  }

  const exportAsPNG = async () => {
    await handleExport("png")
  }

  const handleDocxExport = async () => {
    await handleExport("docx")
  }

  return {
    handleExport,
    exportAsPNG,
    handleDocxExport
  }
}
