"use client"

import { cn } from "@/lib/utils"
import { knowledgeBaseIconForTitle } from "@/components/mind-v2/knowledge-base-icon"
import type { LibraryCoverVariant } from "@/lib/product-media"
import type { PlazaCoverThemeId } from "@/lib/plaza-cover-themes"

/**
 * Plaza — unified icon tile (no per-library gradient backgrounds).
 * Icon is inferred from the title for scannability only.
 */
export function PlazaLibraryCover({
  title,
  className,
  size = "md",
  kbId: _kbId,
  coverVariant: _coverVariant,
  coverTheme: _coverTheme,
}: {
  title: string
  kbId?: number
  coverVariant?: LibraryCoverVariant
  coverTheme?: PlazaCoverThemeId
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const Icon = knowledgeBaseIconForTitle(title)
  const iconWrap =
    size === "lg" ? "h-11 w-11 rounded-xl" : size === "sm" ? "h-8 w-8 rounded-lg" : "h-9 w-9 rounded-xl"
  const iconSize =
    size === "lg" ? "h-5 w-5" : size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]"

  return (
    <div
      className={cn("flex h-full w-full items-center justify-center bg-transparent", className)}
      aria-hidden
    >
      <span
        className={cn(
          "flex items-center justify-center bg-mind/[0.08] text-mind ring-1 ring-mind/15",
          iconWrap
        )}
      >
        <Icon className={iconSize} strokeWidth={1.75} />
      </span>
    </div>
  )
}
