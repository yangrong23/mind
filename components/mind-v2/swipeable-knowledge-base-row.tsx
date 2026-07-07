"use client"

import { useRef, useState } from "react"
import { Pin, PinOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { LibraryCoverFromKb, LibraryCoverWithUpdateBadge } from "@/components/mind-v2/library-cover"

const PIN_STRIP_PX = 88
const PIN_REVEAL_THRESHOLD = 40

export function SwipeableKnowledgeBaseRow({
  kb,
  pinned,
  onTogglePin,
  onOpen,
  isRail = false,
  selected = false,
  showTeamBadge = false,
  showPublisherMeta = false,
}: {
  kb: KnowledgeBase
  pinned: boolean
  onTogglePin: () => void
  onOpen: () => void
  isRail?: boolean
  selected?: boolean
  showTeamBadge?: boolean
  showPublisherMeta?: boolean
}) {
  const startX = useRef(0)
  const startDx = useRef(0)
  const [dx, setDx] = useState(0)
  const dragging = useRef(false)

  const snapOpen = () => setDx(-PIN_STRIP_PX)
  const snapClosed = () => setDx(0)

  const onStart = (clientX: number) => {
    startX.current = clientX
    startDx.current = dx
    dragging.current = true
  }
  const onMove = (clientX: number) => {
    if (!dragging.current) return
    const next = startDx.current + (clientX - startX.current)
    setDx(Math.max(-PIN_STRIP_PX, Math.min(48, next)))
  }
  const onEnd = () => {
    dragging.current = false
    if (dx > 24) {
      snapClosed()
      return
    }
    if (dx < -PIN_REVEAL_THRESHOLD) {
      snapOpen()
      return
    }
    snapClosed()
  }

  const revealed = dx <= -PIN_REVEAL_THRESHOLD / 2

  return (
    <div className="relative overflow-hidden">
      <button
        type="button"
        style={{ width: PIN_STRIP_PX }}
        className={cn(
          "absolute inset-y-0 right-0 z-20 flex flex-col items-center justify-center gap-1 text-white transition-opacity",
          pinned ? "bg-mind" : "bg-zinc-600",
          revealed ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-label={pinned ? `Unpin ${kb.name}` : `Pin ${kb.name}`}
        onClick={(e) => {
          e.stopPropagation()
          onTogglePin()
          snapClosed()
        }}
      >
        {pinned ? (
          <PinOff className="h-5 w-5 shrink-0" strokeWidth={1.85} aria-hidden />
        ) : (
          <Pin className="h-5 w-5 shrink-0" strokeWidth={1.85} aria-hidden />
        )}
        <span className="text-[11px] font-semibold">{pinned ? "Unpin" : "Pin"}</span>
      </button>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (revealed) snapClosed()
            else onOpen()
          }
        }}
        onClick={() => {
          if (revealed) {
            snapClosed()
            return
          }
          if (Math.abs(dx) < 8) onOpen()
        }}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => dragging.current && onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={() => dragging.current && onEnd()}
        className={cn(
          "relative z-10 block w-full select-none text-left",
          isRail ? "rounded-xl px-2 py-2.5" : "py-3.5 first:pt-1",
          isRail
            ? cn(
                "rounded-xl transition-colors",
                selected
                  ? "bg-mind/10 ring-1 ring-mind/20"
                  : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              )
            : selected
              ? cn(mx.shellCard, "ring-mind/25")
              : "transition-colors hover:bg-black/[0.02] active:scale-[0.99] dark:hover:bg-white/[0.03]"
        )}
        style={{
          transform: `translateX(${dx}px)`,
          transition: dragging.current ? "none" : "transform 0.2s ease-out",
        }}
      >
        <div className={cn("flex items-start gap-2.5", !showTeamBadge && !isRail && "items-center")}>
          {showPublisherMeta ? (
            <LibraryCoverWithUpdateBadge
              kb={kb}
              hasUpdate={kb.hasContentUpdate}
              coverClassName={isRail ? "h-9 w-9" : "h-12 w-12 rounded-xl"}
            />
          ) : (
            <div
              className={cn(
                "shrink-0 overflow-hidden rounded-lg ring-1 ring-stone-200/90 dark:ring-zinc-700/80",
                isRail ? "h-9 w-9" : "h-12 w-12 rounded-xl"
              )}
            >
              <LibraryCoverFromKb kb={kb} showMiniUi={false} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3
                className={cn(
                  "min-w-0 truncate font-semibold leading-snug",
                  isRail ? "text-[13px]" : "text-[15px]",
                  mx.shellInk
                )}
              >
                {kb.name}
              </h3>
              {pinned ? (
                <Pin className="h-3 w-3 shrink-0 fill-mind/20 text-mind" strokeWidth={2.25} aria-hidden />
              ) : null}
              {showTeamBadge && kb.teamMembershipRole ? (
                <span
                  className={cn(
                    "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    kb.teamMembershipRole === "owner"
                      ? "bg-mind/12 text-mind"
                      : "bg-stone-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  )}
                >
                  {kb.teamMembershipRole === "owner" ? "Owner" : "Member"}
                </span>
              ) : null}
            </div>
            {!isRail ? (
              showPublisherMeta ? (
                <>
                  <p className={cn("mt-0.5 line-clamp-1 text-[13px]", mx.shellMuted)}>
                    {kb.publisherName ?? kb.description}
                  </p>
                  <p className={cn("mt-2 text-[11px] tabular-nums", mx.shellIcon)}>
                    Updated {kb.lastUpdate}
                  </p>
                </>
              ) : (
                <>
                  <p className={cn("mt-0.5 line-clamp-1 text-[13px] leading-relaxed", mx.shellMuted)}>
                    {kb.description}
                  </p>
                  <div className={cn("mt-2 flex flex-wrap items-center gap-x-2 text-[11px]", mx.shellIcon)}>
                    <span>{kb.count} items</span>
                    <span aria-hidden>·</span>
                    <span>Updated {kb.lastUpdate}</span>
                  </div>
                </>
              )
            ) : (
              <p className="mt-0.5 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
                Updated {kb.lastUpdate}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const PINNED_KB_STORAGE_KEY = "mind-pinned-kb-ids"

export function readPinnedKbIds(): number[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(PINNED_KB_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === "number") : []
  } catch {
    return []
  }
}

export function writePinnedKbIds(ids: number[]) {
  try {
    localStorage.setItem(PINNED_KB_STORAGE_KEY, JSON.stringify(ids))
  } catch {
    /* noop */
  }
}

export function sortKnowledgeBasesWithPins(items: KnowledgeBase[], pinnedIds: number[]): KnowledgeBase[] {
  const pinSet = new Set(pinnedIds)
  return [...items].sort((a, b) => {
    const aPin = pinSet.has(a.id)
    const bPin = pinSet.has(b.id)
    if (aPin && !bPin) return -1
    if (!aPin && bPin) return 1
    return 0
  })
}
