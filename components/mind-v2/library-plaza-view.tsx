"use client"

import { useCallback, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, RefreshCw, User, Check } from "lucide-react"
import { toast } from "sonner"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import {
  MOCK_PLAZA_LIBRARIES,
  PLAZA_CATEGORY_TABS,
  formatPlazaContent,
  formatPlazaSubscriber,
  plazaRowToKnowledgeBase,
  type PlazaCategoryId,
  type PlazaLibraryRow,
} from "@/lib/mock-plaza-libraries"

function shufflePlazaRows(rows: PlazaLibraryRow[], seed: number): PlazaLibraryRow[] {
  const a = [...rows]
  let s = (seed % 2147483646) + 1
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647
    const j = s % (i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function VerifiedDot({ tone }: { tone: "blue" | "gold" }) {
  return (
    <span
      className={cn(
        "inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white",
        tone === "blue" ? "bg-zinc-400" : "bg-amber-500/90 text-white"
      )}
      title="Verified"
      aria-label="Verified"
    >
      <Check className="h-2.5 w-2.5 stroke-[3]" aria-hidden />
    </span>
  )
}

function PlazaCard({
  row,
  onPick,
}: {
  row: PlazaLibraryRow
  onPick: () => void
}) {
  const leftMeta = `${formatPlazaSubscriber(row.subscriberCount)} | ${formatPlazaContent(row.contentCount)} | `
  return (
    <button
      type="button"
      onClick={onPick}
      className="w-full py-3 text-left transition-colors hover:bg-black/[0.025] active:scale-[0.99] dark:hover:bg-white/[0.04]"
    >
      <div className="flex gap-3">
        <img
          src={row.coverImage}
          alt=""
          width={72}
          height={72}
          className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-snug text-zinc-900 dark:text-zinc-50">{row.title}</h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">{row.description}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-1 text-[11px] leading-tight text-zinc-400 dark:text-zinc-500">
            <span className="shrink-0">{leftMeta}</span>
            <span className="inline-flex min-w-0 items-center gap-0.5 break-all">
              {row.authorHandle}
              {row.verified && row.verifyTone ? <VerifiedDot tone={row.verifyTone} /> : null}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

export interface LibraryPlazaViewProps {
  onBack: () => void
  onPickLibrary?: (kb: KnowledgeBase) => void
  subtitle?: string
}

export function LibraryPlazaView({ onBack, onPickLibrary, subtitle }: LibraryPlazaViewProps) {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<PlazaCategoryId>("recommended")
  const [featuredShuffleKey, setFeaturedShuffleKey] = useState(0)

  const featuredPool = useMemo(() => MOCK_PLAZA_LIBRARIES.filter((r) => r.featured), [])
  const featuredDisplay = useMemo(
    () => shufflePlazaRows(featuredPool, featuredShuffleKey).slice(0, 4),
    [featuredPool, featuredShuffleKey]
  )

  const searchTrim = query.trim().toLowerCase()
  const searchRows = useMemo(() => {
    if (!searchTrim) return null
    return MOCK_PLAZA_LIBRARIES.filter(
      (r) =>
        r.title.toLowerCase().includes(searchTrim) ||
        r.description.toLowerCase().includes(searchTrim) ||
        r.authorHandle.toLowerCase().includes(searchTrim)
    )
  }, [searchTrim])

  const categoryRows = useMemo(() => {
    if (searchRows) return searchRows
    if (activeCategory === "recommended") {
      return [...MOCK_PLAZA_LIBRARIES].sort((a, b) => b.subscriberCount - a.subscriberCount)
    }
    return MOCK_PLAZA_LIBRARIES.filter((r) => r.plazaCategories.includes(activeCategory))
  }, [activeCategory, searchRows])

  const pick = useCallback(
    (row: PlazaLibraryRow) => {
      const kb = plazaRowToKnowledgeBase(row)
      if (onPickLibrary) onPickLibrary(kb)
      else toast.message("Library", { description: `Open “${row.title}” (demo).` })
    },
    [onPickLibrary]
  )

  return (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-zinc-950 dark:bg-zinc-950">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <header className="shrink-0 bg-white dark:bg-zinc-950 px-4 pb-2 pt-3 dark:bg-zinc-950">
          <div className="relative flex items-center justify-center py-1">
            <button
              type="button"
              onClick={onBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full p-2 text-zinc-600 transition-colors hover:bg-black/[0.04] dark:text-zinc-300 dark:hover:bg-white/10"
              aria-label="Back"
            >
              <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
            </button>
            <h1 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Library plaza</h1>
            <button
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full p-2 text-zinc-500 transition-colors hover:bg-black/[0.04] dark:text-zinc-400 dark:hover:bg-white/10"
              aria-label="Account"
              onClick={() => toast.message("Account", { description: "Demo entry." })}
            >
              <User className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
          {subtitle ? (
            <p className="mt-1 px-2 text-center text-[12px] leading-snug text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          ) : null}
          <div className="relative mt-3">
            <SmartSearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search libraries"
              className="w-full rounded-full border-0 bg-white py-2.5 pl-10 pr-4 text-[14px] text-zinc-900 shadow-sm outline-none ring-1 ring-black/[0.06] placeholder:text-zinc-400 focus:ring-2 focus:ring-stone-200/80 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/10 dark:focus:ring-zinc-200/50"
            />
          </div>
        </header>

        <div className="px-4 pb-2 pt-1">
          {!searchRows ? (
            <>
              <div className="mb-3 flex items-center justify-between pt-2">
                <span className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-50">Featured</span>
                <button
                  type="button"
                  onClick={() => {
                    setFeaturedShuffleKey((k) => k + 1)
                    toast.message("Refreshed", { description: "Featured order updated (demo)." })
                  }}
                  className="flex items-center gap-1 text-[13px] font-medium text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Shuffle
                </button>
              </div>

              <div className="divide-y divide-zinc-100/80 dark:divide-zinc-800/50">
                {featuredDisplay.map((row) => (
                  <PlazaCard key={`feat-${row.kbId}`} row={row} onPick={() => pick(row)} />
                ))}
              </div>
            </>
          ) : (
            <p className="py-3 text-center text-[13px] text-zinc-500">
              {searchRows.length} result{searchRows.length === 1 ? "" : "s"} for “{query.trim()}”
            </p>
          )}
        </div>

        {!searchRows ? (
          <div className="sticky top-0 z-20 border-y border-zinc-100/90 bg-white dark:bg-zinc-950 py-2.5 dark:border-zinc-800/80 dark:bg-zinc-950">
            <div className="flex gap-4 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {PLAZA_CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={cn(
                    "shrink-0 whitespace-nowrap text-[15px] transition-colors",
                    activeCategory === tab.id
                      ? "font-semibold text-zinc-900 dark:text-zinc-50"
                      : "font-normal text-zinc-500 dark:text-zinc-400"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="divide-y divide-zinc-100/80 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 dark:divide-zinc-800/50">
          {searchRows && searchRows.length === 0 ? (
            <div className="py-10 text-center text-[14px] text-zinc-500 dark:text-zinc-400">No libraries match your search</div>
          ) : (
            categoryRows.map((row) => <PlazaCard key={row.kbId} row={row} onPick={() => pick(row)} />)
          )}
        </div>
      </div>
    </div>
  )
}
