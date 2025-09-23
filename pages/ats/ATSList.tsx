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
  Target,
  Grid,
  List,
  Eye,
  Trash2,
  Search,
  Plus,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  ATSResume,
  getATSResumes,
  deleteATSResume,
} from "../../lib/redux/service/atsResumeService";
import { useAppSelector } from "../../lib/redux/hooks";
import Link from "next/link";
import { toast } from "sonner";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Crown, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Label } from "../../components/ui/label";

export function ATSListPage() {
  const [atsResumes, setAtsResumes] = useState<ATSResume[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id;

  useEffect(() => {
    const fetchATSResumes = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const resumes = await getATSResumes();
        setAtsResumes(resumes);
      } catch (error) {
        console.error("Error fetching ATS resumes:", error);
        toast.error("Failed to load ATS analyses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchATSResumes();
  }, [userId]);

  const handleDelete = async (resume: ATSResume) => {
    try {
      await deleteATSResume(resume.id);
      setAtsResumes(atsResumes.filter((r) => r.id !== resume.id));
      toast.success("ATS analysis deleted successfully");
    } catch (error) {
      console.error("Error deleting ATS resume:", error);
      toast.error("Failed to delete ATS analysis");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredResumes = atsResumes.filter((resume) =>
    resume.job_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && atsResumes.length === 0) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg resumaic-gradient-green text-white">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ATS Analyses</h1>
            <p className="text-gray-600">
              View and manage your ATS resume analyses
            </p>
          </div>
        </div>

        <Link href="/dashboard/ats/new">
          <Button className="resumaic-gradient-green hover:opacity-90 hover-lift button-press">
            <Plus className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </Link>
      </div>

      {atsResumes.length > 0 && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    ATS Analyses ({filteredResumes.length})
                  </h3>
                  <p className="text-sm text-gray-600">
                    View and manage your ATS resume analyses
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search analyses by job description..."
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
                      <TableHead>Analysis</TableHead>
                      <TableHead>Job Description</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResumes.map((resume) => {
                      const analysis = resume.analysis_result
                        ? JSON.parse(resume.analysis_result)
                        : { score: 0 };

                      return (
                        <TableRow key={resume.id}>
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
                                <div className="font-medium">
                                  ATS Analysis #{resume.id.slice(0, 8)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate">
                              {resume.job_description.substring(0, 60)}
                              {resume.job_description.length > 60 ? "..." : ""}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {analysis.score >= 70 ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="font-medium">
                                {analysis.score || 0}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(resume.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Link href={`/dashboard/ats/${resume.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="cursor-pointer"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <ConfirmDialog
                                title={`Delete ATS Analysis #${resume.id.slice(
                                  0,
                                  8
                                )}`}
                                description="Are you sure you want to delete this ATS analysis? This action cannot be undone."
                                confirmText="Delete"
                                cancelText="Cancel"
                                onConfirm={() => handleDelete(resume)}
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
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResumes.map((resume) => {
                const analysis = resume.analysis_result
                  ? JSON.parse(resume.analysis_result)
                  : { score: 0 };

                return (
                  <Card
                    key={resume.id}
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
                            <CardTitle className="text-lg">
                              Analysis #{resume.id.slice(0, 8)}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              {analysis.score >= 70 ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="text-sm font-medium">
                                {analysis.score || 0}% Match
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">
                            Job Description
                          </Label>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {resume.job_description.substring(0, 100)}
                            {resume.job_description.length > 100 ? "..." : ""}
                          </p>
                        </div>

                        <div className="text-xs text-gray-500">
                          Created: {formatDate(resume.created_at)}
                        </div>

                        <div className="flex gap-2 items-center">
                          <Link
                            href={`/dashboard/ats/${resume.id}`}
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full bg-transparent"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </Link>
                          <ConfirmDialog
                            title={`Delete Analysis #${resume.id.slice(0, 8)}`}
                            description="Are you sure you want to delete this ATS analysis? This action cannot be undone."
                            confirmText="Delete"
                            cancelText="Cancel"
                            onConfirm={() => handleDelete(resume)}
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
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {filteredResumes.length === 0 && atsResumes.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No analyses found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or create a new analysis
            </p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}
      {atsResumes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Target className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No ATS analyses created yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first ATS analysis by clicking the "New Analysis"
              button above
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
            ATS Optimization Tips
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
                <CheckCircle className="h-5 w-5 text-[#70E4A8]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] font-rubik">
                  Keyword Optimization
                </h4>
                <p className="text-sm text-gray-600 font-inter">
                  Match your resume keywords with the job description
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
                <AlertTriangle className="h-5 w-5 text-[#EA580C]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] font-rubik">
                  Formatting Matters
                </h4>
                <p className="text-sm text-gray-600 font-inter">
                  Use clean, ATS-friendly formatting without complex layouts
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
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] font-rubik">
                  Tailor Each Application
                </h4>
                <p className="text-sm text-gray-600 font-inter">
                  Customize your resume for each specific job application
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default ATSListPage
