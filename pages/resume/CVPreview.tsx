"use client";

import type { CVData } from "@/types/cv-data";
import { ModernTemplate } from "@/components/templates/modern-template";
import { ClassicTemplate } from "@/components/templates/classic-template";
import { MinimalTemplate } from "@/components/templates/minimal-template";
import { CreativeTemplate } from "@/components/templates/creative-template";
import { ModernTemplate2 } from "@/components/templates/modern-template2";
import { ModernTemplate3 } from "@/components/templates/modern-template3";
import { ModernTemplate4 } from "@/components/templates/modern-template-4";
import { ClassicTemplate2 } from "@/components/templates/classic-template-2";
import { ClassicTemplate3 } from "@/components/templates/classic-template-3";
import { ClassicTemplate4 } from "@/components/templates/classic-template-4";
import { CreativeTemplate2 } from "@/components/templates/creative-template-2";
import { CreativeTemplate3 } from "@/components/templates/creative-template-3";
import { CreativeTemplate4 } from "@/components/templates/creative-template-4";
import { MinimalTemplate2 } from "@/components/templates/minimal-template2";
import { MinimalTemplate3 } from "@/components/templates/minimal-template3";
import { MinimalTemplate4 } from "@/components/templates/minimal-template-4";
import { sampleCVData } from "@/lib/sample-cv-data";
import { useRef } from "react";

interface CVTemplate {
  id: string;
  name: string;
  description: string;
  category: "modern" | "classic" | "creative" | "minimal";
}

interface CVPreviewProps {
  data?: CVData;
  template?: CVTemplate;
}

const defaultTemplate: CVTemplate = {
  id: "modern",
  name: "Modern",
  description: "Default modern resume template",
  category: "modern",
};

export function CVPreview({
  data = sampleCVData,
  template = defaultTemplate,
}: CVPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const renderTemplate = () => {
    switch (template?.id) {
      case "modern":
        return <ModernTemplate data={data} />;
      case "classic":
        return <ClassicTemplate data={data} />;
      case "minimal":
        return <MinimalTemplate data={data} />;
      case "creative":
        return <CreativeTemplate data={data} />;
      case "modern-2":
        return <ModernTemplate2 data={data} />;
      case "modern-3":
        return <ModernTemplate3 data={data} />;
      case "classic-2":
        return <ClassicTemplate2 data={data} />;
      case "classic-3":
        return <ClassicTemplate3 data={data} />;
      case "creative-2":
        return <CreativeTemplate2 data={data} />;
      case "creative-3":
        return <CreativeTemplate3 data={data} />;
      case "minimal-2":
        return <MinimalTemplate2 data={data} />;
      case "minimal-3":
        return <MinimalTemplate3 data={data} />;
      case "modern-4":
        return <ModernTemplate4 data={data} />;
      case "classic-4":
        return <ClassicTemplate4 data={data} />;
      case "creative-4":
        return <CreativeTemplate4 data={data} />;
      case "minimal-4":
        return <MinimalTemplate4 data={data} />;
      default:
        return <ModernTemplate data={data} />;
    }
  };

  return (
    <div className="relative">
      {/* Preview Container */}
      <div className="overflow-auto border rounded-lg bg-gray-50 p-4 print:p-0 print:border-0">
        <div
          ref={previewRef}
          id="cv-preview-content"
          className="bg-white shadow-lg mx-auto"
        >
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
}
export default CVPreview
