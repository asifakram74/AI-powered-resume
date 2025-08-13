"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Grid, List, Search, TrendingUp, Award, Target, Users, Edit, Trash2, Download, Eye, Plus } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { getCVs, deleteCV, createCV, updateCV, type CV, CreateCVData } from "@/lib/redux/service/cvService"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/redux/hooks"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { CVWizard } from "./AddEditResume"
import { toast } from "sonner"

export function ResumePage() {
  const router = useRouter()
  const [cvs, setCVs] = useState<CV[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedCV, setSelectedCV] = useState<CV | null>(null)
  const { user } = useAppSelector((state) => state.auth)
  const userId = user?.id;

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        setIsLoading(true)
        const data = await getCVs(userId?.toString() || '')
        setCVs(data)
      } catch (error) {
        console.error("Error fetching CVs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCVs()
  }, [userId])

  const handleDelete = async (cv: CV) => {
    if (confirm(`Are you sure you want to delete "${cv.title}"?`)) {
      try {
        await deleteCV(cv.id)
        setCVs((prev) => prev.filter((c) => c.id !== cv.id))
      } catch (error) {
        console.error("Error deleting CV:", error)
        toast("Failed to delete CV")
      }
    }
  }

  const handleCreateAICV = (personaId: string) => {
    router.push(`/create-cv?personaId=${personaId}`)
  }

  const handleSaveCV = async (cvData: CreateCVData) => {
    try {
      const response = await createCV(cvData)
      setCVs(prev => [response, ...prev])
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error creating CV:", error)
    }
  }

  const handleUpdateCV = async (cvData: CreateCVData) => {
    if (!selectedCV) return
    try {
      const response = await updateCV(selectedCV.id, cvData)
      setCVs(prev => prev.map(c => c.id === selectedCV.id ? response : c))
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating CV:", error)
    }
  }

 // In ResumeList.tsx
const handleEdit = (cv: CV) => {
  router.push(`/create-cv?cvId=${cv.id}`);
};

  // Filter CVs based on search term
  const filteredCVs = cvs.filter(cv =>
    cv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.layout_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading && cvs.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-blue-600 text-white">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
            <p className="text-gray-600">View your professional resumes</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Resume
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[70vw] !max-w-none max-h-[90vh] overflow-x-auto">
            <DialogTitle className="sr-only">Create New Resume</DialogTitle>
            <CVWizard
              onSave={handleSaveCV}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="w-[95vw] !max-w-none max-h-[90vh] overflow-x-auto">
          <DialogTitle className="sr-only">Edit Resume</DialogTitle>
          <CVWizard
            editingCV={selectedCV}
            onSave={handleUpdateCV}
            onCancel={() => {
              setIsEditing(false)
              setSelectedCV(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {cvs.length > 0 && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Your Resumes ({filteredCVs.length})</h3>
                  <p className="text-sm text-gray-600">View your professional resumes</p>
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
                                {cv?.title
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{cv.title}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {cv.layout_id.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(cv.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(cv.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(cv)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(cv)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {/* <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/create-cv?personaId=${cv.personas_id}&step=template`)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Create AI CV
                            </Button> */}
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
                            {cv?.title
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{cv.title}</CardTitle>
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

                      <div className="text-xs text-gray-500">
                        <div>Created: {new Date(cv.created_at).toLocaleDateString()}</div>
                        <div>Updated: {new Date(cv.updated_at).toLocaleDateString()}</div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleEdit(cv)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
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

      {filteredCVs.length === 0 && cvs.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search terms</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes found</h3>
            <p className="text-gray-500 mb-4">You don't have any resumes yet</p>
          </CardContent>
        </Card>
      )}

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