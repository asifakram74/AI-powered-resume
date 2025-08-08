"use client"

import type { CVData } from "@/types/cv-data"
import { ModernTemplate } from "@/components/templates/modern-template"
import { ClassicTemplate } from "@/components/templates/classic-template"
import { MinimalTemplate } from "@/components/templates/minimal-template"
import { CreativeTemplate } from "@/components/templates/creative-template"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, ZoomIn, ZoomOut, FileText, Image, File } from "lucide-react"
import { toast } from "sonner"

interface CVTemplate {
  id: string
  name: string
  description: string
  category: "modern" | "classic" | "creative" | "minimal"
  isPremium: boolean
}

interface CVPreviewProps {
  data: CVData
  template: CVTemplate
}

export function CVPreview({ data, template }: CVPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [isExporting, setIsExporting] = useState<"pdf" | "png" | "docx" | null>(null)

  const exportToPDF = async () => {
    if (!previewRef.current) return
    setIsExporting("pdf")
    
    try {
      const [html2canvas, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ])

      // Get the actual dimensions of the CV content
      const cvElement = previewRef.current
      const width = cvElement.offsetWidth
      const height = cvElement.offsetHeight

      // Calculate the scale to fit A4 page (in mm)
      const a4Width = 210 // A4 width in mm
      const a4Height = 297 // A4 height in mm
      const scale = a4Width / width * 0.95 // Scale down slightly to add margins

      const canvas = await html2canvas.default(cvElement, {
        scale: 3, // Higher scale for better quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: width,
        height: height,
        windowWidth: width,
        windowHeight: height
      })

      const imgData = canvas.toDataURL("image/png", 1.0)
      const pdf = new jsPDF({
        orientation: height > width ? "portrait" : "landscape",
        unit: "mm",
        format: "a4",
      })

      // Calculate the position to center the image
      const imgWidth = a4Width * 0.95 // 95% of page width
      const imgHeight = (height * imgWidth) / width

      // If the content is taller than the page, split into multiple pages
      if (imgHeight > a4Height) {
        let position = 0
        const pageHeight = a4Height * 0.95 // Leave some margin
        
        while (position < imgHeight) {
          if (position > 0) {
            pdf.addPage()
          }
          
          const remainingHeight = imgHeight - position
          const heightToAdd = Math.min(remainingHeight, pageHeight)
          
          pdf.addImage(
            imgData,
            "PNG",
            10, // x position (left margin)
            10, // y position (top margin)
            imgWidth - 20, // width (with margins)
            heightToAdd,
            undefined,
            "FAST",
            -position
          )
          
          position += pageHeight
        }
      } else {
        // Single page for shorter content
        const yOffset = (a4Height - imgHeight) / 2
        pdf.addImage(
          imgData,
          "PNG",
          10, // x position (left margin)
          yOffset < 10 ? 10 : yOffset, // Ensure at least 10mm top margin
          imgWidth - 20, // width (with margins)
          imgHeight,
          undefined,
          "FAST"
        )
      }

      pdf.save("cv.pdf")
      toast.success("PDF exported successfully")
    } catch (error) {
      console.error("Error exporting to PDF:", error)
      toast.error("Failed to export PDF")
    } finally {
      setIsExporting(null)
    }
  }

  const exportToPNG = async () => {
    if (!previewRef.current) return
    setIsExporting("png")
    
    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      const link = document.createElement("a")
      link.download = "cv.png"
      link.href = canvas.toDataURL("image/png")
      link.click()
      toast.success("PNG exported successfully")
    } catch (error) {
      console.error("Error exporting to PNG:", error)
      toast.error("Failed to export PNG")
    } finally {
      setIsExporting(null)
    }
  }

  const exportToDOCX = async () => {
    if (!previewRef.current) return
    setIsExporting("docx")

    try {
      // Send HTML to server API for DOCX generation
      const html = previewRef.current.innerHTML
      const response = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      })
      if (!response.ok) throw new Error("Failed to export DOCX")
      const blob = await response.blob()
      const link = document.createElement("a")
      link.download = "cv.docx"
      link.href = URL.createObjectURL(blob)
      link.click()
      toast.success("DOCX exported successfully")
    } catch (error) {
      console.error("Error exporting to DOCX:", error)
      toast.error("Failed to export DOCX")
    } finally {
      setIsExporting(null)
    }
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 1.5))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.7))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
  }

  const renderTemplate = () => {
    switch (template.id) {
      case "modern":
        return <ModernTemplate data={data} />
      case "classic":
        return <ClassicTemplate data={data} />
      case "minimal":
        return <MinimalTemplate data={data} />
      case "creative":
        return <CreativeTemplate data={data} />
      default:
        return <ModernTemplate data={data} />
    }
  }

  return (
    <div className="relative">
      {/* Export Controls */}
      <div className="flex items-center justify-end gap-2 mb-4 print:hidden">
        <div className="flex items-center gap-1 bg-white rounded-md shadow-sm p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.7}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetZoom}
            className="h-8 w-16 p-0 text-xs"
          >
            {Math.round(zoomLevel * 100)}%
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 1.5}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={exportToPDF}
          disabled={!!isExporting}
          className="gap-2"
        >
          {isExporting === "pdf" ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            <FileText className="h-4 w-4" />
          )}
          PDF
        </Button>

        <Button
          onClick={exportToPNG}
          disabled={!!isExporting}
          variant="outline"
          className="gap-2"
        >
          {isExporting === "png" ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            <Image className="h-4 w-4" />
          )}
          PNG
        </Button>

        <Button
          onClick={exportToDOCX}
          disabled={!!isExporting}
          variant="outline"
          className="gap-2"
        >
          {isExporting === "docx" ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            <File className="h-4 w-4" />
          )}
          DOCX
        </Button>
      </div>

      {/* Preview Container */}
      <div className="overflow-auto border rounded-lg bg-gray-50 p-4 print:p-0 print:border-0">
        <div
          ref={previewRef}
          className="bg-white shadow-lg mx-auto transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "top center",
            width: `${100 / zoomLevel}%`,
          }}
        >
          {renderTemplate()}
        </div>
      </div>
    </div>
  )
} 