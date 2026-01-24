"use client";

import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  Eye, 
  EyeOff, 
  GripVertical, 
  MoreVertical, 
  Plus, 
  Trash2,
  Check,
  Lightbulb,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  User,
  Calendar,
  CreditCard,
  Flag,
  Type,
  Camera,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Types ---

export interface SectionItem {
  id?: string;
  title?: string;
  subtitle?: string;
  date?: string;
  description?: string;
  isHidden?: boolean;
  [key: string]: any;
}

interface CVSidebarSectionProps {
  sectionId: string;
  title: string;
  icon: React.ElementType;
  items: SectionItem[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateItems: (items: SectionItem[]) => void;
  onEditItem: (index: number) => void;
  onAddItem: () => void;
}

// --- List View Component ---

export function CVSidebarSection({
  sectionId,
  title,
  icon: Icon,
  items,
  isExpanded,
  onToggleExpand,
  onUpdateItems,
  onEditItem,
  onAddItem
}: CVSidebarSectionProps) {
  
  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    onUpdateItems(newItems);
  };

  const handleToggleVisibility = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newItems = [...items];
    newItems[index] = { ...newItems[index], isHidden: !newItems[index].isHidden };
    onUpdateItems(newItems);
  };

  const handleDeleteItem = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newItems = items.filter((_, i) => i !== index);
    onUpdateItems(newItems);
  };

  const getItemTitle = (item: SectionItem): string => {
    if (sectionId === "personalInfo") return item.fullName || item.name || item.jobTitle || "(No Name)"
    if (sectionId === "experience") return item.jobTitle || item.title || "(No Title)"
    if (sectionId === "education") return item.degree || item.title || "(No Degree)"
    if (sectionId === "projects") return item.name || item.title || "(No Project)"
    if (sectionId === "languages") return item.name || item.title || "(No Language)"
    if (sectionId === "certifications") return item.title || item.name || "(No Title)"
    if (sectionId === "skills") return item.title || item.name || "(No Skill)"
    if (sectionId === "interests") return item.title || item.name || "(No Interest)"
    return item.title || item.name || "(No Title)"
  }

  const getItemSubtitle = (item: SectionItem): string => {
    if (sectionId === "personalInfo") {
      const pieces = [item.jobTitle, item.email, item.phone, item.location].filter(Boolean)
      return pieces.join(" • ") || "Click to add details"
    }
    if (sectionId === "experience") {
      const duration = [item.startDate, item.endDate].filter(Boolean).join(" - ") || item.duration
      const pieces = [item.companyName || item.company, duration, item.location].filter(Boolean)
      return pieces.join(" • ") || item.description || "Click to add details"
    }
    if (sectionId === "education") {
      const pieces = [item.institutionName || item.institution, item.graduationDate || item.year, item.location].filter(Boolean)
      return pieces.join(" • ") || "Click to add details"
    }
    if (sectionId === "projects") {
      const tech = Array.isArray(item.technologies) ? item.technologies.filter(Boolean).join(", ") : ""
      const pieces = [item.role, tech].filter(Boolean)
      return pieces.join(" • ") || item.description || "Click to add details"
    }
    if (sectionId === "certifications") {
      const pieces = [item.issuingOrganization, item.dateObtained].filter(Boolean)
      return pieces.join(" • ") || "Click to add details"
    }
    if (sectionId === "languages") return item.proficiency || "Click to add details"
    return item.subtitle || item.description || "Click to add details"
  }

  if (sectionId === "personalInfo") {
    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <div 
            key={index}
            className="group relative p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:shadow-md transition-all cursor-pointer"
            onClick={() => onEditItem(index)}
          >
            {/* Edit Button - Top Right */}
            <div className="absolute top-4 right-4 p-2.5 rounded-full resumaic-gradient-green text-white shadow-md shadow-emerald-100 dark:shadow-none group-hover:scale-110 transition-transform z-10">
              <Edit2 className="h-4 w-4" />
            </div>

            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 pr-4">
                <div className="mb-4">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-0.5">
                    {item.fullName || item.name || "(No Name)"}
                  </h4>
                  <p className="text-base text-gray-500 dark:text-gray-400 font-medium">
                    {item.jobTitle || item.title || "(No Title)"}
                  </p>
                </div>

                <div className="space-y-3">
                  {item.email && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span className="truncate">{item.email}</span>
                    </div>
                  )}
                  {item.phone && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span>{item.phone || "Phone"}</span>
                    </div>
                  )}
                  {(item.location || item.address || item.city || item.country) && (
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <span className="truncate">
                        {[item.address, item.city, item.location, item.country].filter(Boolean).join(", ") || "Location"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Image */}
              <div className="flex-shrink-0 mt-6">
                <Avatar className="h-24 w-24 border-2 border-gray-50 dark:border-gray-800 shadow-sm">
                  {item.profilePicture && (
                    <AvatarImage 
                      src={item.profilePicture} 
                      alt={item.fullName || item.name || "Profile"} 
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-200">
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex items-center">
            <span className="font-bold text-gray-700 dark:text-gray-200 tracking-wide uppercase text-sm">
              {title}
            </span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-2 space-y-2 pb-4">
          {items.map((item, index) => (
            <div 
              key={index}
              draggable={items.length > 1}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", index.toString());
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
                if (!isNaN(fromIndex) && fromIndex !== index) {
                   moveItem(fromIndex, index);
                }
              }}
              className={`group flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:shadow-sm transition-all relative ${item.isHidden ? "opacity-60" : ""} ${items.length > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
              onClick={() => onEditItem(index)}
            >
              {/* Drag Handle */}
              <div className={`text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 ${items.length > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}>
                <GripVertical className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold truncate ${item.isHidden ? "text-gray-500 dark:text-gray-400 line-through" : "text-gray-800 dark:text-gray-200"}`}>
                  {getItemTitle(item)}
                </h4>
                <p className={`text-xs truncate ${item.isHidden ? "text-gray-400 dark:text-gray-500" : "text-gray-500 dark:text-gray-400"}`}>
                  {getItemSubtitle(item)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditItem(index);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  onClick={(e) => handleToggleVisibility(e, index)}
                >
                  {item.isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={(e) => handleDeleteItem(e, index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Add Entry Button */}
          <div className="pt-2 flex justify-center">
            <Button 
              variant="outline" 
              className="h-10 px-6 rounded-full border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-transparent hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400 gap-2 transition-all"
              onClick={onAddItem}
            >
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Edit View Component ---

interface CVSidebarEditFormProps {
  sectionId: string;
  item: SectionItem;
  onSave: (item: SectionItem) => void;
  onCancel: () => void;
  onDelete: () => void;
}

export function CVSidebarEditForm({ sectionId, item, onSave, onCancel, onDelete }: CVSidebarEditFormProps) {
  const [formData, setFormData] = useState<SectionItem>(item);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePicture: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profilePicture: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isPersonalInfo = sectionId === "personalInfo"

  const hasStartEndDates = ("startDate" in item) || ("endDate" in item);
  const hasGraduationDate = "graduationDate" in item;
  const hasDateObtained = "dateObtained" in item;
  const hasDuration = "duration" in item;
  const hasYear = "year" in item;

  const shouldShowStartEndDates = hasStartEndDates;
  const shouldShowSingleDate =
    !shouldShowStartEndDates && (hasGraduationDate || hasDateObtained || hasYear || hasDuration);

  const titleKey =
    "jobTitle" in item
      ? "jobTitle"
      : "name" in item
      ? "name"
      : "title" in item
      ? "title"
      : "institutionName" in item
      ? "institutionName"
      : "institution" in item
      ? "institution"
      : "degree" in item
      ? "degree"
      : "fullName" in item
      ? "fullName"
      : "title";

  const subtitleKey =
    "companyName" in item
      ? "companyName"
      : "company" in item
      ? "company"
      : "role" in item
      ? "role"
      : "degree" in item
      ? "degree"
      : "location" in item
      ? "location"
      : "subtitle";

  const getTitleLabel = () => {
    if (sectionId === "projects") return "Project Name";
    if (sectionId === "experience") return "Job Title";
    if (sectionId === "education") return "Degree";
    if (sectionId === "certifications") return "Certification Title";
    if (sectionId === "languages") return "Language";
    if (sectionId === "skills") return "Skill";
    if (sectionId === "interests") return "Interest";
    return "Title";
  };

  const getSubtitleLabel = () => {
    if (sectionId === "projects") return "Role";
    if (sectionId === "experience") return "Company";
    if (sectionId === "education") return "School / University";
    if (sectionId === "certifications") return "Issuing Organization";
    if (sectionId === "languages") return "Proficiency";
    return "Subtitle";
  };

  const singleDateKey =
    hasGraduationDate ? "graduationDate" : hasDateObtained ? "dateObtained" : hasYear ? "year" : "duration";

  const shouldShowDescription =
    "description" in item || sectionId === "projects" || sectionId === "experience" || sectionId === "education";

  const shouldShowSubtitle = sectionId !== "skills" && sectionId !== "interests";

  const shouldShowResponsibilities = Array.isArray((item as any).responsibilities);
  const shouldShowTechnologies = Array.isArray((item as any).technologies);
  const shouldShowLinks = "liveDemoLink" in item || "githubLink" in item || "verificationLink" in item;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          {isPersonalInfo ? "Edit Personal Details" : "Edit Entry"}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-1 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
            <Lightbulb className="h-4 w-4" />
            <span className="text-xs font-medium">Get Tips</span>
          </Button>
          {!isPersonalInfo && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
        {isPersonalInfo ? (
          <>
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center gap-4 py-4 border-b border-gray-50 dark:border-gray-800 mb-4">
              <div className="relative group">
                <Avatar className="h-28 w-28 border-4 border-white dark:border-gray-800 shadow-xl">
                  {formData.profilePicture && (
                    <AvatarImage 
                      src={formData.profilePicture} 
                      alt="Profile preview" 
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}>
                  <Camera className="h-8 w-8 text-white" />
                </div>

                {formData.profilePicture && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-1 -right-1 h-7 w-7 rounded-full shadow-lg"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs font-semibold rounded-lg border-gray-200 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Photo
                </Button>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 uppercase tracking-wider font-medium">
                  JPG, PNG or WebP. Max 2MB.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Full name</label>
              <Input
                value={formData.fullName || ""}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 h-10"
                placeholder="e.g. Asif Akram"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Professional title</label>
              <Input
                value={formData.jobTitle || ""}
                onChange={(e) => handleChange("jobTitle", e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 h-10"
                placeholder="e.g. Full Stack Developer"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Location</label>
              <div className="relative">
                <Input
                  value={formData.location || ""}
                  onChange={(e) => handleChange("location", e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 h-10"
                  placeholder="e.g. Lahore, Punjab, Pakistan"
                />
                <GripVertical className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Input
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 h-10"
                  placeholder="e.g. name@example.com"
                />
                <GripVertical className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Phone</label>
              <div className="relative">
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 h-10"
                  placeholder="Enter Phone"
                />
                <GripVertical className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">LinkedIn</label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={formData.linkedin || ""}
                    onChange={(e) => handleChange("linkedin", e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 h-10"
                    placeholder="Enter LinkedIn"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-10 px-3 text-xs gap-1 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Globe className="h-3 w-3" />
                  Link
                </Button>
                <div className="flex items-center">
                   <GripVertical className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">GitHub</label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={formData.github || ""}
                    onChange={(e) => handleChange("github", e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 h-10"
                    placeholder="Enter GitHub"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-10 px-3 text-xs gap-1 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Globe className="h-3 w-3" />
                  Link
                </Button>
                <div className="flex items-center">
                   <GripVertical className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            </div>

            {/* <div className="pt-2 space-y-3">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">Add Details</label>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Plus className="h-3 w-3" /> Website
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Plus className="h-3 w-3" /> Nationality
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Plus className="h-3 w-3" /> Date of Birth
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Plus className="h-3 w-3" /> Visa
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Plus className="h-3 w-3" /> Passport or Id
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Plus className="h-3 w-3" /> Gender/Pronoun
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 px-4">
                  Show More
                </Button>
              </div>
            </div> */}


            
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Summary</label>
              <Textarea
                value={formData.summary || ""}
                onChange={(e) => handleChange("summary", e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 min-h-[140px]"
                placeholder="Write a brief professional summary..."
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {getTitleLabel()}
              </label>
              <div className="relative">
                <Input 
                  value={formData[titleKey as keyof SectionItem] || ''} 
                  onChange={(e) => handleChange(titleKey as string, e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                  placeholder="e.g. Senior Product Designer"
                />
              </div>
            </div>

            {shouldShowSubtitle && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {getSubtitleLabel()}
                </label>
                <Input 
                  value={formData[subtitleKey as keyof SectionItem] || ''} 
                  onChange={(e) => handleChange(subtitleKey as string, e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                  placeholder="e.g. Google Inc."
                />
              </div>
            )}
          </>
        )}

        {shouldShowStartEndDates && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Start Date</label>
              <Input 
                value={formData.startDate || ''} 
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="MM/YYYY" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">End Date</label>
              <Input 
                value={formData.endDate || ''} 
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="MM/YYYY" 
              />
            </div>
          </div>
        )}

        {shouldShowSingleDate && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              {singleDateKey === "graduationDate"
                ? "Graduation Date"
                : singleDateKey === "dateObtained"
                ? "Date Obtained"
                : singleDateKey === "year"
                ? "Year"
                : "Duration"}
            </label>
            <Input
              value={(formData as any)[singleDateKey] || ""}
              onChange={(e) => handleChange(singleDateKey, e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              placeholder={singleDateKey === "duration" ? "e.g. 2022 - Present" : "MM/YYYY"}
            />
          </div>
        )}

        {shouldShowTechnologies && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Technologies</label>
            <Input
              value={Array.isArray((formData as any).technologies) ? (formData as any).technologies.join(", ") : ""}
              onChange={(e) => handleChange("technologies", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
              className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
              placeholder="e.g. React, Next.js, Tailwind"
            />
          </div>
        )}

        {shouldShowResponsibilities && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Responsibilities</label>
            <Textarea
              value={Array.isArray((formData as any).responsibilities) ? (formData as any).responsibilities.join("\n") : ""}
              onChange={(e) => handleChange("responsibilities", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
              className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 min-h-[100px]"
              placeholder={"One bullet per line"}
            />
          </div>
        )}

        {shouldShowLinks && (
          <div className="grid grid-cols-2 gap-4">
            {"liveDemoLink" in item && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Live Demo</label>
                <Input
                  value={(formData as any).liveDemoLink || ""}
                  onChange={(e) => handleChange("liveDemoLink", e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                  placeholder="https://"
                />
              </div>
            )}
            {"githubLink" in item && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">GitHub</label>
                <Input
                  value={(formData as any).githubLink || ""}
                  onChange={(e) => handleChange("githubLink", e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                  placeholder="https://"
                />
              </div>
            )}
            {"verificationLink" in item && (
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Verification Link</label>
                <Input
                  value={(formData as any).verificationLink || ""}
                  onChange={(e) => handleChange("verificationLink", e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500"
                  placeholder="https://"
                />
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {shouldShowDescription && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Description</label>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
              <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                 <Button variant="ghost" size="icon" className="h-6 w-6 rounded text-gray-500 dark:text-gray-400"><span className="font-bold font-serif">B</span></Button>
                 <Button variant="ghost" size="icon" className="h-6 w-6 rounded text-gray-500 dark:text-gray-400"><span className="italic font-serif">I</span></Button>
                 <Button variant="ghost" size="icon" className="h-6 w-6 rounded text-gray-500 dark:text-gray-400"><span className="underline font-serif">U</span></Button>
                 <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
                 <Button variant="ghost" size="icon" className="h-6 w-6 rounded text-gray-500 dark:text-gray-400"><MoreVertical className="h-3 w-3" /></Button>
              </div>
              <Textarea 
                value={formData.description || ''} 
                onChange={(e) => handleChange('description', e.target.value)}
                className="border-0 focus-visible:ring-0 resize-none min-h-[120px] p-3 text-sm leading-relaxed bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Describe your responsibilities and achievements..."
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
               <Button variant="secondary" size="sm" className="h-6 text-[10px] bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-100 dark:border-purple-800/50">
                 Improve Writing
               </Button>
               <Button variant="secondary" size="sm" className="h-6 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-100 dark:border-blue-800/50">
                 Suggest Content
               </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
        <Button 
          className="w-full resumaic-gradient-green hover:opacity-90 text-white shadow-md shadow-emerald-200 dark:shadow-none transition-all rounded-xl h-11"
          onClick={() => onSave(formData)}
        >
          <Check className="h-4 w-4 mr-2" />
          Done
        </Button>
      </div>
    </div>
  );
}
