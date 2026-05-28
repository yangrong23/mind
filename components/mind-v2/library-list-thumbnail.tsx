"use client"

import { cn } from "@/lib/utils"
import { LibraryCoverFromKb } from "@/components/mind-v2/library-cover"
import { kbColorBlockClass, kbCoverVisual, kbHasRichCover } from "@/lib/kb-list-visual"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"

/** List/grid thumbnail — full cover when branded; otherwise color block + small domain icon */
export function LibraryListThumbnail({
  kb,
  className,
  size = "md",
}: {
  kb: KnowledgeBase
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const box =
    size === "sm" ? "h-6 w-6 rounded-md" : size === "lg" ? "h-11 w-11 rounded-lg" : "h-10 w-10 rounded-lg"

  if (kbHasRichCover(kb)) {
    return (
      <div className={cn("shrink-0 overflow-hidden ring-1 ring-black/[0.06]", box, className)}>
        <LibraryCoverFromKb kb={kb} showMiniUi={false} className="h-full w-full" />
      </div>
    )
  }

  const visual = kbCoverVisual(kb)
  const Icon = visual.icon
  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden ring-1 ring-black/[0.08]",
        kbColorBlockClass(kb),
        box,
        className
      )}
      title={visual.label}
    >
      <div className={cn("absolute inset-0 opacity-40", `bg-gradient-to-tr ${visual.glow}`)} aria-hidden />
      <div className="relative flex h-full w-full items-center justify-center">
        <Icon className={cn(iconSize, "text-white/90 drop-shadow-sm")} strokeWidth={2} aria-hidden />
      </div>
    </div>
  )
}
