"use client";

import type { CVData } from "@/types/cv-data";
import { ModernTemplate } from "@/components/templates/modern-template";
import { ClassicTemplate } from "@/components/templates/classic-template";
import { MinimalTemplate } from "@/components/templates/minimal-template";
import { CreativeTemplate } from "@/components/templates/creative-template";
import { useRef } from "react";

interface CVTemplate {
  id: string;
  name: string;
  description: string;
  category: "modern" | "classic" | "creative" | "minimal";
}

interface CVPreviewProps {
  data: CVData;
  template: CVTemplate;
}

export function CVPreview({ data, template }: CVPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const renderTemplate = () => {
    switch (template.id) {
      case "modern":
        return <ModernTemplate data={data} />;
      case "classic":
        return <ClassicTemplate data={data} />;
      case "minimal":
        return <MinimalTemplate data={data} />;
      case "creative":
        return <CreativeTemplate data={data} />;
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
