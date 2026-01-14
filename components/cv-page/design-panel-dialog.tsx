import React, { useMemo, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Check, Minus, Plus, RotateCcw } from "lucide-react"
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
} from "../../types/cv-data"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: CVStyleSettings
  onChange: (next: CVStyleSettings) => void
  onReset: () => void
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-none border border-[rgba(45,54,57,0.12)] bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-foreground mb-3">{title}</div>
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
    <div className="inline-flex rounded-none border border-[rgba(45,54,57,0.14)] bg-[rgba(45,54,57,0.04)] p-1 gap-1">
      {options.map((opt) => {
        const active = opt.id === value
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1.5 text-xs rounded-none transition-colors ${
              active
                ? "bg-[var(--resumaic-green)] text-[var(--resumaic-dark-gray)]"
                : "text-[rgba(45,54,57,0.7)] hover:bg-[rgba(112,228,168,0.18)] hover:text-[var(--resumaic-dark-gray)]"
            }`}
          >
            {active ? (
              <span className="inline-flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
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
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-2">
      <div
        className={`grid place-items-center size-14 rounded-none border transition-colors ${
          active
            ? "border-[rgba(112,228,168,0.9)] bg-[rgba(112,228,168,0.18)]"
            : "border-[rgba(45,54,57,0.16)] bg-white"
        }`}
      >
        {icon}
      </div>
      <div className={`text-xs ${active ? "text-[var(--resumaic-dark-gray)]" : "text-[rgba(45,54,57,0.65)]"}`}>{label}</div>
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
    <button type="button" onClick={onClick} className="relative size-9 rounded-none">
      <span className="absolute inset-0 rounded-none border border-[rgba(45,54,57,0.16)]" style={{ background: color }} />
      {selected ? (
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid place-items-center size-6 rounded-none bg-white/80 backdrop-blur-sm">
            <Check className="h-4 w-4 text-[var(--resumaic-dark-gray)]" />
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
    <button type="button" onClick={onToggle} className="flex items-center gap-2 text-sm text-[var(--resumaic-dark-gray)]">
      <span
        className={`grid place-items-center size-5 rounded-none border transition-colors ${
          checked
            ? "border-[rgba(112,228,168,0.9)] bg-[rgba(112,228,168,0.18)]"
            : "border-[rgba(45,54,57,0.16)] bg-white"
        }`}
      >
        {checked ? <Check className="h-4 w-4 text-[var(--resumaic-dark-gray)]" /> : null}
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
  
  // Calculate which segment the current value belongs to (0 to segments-1)
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
    // Round to step
    const steppedValue = Math.round(newValue / step) * step
    onChange(Number(steppedValue.toFixed(4)))
  }

  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 items-center">
      <div className="text-sm font-medium text-[var(--resumaic-dark-gray)]">{label}</div>
      <div className="text-sm text-[rgba(45,54,57,0.65)] tabular-nums">{valueLabel}</div>

      <div 
        className="relative col-span-1 h-11 border border-[rgba(45,54,57,0.10)] bg-[rgba(45,54,57,0.04)] overflow-hidden cursor-pointer group rounded-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
        onClick={handleClick}
      >
        {/* Vertical Dividers */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: segments - 1 }).map((_, i) => (
            <div 
              key={i} 
              className="h-full border-r border-[rgba(45,54,57,0.1)]" 
              style={{ width: `${100 / segments}%` }} 
            />
          ))}
        </div>

        {/* Hover Indicator */}
        {hoverIndex !== null && hoverIndex !== segmentIndex && (
          <div
            className="absolute top-0 bottom-0 bg-[rgba(112,228,168,0.15)] transition-all duration-150"
            style={{ 
              left: `${(hoverIndex * 100) / segments}%`,
              width: `${100 / segments}%`
            }}
          />
        )}

        {/* Active Indicator */}
        <div
          className="absolute top-1.5 bottom-1.5 transition-all duration-200 shadow-sm rounded-none"
          style={{ 
            left: `calc(${(segmentIndex * 100) / segments}% + 6px)`,
            width: `calc(${100 / segments}% - 12px)`,
            background: 'linear-gradient(135deg, #70e4a8 0%, #4ade80 100%)'
          }}
        />
      </div>

      <div className="col-span-1 flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onMinus}
          className="size-11 rounded-none border-[rgba(45,54,57,0.18)] bg-white text-[var(--resumaic-dark-gray)] hover:bg-[rgba(112,228,168,0.18)] hover:border-[rgba(112,228,168,0.6)]"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onPlus}
          className="size-11 rounded-none border-[rgba(45,54,57,0.18)] bg-white text-[var(--resumaic-dark-gray)] hover:bg-[rgba(112,228,168,0.18)] hover:border-[rgba(112,228,168,0.6)]"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function DesignPanelDialog({ open, onOpenChange, value, onChange, onReset }: Props) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
<DialogContent className="fixed top-0 bottom-0 left-0 h-[100dvh]
w-screen sm:w-[62.4vw] md:w-[59.8vw] lg:w-[57.2vw] xl:w-[50.7vw] 2xl:w-[44.2vw]
max-w-none sm:max-w-none translate-x-0 translate-y-0 p-0 gap-0 rounded-none
border-none data-[state=closed]:-translate-x-full
data-[state=open]:translate-x-0 transition-transform duration-300
overflow-y-auto overflow-x-hidden custom-scrollbar bg-white text-[var(--resumaic-dark-gray)] shadow-2xl">


        <div className="flex flex-col h-full">
          <div className="px-6 py-5 bg-white border-b border-[rgba(45,54,57,0.12)]">
            <div className="flex items-start justify-between gap-4 pr-10">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-bold text-[var(--resumaic-dark-gray)]">
                  Design
                </DialogTitle>
                <div className="text-sm text-[rgba(45,54,57,0.65)]">
                  Customize fonts, sizes, colors, and icons
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  className="flex items-center gap-2 border-[rgba(45,54,57,0.18)] bg-white text-[var(--resumaic-dark-gray)] hover:bg-[rgba(112,228,168,0.18)] hover:border-[rgba(112,228,168,0.6)]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Default
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-[rgba(112,228,168,0.05)]">
            <div className="px-6 py-6 space-y-6">
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
                </div>
              </Section>

              <Section title="Colors">
                <div className="space-y-5">
                  <div className="flex items-start justify-between">
                    <ModeButton
                      active={!showBorderPanel && value.colorMode === "basic"}
                      label="Basic"
                      onClick={() => {
                        setShowBorderPanel(false)
                        set({ colorMode: "basic" })
                      }}
                      icon={<span className="size-8 rounded-none border-2 border-[rgba(112,228,168,0.9)]" />}
                    />
                    <ModeButton
                      active={!showBorderPanel && value.colorMode === "advanced"}
                      label="Advanced"
                      onClick={() => {
                        setShowBorderPanel(false)
                        set({ colorMode: "advanced" })
                      }}
                      icon={
                        <span className="size-8 rounded-none border border-[rgba(45,54,57,0.16)] overflow-hidden">
                          <span className="block h-1/2 bg-[rgba(45,54,57,0.10)]" />
                          <span className="block h-1/2 bg-white" />
                        </span>
                      }
                    />
                    <ModeButton
                      active={showBorderPanel}
                      label="Border"
                      onClick={() => setShowBorderPanel(true)}
                      icon={
                        <span className="size-8 rounded-none border-[6px] border-[rgba(45,54,57,0.22)] bg-white" />
                      }
                    />
                  </div>

                  {!showBorderPanel ? (
                    <>
                      <div className="grid grid-cols-3 gap-3">
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
                              className={`rounded-none border p-3 text-left transition-colors ${
                                active
                                  ? "border-[rgba(112,228,168,0.9)] bg-[rgba(112,228,168,0.18)]"
                                  : "border-[rgba(45,54,57,0.16)] bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium text-foreground">{opt.label}</div>
                                {active ? <Check className="h-4 w-4 text-[var(--resumaic-dark-gray)]" /> : null}
                              </div>
                              <div className="mt-2 h-10 rounded-none bg-[rgba(45,54,57,0.08)]" />
                            </button>
                          )
                        })}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {accentPalette.map((c) => (
                          <Swatch key={c} color={c} selected={c.toLowerCase() === value.accentColor.toLowerCase()} onClick={() => set({ accentColor: c })} />
                        ))}
                        <label className="relative size-9 rounded-none cursor-pointer">
                          <span className="absolute inset-0 rounded-none border border-border bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500" />
                          <input
                            type="color"
                            value={value.accentColor}
                            onChange={(e) => updateColor("accentColor", e.target.value)}
                            className="absolute inset-0 size-full opacity-0 cursor-pointer"
                          />
                        </label>
                      </div>

                      <div className="space-y-3">
                        <div className="text-xs font-semibold text-[rgba(45,54,57,0.6)] uppercase tracking-wide">
                          Apply accent color
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <Label className="text-sm">Border Mode</Label>
                        <Segmented value={value.borderMode} options={BORDER_MODE_OPTIONS} onChange={(v) => set({ borderMode: v })} />
                      </div>

                      <div className="flex items-end gap-3">
                        <div className="grow space-y-1.5">
                          <Label>Border color</Label>
                          <Input
                            value={value.borderColor}
                            onChange={(e) => {
                              const normalized = normalizeHex(e.target.value)
                              if (normalized) set({ borderColor: normalized })
                            }}
                            placeholder="#1f2937"
                            className="bg-white border-[rgba(45,54,57,0.16)] text-[var(--resumaic-dark-gray)]"
                          />
                        </div>
                        <input
                          type="color"
                          value={value.borderColor}
                          onChange={(e) => updateColor("borderColor" as any, e.target.value)}
                          className="h-9 w-12 rounded-none border border-[rgba(45,54,57,0.16)] bg-white p-1"
                        />
                      </div>

                      {value.borderMode === "image" ? (
                        <div className="space-y-2">
                          <Label>Background image URL</Label>
                          <Input
                            value={value.backgroundImageUrl}
                            onChange={(e) => set({ backgroundImageUrl: e.target.value })}
                            placeholder="https://..."
                            className="bg-white border-[rgba(45,54,57,0.16)] text-[var(--resumaic-dark-gray)]"
                          />
                        </div>
                      ) : null}
                    </div>
                  )}

                  {showAdvancedColors ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {([
                        ["textColor", "Text"],
                        ["headingColor", "Headings"],
                        ["mutedColor", "Muted"],
                        ["backgroundColor", "Background"],
                      ] as const).map(([key, label]) => (
                        <div key={key} className="flex items-end gap-3">
                          <div className="grow space-y-1.5">
                            <Label>{label}</Label>
                            <Input
                              value={(value as any)[key]}
                              onChange={(e) => {
                                const normalized = normalizeHex(e.target.value)
                                if (normalized) set({ [key]: normalized } as any)
                              }}
                              placeholder="#000000"
                              className="bg-white border-[rgba(45,54,57,0.16)] text-[var(--resumaic-dark-gray)]"
                            />
                          </div>
                          <input
                            type="color"
                            value={(value as any)[key]}
                            onChange={(e) => updateColor(key as any, e.target.value)}
                            className="h-9 w-12 rounded-none border border-[rgba(45,54,57,0.16)] bg-white p-1"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="inline-flex rounded-none border border-[rgba(45,54,57,0.14)] bg-[rgba(45,54,57,0.04)] p-1 gap-1">
                      {(["body", "heading"] as const).map((t) => {
                        const active = t === fontTarget
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFontTarget(t)}
                            className={`px-3 py-1.5 text-xs rounded-none transition-colors ${
                              active
                                ? "bg-[var(--resumaic-green)] text-[var(--resumaic-dark-gray)]"
                                : "text-[rgba(45,54,57,0.7)] hover:bg-[rgba(112,228,168,0.18)] hover:text-[var(--resumaic-dark-gray)]"
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

                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { id: "serif" as const, label: "Serif" },
                      { id: "sans" as const, label: "Sans" },
                      { id: "mono" as const, label: "Mono" },
                    ] as const).map((c) => {
                      const active = c.id === fontCategory
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setFontCategory(c.id)}
                          className={`rounded-none border p-4 text-center transition-colors ${
                            active
                              ? "border-[rgba(112,228,168,0.9)] bg-[rgba(112,228,168,0.18)]"
                              : "border-[rgba(45,54,57,0.16)] bg-white"
                          }`}
                        >
                          <div className={`text-3xl leading-none ${active ? "text-[var(--resumaic-dark-gray)]" : "text-foreground"}`}>Aa</div>
                          <div className="mt-1 text-xs text-[rgba(45,54,57,0.6)]">{c.label}</div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {visibleFonts.map((opt) => {
                      const active = opt.id === activeFontFamily
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFontFamily(opt.id)}
                          className={`rounded-none border px-3 py-2 text-sm transition-colors ${
                            active
                              ? "border-[rgba(112,228,168,0.9)] bg-[rgba(112,228,168,0.18)] text-[var(--resumaic-dark-gray)]"
                              : "border-[rgba(45,54,57,0.16)] bg-white text-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <RangeControl
                      label="Headings size"
                      valueLabel={`${value.headingFontSizePx}px`}
                      value={value.headingFontSizePx}
                      min={14}
                      max={26}
                      step={1}
                      onChange={(next) => set({ headingFontSizePx: clampNumber(next, 14, 26) })}
                    />
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-sm">Capitalization</Label>
                      <Segmented value={value.capitalization} options={CAPITALIZATION_OPTIONS} onChange={(v) => set({ capitalization: v })} />
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Section Headings">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <Label className="text-sm">Headings line</Label>
                    <Segmented
                      value={value.headingsLine ? ("on" as const) : ("off" as const)}
                      options={[
                        { id: "on", label: "On" },
                        { id: "off", label: "Off" },
                      ]}
                      onChange={(v) => set({ headingsLine: v === "on" })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Section header icon</Label>
                      <Select
                        value={value.sectionHeaderIconStyle}
                        onValueChange={(v) => set({ sectionHeaderIconStyle: v as CVSectionHeaderIconStyle })}
                      >
                        <SelectTrigger className="w-full bg-white border-[rgba(45,54,57,0.16)] text-[var(--resumaic-dark-gray)]">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-[var(--resumaic-dark-gray)] border-[rgba(45,54,57,0.16)]">
                          {SECTION_ICON_OPTIONS.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Dots / Bars / Bubbles</Label>
                      <Select value={value.dotsBarsBubbles} onValueChange={(v) => set({ dotsBarsBubbles: v as CVDotsBarsBubbles })}>
                        <SelectTrigger className="w-full bg-white border-[rgba(45,54,57,0.16)] text-[var(--resumaic-dark-gray)]">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-[var(--resumaic-dark-gray)] border-[rgba(45,54,57,0.16)]">
                          {DOTS_BARS_BUBBLES_OPTIONS.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Description indentation ({value.descriptionIndentPx}px)</Label>
                      <input
                        className="w-full accent-[var(--resumaic-green)]"
                        type="range"
                        min={0}
                        max={32}
                        step={1}
                        value={value.descriptionIndentPx}
                        onChange={(e) => set({ descriptionIndentPx: clampNumber(Number(e.target.value), 0, 32) })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>List style</Label>
                      <Select value={value.entryListStyle} onValueChange={(v) => set({ entryListStyle: v as CVEntryListStyle })}>
                        <SelectTrigger className="w-full bg-white border-[rgba(45,54,57,0.16)] text-[var(--resumaic-dark-gray)]">
                          <SelectValue placeholder="Select list style" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-[var(--resumaic-dark-gray)] border-[rgba(45,54,57,0.16)]">
                          {ENTRY_LIST_STYLE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Personal Details">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <Label className="text-sm">Align</Label>
                    <Segmented value={value.align} options={ALIGN_OPTIONS} onChange={(v) => set({ align: v })} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Header icons</Label>
                      <Select value={value.headerIcons} onValueChange={(v) => set({ headerIcons: v as CVIconFill })}>
                        <SelectTrigger className="w-full bg-white border-[rgba(45,54,57,0.16)] text-[var(--resumaic-dark-gray)]">
                          <SelectValue placeholder="Select icon style" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-[var(--resumaic-dark-gray)] border-[rgba(45,54,57,0.16)]">
                          {ICON_FILL_OPTIONS.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Link icons</Label>
                      <Select value={value.linkIcons} onValueChange={(v) => set({ linkIcons: v as CVIconFill })}>
                        <SelectTrigger className="w-full bg-white border-[rgba(45,54,57,0.16)] text-[var(--resumaic-dark-gray)]">
                          <SelectValue placeholder="Select icon style" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-[var(--resumaic-dark-gray)] border-[rgba(45,54,57,0.16)]">
                          {ICON_FILL_OPTIONS.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Icon frame</Label>
                      <Select value={value.iconFrame} onValueChange={(v) => set({ iconFrame: v as CVIconFrame })}>
                        <SelectTrigger className="w-full bg-white border-[rgba(45,54,57,0.16)] text-[var(--resumaic-dark-gray)]">
                          <SelectValue placeholder="Select frame" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-[var(--resumaic-dark-gray)] border-[rgba(45,54,57,0.16)]">
                          {ICON_FRAME_OPTIONS.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Icon size</Label>
                      <Select value={value.iconSize} onValueChange={(v) => set({ iconSize: v as CVIconSize })}>
                        <SelectTrigger className="w-full bg-white border-[rgba(45,54,57,0.16)] text-[var(--resumaic-dark-gray)]">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent className="bg-white text-[var(--resumaic-dark-gray)] border-[rgba(45,54,57,0.16)]">
                          {ICON_SIZE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.id} value={opt.id}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Name">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm">Name bold</Label>
                  <Segmented
                    value={value.nameBold ? ("on" as const) : ("off" as const)}
                    options={[
                      { id: "on", label: "On" },
                      { id: "off", label: "Off" },
                    ]}
                    onChange={(v) => set({ nameBold: v === "on" })}
                  />
                </div>
              </Section>

              <Section title="Footer">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between gap-4 rounded-none border border-[rgba(45,54,57,0.12)] bg-[rgba(45,54,57,0.03)] px-3 py-2">
                    <Label className="text-sm">Page numbers</Label>
                    <Segmented
                      value={value.showPageNumbers ? ("on" as const) : ("off" as const)}
                      options={[
                        { id: "on", label: "On" },
                        { id: "off", label: "Off" },
                      ]}
                      onChange={(v) => set({ showPageNumbers: v === "on" })}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-none border border-[rgba(45,54,57,0.12)] bg-[rgba(45,54,57,0.03)] px-3 py-2">
                    <Label className="text-sm">Email</Label>
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
              </Section>

              <Section title="Icons">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Bullets</Label>
                    <Select value={value.bulletStyle} onValueChange={(v) => set({ bulletStyle: v as CVBulletStyle })}>
                      <SelectTrigger className="w-full bg-white border-[rgba(45,54,57,0.16)] text-[var(--resumaic-dark-gray)]">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-[var(--resumaic-dark-gray)] border-[rgba(45,54,57,0.16)]">
                        {BULLET_OPTIONS.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>List bullets</Label>
                    <Select value={value.entryListStyle} onValueChange={(v) => set({ entryListStyle: v as CVEntryListStyle })}>
                      <SelectTrigger className="w-full bg-white border-[rgba(45,54,57,0.16)] text-[var(--resumaic-dark-gray)]">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-[var(--resumaic-dark-gray)] border-[rgba(45,54,57,0.16)]">
                        {ENTRY_LIST_STYLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
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
      </DialogContent>
    </Dialog>
  )
}
