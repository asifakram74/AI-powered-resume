"use client";
import { useState } from "react";
import {
  Card,
  CardHeader,
} from "../../components/ui/card";
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
//  {
//   id: "modern",
//   name: "Modern Professional",
//   description: "Clean, modern design perfect for tech and business professionals",
//   category: "modern",
// },
// {
//   id: "modern-2",
//   name: "Modern LOREN",
//   description: "Dark blue curved sidebar with elegant design",
//   category: "modern",
// },
// {
//   id: "modern-3",
//   name: "Modern LILLY",
//   description: "Light blue sidebar with rounded contact section",
//   category: "modern",
// },
// {
//   id: "modern-4",
//   name: "Modern MIKE",
//   description: "Blue sidebar with professional white layout",
//   category: "modern",
// },

{
  id: "classic",
  name: "Classic Traditional",
  description: "Traditional format ideal for conservative industries",
  category: "classic",
},
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
{
  id: "classic-4",
  name: "Classic Traditional 4",
  description: "Premium classic format with enhanced layout",
  category: "classic",
},

{
  id: "creative",
  name: "Creative SOFIA",
  description: "Clean layout with name positioned on left side",
  category: "creative",
},
{
  id: "creative-2",
  name: "Creative Minimal Clean",
  description: "Simple, clean layout focusing on content",
  category: "creative",
},
{
  id: "creative-3",
  name: "Creative Designer",
  description: "Eye-catching design for creative professionals",
  category: "creative",
},
{
  id: "creative-4",
  name: "Creative JAY",
  description: "Gray sidebar with clean white main content",
  category: "creative",
},

// {
//   id: "minimal",
//   name: "Minimal",
//   description: "A new creative design for professionals",
//   category: "minimal",
// },
{
  id: "minimal-2",
  name: "Minimal Clean 2",
  description: "An updated minimal layout focusing on content",
  category: "minimal",
},
{
  id: "minimal-3",
  name: "Minimal Clean 3",
  description: "Another variation of the minimal layout",
  category: "minimal",
},
// {
//   id: "minimal-4",
//   name: "Minimal Clean 4",
//   description: "Ultra-clean minimal design focusing on content",
//   category: "minimal",
// },
// {
//   id: "minimal-5",
//   name: "Minimal 5",
//   description: "Another creative design option",
//   category: "minimal",
// },
// {
//   id: "minimal-6",
//   name: "Minimal 6",
//   description: "Another modern design option",
//   category: "minimal",
// },
// {
//   id: "minimal-7",
//   name: "Minimal 7",
//   description: "Advanced modern design for professionals",
//   category: "minimal",
// },
// {
//   id: "minimal-8",
//   name: "Minimal 8",
//   description: "Premium creative design for professionals",
//   category: "minimal",
// },


]
const dashboardMenuItems = [
  {
    id: "persona",
    label: "Persona",
    icon: Sparkles,
    badge: "AI",
    href: "/dashboard?page=persona",
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
    <div className="min-h-screen bg-white dark:bg-gray-950 rounded-lg">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Template Selection */}
        <div className="space-y-4">
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
          <div className="grid grid-cols-2 gap-6 w-full">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplate === template.id;
              return (
                <div
                  key={template.id}
                  className="cursor-pointer mt-2 flex justify-center items-center relative group"
                  onClick={() => onTemplateSelect(template)}
                >
                  <div className={`relative rounded-lg transition-all duration-200 aspect-[210/297] w-full max-w-[350px] ${isSelected
                      ? "ring-4 ring-blue-600 dark:ring-blue-400 scale-105 shadow-xl"
                      : "ring-2 ring-green-100 dark:ring-gray-800 hover:ring-green-300 dark:hover:ring-green-400 hover:scale-105 hover:shadow-lg"
                    }`}>
                    <Image
                      src={`/templates/${template.id}.png`}
                      alt={template.name}
                      width={800}
                      height={1131}
                      quality={100}
                      priority
                      className="object-contain w-full h-full rounded-lg"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-blue-600 rounded-full p-2 shadow-lg animate-in zoom-in duration-200">
                          <Check className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default CVTemplates

