"use client"

import { MINDAR_LOGO_ALT, MINDAR_LOGO_SRC } from "@/lib/mindar-logo"
import { cn } from "@/lib/utils"

/** Wordmark aspect ratio (source asset 1024×445). */
const LOGO_ASPECT = 1024 / 445

type MindarLogoProps = {
  className?: string
  /** Rendered height in px; width follows aspect ratio */
  height?: number
  priority?: boolean
}

/** Official Mindar horizontal wordmark */
export function MindarLogo({ className, height = 32, priority }: MindarLogoProps) {
  const w = Math.round(height * LOGO_ASPECT)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={MINDAR_LOGO_SRC}
      alt={MINDAR_LOGO_ALT}
      width={w}
      height={height}
      className={cn("h-auto w-auto max-w-full object-contain object-center", className)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  )
}

type MindarLogoMarkProps = {
  className?: string
  /** Layout box height in px — wordmark scales inside */
  size?: number
  priority?: boolean
}

/** Compact wordmark for rails, agent avatar slots (same asset as MindarLogo). */
export function MindarLogoMark({ className, size = 44, priority }: MindarLogoMarkProps) {
  const height = Math.max(18, Math.round(size * 0.38))
  return <MindarLogo height={height} priority={priority} className={cn("shrink-0", className)} />
}
