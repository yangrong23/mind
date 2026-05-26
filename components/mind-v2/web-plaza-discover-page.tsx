"use client"

import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"
import { PlazaLibraryCover } from "@/components/mind-v2/plaza-library-cover"
import {
  MOCK_PLAZA_LIBRARIES,
  PLAZA_CATEGORY_TABS,
  formatPlazaContent,
  formatPlazaSubscriber,
  plazaRowAgentLabel,
  plazaRowCardSummary,
  type PlazaCategoryId,
  type PlazaLibraryRow,
} from "@/lib/mock-plaza-libraries"

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

/** Unified discover card — icon left, copy right (reference layout) */
function DiscoverLibraryCard({
  row,
  onPick,
}: {
  row: PlazaLibraryRow
  onPick: () => void
}) {
  const summary = plazaRowCardSummary(row)
  const agentLabel = plazaRowAgentLabel(row)

  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "flex h-full w-full min-h-[108px] gap-4 rounded-2xl bg-white p-4 text-left",
        "transition-colors hover:bg-zinc-50/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/60"
      )}
    >
      <div className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-2xl">
        <PlazaLibraryCover title={row.title} kbId={row.kbId} size="lg" className="h-full w-full" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-zinc-900">{row.title}</h3>
        <p className="mt-1 text-[12px] font-medium text-mind">With {agentLabel}</p>
        <p className="mt-1 line-clamp-2 text-[13px] leading-[1.45] text-zinc-500">{summary}</p>
        <p className="mt-2 truncate text-[12px] text-zinc-400">
          {formatPlazaSubscriber(row.subscriberCount)} · {formatPlazaContent(row.contentCount)} ·{" "}
          {row.authorHandle}
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
    <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2", className)}>
      {rows.map((row) => (
        <DiscoverLibraryCard key={row.kbId} row={row} onPick={() => onPick(row)} />
      ))}
    </div>
  )
}

/** 发现页 — 对齐参考图：标题 + 搜索、Featured 双列、分类 Tab、列表双列 */
export function WebPlazaDiscoverPage({
  onPickRow,
}: {
  onPickRow: (row: PlazaLibraryRow) => void
}) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<PlazaCategoryId>("recommended")
  const [shuffleKey, setShuffleKey] = useState(0)

  const featured = useMemo(
    () => shuffleRows(MOCK_PLAZA_LIBRARIES.filter((r) => r.featured), shuffleKey).slice(0, 4),
    [shuffleKey]
  )

  const searchTrim = query.trim().toLowerCase()

  const listRows = useMemo(() => {
    if (searchTrim) {
      return MOCK_PLAZA_LIBRARIES.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTrim) ||
          r.description.toLowerCase().includes(searchTrim) ||
          r.authorHandle.toLowerCase().includes(searchTrim)
      )
    }
    let rows: PlazaLibraryRow[]
    if (category === "recommended") {
      rows = [...MOCK_PLAZA_LIBRARIES]
        .filter((r) => !r.featured)
        .sort((a, b) => b.subscriberCount - a.subscriberCount)
    } else {
      rows = MOCK_PLAZA_LIBRARIES.filter((r) => r.plazaCategories.includes(category))
    }
    return rows
  }, [category, searchTrim])

  const pick = useCallback((row: PlazaLibraryRow) => onPickRow(row), [onPickRow])

  return (
    <div className={cn("relative h-full min-h-0 overflow-y-auto", web.canvas)}>
      <div className="mx-auto w-full max-w-[1040px] px-6 py-8 pb-14 lg:px-10">
        {/* Header — Discover + search on one row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-[32px] font-semibold tracking-tight text-zinc-900">Discover</h1>
          <div className="relative w-full sm:max-w-[320px] sm:shrink-0">
            <SmartSearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search libraries to subscribe"
              className="w-full rounded-full border border-stone-200/90 bg-white py-2.5 pl-11 pr-4 text-[14px] text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-sky-200 focus:ring-1 focus:ring-mind/25"
            />
          </div>
        </div>

        {searchTrim ? (
          <>
            <p className="mt-8 text-[14px] text-zinc-500">
              {listRows.length} result{listRows.length === 1 ? "" : "s"}
            </p>
            <DiscoverCardGrid className="mt-4" rows={listRows} onPick={pick} />
          </>
        ) : (
          <>
            {/* Featured */}
            <div className="mt-10 flex items-center justify-between gap-3">
              <h2 className="text-[17px] font-semibold text-zinc-900">Featured</h2>
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
            <DiscoverCardGrid className="mt-4" rows={featured} onPick={pick} />

            {/* Category tabs — text only */}
            <div
              className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px]"
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

            {/* Category grid — same card as Featured */}
            <DiscoverCardGrid className="mt-6" rows={listRows} onPick={pick} />
          </>
        )}
      </div>
    </div>
  )
}
