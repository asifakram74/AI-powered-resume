import { useEffect, useMemo, useRef, useState } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

type Option = {
  id: string
  name: string
  meta?: Record<string, any>
}

type AutocompleteProps = {
  label?: string
  placeholder?: string
  minChars: number
  maxHeight?: number
  fetchOptions: (query: string) => Promise<Option[]>
  onSelect: (option: Option) => void
  onAddCustom?: (query: string) => void
  ariaLabel: string
  sessionKey: string
  clearOnSelect?: boolean
  initialValue?: string
}

export function Autocomplete({
  label,
  placeholder,
  minChars,
  maxHeight = 320,
  fetchOptions,
  onSelect,
  onAddCustom,
  ariaLabel,
  sessionKey,
  clearOnSelect = false,
  initialValue,
}: AutocompleteProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Option[]>([])
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listboxId = useMemo(() => `ac-list-${sessionKey}`, [sessionKey])
  const liveId = useMemo(() => `ac-live-${sessionKey}`, [sessionKey])
  const itemHeight = 36

  useEffect(() => {
    if (initialValue && query === "") {
      setQuery(initialValue)
    }
  }, [initialValue])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return
      const target = e.target as Node
      if (!containerRef.current.contains(target)) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    const t = setTimeout(async () => {
      const trimmed = query.trim()
      if (trimmed.length < minChars) {
        setSuggestions([])
        setIsOpen(false)
        setLoading(false)
        setError(null)
        return
      }
      setLoading(true)
      setError(null)
      const cacheKey = `${sessionKey}:${trimmed}`
      try {
        const cached = typeof window !== "undefined" ? window.sessionStorage.getItem(cacheKey) : null
        if (cached) {
          const parsed: Option[] = JSON.parse(cached)
          setSuggestions(parsed)
          setIsOpen(parsed.length > 0)
          setActiveIndex(parsed.length > 0 ? 0 : -1)
          setLoading(false)
          return
        }
        const result = await fetchOptions(trimmed)
        const top = result.slice(0, 50)
        setSuggestions(top)
        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.setItem(cacheKey, JSON.stringify(top))
          } catch {}
        }
        setIsOpen(top.length > 0)
        setActiveIndex(top.length > 0 ? 0 : -1)
      } catch (e: any) {
        setError(e?.message || "Failed to fetch suggestions")
        setSuggestions([])
        setIsOpen(false)
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => clearTimeout(t)
  }, [query, minChars, fetchOptions, sessionKey])

  const totalHeight = suggestions.length * itemHeight
  const visibleCount = Math.ceil(maxHeight / itemHeight) + 4
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2)
  const endIndex = Math.min(suggestions.length, startIndex + visibleCount)
  const visibleItems = suggestions.slice(startIndex, endIndex)
  const topSpacer = startIndex * itemHeight
  const bottomSpacer = totalHeight - topSpacer - visibleItems.length * itemHeight

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true)
      }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      const next = Math.min(suggestions.length - 1, activeIndex + 1)
      setActiveIndex(next)
      const neededTop = next * itemHeight
      const neededBottom = neededTop + itemHeight
      const currentTop = scrollTop
      const currentBottom = scrollTop + maxHeight
      if (neededBottom > currentBottom) {
        const newTop = neededBottom - maxHeight
        setScrollTop(newTop)
        if (containerRef.current) containerRef.current.scrollTop = newTop
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      const prev = Math.max(0, activeIndex - 1)
      setActiveIndex(prev)
      const neededTop = prev * itemHeight
      if (neededTop < scrollTop) {
        setScrollTop(neededTop)
        if (containerRef.current) containerRef.current.scrollTop = neededTop
      }
    } else if (e.key === "Enter") {
      e.preventDefault()
      const option = suggestions[activeIndex]
      if (option) {
        onSelect(option)
        setIsOpen(false)
        setQuery(clearOnSelect ? "" : option.name)
        setSuggestions([])
        setActiveIndex(-1)
        if (inputRef.current) inputRef.current.blur()
      } else if (onAddCustom && query.trim().length >= minChars) {
        onAddCustom(query.trim())
        setIsOpen(false)
        setQuery("")
        setSuggestions([])
        setActiveIndex(-1)
        if (inputRef.current) inputRef.current.blur()
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  const highlight = (text: string, q: string) => {
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text
    const before = text.slice(0, idx)
    const match = text.slice(idx, idx + q.length)
    const after = text.slice(idx + q.length)
    return (
      <span>
        {before}
        <mark className="bg-yellow-200 dark:bg-yellow-600">{match}</mark>
        {after}
      </span>
    )
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {label ? <div className="mb-1 text-sm font-medium">{label}</div> : null}
      <Input
        ref={inputRef}
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        onKeyDown={onKeyDown}
        className="ring-2 ring-transparent focus:ring-2 focus:ring-blue-600"
      />
      <div id={liveId} aria-live="polite" className="sr-only">
        {loading ? "Loading" : `${suggestions.length} suggestions`}
      </div>
      {isOpen && (
        <div
          role="listbox"
          id={listboxId}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined}
          className="absolute z-50 mt-1 w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md shadow-lg"
          style={{ maxHeight, overflowY: "auto" }}
          onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
        >
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">Loading...</div>
          )}
          {error && !loading && (
            <div className="px-3 py-2 text-sm text-red-600">{error}</div>
          )}
          {!loading && !error && suggestions.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">No results</div>
          )}
          {!loading && !error && suggestions.length > 0 && (
            <div style={{ height: totalHeight + "px", position: "relative" }}>
              <div style={{ position: "absolute", top: topSpacer + "px", left: 0, right: 0 }}>
                {visibleItems.map((opt, i) => {
                  const realIndex = startIndex + i
                  const isActive = realIndex === activeIndex
                  return (
                    <div
                      key={opt.id}
                      id={`${listboxId}-opt-${realIndex}`}
                      role="option"
                      aria-selected={isActive}
                      className={`px-3 h-9 flex items-center cursor-pointer ${
                        isActive ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-100" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      onMouseEnter={() => setActiveIndex(realIndex)}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onSelect(opt)
                        setIsOpen(false)
                        setQuery(clearOnSelect ? "" : opt.name)
                        setSuggestions([])
                        setActiveIndex(-1)
                      }}
                    >
                      <div className="flex-1 text-sm">
                        {highlight(opt.name, query)}
                      </div>
                      {opt.meta?.subtitle ? (
                        <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">{opt.meta.subtitle}</div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {onAddCustom && (
            <div className="border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start px-3 h-9"
                onClick={() => {
                  if (query.trim().length >= minChars) {
                    onAddCustom(query.trim())
                    setIsOpen(false)
                    setQuery("")
                    setSuggestions([])
                    setActiveIndex(-1)
                  }
                }}
              >
                + Add custom
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
