"use client"

import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { BadgeCheck, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"
import { PlazaDiscoverThumbnail } from "@/components/mind-v2/plaza-discover-thumbnail"
import {
  MOCK_PLAZA_LIBRARIES,
  PLAZA_CATEGORY_TABS,
  formatPlazaContent,
  formatPlazaSubscriber,
  type PlazaCategoryId,
  type PlazaLibraryRow,
} from "@/lib/mock-plaza-libraries"
import { WebShellMainLayout } from "@/components/mind-v2/web-shell-main-layout"

const CATEGORY_LABEL: Record<PlazaCategoryId, string> = {
  recommended: "For you",
  tech: "Tech",
  education: "Education",
  workplace: "Work",
  finance: "Finance",
  industry: "Industry",
  health: "Health",
  law: "Law",
  humanities: "Arts",
  life: "Life",
}

function shuffleRows(rows: PlazaLibraryRow[], seed: number) {
  const a = [...rows]
  let s = (seed % 2147483646) + 1
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function PlazaVerifiedMark({
  tone = "gold",
}: {
  tone?: "blue" | "gold"
}) {
  return (
    <BadgeCheck
      className={cn(
        "h-3.5 w-3.5 shrink-0",
        tone === "blue" ? "text-sky-500" : "text-amber-500"
      )}
      strokeWidth={2.25}
      aria-label="Verified"
    />
  )
}

/** Compact row card — reference: small cover · title · 2-line desc · meta line */
function DiscoverLibraryCard({
  row,
  onPick,
  featured = false,
}: {
  row: PlazaLibraryRow
  onPick: () => void
  featured?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "flex w-full gap-3 rounded-xl border border-stone-200/80 bg-white p-3 text-left transition-[box-shadow,border-color,background-color]",
        "hover:border-stone-300/90 hover:shadow-[0_4px_16px_-10px_rgba(15,23,42,0.1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mind/25"
      )}
    >
      <PlazaDiscoverThumbnail row={row} size={featured ? "featured" : "list"} />
      <div className="min-w-0 flex-1 py-0.5">
        <h3 className="line-clamp-1 text-[15px] font-semibold leading-snug text-zinc-900">
          {row.title}
        </h3>
        <p className="mt-1 line-clamp-3 text-[13px] leading-[1.45] text-zinc-500">{row.description}</p>
        <p className="mt-2 line-clamp-1 min-w-0 text-[12px] text-zinc-400">
          <span className="inline-flex min-w-0 max-w-full items-center gap-x-1.5">
            <span className="inline-flex min-w-0 items-center gap-0.5 truncate font-medium text-zinc-500">
              {row.authorHandle}
              {row.verified ? <PlazaVerifiedMark tone={row.verifyTone ?? "gold"} /> : null}
            </span>
            <span className="shrink-0 text-zinc-300" aria-hidden>
              ·
            </span>
            <span className="shrink-0 tabular-nums">{formatPlazaSubscriber(row.subscriberCount)}</span>
            <span className="shrink-0 text-zinc-300" aria-hidden>
              ·
            </span>
            <span className="truncate">{formatPlazaContent(row.contentCount)}</span>
          </span>
        </p>
      </div>
    </button>
  )
}

