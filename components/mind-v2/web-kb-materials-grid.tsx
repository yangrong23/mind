"use client"

import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { HubItemThumb } from "@/components/mind-v2/mind-media-art"
import { hubItemKindFromLabel } from "@/lib/product-media"
import type { WebKbHubListItem } from "@/components/mind-v2/web-kb-detail-chrome"

function sourceTagLabel(source: string) {
  const s = source.toLowerCase()
  if (s.includes("note") || s.includes("笔记")) return "Note"
  if (s.includes("record") || s.includes("录")) return "Recording"
  if (s.includes("link") || s.includes("web")) return "Link"
  if (s.includes("file")) return "File"
  return source || "Source"
}

/** Reference-style card grid — cover, title, type pill, updated time */
export function WebKbMaterialsGrid({
  items,
  onOpenItem,
  className,
}: {
  items: WebKbHubListItem[]
  onOpenItem: (item: WebKbHubListItem) => void
  className?: string
}) {
  if (items.length === 0) return null

  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-4 px-6 pb-8 pt-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:gap-5",
        className
      )}
    >
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onOpenItem(item)}
            className={cn(
              "group flex w-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white text-left shadow-[0_4px_18px_-12px_rgba(15,23,42,0.12)] transition-[box-shadow,transform,border-color] duration-200",
              "hover:-translate-y-0.5 hover:border-mind/20 hover:shadow-[0_12px_32px_-14px_rgba(15,23,42,0.16)]"
            )}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-stone-100 via-white to-sky-50/80">
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <HubItemThumb
                  kind={hubItemKindFromLabel(item.source, item.title)}
                  className="h-16 w-16 rounded-2xl shadow-sm ring-1 ring-black/[0.04]"
                />
              </div>
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.04] to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </div>
            <div className="flex min-h-[88px] flex-col gap-2 px-3.5 py-3">
              <p className="line-clamp-2 text-[14px] font-semibold leading-snug tracking-tight text-zinc-900">
                {item.title || "Untitled"}
              </p>
              <div className="mt-auto flex items-center justify-between gap-2">
                <span className="inline-flex rounded-md bg-mind/10 px-2 py-0.5 text-[11px] font-semibold text-mind">
                  {sourceTagLabel(item.source)}
                </span>
                <span className="truncate text-[11px] font-medium tabular-nums text-zinc-400">
                  {item.date}
                </span>
              </div>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}

/** Compact list fallback — toolbar list mode */
export function WebKbMaterialsList({
  items,
  onOpenItem,
  className,
}: {
  items: WebKbHubListItem[]
  onOpenItem: (item: WebKbHubListItem) => void
  className?: string
}) {
  return (
    <ul className={cn("space-y-1 px-6 pb-8 sm:px-8", className)}>
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onOpenItem(item)}
            className="group flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-colors hover:bg-stone-50/90"
          >
            <HubItemThumb
              kind={hubItemKindFromLabel(item.source, item.title)}
              className="h-11 w-11 shrink-0 rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-zinc-800">{item.title}</p>
              <p className="mt-1 text-[13px] text-zinc-500">
                {item.source} · {item.date}
              </p>
            </div>
            <ChevronDown
              className="h-4 w-4 shrink-0 -rotate-90 text-zinc-300 group-hover:text-zinc-500"
              strokeWidth={2}
              aria-hidden
            />
          </button>
        </li>
      ))}
    </ul>
  )
}
