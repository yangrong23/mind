"use client"

import type { ReactNode } from "react"
import { ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { HubItemThumb } from "@/components/mind-v2/mind-media-art"
import { hubItemKindFromLabel } from "@/lib/product-media"

/** Knowledge detail — hero header (library / subscribed plaza) */
export function WebKbDetailHero({
  title,
  description,
  cover,
  actions,
  engagement,
  meta,
  className,
}: {
  title: string
  description?: string
  cover: ReactNode
  actions?: ReactNode
  engagement?: ReactNode
  meta?: ReactNode
  className?: string
}) {
  return (
    <header className={cn("shrink-0 px-8 pt-8 pb-6", className)}>
      <div className="flex items-start gap-6">
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center">{cover}</div>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <h1 className="text-[24px] font-semibold leading-[1.2] tracking-tight text-zinc-900">
                {title}
              </h1>
              {description ? (
                <p className="max-w-[54ch] text-[14px] leading-[1.65] text-zinc-600">{description}</p>
              ) : null}
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
          </div>
          {engagement ? <div className="space-y-3">{engagement}</div> : null}
          {meta ? (
            <p className="text-[13px] leading-relaxed text-zinc-400">{meta}</p>
          ) : null}
        </div>
      </div>
    </header>
  )
}

/** Search, sort, optional add — single aligned toolbar row */
export function WebKbDetailToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search content in this library",
  sortControl,
  trailing,
  sectionLabel,
  sectionHint,
  className,
}: {
  searchValue: string
  onSearchChange: (v: string) => void
  searchPlaceholder?: string
  sortControl: ReactNode
  trailing?: ReactNode
  sectionLabel: string
  sectionHint?: string
  className?: string
}) {
  return (
    <div className={cn("shrink-0 space-y-4 px-8 pb-2", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(web.kbInput, "py-2.5 pl-10 pr-4 text-[14px]")}
            aria-label={searchPlaceholder}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:shrink-0">{sortControl}</div>
        {trailing ? <div className="flex flex-wrap items-center gap-2 lg:ml-auto">{trailing}</div> : null}
      </div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-400">
          {sectionLabel}
        </h2>
        {sectionHint ? (
          <span className="text-[12px] tabular-nums text-zinc-400">{sectionHint}</span>
        ) : null}
      </div>
    </div>
  )
}

export function WebKbDetailSortSelect({
  value,
  onChange,
  options,
  className,
}: {
  value: string
  onChange: (v: string) => void
  options: { id: string; label: string }[]
  className?: string
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          web.kbInput,
          "min-w-[10.5rem] cursor-pointer appearance-none py-2.5 pl-3.5 pr-9 text-[13px] font-medium"
        )}
        aria-label="Sort content"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        strokeWidth={2}
        aria-hidden
      />
    </div>
  )
}

export type WebKbHubListItem = {
  id: number
  title: string
  source: string
  author: string
  date: string
}

export function WebKbHubContentList({
  items,
  onOpenItem,
  emptyMessage = "No content in this library yet.",
  className,
}: {
  items: WebKbHubListItem[]
  onOpenItem: (item: WebKbHubListItem) => void
  emptyMessage?: string
  className?: string
}) {
  if (items.length === 0) {
    return (
      <p className={cn("px-8 py-16 text-center text-[14px] text-zinc-500", className)}>{emptyMessage}</p>
    )
  }

  return (
    <ul className={cn("space-y-1 px-6 pb-8 sm:px-8", className)}>
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onOpenItem(item)}
            className={cn(
              "group flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-colors",
              "hover:bg-stone-50/90 active:bg-stone-100/60"
            )}
          >
            <HubItemThumb
              kind={hubItemKindFromLabel(item.source, item.title)}
              className="h-12 w-12 shrink-0 rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold leading-snug text-zinc-800 group-hover:text-zinc-900">
                {item.title}
              </p>
              <p className="mt-1.5 text-[13px] text-zinc-500">
                {item.source}
                <span className="mx-1.5 text-zinc-300" aria-hidden>
                  ·
                </span>
                {item.author}
                <span className="mx-1.5 text-zinc-300" aria-hidden>
                  ·
                </span>
                {item.date}
              </p>
            </div>
            <ChevronDown
              className="h-4 w-4 shrink-0 -rotate-90 text-zinc-300 transition-colors group-hover:text-zinc-500"
              strokeWidth={2}
              aria-hidden
            />
          </button>
        </li>
      ))}
    </ul>
  )
}
