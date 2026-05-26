"use client"

import { useState } from "react"
import { Heart, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { PlazaLibraryCover } from "@/components/mind-v2/plaza-library-cover"
import { PersonAvatar } from "@/components/mind-v2/mind-media-art"
import { agentFromPublicKbSettings } from "@/lib/plaza-agent-runtime"
import { publicAgentDisplayName, publicAgentTagline, type PublicKbSettings } from "@/lib/public-kb-settings"

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
  contentCount,
  subscriberCount,
  viewCount,
  likeCount,
  commentCount,
  liked,
  onToggleLike,
  onOpenComments,
}: {
  libraryName: string
  libraryDescription?: string
  publisherName?: string
  kbId?: number
  publicSettings?: PublicKbSettings
  contentCount: number
  subscriberCount: number
  viewCount: number
  likeCount: number
  commentCount: number
  liked: boolean
  onToggleLike: () => void
  onOpenComments: () => void
}) {
  const agent = publicSettings
    ? agentFromPublicKbSettings(publicSettings, libraryName)
    : null
  const agentName = publicSettings ? publicAgentDisplayName(publicSettings) : null
  const tagline =
    libraryDescription?.trim() ||
    (publicSettings ? publicAgentTagline(publicSettings, libraryName) : "") ||
    "Curated knowledge for subscribers"

  return (
    <div className="shrink-0 border-b border-stone-100 px-4 pb-4 pt-4">
      <div className="flex gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-black/[0.06]">
          {kbId != null ? (
            <PlazaLibraryCover title={libraryName} kbId={kbId} size="lg" className="h-full w-full" />
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center bg-gradient-to-br text-xl text-white",
                agent?.color ?? "from-zinc-600 to-zinc-800"
              )}
            >
              {agent?.avatar ?? "📚"}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-[18px] font-semibold leading-snug text-zinc-800">{libraryName}</h1>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-zinc-500">{tagline}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] tabular-nums text-zinc-500">
            <span>{formatKbMetricCount(subscriberCount)} subscribed</span>
            <span aria-hidden>·</span>
            <span>{formatKbMetricCount(viewCount)} views & Q&A</span>
            <span aria-hidden>·</span>
            <span>{formatKbMetricCount(likeCount)} likes</span>
          </div>
        </div>
      </div>

      {agentName ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-stone-50/90 px-3 py-2.5 ring-1 ring-stone-200/60">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm text-white",
              agent?.color ?? "from-sky-500 to-teal-600"
            )}
          >
            {agent?.avatar ?? "✨"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-zinc-800">{agentName}</p>
            <p className="text-[11px] text-zinc-500">Library assistant · grounded on {contentCount} sources</p>
          </div>
        </div>
      ) : null}

      {publisherName ? (
        <div className="mt-2 flex items-center gap-2">
          <PersonAvatar name={publisherName} size="sm" className="h-5 w-5 text-[9px]" />
          <span className="text-[12px] text-zinc-500">{publisherName}</span>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggleLike}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-stone-200/90 px-3 py-1.5 text-[12px] font-medium text-zinc-600 transition-colors",
            liked && "border-sky-200/80 bg-sky-50/80 text-sky-700"
          )}
          aria-pressed={liked}
        >
          <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} strokeWidth={2} aria-hidden />
          {likeCount}
        </button>
        <button
          type="button"
          onClick={onOpenComments}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200/90 px-3 py-1.5 text-[12px] font-medium text-zinc-600 transition-colors hover:bg-stone-50"
        >
          <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          {commentCount}
        </button>
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
  commentCount,
  searchQuery,
  onSearchQueryChange,
  selectedIds,
  onToggleSelected,
  onOpenItem,
}: {
  items: SubscribedContentItem[]
  contentCount: number
  commentCount: number
  searchQuery: string
  onSearchQueryChange: (q: string) => void
  selectedIds: Set<number>
  onToggleSelected: (id: number) => void
  onOpenItem: (item: SubscribedContentItem) => void
}) {
  const [tab, setTab] = useState<"content" | "comments">("content")
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
      <div className="flex shrink-0 gap-6 border-b border-stone-100 px-4">
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
          Comments
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
              className="w-full rounded-lg bg-stone-50/90 py-2 px-3 text-[12px] text-zinc-700 ring-1 ring-stone-200/80 outline-none placeholder:text-zinc-400 focus:ring-sky-200/60"
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
                    className="flex gap-2.5 rounded-lg px-2 py-2.5 hover:bg-stone-50/90"
                  >
                    <button
                      type="button"
                      onClick={() => onOpenItem(item)}
                      className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-stone-100 to-stone-200/80 ring-1 ring-black/[0.04]"
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
                      className="mt-2 shrink-0 rounded border-stone-300"
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
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <p className="text-[13px] font-medium text-zinc-600">{commentCount} comments</p>
          <p className="mt-1 text-[12px] text-zinc-500">Discussion on this library (demo).</p>
        </div>
      )}
    </div>
  )
}
