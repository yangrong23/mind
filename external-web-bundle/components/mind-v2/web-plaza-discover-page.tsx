"use client"

import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { LibraryCover } from "@/components/mind-v2/library-cover"
import {
  MOCK_PLAZA_LIBRARIES,
  PLAZA_CATEGORY_TABS,
  formatPlazaContent,
  formatPlazaSubscriber,
  plazaRowCardSummary,
  plazaRowToKnowledgeBase,
  type PlazaCategoryId,
  type PlazaLibraryRow,
} from "@/lib/mock-plaza-libraries"
import { formatPlazaFreshness } from "@/lib/public-kb-settings"
import { publicSettingsForPlazaRow } from "@/lib/plaza-agent-profiles"

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

function FeaturedCard({ row, onPick }: { row: PlazaLibraryRow; onPick: () => void }) {
  const profile = publicSettingsForPlazaRow(row)
  const fresh = formatPlazaFreshness(profile.lastSyncedAt, row.lastUpdate)
  const summary = plazaRowCardSummary(row)
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex gap-4 rounded-2xl bg-white/60 p-4 text-left transition-colors hover:bg-white/90"
    >
      <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl">
        <LibraryCover name={row.title} coverVariant={row.coverVariant} showMiniUi={false} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[16px] font-semibold leading-snug text-zinc-700">{row.title}</h3>
          {fresh ? (
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 ring-1 ring-teal-100">
              {fresh}
            </span>
          ) : null}
        </div>
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-zinc-500">{summary}</p>
        <p className="mt-2 text-[12px] text-zinc-400">
          {formatPlazaSubscriber(row.subscriberCount)} · Assistant: {profile.displayName} · {row.authorHandle}
        </p>
      </div>
    </button>
  )
}

function CompactCard({ row, onPick }: { row: PlazaLibraryRow; onPick: () => void }) {
  const profile = publicSettingsForPlazaRow(row)
  const fresh = formatPlazaFreshness(profile.lastSyncedAt, row.lastUpdate)
  const summary = plazaRowCardSummary(row)
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex gap-3 rounded-xl py-3 text-left transition-colors hover:bg-white/70"
    >
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
        <LibraryCover name={row.title} coverVariant={row.coverVariant} showMiniUi={false} />
      </div>
      <div className="min-w-0 flex-1 border-b border-stone-100/80 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-semibold text-zinc-700">{row.title}</h3>
          {fresh ? (
            <span className="rounded-full bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700">{fresh}</span>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 text-[13px] text-zinc-500">{summary}</p>
        <p className="mt-1.5 text-[11px] text-zinc-400">
          {formatPlazaSubscriber(row.subscriberCount)} · {profile.displayName} · {row.authorHandle}
        </p>
      </div>
    </button>
  )
}

/** 发现页排版 — 参考图一 */
export function WebPlazaDiscoverPage({ onPickLibrary }: { onPickLibrary: (kb: KnowledgeBase) => void }) {
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
    if (category === "recommended") {
      return [...MOCK_PLAZA_LIBRARIES].sort((a, b) => b.subscriberCount - a.subscriberCount)
    }
    return MOCK_PLAZA_LIBRARIES.filter((r) => r.plazaCategories.includes(category))
  }, [category, searchTrim])

  const pick = useCallback(
    (row: PlazaLibraryRow) => onPickLibrary(plazaRowToKnowledgeBase(row)),
    [onPickLibrary]
  )

  return (
    <div className={cn("h-full min-h-0 overflow-y-auto", web.canvas)}>
      <div className="mx-auto max-w-[920px] px-8 pt-8 pb-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-[32px] font-semibold tracking-tight text-zinc-700">Discover</h1>
          <div className="relative w-full max-w-[320px] sm:w-auto">
            <SmartSearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search libraries to subscribe"
              className="w-full rounded-full bg-white py-2.5 pl-10 pr-4 text-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] outline-none ring-1 ring-black/[0.04] placeholder:text-zinc-400 focus:ring-teal-200/60 sm:min-w-[280px]"
            />
          </div>
        </div>

        {!searchTrim ? (
          <>
            <div className="mt-10 flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-zinc-700">Featured</h2>
              <button
                type="button"
                onClick={() => {
                  setShuffleKey((k) => k + 1)
                  toast.message("Refreshed featured picks")
                }}
                className="flex items-center gap-1 text-[13px] font-medium text-zinc-500 hover:text-zinc-600"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Shuffle
              </button>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {featured.map((row) => (
                <FeaturedCard key={`f-${row.kbId}`} row={row} onPick={() => pick(row)} />
              ))}
            </div>

            <div className="mt-10 flex gap-6 overflow-x-auto border-b border-stone-100/90 pb-0 [scrollbar-width:none]">
              {PLAZA_CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategory(tab.id)}
                  className={cn(
                    "shrink-0 pb-2.5 text-[15px] transition-colors",
                    category === tab.id
                      ? "font-semibold text-zinc-700"
                      : "font-normal text-zinc-400 hover:text-zinc-600"
                  )}
                >
                  {CATEGORY_LABEL[tab.id] ?? tab.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-8 text-[14px] text-zinc-500">
            {listRows.length} result{listRows.length === 1 ? "" : "s"} found
          </p>
        )}

        <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
          {listRows.map((row) => (
            <CompactCard key={row.kbId} row={row} onPick={() => pick(row)} />
          ))}
        </div>
      </div>
    </div>
  )
}
