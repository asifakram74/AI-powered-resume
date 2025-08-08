"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Crown, Sparkles, FileText, Target, CheckCircle, Star, ArrowRight, Zap, Shield, Mail, Globe, Menu, X, UserCircle, Settings } from "lucide-react"
import ResumeTemplate from "./ResumeTemplate"
import { sampleCVData } from "@/lib/sample-cv-data"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { logoutUser } from "@/lib/redux/slices/authSlice"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CVTemplate {
  id: string
  name: string
  description: string
  category: "modern" | "classic" | "creative" | "minimal"
}

const templates: CVTemplate[] = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean, modern design perfect for tech and business professionals",
    category: "modern",
  },
  {
    id: "classic",
    name: "Classic Traditional",
    description: "Traditional format ideal for conservative industries",
    category: "classic",
  },
  {
    id: "creative",
    name: "Creative Designer",
    description: "Eye-catching design for creative professionals",
    category: "creative",
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    description: "Simple, clean layout focusing on content",
    category: "minimal",
  },
]

const dashboardMenuItems = [
  {
    id: "create-persona",
    label: "Persona",
    icon: Sparkles,
    badge: "AI",
    href: "/dashboard?page=create-persona",
  },
  {
    id: "resumes",
    label: "Resumes",
    icon: FileText,
    href: "/dashboard?page=resumes",
  },
  {
    id: "cover-letter",
    label: "Cover Letters",
    icon: Mail,
    href: "/dashboard?page=cover-letter",
  },
  {
    id: "ats-checker",
    label: "ATS Checker",
    icon: CheckCircle,
    badge: "Pro",
    href: "/dashboard?page=ats-checker",
  },
  {
    id: "profile",
    label: "Profile",
    icon: UserCircle,
    href: "/dashboard?page=profile",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard?page=settings",
  },
]

interface CVTemplatesProps {
  onTemplateSelect: (template: CVTemplate) => void
  selectedTemplate?: string
}

export function CVTemplates({ onTemplateSelect, selectedTemplate }: CVTemplatesProps) {
  const [filter, setFilter] = useState<"all" | "modern" | "classic" | "creative" | "minimal">("all")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const filteredTemplates = templates.filter((template) => {
    if (filter === "all") return true
    return template.category === filter
  })

  const handleLogout = async () => {
    await dispatch(logoutUser())
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-white rounded-lg shadow-lg">
      {/* Navigation - Matches home page */}
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
            <Sparkles className="h-3 w-3 mr-1" />
            Professional Templates
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Resume Template</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select from our professionally designed templates that pass ATS systems and impress recruiters
          </p>
        </div>

        {/* Template Selection */}
        <div className="space-y-6">
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
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

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplate === template.id

              return (
                <Card
                  key={template.id}
                  className={`cursor-pointer h-full w-full transition-all duration-200 hover:shadow-lg ${
                    isSelected ? "ring-2 ring-blue-900 border-blue-900" : ""
                  }`}
                  onClick={() => onTemplateSelect(template)}
                >
                  <CardHeader className="p-4">
                    <div className="relative">
                      <div className="w-full overflow-hidden rounded-lg">
                        <div className="flex items-center justify-center">
                          <div className="h-32">
                            <ResumeTemplate
                              className="w-12 h-32"
                              scale={0.2}
                              data={sampleCVData}
                              templateId={template.id}
                              isPreview={true}
                            />
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <div className="bg-blue-500 rounded-full p-2">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <CardTitle className="text-base mb-1">{template.name}</CardTitle>
                    <CardDescription className="text-sm mb-3">{template.description}</CardDescription>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="capitalize">
                        {template.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}