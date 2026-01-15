"use client";

import { ModernTemplate } from "../../components/templates/modern/modern-template";
import { ClassicTemplate } from "../../components/templates/classic/classic-template";
import { CreativeTemplate2 } from "../../components/templates/creative/creative-template-2";
import { CreativeTemplate3 } from "../../components/templates/creative/creative-template-3";
import { MinimalTemplate6 } from "../../components/templates/minimal/minimal-template-6";
import { MinimalTemplate7 } from "../../components/templates/minimal/minimal-template-7";
import { ClassicTemplate2 } from "../../components/templates/classic/classic-template-2";
import { ClassicTemplate3 } from "../../components/templates/classic/classic-template-3";
import { ClassicTemplate4 } from "../../components/templates/classic/classic-template-4";
import { MinimalTemplate } from "../../components/templates/minimal/minimal-template";
import { MinimalTemplate5 } from "../../components/templates/minimal/minimal-template-5";
import { MinimalTemplate8 } from "../../components/templates/minimal/minimal-template-8";
import { MinimalTemplate2 } from "../../components/templates/minimal/minimal-template2";
import { MinimalTemplate3 } from "../../components/templates/minimal/minimal-template3";  
import { MinimalTemplate4 } from "../../components/templates/minimal/minimal-template-4";
import {CreativeTemplate4}from "../../components/templates/creative/creative-template-4";
import {ModernTemplate2} from "../../components/templates/modern/modern-template-2";
import {ModernTemplate3} from "../../components/templates/modern/modern-template-3";
import {ModernTemplate4} from "../../components/templates/modern/modern-template-4";
import {CreativeTemplate} from "../../components/templates/creative/creative-template";
import { sampleCVData } from "../../lib/sample-cv-data";
import { useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";

interface CVTemplate {
  id: string;
  name: string;
  description: string;
  category: "modern" | "classic" | "creative" | "minimal";
}

interface CVPreviewProps {
  data?: typeof sampleCVData;
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
  const [exporting, setExporting] = useState(false);

  const renderTemplate = () => {
    switch (template?.id) {
      case "modern":
        return <ModernTemplate data={data} isPreview />;
      case "classic":
        return <ClassicTemplate data={data} isPreview />;
      case "minimal":
        return <MinimalTemplate data={data} isPreview />;
      case "creative":
        return <CreativeTemplate data={data} isPreview />;
      case "modern-2":
        return <ModernTemplate2 data={data} isPreview />;
      case "minimal-6":
        return <MinimalTemplate6 data={data} isPreview />;
      case "classic-2":
        return <ClassicTemplate2 data={data} isPreview />;
      case "classic-3":
        return <ClassicTemplate3 data={data} isPreview />;
      case "minimal":
        return <MinimalTemplate data={data} isPreview />;
      case "minimal-5":
        return <MinimalTemplate5 data={data} isPreview />;
      case "minimal-2":
        return <MinimalTemplate2 data={data} isPreview />;
      case "minimal-3":
        return <MinimalTemplate3 data={data} isPreview />;
      case "minimal-7":
        return <MinimalTemplate7 data={data} isPreview />;
      case "classic-4":
        return <ClassicTemplate4 data={data} isPreview />;
      case "minimal-8":
        return <MinimalTemplate8 data={data} isPreview />;
      case "minimal-4":
        return <MinimalTemplate4 data={data} isPreview />;
      case "creative-4":
        return <CreativeTemplate4 data={data} isPreview />;
      case "modern-2":
        return <ModernTemplate2 data={data} isPreview />;
      case "modern-3":
        return <ModernTemplate3 data={data} isPreview />;
      case "modern-4":
        return <ModernTemplate4 data={data} isPreview />;
      case "creative":
        return <CreativeTemplate data={data} isPreview />;
      case "creative-2":
        return <CreativeTemplate2 data={data} isPreview />;
      case "creative-3":
        return <CreativeTemplate3 data={data} isPreview />;
      default:
        return <ModernTemplate data={data} isPreview />;
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const el = document.getElementById("cv-preview-content");
      if (!el) return;

      const base = (data as any)?.personalInfo?.fullName || template?.id || "resume";
      const safe = String(base).toLowerCase().replace(/\s+/g, "-");
      const filename = `${safe}-preview.pdf`;

      const pageEls = Array.from(el.querySelectorAll('.a4-page')) as HTMLElement[];
      if (pageEls.length > 0) {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();

        for (let i = 0; i < pageEls.length; i++) {
          const pageEl = pageEls[i];
          const dataUrl = await htmlToImage.toPng(pageEl, {
            quality: 1,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            skipFonts: true,
          });
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.src = dataUrl;
          });
          const mmPerPx = pageWidth / img.width;
          const imgHeightMm = img.height * mmPerPx;
          pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, imgHeightMm);
          if (i < pageEls.length - 1) pdf.addPage();
        }

        pdf.save(filename);
      } else {
        const dataUrl = await htmlToImage.toPng(el, {
          quality: 1,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
          skipFonts: true,
        });
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.src = dataUrl;
        });
        const mmPerPx = pageWidth / img.width;
        const imgHeightMm = img.height * mmPerPx;
        pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, imgHeightMm);
        pdf.save(filename);
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className=" w-full">
      <div className="w-full  border  bg-gray-50 dark:bg-gray-950 print:p-0 print:border-0">
        <div
          ref={previewRef}
          id="cv-preview-content"
          className="mx-auto print:shadow-none"
        >
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
}
export default CVPreview
