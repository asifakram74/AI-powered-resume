"use client"
import { useState } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"

type CVTemplate = {
  id: string
  name: string
  description: string
  category: "modern" | "classic" | "creative" | "minimal"
}

type Props = {
  templates: CVTemplate[]
  selectedTemplate: CVTemplate | null
  hasUnsavedChanges: boolean
  onSelect: (template: CVTemplate) => void
}

export function CVTemplateSelector({ templates, selectedTemplate, hasUnsavedChanges, onSelect }: Props) {
  const [filter, setFilter] = useState<"all" | "modern" | "classic" | "creative" | "minimal">("all")
  const filteredTemplates = templates.filter((template) => {
    if (filter === "all") return true
    return template.category === filter
  })
  return (
    <Card>
      <CardContent className="p-4 space-y-4">


        <div className="flex flex-wrap items-center justify-center gap-3 py-1">
          {["all", "modern", "classic", "creative", "minimal"].map((category) => (
            <Button
              key={category}
              variant={filter === category ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(category as any)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
        <div className="flex justify-end items-center">
          {hasUnsavedChanges && (
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">Unsaved changes</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedTemplate?.id === template.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
                }`}
              onClick={() => onSelect(template)}
            >
              <h4 className="font-medium text-sm text-center">{template.name}</h4>
              <p className="text-xs text-gray-600 mt-1 text-center">{template.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
