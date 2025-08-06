"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileText,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  Download,
  Search,
  Plus,
  TrendingUp,
  Target,
  Award,
  Users,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CVTemplates } from "./ChooseResumeTemplte"
import { CVForm } from "./AddEditResume"
import { getCVs, createCV, updateCV, deleteCV, type CV, type CreateCVData } from "@/lib/redux/service/cvService"
import { useAppSelector } from "@/lib/redux/hooks"

export function ResumePage() {
  const [cvs, setCVs] = useState<CV[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingCV, setEditingCV] = useState<CV | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAppSelector((state) => state.auth)
  const userId = user?.id;

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        setIsLoading(true)
        const data = await getCVs(userId?.toString() || '')
        console.log("Fetched CVs:", data)
        setCVs(data)
      } catch (error) {
        console.error("Error fetching CVs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCVs()
  }, [user?.id])

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template.id)
    setShowForm(true)
  }

  const handleEdit = (cv: CV) => {
    setEditingCV(cv)
    setSelectedTemplate(cv.layout_id)
    setShowForm(true)
    setIsDialogOpen(true)
  }

  const handleDownload = (cv: CV) => {
    const dataStr = JSON.stringify(cv, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `${cv.title.replace(/\s+/g, "_")}_CV.json`
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleView = (cv: CV) => {
    alert(`Viewing CV: ${cv.title}\n\nName: ${cv.name}\nEmail: ${cv.email}\nTemplate: ${cv.layout_id}`)
  }

  const handleDelete = async (cv: CV) => {
    if (confirm(`Are you sure you want to delete "${cv.title}"?`)) {
      try {
        await deleteCV(cv.id)
        setCVs((prev) => prev.filter((c) => c.id !== cv.id))
      } catch (error) {
        console.error("Error deleting CV:", error)
        alert("Failed to delete CV")
      }
    }
  }

  const handleSaveCV = async (cvData: CreateCVData) => {
    console.log("CV data being processed:", JSON.stringify(cvData, null, 2))
    setIsLoading(true)

    try {
      let response: CV
      if (editingCV) {
        console.log("Updating existing CV with ID:", editingCV.id)
        response = await updateCV(editingCV.id, cvData)
        setCVs((prev) => prev.map((c) => (c.id === editingCV.id ? response : c)))
      } else {
        console.log("Creating new CV")
        response = await createCV(cvData)
        console.log("CV created successfully with ID:", response.id)
        setCVs((prev) => [response, ...prev])
      }

      setIsDialogOpen(false)
      setShowForm(false)
      setSelectedTemplate("")
      setEditingCV(null)
    } catch (error) {
      console.error("Error saving CV:", error)

      // Handle plan limit error
      if (error instanceof Error && error.message.includes("Free plan users")) {
        alert("Free plan users can only create up to 3 CVs. Please upgrade your plan to create more.")
      } else {
        let errorMessage = "Unknown error occurred"
        if (error instanceof Error) {
          errorMessage = error.message
        } else if (typeof error === "string") {
          errorMessage = error
        }
        alert(`Failed to save CV: ${errorMessage}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Filter CVs based on search term
  const filteredCVs = cvs.filter((cv) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      cv.title.toLowerCase().includes(searchLower) ||
      cv.name.toLowerCase().includes(searchLower) ||
      cv.email.toLowerCase().includes(searchLower) ||
      cv.layout_id.toLowerCase().includes(searchLower)
    )
  })

  if (isLoading && cvs.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-blue-600 text-white">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
            <p className="text-gray-600">Create professional resumes with our templates</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              onClick={() => {
                setShowForm(false);
                setSelectedTemplate("");
                setEditingCV(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Resume
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[70vw] !max-w-none max-h-[90vh] overflow-x-auto">
            <DialogHeader>
              <DialogTitle>{editingCV ? "Edit Resume" : "Create New Resume"}</DialogTitle>
              <DialogDescription>
                {!showForm
                  ? "Choose a professional template for your resume"
                  : "Fill in your information to create your resume"}
              </DialogDescription>
            </DialogHeader>

            {!showForm ? (
              <CVTemplates
                onTemplateSelect={handleTemplateSelect}
                selectedTemplate={selectedTemplate}
                userPlan={user?.plan_type}
              />
            ) : (
              <CVForm
                selectedTemplate={selectedTemplate}
                editingCV={editingCV}
                onSave={handleSaveCV}
                onCancel={() => {
                  setIsDialogOpen(false)
                  setShowForm(false)
                  setSelectedTemplate("")
                  setEditingCV(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Plan Usage Info */}
      {user?.plan_type === "free" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2">
                  <Award className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium text-orange-900">Free Plan Usage</h4>
                  <p className="text-sm text-orange-700">
                    You have created {cvs.length}/3 resumes. Upgrade to create unlimited resumes.
                  </p>
                </div>
              </div>
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Toggle and CVs Display */}
      {cvs.length > 0 && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Your Resumes ({filteredCVs.length})</h3>
                  <p className="text-sm text-gray-600">Manage and edit your professional resumes</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search resumes by title, name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {viewMode === "table" ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resume</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCVs.map((cv) => (
                      <TableRow key={cv.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback>
                                {cv.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{cv.title}</div>
                              <div className="text-sm text-gray-600">{cv.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {cv.layout_id.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{cv.email}</div>
                            {cv.phone && <div className="text-gray-500">{cv.phone}</div>}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(cv.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(cv.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleView(cv)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(cv)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDownload(cv)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(cv)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCVs.map((cv) => (
                <Card key={cv.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>
                            {cv.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{cv.title}</CardTitle>
                          <CardDescription>{cv.name}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Template</Label>
                        <Badge variant="secondary" className="mt-1 capitalize">
                          {cv.layout_id.replace("-", " ")}
                        </Badge>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Contact</Label>
                        <div className="text-sm text-gray-600 mt-1">
                          <div>{cv.email}</div>
                          {cv.phone && <div>{cv.phone}</div>}
                          {cv.address && <div>{cv.address}</div>}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        <div>Created: {new Date(cv.created_at).toLocaleDateString()}</div>
                        <div>Updated: {new Date(cv.updated_at).toLocaleDateString()}</div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleView(cv)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleEdit(cv)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleDownload(cv)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(cv)}
                          className="text-red-600 hover:text-red-700 bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {filteredCVs.length === 0 && cvs.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search terms or create a new resume</p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {cvs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes created yet</h3>
            <p className="text-gray-500 mb-4">Create your first professional resume by clicking the button above</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resume Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Tailor Your Resume</h4>
                <p className="text-sm text-gray-600">Customize your resume for each job application</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <Award className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Highlight Achievements</h4>
                <p className="text-sm text-gray-600">Focus on quantifiable accomplishments and results</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Professional Format</h4>
                <p className="text-sm text-gray-600">Use clean, professional templates that are ATS-friendly</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
