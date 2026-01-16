"use client"
import { CVPreview } from "../../pages/resume/CVPreview"

type Props = {
  selectedTemplate: any
  aiResponse: any
  convertToCVData: (aiResponse: any) => any
  isRegenerating: boolean
  activeSection?: string | null
}

export function CVPreviewSection({ selectedTemplate, aiResponse, convertToCVData, isRegenerating, activeSection }: Props) {
  return (
    <div className="relative">
      <CVPreview key={selectedTemplate.id} data={convertToCVData(aiResponse)} template={selectedTemplate} activeSection={activeSection} />

      {/* Progress Overlay */}
      {isRegenerating && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-950/70 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white dark:bg-gray-950 p-8 rounded-xl border flex flex-col items-center gap-4 max-w-full mx-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Regenerating Your CV</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">AI is analyzing your profile and creating fresh content...</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">This may take a few moments</p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
