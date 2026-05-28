"use client"

import { LibraryCoverArt } from "@/components/mind-v2/mind-media-art"
import { PlazaLibraryCover } from "@/components/mind-v2/plaza-library-cover"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { plazaCoverThemeForKb } from "@/lib/plaza-cover-themes"
import { libraryCoverVariantForId, type LibraryCoverVariant } from "@/lib/product-media"
import { cn } from "@/lib/utils"

export function LibraryCover({
  name,
  coverVariant,
  id,
  className,
  showMiniUi = false,
}: {
  name: string
  coverVariant?: LibraryCoverVariant
  id?: number
  className?: string
  showMiniUi?: boolean
}) {
  const variant =
    coverVariant ?? (id != null ? libraryCoverVariantForId(id, name) : "default")
  return (
    <LibraryCoverArt
      variant={variant}
      name={name}
      className={cn("h-full w-full", className)}
      showMiniUi={showMiniUi}
    />
  )
}

/** Red update badge — top-right of subscribed library cover (reference: 订阅知识库) */
export function KbContentUpdateDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute right-0 top-0 z-[1] h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-900",
        className
      )}
      title="New content"
      aria-label="New content"
    />
  )
}

export function LibraryCoverWithUpdateBadge({
  kb,
  hasUpdate,
  className,
  coverClassName,
}: {
  kb: Pick<KnowledgeBase, "id" | "name" | "coverVariant">
  hasUpdate?: boolean
  className?: string
  coverClassName?: string
}) {
  return (
    <div className={cn("relative shrink-0", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-lg ring-1 ring-black/[0.06] dark:ring-white/10",
          coverClassName ?? "h-8 w-8"
        )}
      >
        <LibraryCoverFromKb kb={kb} showMiniUi={false} className="h-full w-full" />
      </div>
      {hasUpdate ? <KbContentUpdateDot className="-translate-y-px translate-x-px" /> : null}
    </div>
  )
}

export function LibraryCoverFromKb({
  kb,
  className,
  showMiniUi,
  size = "sm",
}: {
  kb: Pick<KnowledgeBase, "id" | "name" | "coverVariant">
  className?: string
  showMiniUi?: boolean
  size?: "sm" | "md" | "lg"
}) {
  if (plazaCoverThemeForKb(kb.id)) {
    return (
      <PlazaLibraryCover
        title={kb.name}
        kbId={kb.id}
        coverVariant={kb.coverVariant}
        className={className}
        size={showMiniUi ? "lg" : size}
      />
    )
  }
  return (
    <LibraryCover
      id={kb.id}
      name={kb.name}
      coverVariant={kb.coverVariant}
      className={className}
      showMiniUi={showMiniUi}
    />
  )
}