function DiscoverCardGrid({
  rows,
  onPick,
  className,
}: {
  rows: PlazaLibraryRow[]
  onPick: (row: PlazaLibraryRow) => void
  className?: string
}) {
  if (rows.length === 0) {
    return (
      <p className={cn("py-12 text-center text-[14px] text-zinc-500", className)}>No libraries in this category.</p>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3", className)}>
      {rows.map((row) => (
        <DiscoverLibraryCard
          key={row.kbId}
          row={row}
          featured={rows.length <= 4}
          onPick={() => onPick(row)}
        />
      ))}
    </div>
  )
}

/** 发现页 — 对齐参考图：标题 + 搜索、Featured 双列、分类 Tab、列表双列 */
export function WebPlazaDiscoverPage({
  onBrowseLibrary,
  onStartThread,
  extraPlazaRows = [],
  embedded = false,
  category: controlledCategory,
  onCategoryChange,
  query: controlledQuery,
  onQueryChange,
}: {
  onBrowseLibrary: (row: PlazaLibraryRow) => void
  onStartThread: (row: PlazaLibraryRow, prompt?: string) => void
  extraPlazaRows?: PlazaLibraryRow[]
  embedded?: boolean
  category?: PlazaCategoryId
  onCategoryChange?: (id: PlazaCategoryId) => void
  query?: string
  onQueryChange?: (q: string) => void
}) {
  const [internalQuery, setInternalQuery] = useState("")
  const [internalCategory, setInternalCategory] = useState<PlazaCategoryId>("recommended")
  const query = controlledQuery ?? internalQuery
  const setQuery = onQueryChange ?? setInternalQuery
  const category = controlledCategory ?? internalCategory
  const setCategory = onCategoryChange ?? setInternalCategory
  const [shuffleKey, setShuffleKey] = useState(0)

  const allPlazaRows = useMemo(() => {
    const byId = new Map<number, PlazaLibraryRow>()
    for (const row of MOCK_PLAZA_LIBRARIES) byId.set(row.kbId, row)
    for (const row of extraPlazaRows) byId.set(row.kbId, row)
    return [...byId.values()]
  }, [extraPlazaRows])

  const featured = useMemo(() => {
    const userFeatured = extraPlazaRows.filter((r) => r.featured)
    const pool = [
      ...userFeatured,
      ...allPlazaRows.filter((r) => r.featured && !userFeatured.some((u) => u.kbId === r.kbId)),
    ]
    return shuffleRows(pool.length > 0 ? pool : allPlazaRows.slice(0, 8), shuffleKey).slice(0, 4)
  }, [allPlazaRows, extraPlazaRows, shuffleKey])

  const searchTrim = query.trim().toLowerCase()

  const listRows = useMemo(() => {
    if (searchTrim) {
      return allPlazaRows.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTrim) ||
          r.description.toLowerCase().includes(searchTrim) ||
          r.authorHandle.toLowerCase().includes(searchTrim)
      )
    }
    let rows: PlazaLibraryRow[]
    if (category === "recommended") {
      rows = [...allPlazaRows]
        .filter((r) => !r.featured)
        .sort((a, b) => {
          const aUser = extraPlazaRows.some((u) => u.kbId === a.kbId) ? 1 : 0
          const bUser = extraPlazaRows.some((u) => u.kbId === b.kbId) ? 1 : 0
          if (aUser !== bUser) return bUser - aUser
          return b.subscriberCount - a.subscriberCount
        })
    } else {
      rows = allPlazaRows.filter((r) => r.plazaCategories.includes(category))
    }
    return rows
  }, [allPlazaRows, category, extraPlazaRows, searchTrim])

  const pick = useCallback(
    (row: PlazaLibraryRow) => {
      onBrowseLibrary(row)
    },
    [onBrowseLibrary]
  )

  const embeddedPad = "p-4 sm:p-5"

  const discoverBody =
    searchTrim ? (
      <>
        {!embedded ? (
          <p className="text-[14px] text-zinc-500">
            {listRows.length} result{listRows.length === 1 ? "" : "s"}
          </p>
        ) : null}
        <DiscoverCardGrid className={embedded ? embeddedPad : "mt-4"} rows={listRows} onPick={pick} />
      </>
    ) : embedded && category !== "recommended" ? (
      <DiscoverCardGrid className={embeddedPad} rows={listRows} onPick={pick} />
    ) : (
      <>
        {!embedded ? (
          <div className="mt-2 flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-semibold text-zinc-900">Featured</h2>
            <button
              type="button"
              onClick={() => {
                setShuffleKey((k) => k + 1)
                toast.message("Refreshed featured picks")
              }}
              className="inline-flex items-center gap-1.5 text-[14px] font-medium text-zinc-500 transition-colors hover:text-zinc-800"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={2} />
              Shuffle
            </button>
          </div>
        ) : null}
        {(!embedded || category === "recommended") && featured.length > 0 ? (
          <DiscoverCardGrid
            className={embedded ? cn(embeddedPad, "pb-0 sm:pb-0") : "mt-4"}
            rows={featured}
            onPick={pick}
          />
        ) : null}
        {!embedded ? (
          <div
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px]"
            role="tablist"
            aria-label="Categories"
          >
            {PLAZA_CATEGORY_TABS.map((tab) => {
              const active = category === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(tab.id)}
                  className={cn(
                    "shrink-0 transition-colors",
                    active ? "font-semibold text-zinc-900" : "font-normal text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  {CATEGORY_LABEL[tab.id] ?? tab.label}
                </button>
              )
            })}
          </div>
        ) : null}
        <DiscoverCardGrid className={embedded ? embeddedPad : "mt-4"} rows={listRows} onPick={pick} />
      </>
    )

  const searchField = (fullWidth?: boolean) => (
    <div className={cn("relative min-w-0", fullWidth ? "w-full" : "flex-1 sm:max-w-[300px]")}>
      <SmartSearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search libraries, authors, or descriptions"
        className={cn(
          "w-full rounded-full py-2.5 pl-11 pr-4 text-[14px] text-zinc-800 outline-none placeholder:text-zinc-400",
          web.kbInput
        )}
        aria-label="Search library plaza"
      />
    </div>
  )

  const plazaScroll = (
    <>
      <div
        className={cn(
          "shrink-0 border-b border-stone-100/90 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95",
          embedded ? "sticky top-0 z-10 px-4 py-3 sm:px-5" : "mb-5"
        )}
      >
        {searchField(true)}
      </div>
      {discoverBody}
    </>
  )

  return embedded ? (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">{plazaScroll}</div>
    </div>
  ) : (
    <WebShellMainLayout
      title="Library Plaza"
      subtitle="Discover public libraries — open for intro, sources, chat, and Studio"
      bodyClassName="pt-4"
    >
      {plazaScroll}
    </WebShellMainLayout>
  )
}
