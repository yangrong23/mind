"use client"

import { Pin } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavListItem } from "@/components/mind-v2/web-nav-selection"
import { SwipeableKbRow } from "@/components/mind-v2/swipeable-kb-row"
import { KbContentUpdateDot } from "@/components/mind-v2/library-cover"
import { LibraryListThumbnail } from "@/components/mind-v2/library-list-thumbnail"
import { KbListMetaBadges } from "@/components/mind-v2/library-kb-badges"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { isKbPinned } from "@/lib/web-pinned-kbs"

type WebKbSidebarRowProps = {
  kb: KnowledgeBase
  displayKb: KnowledgeBase
  active: boolean
  itemCount: number
  pinnedKbIds: number[]
  onTogglePin: (kbId: number) => void
  onSelect: () => void
  layout?: "recent" | "following" | "default"
}

export function WebKbSidebarRow({
  kb,
  displayKb,
  active,
  itemCount,
  pinnedKbIds,
  onTogglePin,
  onSelect,
  layout = "default",
}: WebKbSidebarRowProps) {
  const pinned = isKbPinned(kb.id, pinnedKbIds)
  const isFollowing = layout === "following"

  return (
    <SwipeableKbRow
      isPinned={pinned}
      onTogglePin={() => onTogglePin(kb.id)}
      kbName={displayKb.name}
    >
      <button
        type="button"
        onClick={onSelect}
        className={webNavListItem(active, {
          className: cn(
            "flex w-full items-center gap-2 text-left text-[13px] font-medium",
            isFollowing ? "gap-2.5 px-2 py-2" : "gap-2 px-2.5 py-2"
          ),
        })}
      >
        <div className="relative shrink-0">
          <LibraryListThumbnail kb={displayKb} size="sm" />
          {isFollowing && kb.hasContentUpdate ? (
            <KbContentUpdateDot className="-translate-y-px translate-x-px" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1">
            <span className="truncate text-zinc-700">{displayKb.name}</span>
            {pinned ? (
              <Pin className="h-3 w-3 shrink-0 text-mind" strokeWidth={2} aria-label="Pinned" />
            ) : null}
            <KbListMetaBadges kb={displayKb} />
          </span>
          {isFollowing ? (
            <span className="mt-0.5 block truncate text-[10px] tabular-nums text-zinc-400">
              Updated {kb.lastUpdate}
            </span>
          ) : (
            <span
              className={cn(
                "mt-0.5 block text-[10px] tabular-nums",
                active ? web.navItemActiveCount : "text-zinc-400"
              )}
            >
              {itemCount} items
            </span>
          )}
        </div>
      </button>
    </SwipeableKbRow>
  )
}
