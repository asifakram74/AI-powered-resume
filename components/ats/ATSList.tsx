"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Target,
  Grid,
  List,
  Eye,
  Trash2,
  Download,
  Search,
  Plus,
  FileText,
  BarChart2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ATSResume, getATSResumes, deleteATSResume } from "@/lib/redux/service/atsResumeService"
import { useAppSelector } from "@/lib/redux/hooks"
import Link from "next/link"
import { toast } from "sonner"

export function ATSListPage() {
  const [atsResumes, setAtsResumes] = useState<ATSResume[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedResume, setSelectedResume] = useState<ATSResume | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  
  const { user } = useAppSelector((state) => state.auth)
  const userId = user?.id

  useEffect(() => {
    const fetchATSResumes = async () => {
      if (!userId) return
      
      try {
        setIsLoading(true)
        const resumes = await getATSResumes()
        setAtsResumes(resumes)
      } catch (error) {
        console.error("Error fetching ATS resumes:", error)
        toast.error("Failed to load ATS analyses")
      } finally {
        setIsLoading(false)
      }
    }

    fetchATSResumes()
  }, [userId])

  const handleDelete = async () => {
    if (!selectedResume) return
    
    try {
      setIsDeleting(true)
      await deleteATSResume(selectedResume.id)
      setAtsResumes(atsResumes.filter(resume => resume.id !== selectedResume.id))
      toast.success("ATS analysis deleted successfully")
      setShowDeleteDialog(false)
      setSelectedResume(null)
    } catch (error) {
      console.error("Error deleting ATS resume:", error)
      toast.error("Failed to delete ATS analysis")
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredResumes = atsResumes.filter(resume =>
    resume.job_description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ATS Analyses</h2>
          <p className="text-muted-foreground">
            View and manage your ATS resume analyses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'outline' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('table')}
            className={viewMode === 'table' ? 'bg-accent' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'outline' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-accent' : ''}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link href="/dashboard/ats/new">
              <Plus className="mr-2 h-4 w-4" /> New Analysis
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search analyses..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredResumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No ATS analyses found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm ? 'Try a different search term' : 'Get started by creating a new analysis'}
              </p>
              <Button asChild>
                <Link href="/dashboard/ats/new">
                  <Plus className="mr-2 h-4 w-4" /> New Analysis
                </Link>
              </Button>
            </div>
          ) : viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResumes.map((resume) => {
                  const analysis = resume.analysis_result 
                    ? JSON.parse(resume.analysis_result) 
                    : { score: 0 }
                  
                  return (
                    <TableRow key={resume.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          <span className="line-clamp-1">
                            {resume.job_description.substring(0, 50)}
                            {resume.job_description.length > 50 ? '...' : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {analysis.score >= 70 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                          <span>{analysis.score || 0}% Match</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(resume.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/ats/${resume.id}`}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setSelectedResume(resume)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredResumes.map((resume) => {
                const analysis = resume.analysis_result 
                  ? JSON.parse(resume.analysis_result) 
                  : { score: 0 }
                
                return (
                  <Card key={resume.id} className="overflow-hidden">
                    <CardHeader className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-blue-500" />
                          <CardTitle className="text-lg font-medium line-clamp-1">
                            {resume.job_description.substring(0, 30)}
                            {resume.job_description.length > 30 ? '...' : ''}
                          </CardTitle>
                        </div>
                        <Badge 
                          variant={analysis.score >= 70 ? 'default' : 'secondary'}
                          className={`${analysis.score >= 70 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          {analysis.score || 0}% Match
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(resume.created_at)}
                      </p>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/ats/${resume.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedResume(resume)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete ATS Analysis</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ATS analysis? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
