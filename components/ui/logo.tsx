"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import Image from "next/image"

interface LogoProps {
  width?: number
  height?: number
  className?: string
  alt?: string
}

export function Logo({ width = 200, height = 90, className = "", alt = "Resumaic Logo" }: LogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // During server-side rendering or before hydration, we can't know the theme.
  // We default to the light logo (Resumic.png) which matches the previous behavior.
  // You might want to suppress hydration warning if this causes issues, 
  // but returning the same structure usually helps.
  const src = mounted && resolvedTheme === "dark" ? "/Resumic_dark.png" : "/Resumic.png"

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
