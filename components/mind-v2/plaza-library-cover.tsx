"use client"

import { cn } from "@/lib/utils"
import {
  PLAZA_COVER_THEMES,
  plazaCoverThemeForKb,
  type PlazaCoverThemeId,
} from "@/lib/plaza-cover-themes"
import { LibraryCoverArt } from "@/components/mind-v2/mind-media-art"
import type { LibraryCoverVariant } from "@/lib/product-media"

/** Plaza card cover — title-correlated theme when available */
export function PlazaLibraryCover({
  title,
  kbId,
  coverVariant,
  coverTheme,
  className,
  size = "md",
}: {
  title: string
  kbId?: number
  coverVariant?: LibraryCoverVariant
  coverTheme?: PlazaCoverThemeId
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const themeId = coverTheme ?? (kbId != null ? plazaCoverThemeForKb(kbId) : undefined)
  const theme = themeId ? PLAZA_COVER_THEMES[themeId] : null
  const Icon = theme?.icon

  if (!theme || !Icon) {
    return (
      <LibraryCoverArt
        variant={coverVariant ?? "default"}
        name={title}
        className={className}
        showMiniUi={false}
      />
    )
  }

  const iconBox =
    size === "lg" ? "h-11 w-11" : size === "sm" ? "h-8 w-8" : "h-10 w-10"
  const iconSize = size === "lg" ? "h-5 w-5" : size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]"

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-br text-white",
        theme.gradient,
        className
      )}
      aria-hidden
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", theme.glow)} />
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "10px 10px",
        }}
      />
      <div className="relative flex flex-1 flex-col justify-between p-2.5">
        <div className="flex items-start justify-between gap-1">
          <span
            className={cn(
              "flex items-center justify-center rounded-xl bg-white/15 shadow-inner ring-1 ring-white/25 backdrop-blur-sm",
              iconBox
            )}
          >
            <Icon className={cn(iconSize, "text-white/95")} strokeWidth={1.85} />
          </span>
          <span className="rounded-md bg-black/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
            {theme.shortLabel}
          </span>
        </div>
        <div className="space-y-0.5">
          <p className="text-[9px] font-medium uppercase tracking-wider text-white/60">{theme.motif}</p>
          <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-white/95 drop-shadow-sm">
            {title}
          </p>
        </div>
      </div>
    </div>
  )
}
