import React, { useMemo, useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Check, Minus, Plus, RotateCcw, GripVertical, ChevronDown, Trash2 } from "lucide-react"
import type {
  CVBulletStyle,
  CVFontFamilyId,
  CVStyleSettings,
  CVColorMode,
  CVBorderMode,
  CVCapitalization,
  CVAlign,
  CVIconFill,
  CVIconFrame,
  CVIconSize,
  CVEntryListStyle,
  CVDotsBarsBubbles,
  CVSectionHeaderIconStyle,
  CVSectionId,
  PersonalInfoFieldId,
} from "../../types/cv-data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

const SECTION_LABELS: Record<CVSectionId, string> = {
  personalInfo: "Personal Info",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  languages: "Languages",
  interests: "Interests",
}

const PERSONAL_INFO_FIELD_LABELS: Record<PersonalInfoFieldId, string> = {
  fullName: "Full Name",
  jobTitle: "Job Title",
  email: "Email",
  phone: "Phone",
  address: "Address",
  location: "City / Country",
  linkedin: "LinkedIn",
  github: "GitHub",
  summary: "Summary",
}

type Props = {
  value: CVStyleSettings
  onChange: (next: CVStyleSettings) => void
  onReset: () => void

  // Arrange Section Props
  hiddenSections: CVSectionId[]
  setHiddenSections: (sections: CVSectionId[]) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
  resetAllSettings: () => void
  availableSectionIds: CVSectionId[]
  visibleSectionOrder: CVSectionId[]
  moveSection: (from: CVSectionId, to: CVSectionId) => void
  hideSection: (sectionId: CVSectionId) => void
  unhideSection: (sectionId: CVSectionId) => void
  isPersonalInfoOpen: boolean
  setIsPersonalInfoOpen: React.Dispatch<React.SetStateAction<boolean>>
  resetPersonalInfoOrder: () => void
  visiblePersonalInfoFieldOrder: PersonalInfoFieldId[]
  movePersonalInfoField: (from: PersonalInfoFieldId, to: PersonalInfoFieldId) => void
}

const FONT_OPTIONS: Array<{ id: CVFontFamilyId; label: string }> = [
  { id: "inter", label: "Inter (Default)" },
  { id: "roboto", label: "Roboto" },
  { id: "open-sans", label: "Open Sans" },
  { id: "lato", label: "Lato" },
  { id: "system-sans", label: "System Sans" },
  { id: "system-serif", label: "System Serif" },
  { id: "serif", label: "Serif (App)" },
  { id: "mono", label: "Monospace" },
]

const COLOR_MODE_OPTIONS: Array<{ id: CVColorMode; label: string }> = [
  { id: "basic", label: "Basic" },
  { id: "advanced", label: "Advanced" },
]

const BORDER_MODE_OPTIONS: Array<{ id: CVBorderMode; label: string }> = [
  { id: "none", label: "None" },
  { id: "single", label: "Single" },
  { id: "multi", label: "Multi" },
  { id: "image", label: "Image" },
]


const ALIGN_OPTIONS: Array<{ id: CVAlign; label: string }> = [
  { id: "left", label: "Left" },
  { id: "center", label: "Center" },
  { id: "right", label: "Right" },
]

const CAPITALIZATION_OPTIONS: Array<{ id: CVCapitalization; label: string }> = [
  { id: "capitalize", label: "Capitalize" },
  { id: "uppercase", label: "Uppercase" },
]

const ICON_FILL_OPTIONS: Array<{ id: CVIconFill; label: string }> = [
  { id: "none", label: "None" },
  { id: "outline", label: "Outline" },
  { id: "filled", label: "Filled" },
]

const ICON_FRAME_OPTIONS: Array<{ id: CVIconFrame; label: string }> = [
  { id: "none", label: "No frame" },
  { id: "circle-filled", label: "Circle filled" },
  { id: "rounded-filled", label: "Rounded filled" },
  { id: "square-filled", label: "Square filled" },
  { id: "circle-outline", label: "Circle outline" },
  { id: "rounded-outline", label: "Rounded outline" },
  { id: "square-outline", label: "Square outline" },
]

const ICON_SIZE_OPTIONS: Array<{ id: CVIconSize; label: string }> = [
  { id: "xs", label: "XS" },
  { id: "sm", label: "SM" },
  { id: "md", label: "MD" },
  { id: "lg", label: "LG" },
  { id: "xl", label: "XL" },
]




const ENTRY_LIST_STYLE_OPTIONS: Array<{ id: CVEntryListStyle; label: string }> = [
  { id: "bullet", label: "Bullet" },
  { id: "hyphen", label: "Hyphen" },
]

const DOTS_BARS_BUBBLES_OPTIONS: Array<{ id: CVDotsBarsBubbles; label: string }> = [
  { id: "dots", label: "Dots" },
  { id: "bars", label: "Bars" },
  { id: "bubbles", label: "Bubbles" },
]

