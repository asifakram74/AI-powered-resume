"use client"
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
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Change Template</h3>
          {hasUnsavedChanges && (
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">Unsaved changes</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedTemplate?.id === template.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onSelect(template)}
            >
              <h4 className="font-medium text-sm">{template.name}</h4>
              <p className="text-xs text-gray-600 mt-1">{template.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
