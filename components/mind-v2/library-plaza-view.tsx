"use client"

import { useCallback, useMemo, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { ChevronLeft, RefreshCw, Check, Globe } from "lucide-react"
import { toast } from "sonner"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { LibraryCover } from "@/components/mind-v2/library-cover"
import { LIBRARY_CHROME_BAR, LIBRARY_CHROME_FOOTER } from "@/components/mind-v2/library-nav"
import {
  MOCK_PLAZA_LIBRARIES,
  PLAZA_CATEGORY_TABS,
  formatPlazaContent,
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
        "inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white",
        tone === "blue" ? "bg-zinc-400 dark:bg-zinc-500" : "bg-amber-600/85 dark:bg-amber-500/90"
      )}
      title="Verified"
      aria-label="Verified"
    >
      <Check className="h-2 w-2 stroke-[3]" aria-hidden />
    </span>
  )
}

function PlazaSearchBar({
  value,
  onChange,
  className,
  compact,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
  compact?: boolean
}) {
  return (
    <div className={cn("relative", className)}>
      <SmartSearchIcon
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500",
          compact ? "left-3 h-3.5 w-3.5" : "left-3.5 h-4 w-4"
        )}
        strokeWidth={2}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search subscribed libraries"
        className={cn(
          "w-full rounded-full border border-stone-200/50 bg-[var(--mind-surface)] text-zinc-900 outline-none",
          mx.typePlaceholder,
          "focus:border-stone-300/60 focus:ring-2 focus:ring-black/[0.03]",
          "dark:border-zinc-700/45 dark:bg-[var(--mind-surface)] dark:text-zinc-100 dark:focus:ring-white/[0.06]",
          compact ? "py-2 pl-9 pr-3 text-[13px]" : "py-2.5 pl-10 pr-4 text-[14px]"
        )}
      />
    </div>
  )
}

function PlazaSectionHeader({
  title,
  action,
}: {
  title: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 pb-1.5 pt-0.5">
      <h2 className={cn("text-[12px] font-semibold tracking-tight", mx.shellInk)}>{title}</h2>
      {action}
    </div>
  )
}

function PlazaGhostAction({
  onClick,
  children,
  ariaLabel,
}: {
  onClick: () => void
  children: ReactNode
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5",
        "text-[11px] font-medium tabular-nums",
        mx.shellMuted,
        mx.pressableChip,
        "hover:text-zinc-700 dark:hover:text-zinc-200"
      )}
    >
      {children}
    </button>
  )
}

function plazaPublisherLabel(row: PlazaLibraryRow) {
  return (row.publisherName ?? row.authorHandle.replace(/^@/, "")).trim() || "Publisher"
}

function plazaCardMetaLine(row: PlazaLibraryRow) {
  return formatPlazaContent(row.contentCount).replace(/ items$/, " sources")
}

function PlazaVisualCard({ row, onPick }: { row: PlazaLibraryRow; onPick: () => void }) {
  const publisher = plazaPublisherLabel(row)
  const initial = publisher.charAt(0).toUpperCase() || "P"

  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "group relative aspect-[3/4] w-full overflow-hidden rounded-xl text-left",
        "ring-1 ring-black/[0.05] dark:ring-white/[0.08]",
        mx.pressableChip,
        "hover:ring-black/[0.08] dark:hover:ring-white/12"
      )}
    >
      <LibraryCover
        name={row.title}
        coverVariant={row.coverVariant}
        showMiniUi={false}
        className="absolute inset-0 h-full w-full scale-100 transition-transform duration-300 group-hover:scale-[1.02]"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/5"
        aria-hidden
      />

      <div className="absolute inset-x-0 bottom-0 p-2">
        <div className="mb-1 flex min-w-0 items-center gap-1">
          <div
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/20 text-[8px] font-bold text-white ring-1 ring-white/20"
            aria-hidden
          >
            {initial}
          </div>
          <span className="min-w-0 truncate text-[9px] font-medium text-white/85">{publisher}</span>
          {row.verified && row.verifyTone ? (
            <VerifiedDot tone={row.verifyTone} />
          ) : null}
        </div>
        <h3 className="line-clamp-2 text-[11px] font-semibold leading-[1.25] tracking-tight text-white">
          {row.title}
        </h3>
        <div className="mt-1 flex items-end justify-between gap-1">
          <p className="line-clamp-1 min-w-0 text-[9px] leading-tight text-white/65 tabular-nums">
            {plazaCardMetaLine(row)}
          </p>
          <Globe className="h-3 w-3 shrink-0 text-white/50" strokeWidth={1.75} aria-hidden />
        </div>
      </div>
    </button>
  )
}

