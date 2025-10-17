"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Check,
  Sparkles,
  FileText,
  CheckCircle,
  UserCircle,
  Settings,
} from "lucide-react";
import Image from "next/image";
import { sampleCVData } from "../../lib/sample-cv-data";
import { useAppDispatch, useAppSelector } from "../../lib/redux/hooks";
import { logoutUser } from "../../lib/redux/slices/authSlice";

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
    icon: FileText, // Changed from Mail to FileText for consistency with other items
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
    id: "users",
    label: "Users",
    icon: UserCircle,
    href: "/dashboard?page=users",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard?page=settings",
  },
];

interface CVTemplatesProps {
  onTemplateSelect: (template: CVTemplate) => void;
  selectedTemplate?: string;
}

export function CVTemplates({
  onTemplateSelect,
  selectedTemplate,
}: CVTemplatesProps) {
  const [filter, setFilter] = useState<
    "all" | "modern" | "classic" | "creative" | "minimal"
  >("all");
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const filteredTemplates = templates.filter((template) => {
    if (filter === "all") return true;
    return template.category === filter;
  });

  const handleLogout = async () => {
    await dispatch(logoutUser());
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-white rounded-lg shadow-lg">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
            <Sparkles className="h-3 w-3 mr-1" />
            Professional Templates
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Resume Template
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select from our professionally designed templates that pass ATS
            systems and impress recruiters
          </p>
        </div>
        {/* Template Selection */}
        <div className="space-y-6">
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            {["all", "modern", "classic", "creative", "minimal"].map(
              (category) => (
                <Button
                  key={category}
                  variant={filter === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(category as any)}
                  className="capitalize"
                >
                  {category}
                </Button>
              )
            )}
          </div>
          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplate === template.id;
              return (
                <Card
                  key={template.id}
                  className={`cursor-pointer h-full w-full transition-all duration-200 hover:shadow-lg ${isSelected ? "ring-2 ring-blue-900 border-blue-900" : ""
                    }`}
                  onClick={() => onTemplateSelect(template)}
                >
                  <CardHeader className="">
                    <div className="relative">
                      <div className="w-full overflow-hidden rounded-lg">
                        <div className="flex items-center justify-center">
                          <div className="h-64 w-full">
                            <div className="relative w-full h-full flex items-center justify-center p-2">
                              <Image
                                src={`/templates/${template.id}.png`}
                                alt={`${template.name} Template Preview`}
                                width={300}
                                height={450}
                                className="object-contain w-full h-full shadow-md border border-blue-900"
                              />
                            </div>
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
                    <CardTitle className="text-base mb-1">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-sm mb-3">
                      {template.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="capitalize">
                        {template.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default CVTemplates

