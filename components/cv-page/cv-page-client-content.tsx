
"use client";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";

import { Document, Packer, Paragraph } from "docx";
import { Card, CardContent } from "../../components/ui/card";
import { Zap } from "lucide-react";
import html2canvas from "html2canvas";
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Save,
  RefreshCw,
  Edit,
  Loader2,
  Brain,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getPersonaById,
  type PersonaResponse,
} from "../../lib/redux/service/pasonaService";
import { CVPreview } from "../../pages/resume/CVPreview";
import type { CVData } from "../../types/cv-data";
import { useAppDispatch, useAppSelector } from "../../lib/redux/hooks";
import { logoutUser } from "../../lib/redux/slices/authSlice";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import { SidebarProvider } from "../../components/ui/sidebar";
import { Sidebar } from "../../components/dashboard/sidebar";
import CreatePersonaPage from "../../pages/persona/PersonaList";
import { ResumePage } from "../../pages/resume/ResumeList";
import { CoverLetterPage } from "../../pages/cover-letter/CoverLetterList";
import ATSCheckerPage from "../../pages/ats/ats-checker-page";
import { ProfilePage } from "../../pages/profile/profile-page";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import {
  createCV,
  getCVById,
  updateCV,
  type CreateCVData,
  type CV,
} from "../../lib/redux/service/resumeService";
import { CVEditPopup } from "./cv-edit-popup";

interface OptimizedCV {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  workExperience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  certifications: string[];
  languages: string[];
  interests: string[];
}

interface AIResponse {
  optimizedCV: OptimizedCV;
  suggestions: string[];
  improvementScore: number;
}

interface CVTemplate {
  id: string;
  name: string;
  description: string;
  category: "modern" | "classic" | "creative" | "minimal";
}

const templates: CVTemplate[] = [
  {
    id: "modern",
    name: "Modern Professional",
    description:
      "Clean, modern design perfect for tech and business professionals",
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
  // New templates
  {
    id: "classic-2",
    name: "Classic Traditional 2",
    description: "An updated classic format for conservative industries",
    category: "classic",
  },
  {
    id: "classic-3",
    name: "Classic Traditional 3",
    description: "Another variation of the classic format",
    category: "classic",
  },
  // {
  //   id: "creative-2",
  //   name: "Creative Designer 2",
  //   description: "A new creative design for professionals",
  //   category: "creative",
  // },
  // {
  //   id: "creative-3",
  //   name: "Creative Designer 3",
  //   description: "Another creative design option",
  //   category: "creative",
  // },
  // {
  //   id: "minimal-2",
  //   name: "Minimal Clean 2",
  //   description: "An updated minimal layout focusing on content",
  //   category: "minimal",
  // },
  // {
  //   id: "minimal-3",
  //   name: "Minimal Clean 3",
  //   description: "Another variation of the minimal layout",
  //   category: "minimal",
  // },
  // {
  //   id: "modern-2",
  //   name: "Modern Professional 2",
  //   description: "An updated modern design for professionals",
  //   category: "modern",
  // },
  // {
  //   id: "modern-3",
  //   name: "Modern Professional 3",
  //   description: "Another modern design option",
  //   category: "modern",
  // },
  // New template 4 versions
  {
    id: "classic-4",
    name: "Classic Traditional 4",
    description: "Premium classic format with enhanced layout",
    category: "classic",
  },
  {
    id: "minimal-4",
    name: "Minimal Clean 4",
    description: "Ultra-clean minimal design focusing on content",
    category: "minimal",
  },
  {
    id: "modern-4",
    name: "Modern Professional 4",
    description: "Advanced modern design for professionals",
    category: "modern",
  },
  {
    id: "creative-4",
    name: "Creative Designer 4",
    description: "Premium creative design for professionals",
    category: "creative",
  },
  {
    id: "modern-5",
    name: "Modern JAY",
    description: "Gray sidebar with clean white main content",
    category: "modern",
  },
  // {
  //   id: "modern-6",
  //   name: "Modern MIKE",
  //   description: "Blue sidebar with professional white layout",
  //   category: "modern",
  // },
  // {
  //   id: "modern-7",
  //   name: "Modern LOREN",
  //   description: "Dark blue curved sidebar with elegant design",
  //   category: "modern",
  // },
  // {
  //   id: "modern-8",
  //   name: "Modern LILLY",
  //   description: "Light blue sidebar with rounded contact section",
  //   category: "modern",
  // },
  {
    id: "modern-9",
    name: "Modern SOFIA",
    description: "Clean layout with name positioned on left side",
    category: "modern",
  },
];


const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 4000,
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    style: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
    },
  });
};