const SECTION_ICON_OPTIONS: Array<{ id: CVSectionHeaderIconStyle; label: string }> = [
  { id: "none", label: "None" },
  { id: "dot", label: "Dot" },
  { id: "bar", label: "Bar" },
  { id: "square", label: "Square" },
  { id: "circle-outline", label: "Circle Outline" },
]

const BULLET_OPTIONS: Array<{ id: CVBulletStyle; label: string }> = [
  { id: "disc", label: "Disc" },
  { id: "circle", label: "Circle" },
  { id: "square", label: "Square" },
  { id: "hyphen", label: "Hyphen" },
  { id: "none", label: "None" },
]

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

function clampFloat(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

function normalizeHex(input: string) {
  const raw = (input || "").trim()
  if (!raw) return ""
  const s = raw.startsWith("#") ? raw : `#${raw}`
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase()
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    const r = s[1]
    const g = s[2]
    const b = s[3]
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return ""
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[rgba(45,54,57,0.12)] dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="text-base font-bold text-[var(--resumaic-dark-gray)] dark:text-gray-100">{title}</div>
        {action}
      </div>
      {children}
    </div>
  )
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: Array<{ id: T; label: string }>
  onChange: (next: T) => void
}) {
  return (
    <div className="inline-flex rounded-none border border-[rgba(45,54,57,0.14)] dark:border-gray-800 bg-[rgba(45,54,57,0.04)] dark:bg-gray-800/50 p-0.5 gap-0.5">
      {options.map((opt) => {
        const active = opt.id === value
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-2 py-1 text-[11px] rounded-none transition-colors ${active
                ? "bg-[var(--resumaic-green)] text-white"
                : "text-[rgba(45,54,57,0.7)] dark:text-gray-400 hover:bg-[rgba(112,228,168,0.18)] dark:hover:bg-gray-800 hover:text-[var(--resumaic-dark-gray)] dark:hover:text-gray-200"
              }`}
          >
            {active ? (
              <span className="inline-flex items-center gap-1">
                <Check className="h-3 w-3 text-white" />
                {opt.label}
              </span>
            ) : (
              opt.label
            )}
          </button>
        )
      })}
    </div>
  )
}

function ModeButton({
  active,
  label,
  onClick,
  icon,
}: {
  active: boolean
  label: string
  onClick: () => void
  icon: React.ReactNode
}) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1.5">
      <div
        className={`grid place-items-center size-10 rounded-none border transition-colors ${active
            ? "border-[rgba(112,228,168,0.9)] bg-[rgba(112,228,168,0.18)] dark:bg-[rgba(112,228,168,0.1)]"
            : "border-[rgba(45,54,57,0.16)] dark:border-gray-800 bg-white dark:bg-gray-900"
          }`}
      >
        <div className="scale-75 origin-center dark:text-gray-300">{icon}</div>
      </div>
      <div className={`text-[10px] ${active ? "text-[var(--resumaic-dark-gray)] dark:text-gray-100" : "text-[rgba(45,54,57,0.65)] dark:text-gray-500"}`}>{label}</div>
    </button>
  )
}

function Swatch({
  color,
  selected,
  onClick,
}: {
  color: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className="relative size-7 rounded-none">
      <span className="absolute inset-0 rounded-none border border-[rgba(45,54,57,0.16)] dark:border-gray-700" style={{ background: color }} />
      {selected ? (
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid place-items-center size-5 rounded-none bg-white/80 dark:bg-black/40 backdrop-blur-sm">
            <Check className="h-3 w-3 text-[var(--resumaic-dark-gray)] dark:text-white" />
          </span>
        </span>
      ) : null}
    </button>
  )
}

function AccentCheck({
  checked,
  label,
  onToggle,
}: {
  checked: boolean
  label: string
  onToggle: () => void
}) {
  return (
    <button type="button" onClick={onToggle} className="flex items-center gap-1.5 text-xs text-[var(--resumaic-dark-gray)] dark:text-gray-300">
      <span
        className={`grid place-items-center size-4 rounded-none border transition-colors ${checked
            ? "border-[var(--resumaic-green)] bg-[var(--resumaic-green)]"
            : "border-[rgba(45,54,57,0.16)] dark:border-gray-700 bg-white dark:bg-gray-900"
          }`}
      >
        {checked ? <Check className="h-3 w-3 text-white" /> : null}
      </span>
      <span>{label}</span>
    </button>
  )
}

function RangeControl({
  label,
  valueLabel,
  value,
  min,
  max,
  step,
  onChange,
  segments = 9,
}: {
  label: string
  valueLabel: string
  value: number
  min: number
  max: number
  step: number
  onChange: (next: number) => void
  segments?: number
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const segmentIndex = Math.round(((value - min) / (max - min)) * (segments - 1))

  const onMinus = () => onChange(Math.max(min, Number((value - step).toFixed(4))))
  const onPlus = () => onChange(Math.min(max, Number((value + step).toFixed(4))))

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const index = Math.floor((x / rect.width) * segments)
    setHoverIndex(Math.max(0, Math.min(segments - 1, index)))
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const index = Math.floor((x / rect.width) * segments)
    const newValue = min + (index / (segments - 1)) * (max - min)
    const steppedValue = Math.round(newValue / step) * step
    onChange(Number(steppedValue.toFixed(4)))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-[var(--resumaic-dark-gray)] dark:text-gray-200">{label}</div>
        <div className="text-sm text-[rgba(45,54,57,0.65)] dark:text-gray-400 tabular-nums">{valueLabel}</div>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="relative h-9 flex-1 border border-[rgba(45,54,57,0.12)] dark:border-gray-700 bg-[rgba(45,54,57,0.03)] dark:bg-gray-800/50 overflow-hidden cursor-pointer group rounded-lg"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          onClick={handleClick}
        >
          {/* Vertical Dividers */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: segments - 1 }).map((_, i) => (
              <div
                key={i}
                className="h-full border-r border-[rgba(45,54,57,0.08)] dark:border-gray-700/50"
                style={{ width: `${100 / segments}%` }}
              />
            ))}
          </div>

          {/* Hover Indicator */}
          {hoverIndex !== null && hoverIndex !== segmentIndex && (
            <div
              className="absolute inset-y-0 bg-[rgba(112,228,168,0.2)] transition-all duration-150"
              style={{
                left: `${(hoverIndex * 100) / segments}%`,
                width: `${100 / segments}%`,
              }}
            />
          )}

          {/* Active Indicator */}
          <div
            className="absolute inset-y-0 transition-all duration-200 shadow-sm"
            style={{
              left: `${(segmentIndex * 100) / segments}%`,
              width: `${100 / segments}%`,
              background: "var(--resumaic-green)",
            }}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onMinus}
            className="size-9 rounded-lg border-[rgba(45,54,57,0.12)] dark:border-gray-700 bg-white dark:bg-gray-800 text-[var(--resumaic-dark-gray)] dark:text-gray-200 hover:bg-[rgba(112,228,168,0.18)] dark:hover:bg-gray-700 hover:border-[rgba(112,228,168,0.6)]"
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onPlus}
            className="size-9 rounded-lg border-[rgba(45,54,57,0.12)] dark:border-gray-700 bg-white dark:bg-gray-800 text-[var(--resumaic-dark-gray)] dark:text-gray-200 hover:bg-[rgba(112,228,168,0.18)] dark:hover:bg-gray-700 hover:border-[rgba(112,228,168,0.6)]"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function DesignPanel({
  value,
  onChange,
  onReset,
  hiddenSections,
  setHiddenSections,
  setHasUnsavedChanges,
  resetAllSettings,
  availableSectionIds,
  visibleSectionOrder,
  moveSection,
  hideSection,
  unhideSection,
  isPersonalInfoOpen,
  setIsPersonalInfoOpen,
  resetPersonalInfoOrder,
  visiblePersonalInfoFieldOrder,
  movePersonalInfoField,
}: Props) {
  const set = (patch: Partial<CVStyleSettings>) => onChange({ ...value, ...patch })

  const updateColor = (key: keyof Pick<
    CVStyleSettings,
    "textColor" | "headingColor" | "mutedColor" | "accentColor" | "borderColor"
  >, next: string) => {
    const normalized = normalizeHex(next)
    if (!normalized) return
    set({ [key]: normalized } as any)
  }

  const showAdvancedColors = value.colorMode === "advanced"
  const accentTargets = useMemo(() => ([
    ["applyAccentToName", "Name"],
    ["applyAccentToJobTitle", "Job title"],
    ["applyAccentToHeadings", "Headings"],
    ["applyAccentToHeadingsLine", "Headings line"],
    ["applyAccentToHeaderIcons", "Header icons"],
    ["applyAccentToDotsBarsBubbles", "Dots/Bars/Bubbles"],
    ["applyAccentToDates", "Dates"],
    ["applyAccentToLinkIcons", "Link icons"],
  ] as const), [])
  const [showBorderPanel, setShowBorderPanel] = useState(false)
  const [fontTarget, setFontTarget] = useState<"body" | "heading">("body")
  const [fontCategory, setFontCategory] = useState<"serif" | "sans" | "mono">("sans")

  const accentPalette = useMemo(
    () => [
      "#2f2f2f",
      "#445a5f",
      "#6e8b88",
      "#3d8fb2",
      "#2f5a74",
      "#2d4e7d",
      "#4a7bb2",
      "#6bb1e6",
      "#3e1a73",
      "#6b1f5a",
      "#b8577c",
      "#f15b75",
    ],
    [],
  )

  const fontOptionsByCategory = useMemo(() => {
    const all = FONT_OPTIONS
    const serif = all.filter((f) => f.id === "serif" || f.id === "system-serif")
    const mono = all.filter((f) => f.id === "mono")
    const sans = all.filter((f) => !serif.includes(f) && !mono.includes(f))
    return { serif, sans, mono }
  }, [])

  const activeFontFamily = fontTarget === "body" ? value.bodyFontFamily : value.headingFontFamily
  const visibleFonts = fontCategory === "serif" ? fontOptionsByCategory.serif : fontCategory === "mono" ? fontOptionsByCategory.mono : fontOptionsByCategory.sans
  const setFontFamily = (id: CVFontFamilyId) => {
    if (fontTarget === "body") set({ bodyFontFamily: id })
    else set({ headingFontFamily: id })
  }

  return (
    <div className="flex flex-col h-full bg-[#f4f4f2] dark:bg-gray-950">
      <div className="flex-1 min-h-0 overflow-y-auto bg-[#f4f4f2] dark:bg-gray-950 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <div className=" space-y-5 mb-10">

          <Section
            title="Arrange Sections"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetAllSettings}
                className="flex items-center gap-1.5 h-7 px-2 text-xs border-[rgba(45,54,57,0.18)] dark:border-gray-700 bg-white dark:bg-gray-800 text-[var(--resumaic-dark-gray)] dark:text-gray-200 hover:bg-[rgba(112,228,168,0.18)] dark:hover:bg-gray-700 hover:border-[rgba(112,228,168,0.6)]"
              >
                <RotateCcw className="h-3 w-3" />
                Default
              </Button>
            }
          >
            {availableSectionIds.length === 0 ? (
              <div className="rounded-xl border bg-white/60 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 p-4">
                <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  No sections to rearrange yet
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Add experience, education, or projects to enable section
                  ordering.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {hiddenSections.length > 0 && (
                  <div className="rounded-xl border bg-white/70 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 p-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        Hidden Sections
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        onClick={() => {
                          setHiddenSections([])
                          setHasUnsavedChanges(true)
                        }}
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                        Restore All
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      {hiddenSections.map((id) => (
                        <div
                          key={id}
                          className="flex items-center justify-between rounded-lg border bg-white/80 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 px-2.5 py-1.5"
                        >
                          <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {SECTION_LABELS[id]}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => unhideSection(id)}
                            className="h-6 w-6 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label={`Restore ${SECTION_LABELS[id]}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {visibleSectionOrder.map((sectionId) => (
                    <div
                      key={sectionId}
                      className="rounded-xl border bg-white/80 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
                    >
                      <div
                        draggable={availableSectionIds.length > 1}
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = "move"
                          e.dataTransfer.setData("text/plain", sectionId)
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          e.dataTransfer.dropEffect = "move"
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          const from = e.dataTransfer.getData(
                            "text/plain"
                          ) as CVSectionId
                          if (from) moveSection(from, sectionId)
                        }}
                        className={`group flex items-center justify-between px-3 py-2 hover:shadow-md transition-shadow bg-white dark:bg-gray-900 ${availableSectionIds.length > 1 ? "cursor-grab active:cursor-grabbing" : ""
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors cursor-grab active:cursor-grabbing select-none">
                            <GripVertical className="h-3.5 w-3.5" />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (sectionId === "personalInfo")
                                setIsPersonalInfoOpen((v) => !v)
                            }}
                            className="min-w-0 flex items-center gap-2 text-left"
                          >
                            <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {SECTION_LABELS[sectionId]}
                            </div>
                            {sectionId === "personalInfo" && (
                              <ChevronDown
                                className={`h-3.5 w-3.5 text-gray-500 dark:text-gray-400 transition-transform ${isPersonalInfoOpen ? "rotate-180" : ""
                                  }`}
                              />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {sectionId !== "personalInfo" && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => hideSection(sectionId)}
                              className="h-7 w-7 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                              aria-label={`Hide ${SECTION_LABELS[sectionId]}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <div className="text-[10px] text-gray-400 dark:text-gray-500 px-1.5">
                            Drag
                          </div>
                        </div>
                      </div>
                      {sectionId === "personalInfo" && isPersonalInfoOpen && (
                        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40">
                          <div className="px-3 pt-2 pb-1.5 flex items-center justify-between gap-2">
                            <div className="text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                              Personal Info Fields
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={resetPersonalInfoOrder}
                              className="h-6 text-[10px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 px-2"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Reset
                            </Button>
                          </div>
                          <div className="px-3 pb-3">
                            <div className="space-y-1 max-h-48 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                              {visiblePersonalInfoFieldOrder.map(
                                (fieldId) => (
                                  <div
                                    key={fieldId}
                                    draggable={
                                      visiblePersonalInfoFieldOrder.length > 1
                                    }
                                    onDragStart={(e) => {
                                      e.dataTransfer.effectAllowed = "move"
                                      e.dataTransfer.setData(
                                        "text/plain",
                                        fieldId
                                      )
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault()
                                      e.dataTransfer.dropEffect = "move"
                                    }}
                                    onDrop={(e) => {
                                      e.preventDefault()
                                      const from = e.dataTransfer.getData(
                                        "text/plain"
                                      ) as PersonalInfoFieldId
                                      if (from)
                                        movePersonalInfoField(from, fieldId)
                                    }}
                                    className={`group flex items-center justify-between rounded-lg border bg-white/80 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 px-2.5 py-1 ${visiblePersonalInfoFieldOrder.length > 1 ? "cursor-grab active:cursor-grabbing" : ""
                                      }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="shrink-0 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-colors cursor-grab active:cursor-grabbing select-none">
                                        <GripVertical className="h-3.5 w-3.5" />
                                      </div>
                                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                        {PERSONAL_INFO_FIELD_LABELS[fieldId]}
                                      </div>
                                    </div>
                                    <div className="text-[10px] text-gray-400 dark:text-gray-500 select-none">
                                      Drag
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>

          <Section title="Spacing">
            <div className="space-y-6">
              <RangeControl
                label="Font Size"
                valueLabel={`${value.bodyFontSizePx}pt`}
                value={value.bodyFontSizePx}
                min={10}
                max={16}
                step={1}
                onChange={(next) => set({ bodyFontSizePx: clampNumber(next, 10, 16) })}
              />
              <RangeControl
                label="Line Height"
                valueLabel={value.lineHeight.toFixed(1)}
                value={value.lineHeight}
                min={1.0}
                max={1.8}
                step={0.1}
                onChange={(next) => set({ lineHeight: clampFloat(next, 1.0, 1.8) })}
              />
              <RangeControl
                label="Left & Right Margin"
                valueLabel={`${value.marginLeftRightMm}mm`}
                value={value.marginLeftRightMm}
                min={8}
                max={24}
                step={1}
                onChange={(next) => set({ marginLeftRightMm: clampNumber(next, 8, 24) })}
              />
              <RangeControl
                label="Top & Bottom Margin"
                valueLabel={`${value.marginTopBottomMm}mm`}
                value={value.marginTopBottomMm}
                min={8}
                max={24}
                step={1}
                onChange={(next) => set({ marginTopBottomMm: clampNumber(next, 8, 24) })}
              />
              <RangeControl
                label="Space between Entries"
                valueLabel={`${value.spaceBetweenEntriesPx}px`}
                value={value.spaceBetweenEntriesPx}
                min={4}
                max={28}
                step={1}
                onChange={(next) => set({ spaceBetweenEntriesPx: clampNumber(next, 4, 28) })}
              />
              <div className="space-y-4 pt-1 border-t border-[rgba(45,54,57,0.08)]">
                <RangeControl
                  label="Headings size"
                  valueLabel={`${value.headingFontSizePx}px`}
                  value={value.headingFontSizePx}
                  min={14}
                  max={26}
                  step={1}
                  onChange={(next) => set({ headingFontSizePx: clampNumber(next, 14, 26) })}
                />
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs">Capitalization</Label>
                  <Segmented value={value.capitalization} options={CAPITALIZATION_OPTIONS} onChange={(v) => set({ capitalization: v })} />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Colors">
            <div className="space-y-4">
              <div className="flex items-start justify-center">
                <Segmented
                  value={showBorderPanel ? "border" : value.colorMode}
                  options={[
                    { id: "basic", label: "Basic" },
                    { id: "advanced", label: "Advanced" },
                    { id: "border", label: "Border" },
                  ]}
                  onChange={(v) => {
                    if (v === "border") {
                      setShowBorderPanel(true)
                    } else {
                      setShowBorderPanel(false)
                      set({ colorMode: v as CVColorMode })
                    }
                  }}
                />
              </div>

              {!showBorderPanel && value.colorMode === "basic" && (
                <>
                  <div className="flex items-center gap-1.5 justify-between">
                    {([
                      { id: "single" as const, label: "Accent" },
                      { id: "multi" as const, label: "Multi" },
                      { id: "image" as const, label: "Image" },
                    ] as const).map((opt) => {
                      const active = value.borderMode === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => set({ borderMode: opt.id })}
                          className={`flex-1 rounded-none border p-2 text-center transition-colors ${active
                              ? "border-[var(--resumaic-green)] bg-[var(--resumaic-green)] text-white"
                              : "border-[rgba(45,54,57,0.16)] dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground dark:text-gray-200"
                            }`}
                        >
                          <div className="text-xs font-medium">{opt.label}</div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {accentPalette.map((c) => (
                      <Swatch key={c} color={c} selected={c.toLowerCase() === value.accentColor.toLowerCase()} onClick={() => set({ accentColor: c })} />
                    ))}
                    <label className="relative size-7 rounded-none cursor-pointer">
                      <span className="absolute inset-0 rounded-none border border-border dark:border-gray-700 bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500" />
                      <input
                        type="color"
                        value={value.accentColor}
                        onChange={(e) => updateColor("accentColor", e.target.value)}
                        className="absolute inset-0 size-full opacity-0 cursor-pointer"
                      />
                    </label>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold text-[rgba(45,54,57,0.6)] dark:text-gray-400 uppercase tracking-wide">
                      Apply accent color
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {accentTargets.map(([key, label]) => (
                        <AccentCheck
                          key={key}
                          checked={Boolean((value as any)[key])}
                          label={label}
                          onToggle={() => set({ [key]: !(value as any)[key] } as any)}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {showBorderPanel && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <Label className="text-xs dark:text-gray-300">Border Mode</Label>
                    <Segmented value={value.borderMode} options={BORDER_MODE_OPTIONS} onChange={(v) => set({ borderMode: v })} />
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="grow space-y-1">
                      <Label className="text-xs dark:text-gray-300">Border color</Label>
                      <Input
                        value={value.borderColor}
                        onChange={(e) => {
                          const normalized = normalizeHex(e.target.value)
                          if (normalized) set({ borderColor: normalized })
                        }}
                        placeholder="#1f2937"
                        className="h-8 text-xs bg-white dark:bg-gray-800 border-[rgba(45,54,57,0.16)] dark:border-gray-700 text-[var(--resumaic-dark-gray)] dark:text-gray-200"
                      />
                    </div>
                    <input
                      type="color"
                      value={value.borderColor}
                      onChange={(e) => updateColor("borderColor" as any, e.target.value)}
                      className="h-8 w-10 rounded-none border border-[rgba(45,54,57,0.16)] dark:border-gray-700 bg-white dark:bg-gray-800 p-0.5"
                    />
                  </div>

                  {value.borderMode === "image" ? (
                    <div className="space-y-1">
                      <Label className="text-xs dark:text-gray-300">Background image URL</Label>
                      <Input
                        value={value.backgroundImageUrl}
                        onChange={(e) => set({ backgroundImageUrl: e.target.value })}
                        placeholder="https://..."
                        className="h-8 text-xs bg-white dark:bg-gray-800 border-[rgba(45,54,57,0.16)] dark:border-gray-700 text-[var(--resumaic-dark-gray)] dark:text-gray-200"
                      />
                    </div>
                  ) : null}
                </div>
              )}

              {!showBorderPanel && value.colorMode === "advanced" && (
                <div className="grid grid-cols-1 gap-3 pt-1">
                  {([
                    ["textColor", "Text"],
                    ["headingColor", "Headings"],
                    ["mutedColor", "Muted"],
                    ["backgroundColor", "Background"],
                  ] as const).map(([key, label]) => (
                    <div key={key} className="flex items-end gap-2">
                      <div className="grow space-y-1">
                        <Label className="text-xs dark:text-gray-300">{label}</Label>
                        <Input
                          value={(value as any)[key]}
                          onChange={(e) => {
                            const normalized = normalizeHex(e.target.value)
                            if (normalized) set({ [key]: normalized } as any)
                          }}
                          placeholder="#000000"
                          className="h-8 text-xs bg-white dark:bg-gray-800 border-[rgba(45,54,57,0.16)] dark:border-gray-700 text-[var(--resumaic-dark-gray)] dark:text-gray-200"
                        />
                      </div>
                      <input
                        type="color"
                        value={(value as any)[key]}
                        onChange={(e) => updateColor(key as any, e.target.value)}
                        className="h-8 w-10 rounded-none border border-[rgba(45,54,57,0.16)] dark:border-gray-700 bg-white dark:bg-gray-800 p-0.5"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4 pt-2 border-t border-[rgba(45,54,57,0.08)]">
                <RangeControl
                  label="Dates opacity"
                  valueLabel={`${Math.round(value.datesOpacity * 100)}%`}
                  value={value.datesOpacity}
                  min={0.2}
                  max={1}
                  step={0.05}
                  onChange={(next) => set({ datesOpacity: clampFloat(next, 0.2, 1) })}
                  segments={10}
                />
                <RangeControl
                  label="Location opacity"
                  valueLabel={`${Math.round(value.locationOpacity * 100)}%`}
                  value={value.locationOpacity}
                  min={0.2}
                  max={1}
                  step={0.05}
                  onChange={(next) => set({ locationOpacity: clampFloat(next, 0.2, 1) })}
                  segments={10}
                />
              </div>
            </div>
          </Section>

          <Section title="Font">
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between w-full">
                  <div className="inline-flex rounded-none border border-[rgba(45,54,57,0.14)] dark:border-gray-800 bg-[rgba(45,54,57,0.04)] dark:bg-gray-800/50 p-0.5 gap-0.5">
                    {(["body", "heading"] as const).map((t) => {
                      const active = t === fontTarget
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFontTarget(t)}
                          className={`px-2 py-1 text-[11px] rounded-none transition-colors ${active
                              ? "bg-[var(--resumaic-green)] text-white"
                              : "text-[rgba(45,54,57,0.7)] dark:text-gray-400 hover:bg-[rgba(112,228,168,0.18)] dark:hover:bg-gray-800 hover:text-[var(--resumaic-dark-gray)] dark:hover:text-gray-200"
                            }`}
                        >
                          {t === "body" ? "Body" : "Headings"}
                        </button>
                      )
                    })}
                  </div>
                  <Segmented
                    value={fontCategory}
                    options={[
                      { id: "serif", label: "Serif" },
                      { id: "sans", label: "Sans" },
                      { id: "mono", label: "Mono" },
                    ]}
                    onChange={(v) => setFontCategory(v as any)}
                  />
                </div>

                {/* Font Categories Cards - Hidden as we have Segmented Control above */}
                {/* We can remove this grid to save space or keep it if visual selection is preferred. 
                        Given user feedback about size, let's keep only the segmented control for category selection 
                        and show font options directly. */}

                <div className="grid grid-cols-2 gap-2">
                  {visibleFonts.map((opt) => {
                    const active = opt.id === activeFontFamily
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFontFamily(opt.id)}
                        className={`rounded-none border px-2 py-1.5 text-xs transition-colors truncate ${active
                            ? "border-[var(--resumaic-green)] bg-[var(--resumaic-green)] text-white"
                            : "border-[rgba(45,54,57,0.16)] dark:border-gray-700 bg-white dark:bg-gray-800 text-foreground dark:text-gray-200"
                          }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>


            </div>
          </Section>

          <Section title="Section Headings">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs">Headings line</Label>
                <Segmented
                  value={value.headingsLine ? ("on" as const) : ("off" as const)}
                  options={[
                    { id: "on", label: "On" },
                    { id: "off", label: "Off" },
                  ]}
                  onChange={(v) => set({ headingsLine: v === "on" })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Section header icon</Label>
                  <Select
                    value={value.sectionHeaderIconStyle}
                    onValueChange={(v) => set({ sectionHeaderIconStyle: v as CVSectionHeaderIconStyle })}
                  >
                    <SelectTrigger className="h-8 text-xs w-full bg-white dark:bg-gray-800 border-[rgba(45,54,57,0.16)] dark:border-gray-700 text-[var(--resumaic-dark-gray)] dark:text-gray-200">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 text-[var(--resumaic-dark-gray)] dark:text-gray-200 border-[rgba(45,54,57,0.16)] dark:border-gray-700">
                      {SECTION_ICON_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Dots / Bars / Bubbles</Label>
                  <Select value={value.dotsBarsBubbles} onValueChange={(v) => set({ dotsBarsBubbles: v as CVDotsBarsBubbles })}>
                    <SelectTrigger className="h-8 text-xs w-full bg-white dark:bg-gray-800 border-[rgba(45,54,57,0.16)] dark:border-gray-700 text-[var(--resumaic-dark-gray)] dark:text-gray-200">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 text-[var(--resumaic-dark-gray)] dark:text-gray-200 border-[rgba(45,54,57,0.16)] dark:border-gray-700">
                      {DOTS_BARS_BUBBLES_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Entry Layout">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Description indentation ({value.descriptionIndentPx}px)</Label>
                <input
                  className="w-full h-1.5 accent-[var(--resumaic-green)] bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  type="range"
                  min={0}
                  max={32}
                  step={1}
                  value={value.descriptionIndentPx}
                  onChange={(e) => set({ descriptionIndentPx: clampNumber(Number(e.target.value), 0, 32) })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">List style</Label>
                <Select value={value.entryListStyle} onValueChange={(v) => set({ entryListStyle: v as CVEntryListStyle })}>
                  <SelectTrigger className="h-8 text-xs w-full bg-white dark:bg-gray-800 border-[rgba(45,54,57,0.16)] dark:border-gray-700 text-[var(--resumaic-dark-gray)] dark:text-gray-200">
                    <SelectValue placeholder="Select list style" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 text-[var(--resumaic-dark-gray)] dark:text-gray-200 border-[rgba(45,54,57,0.16)] dark:border-gray-700">
                    {ENTRY_LIST_STYLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          <Section title="Personal Details">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs">Align</Label>
                <Segmented value={value.align} options={ALIGN_OPTIONS} onChange={(v) => set({ align: v })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Header icons</Label>
                  <Select value={value.headerIcons} onValueChange={(v) => set({ headerIcons: v as CVIconFill })}>
                    <SelectTrigger className="h-8 text-xs w-full bg-white dark:bg-gray-800 border-[rgba(45,54,57,0.16)] dark:border-gray-700 text-[var(--resumaic-dark-gray)] dark:text-gray-200">
                      <SelectValue placeholder="Select icon style" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 text-[var(--resumaic-dark-gray)] dark:text-gray-200 border-[rgba(45,54,57,0.16)] dark:border-gray-700">
                      {ICON_FILL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Link icons</Label>
                  <Select value={value.linkIcons} onValueChange={(v) => set({ linkIcons: v as CVIconFill })}>
                    <SelectTrigger className="h-8 text-xs w-full bg-white dark:bg-gray-800 border-[rgba(45,54,57,0.16)] dark:border-gray-700 text-[var(--resumaic-dark-gray)] dark:text-gray-200">
                      <SelectValue placeholder="Select icon style" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 text-[var(--resumaic-dark-gray)] dark:text-gray-200 border-[rgba(45,54,57,0.16)] dark:border-gray-700">
                      {ICON_FILL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Icon frame</Label>
                  <Select value={value.iconFrame} onValueChange={(v) => set({ iconFrame: v as CVIconFrame })}>
                    <SelectTrigger className="h-8 text-xs w-full bg-white dark:bg-gray-800 border-[rgba(45,54,57,0.16)] dark:border-gray-700 text-[var(--resumaic-dark-gray)] dark:text-gray-200">
                      <SelectValue placeholder="Select frame" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 text-[var(--resumaic-dark-gray)] dark:text-gray-200 border-[rgba(45,54,57,0.16)] dark:border-gray-700">
                      {ICON_FRAME_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Icon size</Label>
                  <Select value={value.iconSize} onValueChange={(v) => set({ iconSize: v as CVIconSize })}>
                    <SelectTrigger className="h-8 text-xs w-full bg-white dark:bg-gray-800 border-[rgba(45,54,57,0.16)] dark:border-gray-700 text-[var(--resumaic-dark-gray)] dark:text-gray-200">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 text-[var(--resumaic-dark-gray)] dark:text-gray-200 border-[rgba(45,54,57,0.16)] dark:border-gray-700">
                      {ICON_SIZE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Name & Footer">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-xs">Name bold</Label>
                <Segmented
                  value={value.nameBold ? ("on" as const) : ("off" as const)}
                  options={[
                    { id: "on", label: "On" },
                    { id: "off", label: "Off" },
                  ]}
                  onChange={(v) => set({ nameBold: v === "on" })}
                />
              </div>

              <div className="pt-2 border-t border-[rgba(45,54,57,0.08)] grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs">Page numbers</Label>
                  <Segmented
                    value={value.showPageNumbers ? ("on" as const) : ("off" as const)}
                    options={[
                      { id: "on", label: "On" },
                      { id: "off", label: "Off" },
                    ]}
                    onChange={(v) => set({ showPageNumbers: v === "on" })}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs">Email</Label>
                  <Segmented
                    value={value.showEmail ? ("on" as const) : ("off" as const)}
                    options={[
                      { id: "on", label: "On" },
                      { id: "off", label: "Off" },
                    ]}
                    onChange={(v) => set({ showEmail: v === "on" })}
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section title="Icons">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Bullets</Label>
                <Select value={value.bulletStyle} onValueChange={(v) => set({ bulletStyle: v as CVBulletStyle })}>
                  <SelectTrigger className="h-8 text-xs w-full bg-white dark:bg-gray-800 border-[rgba(45,54,57,0.16)] dark:border-gray-700 text-[var(--resumaic-dark-gray)] dark:text-gray-200">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 text-[var(--resumaic-dark-gray)] dark:text-gray-200 border-[rgba(45,54,57,0.16)] dark:border-gray-700">
                    {BULLET_OPTIONS.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">List bullets</Label>
                <Select value={value.entryListStyle} onValueChange={(v) => set({ entryListStyle: v as CVEntryListStyle })}>
                  <SelectTrigger className="h-8 text-xs w-full bg-white dark:bg-gray-800 border-[rgba(45,54,57,0.16)] dark:border-gray-700 text-[var(--resumaic-dark-gray)] dark:text-gray-200">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 text-[var(--resumaic-dark-gray)] dark:text-gray-200 border-[rgba(45,54,57,0.16)] dark:border-gray-700">
                    {ENTRY_LIST_STYLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.id} value={opt.id} className="text-xs">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>

  )
}
