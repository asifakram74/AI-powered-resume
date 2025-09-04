"use client";

import { ModernTemplate } from "../../components/templates/modern-template";
import { ClassicTemplate } from "../../components/templates/classic-template";
import { CreativeTemplate } from "../../components/templates/creative-template";
import { MinimalTemplate } from "../../components/templates/minimal-template";
import { ModernTemplate2 } from "../../components/templates/modern-template2";
import { ModernTemplate3 } from "../../components/templates/modern-template3";
import { ModernTemplate4 } from "../../components/templates/modern-template-4";
import { ClassicTemplate2 } from "../../components/templates/classic-template-2";
import { ClassicTemplate3 } from "../../components/templates/classic-template-3";
import { ClassicTemplate4 } from "../../components/templates/classic-template-4";
import { CreativeTemplate2 } from "../../components/templates/creative-template-2";
import { CreativeTemplate3 } from "../../components/templates/creative-template-3";
import { CreativeTemplate4 } from "../../components/templates/creative-template-4";
import { MinimalTemplate2 } from "../../components/templates/minimal-template2";
import { MinimalTemplate3 } from "../../components/templates/minimal-template3";
import { MinimalTemplate4 } from "../../components/templates/minimal-template-4";
import type { CVData } from "../../types/cv-data";

interface ResumeTemplateProps {
  data: CVData;
  templateId: string;
  scale?: number;
  isPreview?: boolean;
  className?: string;
}

export default function ResumeTemplate({
  data,
  templateId,
  scale = 1,
  isPreview = false,
  className = "",
}: ResumeTemplateProps) {
  const templateMap = {
    modern: ModernTemplate,
    classic: ClassicTemplate,
    creative: CreativeTemplate,
    minimal: MinimalTemplate,
    "modern-2": ModernTemplate2,
    "modern-3": ModernTemplate3,
    "modern-4": ModernTemplate4,
    "classic-2": ClassicTemplate2,
    "classic-3": ClassicTemplate3,
    "classic-4": ClassicTemplate4,
    "creative-2": CreativeTemplate2,
    "creative-3": CreativeTemplate3,
    "creative-4": CreativeTemplate4,
    "minimal-2": MinimalTemplate2,
    "minimal-3": MinimalTemplate3,
    "minimal-4": MinimalTemplate4,
  };

  const TemplateComponent = templateMap[templateId as keyof typeof templateMap];

  if (!TemplateComponent) {
    return <div>Template not found</div>;
  }

  const style = {
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    width: scale !== 0.3 ? `${50 / scale}%` : "100%",
    height: scale !== 1.0 ? `${100 / scale}%` : "auto",
  };

  return (
    <div className={className} style={style}>
      <TemplateComponent data={data} isPreview={isPreview} />
    </div>
  );
}
