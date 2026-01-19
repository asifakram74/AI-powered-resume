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
              const dataUrl = await htmlToImage.toPng(pageEl, {
                quality: 1.0,
                pixelRatio: 4, // Maximized for best quality
                backgroundColor: '#ffffff',
                style: {
                  // @ts-ignore
                  fontSmooth: 'always',
                  // @ts-ignore
                  webkitFontSmoothing: 'antialiased',
                  // @ts-ignore
                  mozOsxFontSmoothing: 'grayscale',
                  printColorAdjust: 'exact',
                  WebkitPrintColorAdjust: 'exact',
                },
              })
              const img = new Image()
              await new Promise<void>((resolve) => {
                img.onload = () => resolve()
                img.src = dataUrl
              })
              const mmPerPx = pageWidth / img.width
              const imgHeightMm = img.height * mmPerPx
              pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, imgHeightMm)
              if (i < pageEls.length - 1) pdf.addPage()
            }

            pdf.save(filename)
          } else {
            const dataUrl = await htmlToImage.toPng(cvElement, {
              quality: 1.0,
              pixelRatio: 4, // Maximized for best quality
              backgroundColor: '#ffffff',
              style: {
                // @ts-ignore
                fontSmooth: 'always',
                // @ts-ignore
                webkitFontSmoothing: 'antialiased',
                // @ts-ignore
                mozOsxFontSmoothing: 'grayscale',
                printColorAdjust: 'exact',
                WebkitPrintColorAdjust: 'exact',
              },
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
            pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, imgHeightMm)
            pdf.save(filename)
          }
        } else if (format === "png") {
          const pageEls = Array.from(cvElement.querySelectorAll('.a4-page')) as HTMLElement[]
          
          if (pageEls.length > 0) {
            // If multiple pages, stitch them together
            // If single page, just export it
            
            // Calculate total height and max width
            let totalHeight = 0
            let maxWidth = 0
            
            for (const pageEl of pageEls) {
              totalHeight += pageEl.offsetHeight
              maxWidth = Math.max(maxWidth, pageEl.offsetWidth)
            }

            const pixelRatio = 4 // Maximized for best quality
            const canvas = document.createElement('canvas')
            canvas.width = maxWidth * pixelRatio
            canvas.height = totalHeight * pixelRatio
            const ctx = canvas.getContext('2d')

            if (ctx) {
              // Fill background
              ctx.fillStyle = '#ffffff'
              ctx.fillRect(0, 0, canvas.width, canvas.height)
              
              let currentY = 0
              for (const pageEl of pageEls) {
                const dataUrl = await htmlToImage.toPng(pageEl, {
                  quality: 1,
                  pixelRatio: pixelRatio,
                  backgroundColor: '#ffffff',
                  style: {
                    // @ts-ignore
                    fontSmooth: 'always',
                    // @ts-ignore
                    webkitFontSmoothing: 'antialiased',
                    // @ts-ignore
                    mozOsxFontSmoothing: 'grayscale',
                    printColorAdjust: 'exact',
                    WebkitPrintColorAdjust: 'exact',
                  },
                })
                
                const img = new Image()
                await new Promise<void>((resolve) => {
                  img.onload = () => resolve()
                  img.src = dataUrl
                })
                
                // Draw image onto canvas
                // dataUrl is already scaled by pixelRatio, so we draw it at the scaled coordinates
                ctx.drawImage(img, 0, currentY * pixelRatio)
                currentY += pageEl.offsetHeight
              }

              const finalDataUrl = canvas.toDataURL('image/png')
              const link = document.createElement('a')
              link.href = finalDataUrl
              link.download = filename
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }
          } else {
            const dataUrl = await htmlToImage.toPng(cvElement, {
              quality: 1,
              pixelRatio: 4,
              backgroundColor: '#ffffff',
              style: {
                // @ts-ignore
                fontSmooth: 'always',
                // @ts-ignore
                webkitFontSmoothing: 'antialiased',
                // @ts-ignore
                mozOsxFontSmoothing: 'grayscale',
                printColorAdjust: 'exact',
                WebkitPrintColorAdjust: 'exact',
              },
            })
            const link = document.createElement('a')
            link.href = dataUrl
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
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
