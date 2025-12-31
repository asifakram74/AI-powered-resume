"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { toast } from "sonner"
import {
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  Download,
  Search,
  TrendingUp,
  Target,
  Sparkles,
  FileText,
  Crown,
  UserCircle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { CoverLetterGenerator } from "./AddEditCoverLetter"
import {
  getAllCoverLetters,
  getCoverLetters,
  createCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
  type CoverLetter,
  type CreateCoverLetterData,
} from "../../lib/redux/service/coverLetterService"
import {
  getAllCVs,
  getCVs,
  type CV
} from "../../lib/redux/service/resumeService"
import { getAllPersonas, getPersonas, type PersonaResponse } from "../../lib/redux/service/pasonaService"
import { ConfirmDialog } from "../../components/ui/ConfirmDialog"
import { PageProps } from "../../types/page-props";
import { createCheckoutSession } from "../../lib/redux/service/paymentService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function CoverLetterPage({ user }: PageProps) {
  const [cvs, setCVs] = useState<CV[]>([])
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([])
  const [selectedCVId, setSelectedCVId] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingLetter, setEditingLetter] = useState<CoverLetter | null>(null)
  const [viewingLetter, setViewingLetter] = useState<CoverLetter | null>(null)
  const [showGenerator, setShowGenerator] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [currentJobDescription, setCurrentJobDescription] = useState("")
  const [currentTone, setCurrentTone] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isViewMode, setIsViewMode] = useState(false)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const userId = user?.id
  const [personaMap, setPersonaMap] = useState<Record<string, string>>({})
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const pdfRef = useRef<HTMLDivElement>(null)

  const tones = [
    {
      id: "professional",
      name: "Professional",
      description: "Formal and business-appropriate tone",
      example: "I am writing to express my strong interest in the position...",
    },
    {
      id: "enthusiastic",
      name: "Enthusiastic",
      description: "Energetic and passionate tone",
      example: "I am thrilled to apply for this exciting opportunity...",
    },
    {
      id: "confident",
      name: "Confident",
      description: "Assertive and self-assured tone",
      example: "With my proven track record and expertise...",
    },
    {
      id: "friendly",
      name: "Friendly",
      description: "Warm and approachable tone",
      example: "I would love the opportunity to contribute to your team...",
    },
    {
      id: "creative",
      name: "Creative",
      description: "Innovative and unique tone",
      example: "Your company's innovative approach resonates with my creative vision...",
    },
  ]

  useEffect(() => {
    const fetchCVsAndPersonas = async () => {
      try {
        setIsLoading(true);

        const isAdmin = user?.role?.toLowerCase() === 'admin';
        const [cvData, personaList] = await Promise.all([
          isAdmin ? getAllCVs() : getCVs(userId?.toString() || ""),
          isAdmin ? getAllPersonas() : getPersonas(userId?.toString() || ""),
        ]);

        setCVs(cvData);

        const map: Record<string, string> = {};
        (personaList || []).forEach((p: any) => {
          const id = p?.id?.toString();
          if (id) {
            map[id] = p.profile_picture || "";
          }
        });
        setPersonaMap(map);
      } catch (error) {
        console.error("Error fetching CVs/personas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCVsAndPersonas();
  }, [userId, user?.role]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      // Force grid view on mobile/tablet
      if (window.innerWidth < 1024) {
        setViewMode("grid")
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize() // Call once on mount

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const fetchCoverLetters = async () => {
      try {
        if (!user?.id && user?.role?.toLowerCase() !== 'admin') {
          console.log("No user ID available - user might not be logged in")
          return
        }

        setIsLoading(true)

        let data;
        if (user?.role?.toLowerCase() === 'admin') {
          data = await getAllCoverLetters();
        } else {
          data = await getCoverLetters(userId?.toString() || "");
        }

        console.log("Fetched cover letters:", data)
        setCoverLetters(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching cover letters:", error)
        setCoverLetters([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoverLetters()
  }, [user?.id, user?.role])

  const handleGenerate = async (jobDescription: string, tone: string, cvId: string, userId: string) => {
    setIsGenerating(true)
    setCurrentJobDescription(jobDescription)
    setCurrentTone(tone)
    setSelectedCVId(cvId)

    try {
      const selectedCV = cvs.find((cv) => cv.id.toString() === cvId)
      if (!selectedCV) {
        throw new Error("Selected CV not found")
      }

      // Get CV content for AI analysis
      const cvContent = await getCVContentForAI(selectedCV)

      // Call DeepSeek AI for cover letter generation
      console.log('Making request to:', '  https://backendserver.resumaic.com/api/cover-letter-generation');
      console.log('Selected tone:', tone);
      console.log('Tone type:', typeof tone);

      // Find the full tone data to get name and description
      const selectedToneData = tones.find(t => t.id === tone);
      console.log('Selected tone data:', selectedToneData);

      const requestPayload = {
        jobDescription,
        tone,
        toneName: selectedToneData?.name || tone,
        toneDescription: selectedToneData?.description || '',
        toneExample: selectedToneData?.example || '',
        cvContent,
        cvData: selectedCV,
      };

      console.log('Request payload:', requestPayload);
      console.log('Request payload size:', JSON.stringify(requestPayload).length);

      try {
        const testResponse = await fetch('  https://backendserver.resumaic.com/', { method: 'HEAD' });
        console.log('Server reachable:', testResponse.ok);
      } catch (testError) {
        console.error('Server not reachable:', testError);
      }

      const response = await fetch('  https://backendserver.resumaic.com/api/cover-letter-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobDescription, tone, cvContent, cvData: selectedCV }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error || "Generation failed")
      }

      setGeneratedLetter(data.coverLetter)
      setAnalysisResult(data)
      setShowGenerator(false)
    } catch (error) {
      console.error("Error generating cover letter:", error)
      alert(`Failed to generate cover letter: ${error instanceof Error ? error.message : "Unknown error"}`)

      // Fallback to basic generatio
      setShowGenerator(false)
    } finally {
      setIsGenerating(false)
    }
  }

  const getCVContentForAI = async (cv: CV) => {
    return {
      title: cv.title,
      jobDescription: cv.job_description,
      layout: cv.layout_id,
    }
  }

  const handleSaveLetter = async () => {
    if (!generatedLetter.trim() || !selectedCVId || !userId) {
      alert("No letter to save or missing required information")
      return
    }

    // Enforce free plan limit for creating new cover letters; allow admin unlimited
    if (!editingLetter && (user as any)?.plan_type?.toLowerCase() === 'free' && coverLetters.length >= 3 && (user?.role?.toLowerCase() !== 'admin')) {
      toast.error("Free plan allows only 3 cover letters. Please upgrade your plan to create more.");
      setIsUpgradeDialogOpen(true);
      return;
    }

    try {
      setIsLoading(true)
      const letterData: CreateCoverLetterData = {
        user_id: userId.toString(),
        cv_id: selectedCVId,
        job_description: currentJobDescription,
        tone: currentTone,
        generated_letter: generatedLetter,
      }

      let response: CoverLetter
      if (editingLetter) {
        response = await updateCoverLetter(editingLetter.id, letterData)
        // Preserve the user object from the existing letter since the update response might not include it
        setCoverLetters((prev) => prev.map((letter) => (letter.id === editingLetter.id ? { ...response, user: (letter as any).user } : letter)))
        toast.success("Cover letter updated successfully!", {
          description: "Your changes have been saved.",
        })
      } else {
        response = await createCoverLetter(letterData)
        // Attach current user to the new letter for immediate display
        setCoverLetters((prev) => [{ ...response, user: user }, ...prev])
        toast.success("Cover letter created successfully!", {
          description: "Your AI-generated cover letter has been saved.",
        })
      }

      setIsDialogOpen(false)
      setShowGenerator(true)
      setGeneratedLetter("")
      setCurrentJobDescription("")
      setCurrentTone("")
      setSelectedCVId("")
      setEditingLetter(null)
      setViewingLetter(null)
      setAnalysisResult(null)
      setIsViewMode(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save cover letter", {
        description: "Please try again or contact support if the issue persists.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (letter: CoverLetter) => {
    setEditingLetter(letter)
    setViewingLetter(null)
    setCurrentJobDescription(letter.job_description)
    setCurrentTone(letter.tone)
    setGeneratedLetter(letter.generated_letter)
    setSelectedCVId(letter.cv_id.toString()) // Add this line to set the selected CV ID
    setShowGenerator(false)
    setIsViewMode(false)
    setIsDialogOpen(true)
  }

  const handleView = (letter: CoverLetter) => {
    setViewingLetter(letter)
    setEditingLetter(null)
    setCurrentJobDescription(letter.job_description)
    setCurrentTone(letter.tone)
    setGeneratedLetter(letter.generated_letter)
    setShowGenerator(false)
    setIsViewMode(true)
    setIsDialogOpen(true)
  }

  const getCoverLetterFilename = (
    letter: CoverLetter,
    format: 'txt' | 'pdf' | 'docx' | 'png' = 'txt'
  ) => {
    const baseName =
      (letter as any).title ||
      (letter as any).company_name ||
      (letter.job_description || '').slice(0, 30) ||
      'cover_letter'

    const safeBase = baseName
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const idPart = letter.id ? `-${letter.id}` : ''
    return `${safeBase}${idPart}.${format}`
  }

  const handleDownload = (letter: CoverLetter) => {
    const element = document.createElement("a")
    const file = new Blob([letter.generated_letter], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = getCoverLetterFilename(letter, 'txt')
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success("Cover letter downloaded!", {
      description: "The file has been saved to your downloads folder.",
    })
  }

  // Client-side PDF generation with proper spacing
  const generatePDF = async (letter: CoverLetter) => {
    try {
      toast.info("Generating PDF...", {
        description: "Please wait while we create your PDF document.",
      });

      // Create a temporary div for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.padding = '20mm'; // Add padding for margins
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.lineHeight = '1.6';
      tempDiv.style.fontSize = '12pt';
      tempDiv.style.color = '#000';
      tempDiv.style.backgroundColor = 'white';
      
      // Format the content with proper HTML
      const formattedContent = letter.generated_letter
        .split('\n')
        .map(line => {
          if (line.trim() === '') {
            return '<div style="height: 12px;"></div>'; // Paragraph spacing
          }
          return `<div>${line}</div>`;
        })
        .join('');

      tempDiv.innerHTML = `
        <div style="margin-bottom: 40px;">
          ${formattedContent}
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Use html2canvas to capture the content
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Remove the temporary div
      document.body.removeChild(tempDiv);

      // Create PDF with jsPDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add margins to the PDF
      const marginLeft = 20;
      const marginRight = 20;
      const marginTop = 20;
      const marginBottom = 20;
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate content dimensions
      const imgWidth = pageWidth - marginLeft - marginRight;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let position = 0;
      let currentPage = 1;
      
      while (position < imgHeight) {
        // Add new page if not the first page
        if (position > 0) {
          pdf.addPage();
          currentPage++;
          
          // Add top margin for new pages
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, pageWidth, marginTop, 'F');
        }
        
        // Calculate slice height for current page
        const sliceHeight = Math.min(imgHeight - position, pageHeight - marginTop - marginBottom);
        
        // Create canvas slice
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = (sliceHeight * canvas.width) / imgWidth;
        
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0,
            (position * canvas.width) / imgWidth,
            canvas.width,
            (sliceHeight * canvas.width) / imgWidth,
            0,
            0,
            canvas.width,
            (sliceHeight * canvas.width) / imgWidth
          );
        }
        
        const imgData = sliceCanvas.toDataURL('image/jpeg', 1.0);
        
        // Add image to PDF with margins
        pdf.addImage(
          imgData,
          'JPEG',
          marginLeft,
          marginTop,
          imgWidth,
          sliceHeight
        );
        
        position += sliceHeight;
      }

      // Save the PDF
      const filename = getCoverLetterFilename(letter, 'pdf');
      pdf.save(filename);

      toast.success("PDF generated successfully!", {
        description: "Your cover letter has been saved as a PDF file.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF", {
        description: "Please try again or use another export format.",
      });
    }
  };

  // Alternative: Direct jsPDF text generation (better for text-only)
  const generatePDFWithText = (letter: CoverLetter) => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set margins
      const marginLeft = 20;
      const marginRight = 20;
      const marginTop = 20; // Extra top margin for first page
      const marginTopSubsequent = 20; // Even more margin for subsequent pages
      const lineHeight = 7;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const maxWidth = pageWidth - marginLeft - marginRight;
      
      let y = marginTop;
      let currentPage = 1;
      
      // Add date
      // const date = new Date().toLocaleDateString('en-US', { 
      //   year: 'numeric', 
      //   month: 'long', 
      //   day: 'numeric' 
      // });
      
      // pdf.setFontSize(11);
      // pdf.text(date, marginLeft, y);
      // y += lineHeight * 2;
      
      // Set font size before calculating lines to ensure correct width usage
      pdf.setFontSize(12);

      // Split content into paragraphs to handle justification
      const paragraphs = letter.generated_letter.split('\n');

      for (let p = 0; p < paragraphs.length; p++) {
        const paragraph = paragraphs[p];
        
        // Handle empty lines (paragraph breaks)
        if (!paragraph.trim()) {
          y += lineHeight;
          continue;
        }

        const lines = pdf.splitTextToSize(paragraph, maxWidth);
        
        for (let i = 0; i < lines.length; i++) {
          // Check if we need a new page
          if (y + lineHeight > pageHeight - marginRight) {
            pdf.addPage();
            currentPage++;
            y = marginTopSubsequent; // Reset Y with larger margin for new pages
          }
          
          // Justify text: apply justify alignment to all lines except the last line of a paragraph
          if (i < lines.length - 1) {
            pdf.text(lines[i], marginLeft, y, { maxWidth: maxWidth, align: "justify" });
          } else {
            pdf.text(lines[i], marginLeft, y);
          }
          y += lineHeight;
        }
      }
      
      // Save the PDF
      const filename = getCoverLetterFilename(letter, 'pdf');
      pdf.save(filename);

      toast.success("PDF generated successfully!", {
        description: "Your cover letter has been saved as a PDF file.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF", {
        description: "Please try again or use another export format.",
      });
    }
  };

  const handleExportCoverLetter = async (letter: CoverLetter, format: 'pdf' | 'docx' | 'png') => {
    try {
      if (format === 'pdf') {
        // Use client-side PDF generation
        generatePDFWithText(letter);
        return;
      }
      
      // For other formats, use the existing backend
      const filename = getCoverLetterFilename(letter, format);

      const response = await fetch(`https://backendserver.resumaic.com/api/cover-letter-export/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: letter.generated_letter,
          filename: filename,
          letterData: {
            jobDescription: letter.job_description,
            tone: letter.tone,
            generatedLetter: letter.generated_letter
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to export ${format.toUpperCase()}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Cover letter exported as ${format.toUpperCase()}!`, {
        description: "The file has been saved to your downloads folder.",
      })
    } catch (error) {
      console.error(`Error exporting ${format}:`, error)
      toast.error(`Failed to export ${format.toUpperCase()}`, {
        description: "Please try again or contact support if the issue persists.",
      })
    }
  }

  const handleDelete = async (letter: CoverLetter) => {
    try {
      await deleteCoverLetter(letter.id)
      setCoverLetters((prev) => prev.filter((l) => l.id !== letter.id))
      toast.success("Cover letter deleted successfully!")
    } catch (error) {
      console.error("Error deleting cover letter:", error)
      toast.error("Failed to delete cover letter")
    }
  }

  const handleOpenNewGenerator = () => {
    setEditingLetter(null)
    setViewingLetter(null)
    setCurrentJobDescription("")
    setCurrentTone("")
    setSelectedCVId("")
    setGeneratedLetter("")
    setAnalysisResult(null)
    setIsViewMode(false)
    setShowGenerator(true)
    setIsDialogOpen(true)
  }

  const filteredLetters = coverLetters.filter((letter) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      letter.job_description.toLowerCase().includes(searchLower) ||
      letter.tone.toLowerCase().includes(searchLower) ||
      letter.generated_letter.toLowerCase().includes(searchLower)
    )
  })

  if (isLoading && coverLetters.length === 0) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        {/* Left Section */}
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-3 text-center sm:text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg resumaic-gradient-green text-white mb-2 sm:mb-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Cover Letters</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-0">Generate professional cover letters with AI assistance</p>
          </div>
        </div>

        {/* Button Section */}
        <div className="flex justify-center sm:justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="resumaic-gradient-green hover:opacity-90 hover-lift button-press"
                onClick={async (e) => {
                  if ((user as any)?.plan_type?.toLowerCase() === 'free' && coverLetters.length >= 3 && (user?.role?.toLowerCase() !== 'admin')) {
                    e.preventDefault();
                    setIsUpgradeDialogOpen(true);
                    return;
                  }
                  handleOpenNewGenerator();
                }}
              >
                Create Cover Letter
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[70vw] !max-w-none max-h-[90vh] overflow-x-auto">
              <DialogHeader>
                <DialogTitle>
                  {isViewMode ? "View Cover Letter" : editingLetter ? "Edit Cover Letter" : "Generate AI Cover Letter"}
                </DialogTitle>
                <DialogDescription>
                  {showGenerator
                    ? "Provide job details to generate a personalized cover letter with AI"
                    : isViewMode
                      ? "Review your AI-generated cover letter"
                      : "Review and edit your AI-generated cover letter"}
                </DialogDescription>
              </DialogHeader>

              {showGenerator ? (
                <CoverLetterGenerator onGenerate={handleGenerate} isGenerating={isGenerating} cvs={cvs} />
              ) : (
                <div className="space-y-6">
                  {analysisResult && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          AI Analysis Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium">Score</Label>
                            <Badge variant="default" className="ml-2">
                              {analysisResult.score}/100
                            </Badge>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Keywords</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {analysisResult.keywords?.map((keyword: string) => (
                                <Badge key={keyword} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Tone</Label>
                            <Badge variant="outline" className="ml-2">
                              {analysisResult.tone}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">{isViewMode ? "Cover Letter" : "Edit Cover Letter"}</Label>
                      <Textarea
                        value={generatedLetter}
                        rows={10}
                        onChange={(e) => !isViewMode && setGeneratedLetter(e.target.value)}
                        className="min-h-[400px] mt-2"
                        placeholder="Your cover letter will appear here..."
                        readOnly={isViewMode}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end items-center space-x-1">
                    {(!editingLetter || isViewMode) && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (isViewMode) {
                            setIsDialogOpen(false)
                            setViewingLetter(null)
                            setIsViewMode(false)
                          } else {
                            setShowGenerator(true)
                            setGeneratedLetter("")
                            setAnalysisResult(null)
                            setEditingLetter(null)
                          }
                        }}
                      >
                        {isViewMode ? "Close" : "Back to Generator"}
                      </Button>
                    )}

                    {!isViewMode && (
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="button-press">
                              <Download className="h-4 w-4 mr-2" />
                              Export
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                const tempLetter = {
                                  ...(editingLetter || {}),
                                  generated_letter: generatedLetter,
                                  job_description: currentJobDescription,
                                  tone: currentTone,
                                } as CoverLetter
                                handleExportCoverLetter(tempLetter, 'pdf')
                              }}
                            >
                              Export as PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const tempLetter = {
                                  ...(editingLetter || {}),
                                  generated_letter: generatedLetter,
                                  job_description: currentJobDescription,
                                  tone: currentTone,
                                } as CoverLetter
                                handleExportCoverLetter(tempLetter, 'docx')
                              }}
                            >
                              Export as DOCX
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const tempLetter = {
                                  ...(editingLetter || {}),
                                  generated_letter: generatedLetter,
                                  job_description: currentJobDescription,
                                  tone: currentTone,
                                } as CoverLetter
                                handleExportCoverLetter(tempLetter, 'png')
                              }}
                            >
                              Export as PNG
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button onClick={handleSaveLetter} className="resumaic-gradient-green hover:opacity-90 button-press">
                          <FileText className="h-4 w-4 mr-2" />
                          {editingLetter ? "Update Cover Letter" : "Save Cover Letter"}
                        </Button>
                      </div>
                    )}

                    {isViewMode && viewingLetter && (
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleDownload(viewingLetter)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Text (.txt)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportCoverLetter(viewingLetter, 'pdf')}>
                              <FileText className="h-4 w-4 mr-2" />
                              PDF (.pdf)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportCoverLetter(viewingLetter, 'docx')}>
                              <FileText className="h-4 w-4 mr-2" />
                              Word (.docx)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportCoverLetter(viewingLetter, 'png')}>
                              <FileText className="h-4 w-4 mr-2" />
                              Image (.png)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          onClick={() => handleEdit(viewingLetter)}
                          className="resumaic-gradient-green hover:opacity-90 button-press"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Upgrade Plan Dialog */}
          <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
            <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-xl rounded-xl">
              <div className="relative resumaic-gradient-green p-6 text-white rounded-t-xl animate-pulse-glow">
                <div className="absolute inset-x-0 top-0 h-0.5 shimmer-effect opacity-70" />
                <div className="flex items-center gap-3">
                  <Crown className="h-6 w-6" />
                  <DialogTitle className="text-lg font-semibold">Upgrade Required</DialogTitle>
                </div>
                <DialogDescription className="mt-2 text-sm opacity-90">
                  You've reached the maximum number of cover letters for the Free plan. Upgrade your plan to create more!
                </DialogDescription>
                <div className="absolute -right-10 -top-10 w-32 h-32 resumaic-gradient-orange rounded-full blur-2xl opacity-30" />
              </div>
              <div className="p-6 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground list-none">
                  {[
                    { color: "resumaic-gradient-green", text: "Create more cover letters" },
                    { color: "resumaic-gradient-orange", text: "Unlock extra cover letters" },
                    { color: "resumaic-gradient-blue", text: "Unlock unlimited persona slots" },
                    { color: "resumaic-gradient-purple", text: "Boost your CV with AI-powered optimization" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 list-none">
                      <span className={`size-1.5 rounded-full ${item.color}`} />
                      <span className="list-none">{item.text}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full resumaic-gradient-orange text-white hover:opacity-90 button-press"
                    onClick={async () => {
                      try {
                        await createCheckoutSession();
                      } catch (err) {
                        console.error('Checkout error:', err);
                      }
                    }}
                  >
                    Upgrade Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-[#70E4A8] text-[#2d3639] hover:bg-[#70E4A8]/10"
                    onClick={() => setIsUpgradeDialogOpen(false)}
                  >
                    Not Now
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cover Letters Display */}
      {coverLetters.length > 0 && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Generated Cover Letters ({filteredLetters.length})</h3>
                  <p className="text-sm text-gray-600">View and manage your AI-generated cover letters</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search cover letters by job description, tone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>

                  <div className="hidden lg:flex gap-2">
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

          {(viewMode === "table" && windowWidth >= 1024) ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profile</TableHead>
                      <TableHead>Resume</TableHead>
                      <TableHead>Job Description</TableHead>
                      <TableHead>Tone</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead className="text-right pr-5">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLetters.map((letter) => (
                      <TableRow key={letter.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                              {(() => {
                                const cvForLetter = cvs.find((cv) => cv.id.toString() === (letter.cv_id as any)?.toString());
                                const imgSrc = cvForLetter ? personaMap[cvForLetter.personas_id] : "";
                                return imgSrc ? (
                                  <AvatarImage
                                    src={imgSrc}
                                    alt="Profile"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = "/placeholder-user.jpg";
                                    }}
                                  />
                                ) : null;
                              })()}
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
                            <div className="font-medium">{(letter as any).user?.name || 'N/A'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {(letter as any).cv?.title?.length > 15
                              ? `${(letter as any).cv.title.slice(0, 15)}...`
                              : (letter as any).cv?.title}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm font-medium truncate">
                              {letter.job_description.substring(0, 100)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {letter.tone}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(letter.updated_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              className="cursor-pointer"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleView(letter)
                              }}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="cursor-pointer"
                                  title="Download"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleDownload(letter)}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Text (.txt)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportCoverLetter(letter, 'pdf')}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  PDF (.pdf)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportCoverLetter(letter, 'docx')}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Word (.docx)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportCoverLetter(letter, 'png')}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Image (.png)
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="ghost"
                              className="cursor-pointer"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(letter)
                              }}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <ConfirmDialog
                              title="Delete Cover Letter"
                              description={`Are you sure you want to delete the cover letter ${letter.job_description || 'Untitled'}? This action is irreversible and cannot be undone.`}
                              confirmText="Delete"
                              cancelText="Cancel"
                              onConfirm={() => handleDelete(letter)}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 cursor-pointer"
                                  title="Delete"
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLetters.map((letter) => (
                <Card key={letter.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                          {(() => {
                            const cvForLetter = cvs.find((cv) => cv.id.toString() === (letter.cv_id as any)?.toString());
                            const imgSrc = cvForLetter ? personaMap[cvForLetter.personas_id] : "";
                            return imgSrc ? (
                              <AvatarImage
                                src={imgSrc}
                                alt="Profile"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = "/placeholder-user.jpg";
                                }}
                              />
                            ) : null;
                          })()}
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
                          <CardTitle className="text-lg">{(letter as any).user?.name || 'N/A'}</CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Job Description</Label>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                          {letter.job_description.substring(0, 150)}...
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Resume</Label>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                          {(letter as any).cv?.title}
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Tone</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {letter.tone}
                          </Badge>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        Last Modified: {new Date(letter.updated_at).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2 items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(letter)}
                          className="bg-transparent p-2"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                              title="Download"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleDownload(letter)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Text (.txt)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportCoverLetter(letter, 'pdf')}>
                              <FileText className="h-4 w-4 mr-2" />
                              PDF (.pdf)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportCoverLetter(letter, 'docx')}>
                              <FileText className="h-4 w-4 mr-2" />
                              Word (.docx)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExportCoverLetter(letter, 'png')}>
                              <FileText className="h-4 w-4 mr-2" />
                              Image (.png)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(letter)}
                          className="bg-transparent p-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmDialog
                          title="Delete Cover Letter"
                          description={`Are you sure you want to delete this cover letter? This action is irreversible and cannot be undone.`}
                          confirmText="Delete"
                          cancelText="Cancel"
                          onConfirm={() => handleDelete(letter)}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
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
          )}
        </>
      )}

      {/* Empty State */}
      {filteredLetters.length === 0 && coverLetters.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cover letters found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search terms or create a new cover letter</p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}
      {coverLetters.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Sparkles className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cover letters created yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first AI cover letter by clicking the "Create Cover Letter" button above
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="animate-slide-up-delay-3 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-rubik text-[#2D3639]">
            <div className="p-2 bg-gradient-to-br from-[#70E4A8] to-[#EA580C] rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Pro Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 animate-fade-in-stagger" style={{ animationDelay: "100ms" }}>
              <div className="rounded-full bg-[#70E4A8]/20 p-3 animate-float" style={{ animationDelay: "0s" }}>
                <Target className="h-5 w-5 text-[#70E4A8]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] font-rubik">Be Specific</h4>
                <p className="text-sm text-gray-600 font-inter">
                  Include detailed job requirements for better AI personalization
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 animate-fade-in-stagger" style={{ animationDelay: "200ms" }}>
              <div className="rounded-full bg-[#EA580C]/20 p-3 animate-float" style={{ animationDelay: "0.5s" }}>
                <Sparkles className="h-5 w-5 text-[#EA580C]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] font-rubik">Choose the Right Tone</h4>
                <p className="text-sm text-gray-600 font-inter">Match your tone to the company culture and industry</p>
              </div>
            </div>

            <div className="flex items-start gap-4 animate-fade-in-stagger" style={{ animationDelay: "300ms" }}>
              <div className="rounded-full bg-blue-100 p-3 animate-float" style={{ animationDelay: "1s" }}>
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] font-rubik">Review and Edit</h4>
                <p className="text-sm text-gray-600 font-inter">Always review and customize the AI-generated content</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
export default CoverLetterPage;