function PlazaCardGrid({
  rows,
  onPick,
  className,
  dense = true,
}: {
  rows: PlazaLibraryRow[]
  onPick: (row: PlazaLibraryRow) => void
  className?: string
  dense?: boolean
}) {
  if (rows.length === 0) return null
  return (
    <div
      className={cn(
        "grid gap-2",
        dense ? "grid-cols-3 sm:grid-cols-3" : "grid-cols-2 gap-3",
        className
      )}
    >
      {rows.map((row) => (
        <PlazaVisualCard key={row.kbId} row={row} onPick={() => onPick(row)} />
      ))}
    </div>
  )
}

function PlazaCategoryTabs({
  activeCategory,
  onCategoryChange,
  className,
}: {
  activeCategory: PlazaCategoryId
  onCategoryChange: (id: PlazaCategoryId) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex justify-center gap-4 overflow-x-auto scrollbar-hide sm:gap-5",
        className
      )}
      role="tablist"
      aria-label="Plaza categories"
    >
      {PLAZA_CATEGORY_TABS.map((tab) => {
        const selected = activeCategory === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onCategoryChange(tab.id)}
            className={cn(
              "relative shrink-0 whitespace-nowrap pb-2 text-[13px] transition-colors",
              mx.pressableChip,
              selected ? cn("font-semibold", mx.shellInk) : cn("font-normal", mx.shellMuted)
            )}
          >
            {tab.label}
            {selected ? (
              <span
                className="absolute bottom-0 left-1/2 h-[2.5px] w-6 -translate-x-1/2 rounded-full bg-mind"
                aria-hidden
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

function PlazaFooterBar({
  count,
  categoryLabel,
  className,
}: {
  count: number
  categoryLabel: string
  className?: string
}) {
  return (
    <footer className={cn(LIBRARY_CHROME_FOOTER, "px-4 py-2.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className={cn("text-[11px] font-medium tabular-nums", mx.shellMuted)}>
          {count} librar{count === 1 ? "y" : "ies"}
        </p>
        <p className={cn("truncate text-[11px] font-semibold", mx.shellInk)}>{categoryLabel}</p>
      </div>
    </footer>
  )
}

export interface LibraryPlazaViewProps {
  onBack: () => void
  onPickLibrary?: (kb: KnowledgeBase) => void
  subtitle?: string
  embedded?: boolean
  hideOuterNav?: boolean
  activeCategory?: PlazaCategoryId
  onCategoryChange?: (id: PlazaCategoryId) => void
  query?: string
  onQueryChange?: (query: string) => void
}

export function LibraryPlazaView({
  onBack,
  onPickLibrary,
  subtitle,
  embedded = false,
  hideOuterNav = false,
  activeCategory: activeCategoryProp,
  onCategoryChange,
  query: queryProp,
  onQueryChange,
}: LibraryPlazaViewProps) {
  const [queryInternal, setQueryInternal] = useState("")
  const [activeCategoryInternal, setActiveCategoryInternal] = useState<PlazaCategoryId>("recommended")
  const query = queryProp ?? queryInternal
  const setQuery = onQueryChange ?? setQueryInternal
  const activeCategory = activeCategoryProp ?? activeCategoryInternal
  const setActiveCategory = onCategoryChange ?? setActiveCategoryInternal
  const [featuredShuffleKey, setFeaturedShuffleKey] = useState(0)

  const featuredPool = useMemo(() => MOCK_PLAZA_LIBRARIES.filter((r) => r.featured), [])
  const featuredDisplay = useMemo(
    () => shufflePlazaRows(featuredPool, featuredShuffleKey).slice(0, 6),
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

  const isRecommended = activeCategory === "recommended" && !searchRows

  const categoryLabel = searchRows
    ? `Search · “${query.trim()}”`
    : PLAZA_CATEGORY_TABS.find((t) => t.id === activeCategory)?.label ?? "Plaza"

  const horizontalPad = hideOuterNav ? "px-4" : "px-3.5"

  return (
    <div className={cn("flex h-full min-h-0 flex-col", hideOuterNav ? "bg-transparent" : mx.pageBg)}>
      {/* Top chrome — mirrors footer */}
      {!hideOuterNav ? (
        <header className={cn(LIBRARY_CHROME_BAR, "px-3.5 pb-2.5 pt-2.5")}>
          {embedded ? (
            <h1 className="text-center text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Library plaza
            </h1>
          ) : (
            <div className="relative flex items-center justify-center py-0.5">
              <button
                type="button"
                onClick={onBack}
                className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-zinc-600 dark:text-zinc-300",
                  mx.pressableChip
                )}
                aria-label="Back"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <h1 className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Library plaza
              </h1>
            </div>
          )}
          {subtitle ? (
            <p className={cn("mt-0.5 text-center", mx.typeCaption)}>{subtitle}</p>
          ) : null}
          <PlazaSearchBar value={query} onChange={setQuery} compact className="mt-2" />
        </header>
      ) : (
        <div className={cn(LIBRARY_CHROME_BAR, "sticky top-0 z-20 px-4 pb-2 pt-1")}>
          <PlazaSearchBar value={query} onChange={setQuery} compact />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className={cn(horizontalPad, "pb-1.5 pt-1.5")}>
          {searchRows ? (
            <p className={cn("py-1.5 text-center", mx.typeCaption)}>
              {searchRows.length} result{searchRows.length === 1 ? "" : "s"}
            </p>
          ) : !isRecommended ? (
            <button
              type="button"
              onClick={() => setActiveCategory("recommended")}
              className={cn(
                "mb-1.5 inline-flex items-center gap-0.5 py-0.5 text-[12px] font-medium",
                mx.accentBlue,
                mx.pressableChip
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              For you
            </button>
          ) : null}

          {isRecommended ? (
            <>
              <PlazaSectionHeader
                title="Featured"
                action={
                  <PlazaGhostAction
                    ariaLabel="Shuffle featured libraries"
                    onClick={() => {
                      setFeaturedShuffleKey((k) => k + 1)
                      toast.message("Refreshed", { description: "Featured order updated (demo)." })
                    }}
                  >
                    <RefreshCw className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                    Shuffle
                  </PlazaGhostAction>
                }
              />
              <PlazaCardGrid rows={featuredDisplay} onPick={pick} />
            </>
          ) : null}
        </div>

        {isRecommended ? (
          <div className={cn("sticky top-0 z-10", LIBRARY_CHROME_BAR, "py-1.5")}>
            <PlazaCategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              className={horizontalPad}
            />
          </div>
        ) : null}

        <div className={cn(horizontalPad, "pb-2 pt-1")}>
          {searchRows && searchRows.length === 0 ? (
            <div className={cn("py-8 text-center", mx.typeBody)}>No libraries match your search</div>
          ) : (
            <PlazaCardGrid rows={categoryRows} onPick={pick} />
          )}
        </div>
      </div>

      {/* Bottom chrome — echoes top search bar */}
      <PlazaFooterBar count={categoryRows.length} categoryLabel={categoryLabel} />
    </div>
  )
}
