"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  FileText,
  Grid,
  List,
  Search,
  TrendingUp,
  Award,
  Target,
  Users,
  Edit,
  Trash2,
  Download,
  Eye,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import {
  getAllCVs,
  getCVs,
  deleteCV,
  createCV,
  updateCV,
  type CV,
  CreateCVData,
} from "../../lib/redux/service/resumeService";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "../../components/ui/dialog";
import { CVWizard } from "./AddEditResume";
import { toast } from "sonner";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Crown, UserCircle } from "lucide-react";
import { PageProps } from "../../app/dashboard/page";

export function ResumePage({ user }: PageProps) {
  const router = useRouter();
  const [cvs, setCVs] = useState<CV[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCV, setSelectedCV] = useState<CV | null>(null);
  const userId = user?.id;

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        setIsLoading(true);

        let data;
        if (user?.role?.toLowerCase() === 'admin') {
          data = await getAllCVs();
        } else {
          data = await getCVs(userId?.toString() || "");
        }

        setCVs(data);
      } catch (error) {
        console.error("Error fetching CVs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCVs();
  }, [userId, user?.role]);

  const handleCreateAICV = (personaId: string) => {
    router.push(`/create-cv?personaId=${personaId}`);
  };

  const handleSaveCV = async (cvData: CreateCVData) => {
    // Check CV limit for free plan users
    if ((user as any)?.plan === 'free' && cvs.length >= 3) {
      toast.error("Free plan users can only create up to 3 CVs. Please upgrade your plan to create more.");
      return;
    }

    try {
      const response = await createCV(cvData);
      setCVs((prev) => [response, ...prev]);
      setIsDialogOpen(false);
      toast.success("Resume created successfully");
    } catch (error: any) {
      console.error("Error creating CV:", error);
      // Display the actual error message from the backend
      const errorMessage = error.message || "Failed to create resume";
      toast.error(errorMessage);
    }
  };

  const handleUpdateCV = async (cvData: CreateCVData) => {
    if (!selectedCV) return;
    try {
      const response = await updateCV(selectedCV.id, cvData);
      setCVs((prev) =>
        prev.map((c) => (c.id === selectedCV.id ? response : c))
      );
      setIsEditing(false);
      setSelectedCV(null);
      toast.success("Resume updated successfully");
    } catch (error) {
      console.error("Error updating CV:", error);
      toast.error("Failed to update resume");
    }
  };

  const handleEdit = (cv: CV) => {
    router.push(`/create-cv?cvId=${cv.id}`);
  };
  const handleView = (cv: CV) => {
    router.push(`/create-cv?cvId=${cv.id}&view=true`);
  };

  const handleDelete = async (cv: CV) => {
    try {
      await deleteCV(cv.id);
      setCVs((prev) => prev.filter((c) => c.id !== cv.id));
      toast.success("Resume deleted successfully");
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast.error("Failed to delete resume");
    }
  };

  // Filter CVs based on search term
  const filteredCVs = cvs.filter(
    (cv) =>
      cv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.layout_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && cvs.length === 0) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        {/* Left Section */}
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-3 text-center sm:text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg resumaic-gradient-green text-white mb-2 sm:mb-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              My Resumes
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-0">
              View and manage your professional resumes
            </p>
          </div>
        </div>

        {/* Button Section */}
        <div className="flex justify-center sm:justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="resumaic-gradient-green hover:opacity-90 hover-lift button-press"
                onClick={() => {
                  // Check CV limit for free plan users before opening dialog
                  if ((user as any)?.plan === 'free' && cvs.length >= 3) {
                    toast.error("Free plan limit reached! You can create up to 3 CVs. Upgrade to create more.");
                    return;
                  }
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Resume
                {(user as any)?.plan === 'free' && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {cvs.length}/3
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent
              className="
        w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] 
        !max-w-none max-h-[90vh] overflow-x-auto
      "
            >
              <DialogHeader>
                <DialogTitle>Create New Resume</DialogTitle>
                <DialogDescription>
                  Create a new resume by filling in the details below.
                </DialogDescription>
              </DialogHeader>
              <CVWizard
                onSave={handleSaveCV}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>


      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="w-[70vw] !max-w-none max-h-[90vh] overflow-x-auto">
          <DialogHeader>
            <DialogTitle>Edit Resume</DialogTitle>
            <DialogDescription>
              Update the resume details below.
            </DialogDescription>
          </DialogHeader>
          <CVWizard
            editingCV={selectedCV}
            onSave={handleUpdateCV}
            onCancel={() => {
              setIsEditing(false);
              setSelectedCV(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {cvs.length > 0 && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Title section - always full width */}
                <div className="w-full">
                  <h3 className="text-lg font-semibold">
                    Your Resumes ({filteredCVs.length})
                  </h3>
                  <p className="text-sm text-gray-600">
                    View and manage your professional resumes
                  </p>
                </div>

                {/* Controls section - improved mobile layout */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search resumes by title, template..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>

                  {/* View mode controls - hidden on mobile/tablet, visible on lg screens */}
                  <div className="hidden lg:flex gap-2 flex-shrink-0">
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

          {/* Table view - only visible on large screens */}
          {viewMode === "table" ? (
            <Card className="hidden lg:block">
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
                            <Avatar className="h-10 w-10 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                              <AvatarFallback
                                className={`bg-[#70E4A8]/20 hover:opacity-90 button-press text-[#70E4A8] font-semibold ${user?.role === "admin"
                                  ? ""
                                  : "bg-[#70E4A8]/20 hover:opacity-90 button-press text-[#70E4A8]"
                                  }`}
                              >
                                {user?.role === "admin" ? (
                                  <Crown className="h-5 w-5 text-[#EA580C]" />
                                ) : user?.name ? (
                                  user.name.charAt(0).toUpperCase()
                                ) : (
                                  <UserCircle className="h-5 w-5 text-[#70E4A8]" />
                                )}
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
                        <TableCell>
                          {new Date(cv.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(cv.updated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(cv)} className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(cv)} className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <ConfirmDialog
                              title="Delete Resume"
                              description="Are you sure you want to delete this resume? This action cannot be undone."
                              confirmText="Delete"
                              cancelText="Cancel"
                              onConfirm={() => handleDelete(cv)}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

          {/* Grid/Card view - always visible on mobile/tablet, conditionally visible on lg screens */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${viewMode === "table" ? "lg:hidden" : ""}`}>
            {filteredCVs.map((cv) => (
              <Card
                key={cv.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                        <AvatarFallback
                          className={`bg-[#70E4A8]/20 hover:opacity-90 button-press text-[#70E4A8] font-semibold ${user?.role === "admin"
                            ? ""
                            : "bg-[#70E4A8]/20 hover:opacity-90 button-press text-[#70E4A8]"
                            }`}
                        >
                          {user?.role === "admin" ? (
                            <Crown className="h-5 w-5 text-[#EA580C]" />
                          ) : user?.name ? (
                            user.name.charAt(0).toUpperCase()
                          ) : (
                            <UserCircle className="h-5 w-5 text-[#70E4A8]" />
                          )}
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
                      <div>
                        Created:{" "}
                        {new Date(cv.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        Updated:{" "}
                        {new Date(cv.updated_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(cv)} className="bg-transparent p-2"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(cv)}
                        className="bg-transparent p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        title="Delete Resume"
                        description="Are you sure you want to delete this resume? This action cannot be undone."
                        confirmText="Delete"
                        cancelText="Cancel"
                        onConfirm={() => handleDelete(cv)}
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 bg-transparent p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {filteredCVs.length === 0 && cvs.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No resumes found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or create a new resume
            </p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No resumes created yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first professional resume by clicking the "Create
              Resume" button above
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card className="animate-slide-up-delay-3 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-rubik text-[#2D3639]">
            <div className="p-2 bg-gradient-to-br from-[#70E4A8] to-[#EA580C] rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Resume Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tip 1 */}
            <div
              className="flex items-start gap-4 animate-fade-in-stagger"
              style={{ animationDelay: "100ms" }}
            >
              <div
                className="rounded-full bg-[#70E4A8]/20 p-3 animate-float"
                style={{ animationDelay: "0s" }}
              >
                <Target className="h-5 w-5 text-[#70E4A8]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] font-rubik">
                  Tailor Your Resume
                </h4>
                <p className="text-sm text-gray-600 font-inter">
                  Customize your resume for each job application
                </p>
              </div>
            </div>

            {/* Tip 2 */}
            <div
              className="flex items-start gap-4 animate-fade-in-stagger"
              style={{ animationDelay: "200ms" }}
            >
              <div
                className="rounded-full bg-[#EA580C]/20 p-3 animate-float"
                style={{ animationDelay: "0.5s" }}
              >
                <Award className="h-5 w-5 text-[#EA580C]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] font-rubik">
                  Highlight Achievements
                </h4>
                <p className="text-sm text-gray-600 font-inter">
                  Focus on quantifiable accomplishments and results
                </p>
              </div>
            </div>

            {/* Tip 3 */}
            <div
              className="flex items-start gap-4 animate-fade-in-stagger"
              style={{ animationDelay: "300ms" }}
            >
              <div
                className="rounded-full bg-blue-100 p-3 animate-float"
                style={{ animationDelay: "1s" }}
              >
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] font-rubik">
                  Professional Format
                </h4>
                <p className="text-sm text-gray-600 font-inter">
                  Use clean, professional templates that are ATS-friendly
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default ResumePage