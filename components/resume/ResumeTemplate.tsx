"use client"

import { ModernTemplate } from "@/components/templates/modern-template"
import { ClassicTemplate } from "@/components/templates/classic-template"
import { CreativeTemplate } from "@/components/templates/creative-template"
import { MinimalTemplate } from "@/components/templates/minimal-template"
import type { CVData } from "@/types/cv-data"

interface ResumeTemplateProps {
  data: CVData
  templateId: string
  scale?: number
  isPreview?: boolean
  className?: string
}

export default function ResumeTemplate({ 
  data, 
  templateId, 
  scale = 1, 
  isPreview = false,
  className = ""
}: ResumeTemplateProps) {
  const templateMap = {
    "modern": ModernTemplate,
    "classic": ClassicTemplate,
    "creative": CreativeTemplate,
    "minimal": MinimalTemplate,
  }

  const TemplateComponent = templateMap[templateId as keyof typeof templateMap]

  if (!TemplateComponent) {
    return <div>Template not found</div>
  }

  const style = {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: scale !== 0.3 ? `${50 / scale}%` : '100%',
    height: scale !== 1.8 ? `${100 / scale}%` : 'auto',
  }

  return (
    <div className={className} style={style}>
      <TemplateComponent data={data} isPreview={isPreview} />
    </div>
  )
} 