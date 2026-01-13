"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { Moon, Sun } from "lucide-react"
import { Button } from "./ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Hide on dashboard pages where sidebar toggle is available
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/create-cv")) {
    return null
  }

  const isDark = theme === "dark"

  return (
    <div className="fixed right-4 top-4 z-50">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {isDark ? <Sun /> : <Moon />}
      </Button>
    </div>
  )
}