const showErrorToast = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: 5000,
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    style: {
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
    },
  });
};

const showInfoToast = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 4000,
    icon: <Brain className="h-5 w-5 text-blue-500" />,
    style: {
      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
    },
  });
};

const showLoadingToast = (message: string, description?: string) => {
  return toast.loading(message, {
    description,
    icon: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
    style: {
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      color: "#1e293b",
      border: "1px solid #cbd5e1",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
    },
  });
};

export function CVPageLoading({ isEditMode = false }) {
  if (isEditMode) {
    return (
      <div className="min-h-screen resumaic-gradient-subtle flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 resumaic-gradient-green rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 resumaic-gradient-orange rounded-full blur-2xl animate-float-delayed"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xl animate-pulse"></div>
        </div>

        <div className="text-center max-w-md mx-auto px-6 relative z-10">
          {/* Animated Icon */}
          <div className="relative mb-8 animate-fade-in">
            <div className="w-24 h-24 mx-auto relative">
              {/* Outer rotating ring */}
              <div className="absolute inset-0 resumaic-gradient-green rounded-full animate-spin-slow opacity-80"></div>
              <div className="absolute inset-1 bg-white rounded-full shadow-2xl flex items-center justify-center animate-pulse-gentle">
                <FileText className="w-10 h-10 text-emerald-600 animate-bounce-gentle" />
              </div>
              {/* Inner glow */}
              <div className="absolute inset-3 resumaic-gradient-green rounded-full opacity-20 animate-ping"></div>
            </div>

            {/* Floating particles */}
            <div className="absolute -top-3 -left-3 w-4 h-4 resumaic-gradient-green rounded-full animate-float opacity-80"></div>
            <div className="absolute -top-2 -right-4 w-3 h-3 resumaic-gradient-orange rounded-full animate-float-delayed opacity-70"></div>
            <div className="absolute -bottom-3 -left-2 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-float animation-delay-700 opacity-60"></div>
            <div className="absolute -bottom-1 -right-2 w-2 h-2 resumaic-gradient-green rounded-full animate-ping animation-delay-1000"></div>
          </div>

          {/* Loading Text */}
          <div className="space-y-6 animate-fade-in-up animation-delay-300">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3 animate-pulse-gentle">
              <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
              <span className="resumaic-text-gradient bg-clip-text text-transparent">
                Loading Your CV
              </span>
              <Zap className="w-6 h-6 text-emerald-500 animate-bounce-gentle" />
            </h2>

            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-emerald-100/50 animate-slide-up animation-delay-500">
              <p className="text-xl font-semibold text-emerald-700 mb-3 animate-fade-in animation-delay-700">
                Preparing your CV for editing...
              </p>
              <p className="text-base text-gray-600 leading-relaxed animate-fade-in animation-delay-900">
                We’re organizing and formatting your data so you can edit
                smoothly with AI-powered assistance.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200/80 rounded-full h-3 overflow-hidden shadow-inner animate-fade-in animation-delay-1100">
              <div className="h-full resumaic-gradient-green rounded-full animate-progress-flow shadow-lg"></div>
            </div>

            {/* Status indicators */}
            <div className="flex justify-center space-x-6 animate-fade-in animation-delay-1300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 resumaic-gradient-green rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Loading</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 resumaic-gradient-orange rounded-full animate-pulse animation-delay-300"></div>
                <span className="text-sm text-gray-600">Structuring</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse animation-delay-600"></div>
                <span className="text-sm text-gray-600">Finalizing</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-6 animate-fade-in animation-delay-1500">
              This usually takes just a few seconds • Powered by Resumaic AI
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [loadingMessage, setLoadingMessage] = useState(
    "Initializing AI analysis..."
  );
  const [dots, setDots] = useState("");

  useEffect(() => {
    const messages = [
      "Initializing AI analysis...",
      "Analyzing your professional profile...",
      "Optimizing content structure...",
      "Enhancing keyword relevance...",
      "Crafting your perfect CV...",
      "Finalizing AI recommendations...",
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 2000);

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="min-h-screen resumaic-gradient-subtle flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 resumaic-gradient-green rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 resumaic-gradient-orange rounded-full blur-2xl animate-float-delayed"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur-xl animate-pulse"></div>
      </div>

      <div className="text-center max-w-md mx-auto px-6 relative z-10">
        {/* Enhanced AI Document Animation */}
        <div className="relative mb-8 animate-fade-in">
          <div className="w-24 h-24 mx-auto relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 resumaic-gradient-green rounded-full animate-spin-slow opacity-80"></div>
            <div className="absolute inset-1 bg-white rounded-full shadow-2xl flex items-center justify-center animate-pulse-gentle">
              <FileText className="w-10 h-10 text-emerald-600 animate-bounce-gentle" />
            </div>
            {/* Inner glow effect */}
            <div className="absolute inset-3 resumaic-gradient-green rounded-full opacity-20 animate-ping"></div>
          </div>

          {/* Enhanced floating particles */}
          <div className="absolute -top-3 -left-3 w-4 h-4 resumaic-gradient-green rounded-full animate-float opacity-80"></div>
          <div className="absolute -top-2 -right-4 w-3 h-3 resumaic-gradient-orange rounded-full animate-float-delayed opacity-70"></div>
          <div className="absolute -bottom-3 -left-2 w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-float animation-delay-700 opacity-60"></div>
          <div className="absolute -bottom-1 -right-2 w-2 h-2 resumaic-gradient-green rounded-full animate-ping animation-delay-1000"></div>

          {/* Orbiting elements */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-2 h-2 resumaic-gradient-orange rounded-full"></div>
            <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 w-2 h-2 resumaic-gradient-green rounded-full"></div>
          </div>
        </div>

        {/* Enhanced Loading Text */}
        <div className="space-y-6 animate-fade-in-up animation-delay-300">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3 animate-pulse-gentle">
            <Sparkles className="w-7 h-7 text-amber-500 animate-pulse" />
            <span className="resumaic-text-gradient bg-clip-text text-transparent">
              AI is Crafting Your Resume
            </span>
            <Zap className="w-6 h-6 text-emerald-500 animate-bounce-gentle" />
          </h2>

          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-emerald-100/50 animate-slide-up animation-delay-500">
            <p className="text-xl font-semibold text-emerald-700 mb-3 animate-fade-in animation-delay-700">
              Analyzing your professional details...
            </p>
            <p className="text-base text-gray-600 leading-relaxed animate-fade-in animation-delay-900">
              Our advanced AI is meticulously crafting a personalized,
              ATS-optimized resume that showcases your unique strengths and
              achievements.
            </p>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="w-full bg-gray-200/80 rounded-full h-3 overflow-hidden shadow-inner animate-fade-in animation-delay-1100">
            <div className="h-full resumaic-gradient-green rounded-full animate-progress-flow shadow-lg"></div>
          </div>

          {/* Status indicators */}
          <div className="flex justify-center space-x-6 animate-fade-in animation-delay-1300">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 resumaic-gradient-green rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Processing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 resumaic-gradient-orange rounded-full animate-pulse animation-delay-300"></div>
              <span className="text-sm text-gray-600">Optimizing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse animation-delay-600"></div>
              <span className="text-sm text-gray-600">Finalizing</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-6 animate-fade-in animation-delay-1500">
            This usually takes 15–20 seconds • Powered by Resumaic AI
          </p>
        </div>
      </div>
    </div>
  );
}

export function CVPageClientContent() {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [persona, setPersona] = useState<PersonaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate | null>(
    null
  );
  const [activePage, setActivePage] = useState("create-persona");
  const [existingCV, setExistingCV] = useState<CV | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false); // Add this state

  const searchParams = useSearchParams();
  const router = useRouter();
  const personaId = searchParams?.get("personaId") ?? '';
  const cvId = searchParams?.get("cvId") ?? '';
  const templateIdFromUrl = searchParams?.get("templateId") ?? '';
  const viewMode = searchParams?.get("view") === 'true'; // Check for view mode parameter

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const cvPreviewRef = useRef<HTMLDivElement>(null);

  const renderActivePage = () => {
    switch (activePage) {
      case "create-persona":
        return <CreatePersonaPage user={user} />;
      case "resumes":
        return <ResumePage user={user} />;
      case "cover-letter":
        return <CoverLetterPage user={user} />;
      case "ats-checker":
        return <ATSCheckerPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <CreatePersonaPage user={user} />;
    }
  };
  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/");
  };

  const handleTemplateSelect = (template: CVTemplate) => {
    setSelectedTemplate(template);
    setHasUnsavedChanges(true);
    const url = new URL(window.location.href);
    url.searchParams.set("templateId", template.id);
    router.replace(url.toString());
  };

  const defaultTemplate: CVTemplate = {
    id: "modern",
    name: "Modern Professional",
    description:
      "Clean, modern design perfect for tech and business professionals",
    category: "modern",
  };

  useEffect(() => {
    if (templateIdFromUrl) {
      const foundTemplate =
        templates.find((t) => t.id === templateIdFromUrl) || defaultTemplate;
      setSelectedTemplate(foundTemplate);
    } else if (!selectedTemplate) {
      setSelectedTemplate(defaultTemplate);
    }
  }, [templateIdFromUrl, selectedTemplate]);

  useEffect(() => {
    // Set view mode based on URL parameter
    setIsViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (cvId) {
          // Fetch existing CV data
          const cvData = await getCVById(cvId);
          setExistingCV(cvData);

          // Set template from the CV data
          const template =
            templates.find((t) => t.id === cvData.layout_id) || defaultTemplate;
          setSelectedTemplate(template);

          // Parse the generated content if it exists
          if (cvData.generated_content) {
            const parsedContent = JSON.parse(cvData.generated_content);
            setAiResponse({
              optimizedCV: parsedContent,
              suggestions: [],
              improvementScore: 80, // Default score for existing CVs
            });
          }

          // Fetch persona data if available
          if (cvData.personas_id) {
            const personaData = await getPersonaById(
              Number.parseInt(cvData.personas_id)
            );
            setPersona(personaData);
          }

          setIsLoading(false);
          return;
        }

        if (!personaId) {
          setError("No persona ID provided");
          setIsLoading(false);
          return;
        }

        // 1. Fetch persona data
        const personaData = await getPersonaById(Number.parseInt(personaId));
        if (!personaData) {
          setError("Persona not found.");
          setIsLoading(false);
          return;
        }
        setPersona(personaData);

        // 2. Set default template if none is selected
        if (!selectedTemplate) {
          const templateToUse = templateIdFromUrl
            ? templates.find((t) => t.id === templateIdFromUrl) ||
            defaultTemplate
            : defaultTemplate;
          setSelectedTemplate(templateToUse);
        }

        // 3. Generate AI response only for new CVs
        if (!cvId) {
          const personaText = convertPersonaToText(personaData);

          console.log('Making request to:', 'https://backendserver.resumaic.com/api/optimize-cv');
          console.log('Request payload size:', JSON.stringify({ extractedText: personaText }).length);

          try {
            const testResponse = await fetch('https://backendserver.resumaic.com/', { method: 'HEAD' });
        
            console.log('Server reachable:', testResponse.ok);
          } catch (testError) {
            console.error('Server not reachable:', testError);
          }

          const response = await fetch('https://backendserver.resumaic.com/api/optimize-cv', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              extractedText: personaText,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const aiData = await response.json();

          if (aiData.error) {
            throw new Error(aiData.error);
          }

          setAiResponse(aiData);
        }
      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message || "Failed to load CV data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [personaId, cvId]);

  const convertPersonaToText = (personaData: PersonaResponse) => {
    let text = "";
    text += `Name: ${personaData.full_name || ""}\n`;
    text += `Job Title: ${personaData.job_title || ""}\n`;
    text += `Email: ${personaData.email || ""}\n`;
    text += `Phone: ${personaData.phone || ""}\n`;
    text += `Address: ${personaData.address || ""}\n`;
    text += `City: ${personaData.city || ""}\n`;
    text += `Country: ${personaData.country || ""}\n`;
    text += `Summary: ${personaData.summary || ""}\n`;
    text += `LinkedIn: ${personaData.linkedin || ""}\n`;
    text += `GitHub: ${personaData.github || ""}\n\n`;

    if (personaData.experience && Array.isArray(personaData.experience)) {
      text += "Work Experience:\n";
      personaData.experience.forEach((exp: any) => {
        text += `${exp.jobTitle || ""} at ${exp.companyName || ""}\n`;
        text += `${exp.startDate || ""} - ${exp.endDate || ""}\n`;
        text += `Location: ${exp.location || ""}\n`;
        if (exp.responsibilities && Array.isArray(exp.responsibilities)) {
          exp.responsibilities.forEach((resp: string) => {
            text += `- ${resp}\n`;
          });
        }
        text += "\n";
      });
    }

    if (personaData.education && Array.isArray(personaData.education)) {
      text += "Education:\n";
      personaData.education.forEach((edu: any) => {
        text += `${edu.degree || ""} from ${edu.institutionName || ""}\n`;
        text += `Graduation: ${edu.graduationDate || ""}\n`;
        text += `GPA: ${edu.gpa || ""}\n`;
        text += `Honors: ${edu.honors || ""}\n`;
        text += `Additional Info: ${edu.additionalInfo || ""}\n\n`;
      });
    }

    if (personaData.skills) {
      text += "Skills:\n";
      if (Array.isArray(personaData.skills.technical)) {
        text += `Technical: ${personaData.skills.technical.join(", ")}\n`;
      }
      if (Array.isArray(personaData.skills.soft)) {
        text += `Soft Skills: ${personaData.skills.soft.join(", ")}\n`;
      }
      text += "\n";
    }

    if (personaData.languages && Array.isArray(personaData.languages)) {
      text += "Languages:\n";
      personaData.languages.forEach((lang: any) => {
        if (lang) {
          text += `${lang.name || ""} - ${lang.proficiency || ""}\n`;
        }
      });
      text += "\n";
    }

    if (
      personaData.certifications &&
      Array.isArray(personaData.certifications)
    ) {
      text += "Certifications:\n";
      personaData.certifications.forEach((cert: any) => {
        text += `${cert.title || ""} from ${cert.issuingOrganization || ""}\n`;
        text += `Date: ${cert.dateObtained || ""}\n\n`;
      });
    }

    if (personaData.projects && Array.isArray(personaData.projects)) {
      text += "Projects:\n";
      personaData.projects.forEach((proj: any) => {
        text += `${proj.name || ""}\n`;
        text += `Role: ${proj.role || ""}\n`;
        text += `Description: ${proj.description || ""}\n`;
        if (proj.technologies && Array.isArray(proj.technologies)) {
          text += `Technologies: ${proj.technologies.join(", ")}\n`;
        }
        text += `Live Demo: ${proj.liveDemoLink || ""}\n`;
        text += `GitHub: ${proj.githubLink || ""}\n\n`;
      });
    }
    return text;
  };

  const convertToCVData = (aiResponse: AIResponse): CVData => {
    return {
      id: existingCV?.id || "generated-cv",
      personalInfo: {
        fullName: aiResponse.optimizedCV.personalInfo.name,
        jobTitle: persona?.job_title || "",
        email: aiResponse.optimizedCV.personalInfo.email,
        phone: aiResponse.optimizedCV.personalInfo.phone,
        address: aiResponse.optimizedCV.personalInfo.location,
        city: "",
        country: "",
        profilePicture: "",
        summary: aiResponse.optimizedCV.summary,
        linkedin: aiResponse.optimizedCV.personalInfo.linkedin,
        github: "",
      },
      experience: aiResponse.optimizedCV.workExperience.map((exp, index) => ({
        id: `exp-${index}`,
        jobTitle: exp.title,
        companyName: exp.company,
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        responsibilities: [exp.description],
      })),
      education: aiResponse.optimizedCV.education.map((edu, index) => ({
        id: `edu-${index}`,
        degree: edu.degree,
        institutionName: edu.institution,
        location: "",
        graduationDate: edu.year,
        gpa: edu.gpa,
        honors: "",
        additionalInfo: "",
      })),
      skills: {
        technical: aiResponse.optimizedCV.skills,
        soft: [],
      },
      languages: aiResponse.optimizedCV.languages.map((lang, index) => ({
        id: `lang-${index}`,
        name: lang,
        proficiency: "Intermediate" as const,
      })),
      certifications: aiResponse.optimizedCV.certifications.map(
        (cert, index) => ({
          id: `cert-${index}`,
          title: cert,
          issuingOrganization: "",
          dateObtained: "",
          verificationLink: "",
        })
      ),
      projects: aiResponse.optimizedCV.projects.map((proj, index) => ({
        id: `proj-${index}`,
        name: proj.name,
        role: "",
        description: proj.description,
        technologies: proj.technologies,
        liveDemoLink: "",
        githubLink: "",
      })),
      additional: {
        interests: aiResponse.optimizedCV.interests,
      },
      createdAt: existingCV?.created_at || new Date().toISOString(),
    };
  };

  const handleEdit = () => {
    router.push(`/dashboard?activePage=create-persona&editId=${personaId}`);
  };

  const handleRegenerateCV = async () => {
    if (!persona) {
      showErrorToast(
        "Regeneration Failed",
        "No persona data available for regeneration."
      );
      return;
    }

    setIsRegenerating(true);
    const loadingToastId = showLoadingToast(
      "AI is regenerating your CV...",
      "Analyzing your profile and creating fresh content"
    );

    try {
      const personaText = convertPersonaToText(persona);

      console.log('Making request to:', 'https://backendserver.resumaic.com/api/optimize-cv');
      console.log('Request payload size:', JSON.stringify({ extractedText: personaText }).length);

      try {
        const testResponse = await fetch('https://backendserver.resumaic.com', { method: 'HEAD' });
        console.log('Server reachable:', testResponse.ok);
      } catch (testError) {
        console.error('Server not reachable:', testError);
      }

      const response = await fetch('https://backendserver.resumaic.com/api/optimize-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extractedText: personaText,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const aiData = await response.json();

      if (aiData.error) {
        throw new Error(aiData.error);
      }

      setAiResponse(aiData);
      setHasUnsavedChanges(true);

      toast.dismiss(loadingToastId);
      showSuccessToast(
        "CV Regenerated Successfully! ✨",
        "Your CV has been refreshed with new AI insights. Don't forget to save your changes."
      );
    } catch (error: any) {
      console.error("Error regenerating CV:", error);
      // toast.dismiss(loadingToastId)
      showErrorToast(
        "Regeneration Failed",
        error.message || "Unable to regenerate CV. Please try again."
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExport = async (format: "pdf" | "docx" | "png") => {
    try {
      const cvElement = document.getElementById("cv-preview-content");
      if (!cvElement) {
        showErrorToast(
          "Export Failed",
          "CV preview not found. Please refresh and try again."
        );
        return;
      }

      const loadingToastId = showLoadingToast(
        `Preparing ${format.toUpperCase()} export...`,
        "Processing your CV for download"
      );

      try {
        // Get HTML content and CV data for backend processing
        const htmlContent = cvElement.outerHTML;
        const cvData = aiResponse?.optimizedCV;
        const filename = `${persona?.full_name || "resume"}-cv.${format}`;

        // Call the new backend API
        const response = await fetch(`https://backendserver.resumaic.com/api/cv-export/${format}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            html: htmlContent,
            cvData: cvData,
            filename: filename,
            options: format === 'pdf' ? {
              format: 'A4',
              printBackground: true,
           
            } : format === 'png' ? {
              type: 'png',
              fullPage: true,
              omitBackground: false
            } : {}
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to export ${format.toUpperCase()}`);
        }

        // Get the file as blob and download it
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.dismiss(loadingToastId);
        showSuccessToast(
          `${format.toUpperCase()} Downloaded! 📄`,
          `Your CV has been downloaded as ${format.toUpperCase()}`
        );

      } catch (error) {
        console.error(`Error exporting as ${format}:`, error);
        toast.dismiss(loadingToastId);
        showErrorToast(
          "Export Failed", 
          `${format.toUpperCase()} export failed. Please try again.`
        );
      }

    } catch (error: any) {
      console.error("Export error:", error);
      showErrorToast(
        "Export Failed",
        `Unable to export as ${format.toUpperCase()}. Please try again.`
      );
    }
  };

  const exportAsPNG = async () => {
    await handleExport('png');
  };

  const handleDocxExport = async () => {
    await handleExport('docx');
  };
  const handleSaveCV = async () => {
    if (!aiResponse || !selectedTemplate || !persona || !user?.id) {
      showErrorToast(
        "Save Failed",
        "Missing required data. Please regenerate your CV and try again."
      );
      return;
    }

    // Check CV limit for free plan users (only for new CVs)
    if (!existingCV && user?.plan === 'free' && (user as any)?.profile?.cvs_count >= 3) {
      showErrorToast(
        "CV Limit Reached",
        "Free plan users can only create up to 3 CVs. Please upgrade your plan to create more."
      );
      return;
    }

    setIsSaving(true);
    const loadingToastId = showLoadingToast(
      existingCV ? "Updating your CV..." : "Saving your CV...",
      "Securing your professional profile"
    );

    try {
      const cvDataToSave: CreateCVData = {
        user_id: user.id.toString(),
        layout_id: selectedTemplate.id,
        personas_id: persona.id.toString(),
        title: `${persona.full_name}'s AI CV - ${selectedTemplate.name}`,
        job_description: "AI-generated CV based on persona",
        generated_content: JSON.stringify(aiResponse.optimizedCV),
      };

      if (existingCV) {
        // Update existing CV
        const updatedCV = await updateCV(existingCV.id, cvDataToSave);
        setExistingCV(updatedCV);
        setHasUnsavedChanges(false);

        toast.dismiss(loadingToastId);
        showSuccessToast(
          "CV Updated Successfully! 🎉",
          "Your changes have been saved and are ready to use"
        );
      } else {
        // Create new CV
        const newCV = await createCV(cvDataToSave);
        setExistingCV(newCV);
        setHasUnsavedChanges(false);

        // Update URL to include the new CV ID
        const url = new URL(window.location.href);
        url.searchParams.set("cvId", newCV.id);
        router.replace(url.toString());

        toast.dismiss(loadingToastId);
        showSuccessToast(
          "CV Created Successfully! 🚀",
          "Your professional CV is now saved and ready to impress employers"
        );
      }
    } catch (saveError: any) {
      console.error("Error saving CV:", saveError);
      toast.dismiss(loadingToastId);
      showErrorToast(
        "Save Failed",
        saveError.message || "Unable to save CV. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTitle = async (newTitle: string) => {
    if (!existingCV || !newTitle.trim()) return;

    setIsSaving(true);
    const loadingToastId = showLoadingToast(
      "Updating title...",
      "Saving your changes"
    );

    try {
      const updatedCV = await updateCV(existingCV.id, {
        title: newTitle.trim(),
      });
      setExistingCV(updatedCV);

      toast.dismiss(loadingToastId);
      showSuccessToast(
        "Title Updated! ✏️",
        "Your CV title has been successfully changed"
      );
    } catch (error: any) {
      console.error("Error updating CV title:", error);
      toast.dismiss(loadingToastId);
      showErrorToast(
        "Update Failed",
        error.message || "Unable to update title. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCVDataUpdate = async (updatedData: OptimizedCV) => {
    setAiResponse((prev) =>
      prev ? { ...prev, optimizedCV: updatedData } : null
    );
    setHasUnsavedChanges(true);
    setShowEditPopup(false);
    showInfoToast(
      "CV Updated! 📝",
      "Your changes look great! Remember to save to keep them permanent."
    );
  };

  if (isLoading) {
    return <CVPageLoading isEditMode={!!cvId} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-gray-500 mb-4">
              <TrendingUp className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if ((!persona && !existingCV) || !selectedTemplate) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center p-6">
              <div className="text-gray-500 mb-4">
                <Sparkles className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                No CV Data Available
              </h2>
              <p className="text-gray-600 mb-4">
                Please ensure a persona and template are selected to generate a
                CV.
              </p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar
            user={user}
            activePage="cv-export"
            setActivePage={(page) => {
              if (page === "create-persona") {
                router.push("/dashboard?page=create-persona");
              } else if (page === "resumes") {
                router.push("/dashboard?page=resumes");
              } else if (page === "cover-letter") {
                router.push("/dashboard?page=cover-letter");
              } else if (page === "profile") {
                router.push("/dashboard?page=profile");
              }
            }}
            onExportPDF={() => handleExport('pdf')}
            onExportDOCX={handleDocxExport}
            onExportPNG={exportAsPNG}
            exportMode={true}
          />
          <main className="flex-1 p-6 bg-gray-50">
            <div className="flex flex-col gap-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {existingCV?.title || 'Create Your CV'}
                      </h1>
                      {hasUnsavedChanges && (
                        <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">
                          Unsaved changes
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isViewMode && aiResponse && (
                      <>
                        <Button
                          onClick={() => setShowEditPopup(true)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Details
                        </Button>

                        <Button
                          onClick={handleRegenerateCV}
                          disabled={isRegenerating}
                          variant="outline"
                          className={`flex items-center gap-2 bg-transparent transition-all duration-200 ${
                            isRegenerating 
                              ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-md' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {isRegenerating ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          {isRegenerating ? "Regenerating..." : "Regenerate"}
                        </Button>
                      </>
                    )}

                    {!isViewMode && (
                      <Button
                        onClick={handleSaveCV}
                        disabled={isSaving || !aiResponse}
                        className="flex items-center gap-2"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {isSaving
                          ? "Saving..."
                          : existingCV
                            ? "Update CV"
                            : "Save CV"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Template Selection for Updates */}
                {existingCV && !isViewMode && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-3">
                        Change Template
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedTemplate?.id === template.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                              }`}
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <h4 className="font-medium text-sm">
                              {template.name}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {template.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedTemplate && aiResponse && (
                  <div className="relative">
                    <CVPreview
                      key={selectedTemplate.id}
                      data={convertToCVData(aiResponse)}
                      template={selectedTemplate}
                    />
                    
                    {/* Progress Overlay */}
                    {isRegenerating && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
                        <div className="bg-white p-8 rounded-xl shadow-lg border flex flex-col items-center gap-4 max-w-sm mx-4">
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Regenerating Your CV
                            </h3>
                            <p className="text-sm text-gray-600 mb-1">
                              AI is analyzing your profile and creating fresh content...
                            </p>
                            <p className="text-xs text-gray-500">
                              This may take a few moments
                            </p>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {aiResponse?.improvementScore && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {aiResponse.improvementScore}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          Improvement Score
                        </h3>
                        <p className="text-gray-600">
                          Your CV has been enhanced with AI optimization using
                          the {selectedTemplate?.name} template.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {aiResponse && (
              <CVEditPopup
                isOpen={showEditPopup}
                onClose={() => setShowEditPopup(false)}
                cvData={aiResponse.optimizedCV}
                onSave={handleCVDataUpdate}
                isLoading={isSaving}
              />
            )}
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































