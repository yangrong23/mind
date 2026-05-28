"use client"

import { useEffect, useRef, useState } from "react"
import { MoreHorizontal, Pin, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { PlazaLibraryCover } from "@/components/mind-v2/plaza-library-cover"
import { PersonAvatar } from "@/components/mind-v2/mind-media-art"
import { publicAgentTagline, type PublicKbSettings } from "@/lib/public-kb-settings"
import {
  PublicKbEngagementBar,
  PublicKbEngagementStats,
  type PublicKbEngagementMetrics,
} from "@/components/mind-v2/public-kb-engagement-bar"
import { PublicKbCommentsPanel } from "@/components/mind-v2/public-kb-comments-panel"
import type { PublicKbComment } from "@/lib/plaza-kb-engagement"

export function formatKbMetricCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (n >= 10_000) return `${Math.round(n / 1000)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return String(n)
}

export function WebSubscribedKbProfileHeader({
  libraryName,
  libraryDescription,
  publisherName,
  kbId,
  publicSettings,
  metrics,
  viewCount,
  subscribed,
  liked,
  onToggleSubscribe,
  onToggleLike,
  onOpenComments,
  onShare,
  pinned = false,
  onTogglePin,
  isOwner,
}: {
  libraryName: string
  libraryDescription?: string
  publisherName?: string
  kbId?: number
  publicSettings?: PublicKbSettings
  metrics: PublicKbEngagementMetrics
  viewCount?: number
  subscribed: boolean
  liked: boolean
  onToggleSubscribe: () => void
  onToggleLike: () => void
  onOpenComments: () => void
  onShare?: () => void
  pinned?: boolean
  onTogglePin?: () => void
  isOwner?: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const tagline =
    libraryDescription?.trim() ||
    (publicSettings ? publicAgentTagline(publicSettings, libraryName) : "") ||
    "Curated knowledge for subscribers"

  useEffect(() => {
    if (!menuOpen) return
    function onDoc(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [menuOpen])

  return (
    <div className={cn("shrink-0 border-b px-4 pb-4 pt-4", web.kbDivider)}>
      <div className="flex gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center">
          <PlazaLibraryCover title={libraryName} kbId={kbId} size="md" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <h1 className="min-w-0 flex-1 text-[18px] font-semibold leading-snug text-zinc-800">
              {libraryName}
            </h1>
            <div className="flex shrink-0 items-center gap-0.5">
              {onShare ? (
                <button
                  type="button"
                  onClick={onShare}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-900/[0.05] hover:text-zinc-800"
                  aria-label="Share library"
                >
                  <Share2 className="h-[18px] w-[18px]" strokeWidth={1.75} />
                </button>
              ) : null}
              {onTogglePin ? (
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-900/[0.05] hover:text-zinc-800"
                    aria-label="More actions"
                    aria-expanded={menuOpen}
                  >
                    <MoreHorizontal className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  </button>
                  {menuOpen ? (
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-50 mt-1 min-w-[11rem] overflow-hidden rounded-xl border border-black/[0.06] bg-white py-1 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.18)]"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[14px] text-zinc-700 transition-colors hover:bg-zinc-50"
                        onClick={() => {
                          setMenuOpen(false)
                          onTogglePin()
                        }}
                      >
                        <Pin
                          className={cn("h-4 w-4", pinned ? "text-mind" : "text-zinc-400")}
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        {pinned ? "Unpin from top" : "Pin to top"}
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-zinc-500">{tagline}</p>
          {publisherName ? (
            <div className="mt-2 flex items-center gap-2">
              <PersonAvatar name={publisherName} size="sm" className="h-5 w-5 text-[9px]" />
              <span className="text-[12px] text-zinc-500">{publisherName}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3">
        <PublicKbEngagementStats metrics={metrics} viewCount={viewCount} />
      </div>

      <div className="mt-3">
        <PublicKbEngagementBar
          metrics={metrics}
          subscribed={subscribed}
          liked={liked}
          onToggleSubscribe={onToggleSubscribe}
          onToggleLike={onToggleLike}
          onOpenComments={onOpenComments}
          showChat={false}
          subscribeLabel={isOwner ? { follow: "Published", following: "Your library" } : undefined}
        />
      </div>
    </div>
  )
}

export type SubscribedContentItem = {
  id: number
  title: string
  excerpt: string
  source: string
  date: string
}

export function WebSubscribedKbContentPanel({
  items,
  contentCount,
  comments,
  onCommentsChange,
  searchQuery,
  onSearchQueryChange,
  selectedIds,
  onToggleSelected,
  onOpenItem,
  initialTab,
  commentCount,
}: {
  items: SubscribedContentItem[]
  contentCount: number
  comments: PublicKbComment[]
  onCommentsChange: (next: PublicKbComment[]) => void
  searchQuery: string
  onSearchQueryChange: (q: string) => void
  selectedIds: Set<number>
  onToggleSelected: (id: number) => void
  onOpenItem: (item: SubscribedContentItem) => void
  /** Open comments tab when user taps Comment in header */
  initialTab?: "content" | "comments"
  commentCount?: number
}) {
  const [tab, setTab] = useState<"content" | "comments">(initialTab ?? "content")

  useEffect(() => {
    if (initialTab) setTab(initialTab)
  }, [initialTab])
  const q = searchQuery.trim().toLowerCase()
  const filtered = q
    ? items.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.excerpt.toLowerCase().includes(q) ||
          c.source.toLowerCase().includes(q)
      )
    : items

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn("flex shrink-0 gap-6 border-b px-4", web.kbDivider)}>
        <button
          type="button"
          onClick={() => setTab("content")}
          className={cn(
            "border-b-2 py-2.5 text-[14px] font-semibold transition-colors",
            tab === "content"
              ? "border-zinc-800 text-zinc-800"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          )}
        >
          Content {contentCount}
        </button>
        <button
          type="button"
          onClick={() => setTab("comments")}
          className={cn(
            "border-b-2 py-2.5 text-[14px] font-semibold transition-colors",
            tab === "comments"
              ? "border-zinc-800 text-zinc-800"
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          )}
        >
          Comments {commentCount ?? comments.length}
        </button>
      </div>

      {tab === "content" ? (
        <>
          <div className="shrink-0 px-3 py-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search in this library"
              className={cn(web.kbInput, "px-3")}
              aria-label="Search in this library"
            />
          </div>
          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {filtered.length === 0 ? (
              <p className="px-2 py-8 text-center text-[12px] text-zinc-500">No content matches.</p>
            ) : (
              filtered.map((item) => {
                const checked = selectedIds.has(item.id)
                return (
                  <div
                    key={item.id}
                    className={cn("flex gap-2.5 rounded-lg px-2 py-2.5", web.kbRowHover)}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenItem(item)}
                      className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-white/80 ring-1 ring-black/[0.04]"
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={() => onOpenItem(item)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="line-clamp-2 text-[13px] font-medium leading-snug text-zinc-700">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-zinc-400">
                        {item.source} · {item.date}
                      </p>
                    </button>
                    <input
                      type="checkbox"
                      className="mt-2 shrink-0 rounded border-black/[0.12]"
                      checked={checked}
                      onChange={() => onToggleSelected(item.id)}
                      aria-label={`Include ${item.title} in context`}
                    />
                  </div>
                )
              })
            )}
          </div>
        </>
      ) : (
        <PublicKbCommentsPanel
          comments={comments}
          onCommentsChange={onCommentsChange}
          compact
          className="min-h-[280px]"
        />
      )}
    </div>
  )
}
