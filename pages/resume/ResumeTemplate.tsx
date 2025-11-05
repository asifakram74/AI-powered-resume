"use client";

import { ModernTemplate } from "../../components/templates/modern-template";
import { ClassicTemplate } from "../../components/templates/classic-template";
import { CreativeTemplate2 } from "../../components/templates/creative-template-2";
import { CreativeTemplate3 } from "../../components/templates/creative-template-3";
import { ModernTemplate2 } from "../../components/templates/modern-template2";
import { MinimalTemplate6 } from "../../components/templates/minimal-template-6";
import { MinimalTemplate7 } from "../../components/templates/minimal-template-7";
import { ClassicTemplate2 } from "../../components/templates/classic-template-2";
import { ClassicTemplate3 } from "../../components/templates/classic-template-3";
import { ClassicTemplate4 } from "../../components/templates/classic-template-4";
import { MinimalTemplate } from "../../components/templates/minimal-template";
import { MinimalTemplate5 } from "../../components/templates/minimal-template-5";
import { MinimalTemplate8 } from "../../components/templates/minimal-template-8";
import { MinimalTemplate2 } from "../../components/templates/minimal-template2";
import { MinimalTemplate3 } from "../../components/templates/minimal-template3";
import { MinimalTemplate4 } from "../../components/templates/minimal-template-4";
import {CreativeTemplate4}from "../../components/templates/creative-template-4";
import {ModernTemplate6} from "../../components/templates/modern-template-6";
import {ModernTemplate7} from "../../components/templates/modern-template-7";
import {ModernTemplate8} from "../../components/templates/modern-template-8";
import {CreativeTemplate} from "../../components/templates/creative-template";
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
    "creative-1": CreativeTemplate,
    "creative-2": CreativeTemplate2,
    "creative-3": CreativeTemplate3,
    "creative-4": CreativeTemplate4,
    "minimal-6": MinimalTemplate6,
    "minimal-7": MinimalTemplate7,
    // "modern-5": ModernTemplate5,
    "modern-6": ModernTemplate6,
    "modern-7": ModernTemplate7,
    "modern-8": ModernTemplate8,
    // "modern-9": ModernTemplate9,
    "classic-2": ClassicTemplate2,
    "classic-3": ClassicTemplate3,
    "classic-4": ClassicTemplate4,
    "minimal-1": MinimalTemplate,
    "minimal-5": MinimalTemplate5,
    "minimal-8": MinimalTemplate8,
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
