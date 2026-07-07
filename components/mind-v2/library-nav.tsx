"use client"

import { type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { MindAddButton, MindAddFab } from "@/components/mind-v2/mind-add-button"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"
import type { KBCategory } from "@/lib/mock-knowledge-bases"

export type LibraryTopTab = "plaza" | "mine"

const HEADER_GLASS =
  "shrink-0 border-b border-black/[0.06] bg-[var(--mind-page-bg)]/80 backdrop-blur-2xl backdrop-saturate-[1.8] supports-[backdrop-filter]:bg-white/72 dark:border-white/[0.08] dark:supports-[backdrop-filter]:bg-zinc-950/72"

/** Shared chrome for Library plaza top/bottom bars */
export const LIBRARY_CHROME_BAR = HEADER_GLASS

export const LIBRARY_CHROME_FOOTER =
  "shrink-0 border-t border-black/[0.06] bg-[var(--mind-page-bg)]/80 backdrop-blur-2xl backdrop-saturate-[1.8] supports-[backdrop-filter]:bg-white/72 dark:border-white/[0.08] dark:supports-[backdrop-filter]:bg-zinc-950/72"

const SEGMENTED_SHELL =
  "rounded-[11px] bg-zinc-200/55 p-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] dark:bg-zinc-800/80 dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]"

const SEGMENT_SELECTED =
  "bg-white text-zinc-900 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_0_0_0.5px_rgba(0,0,0,0.04)] dark:bg-zinc-700 dark:text-zinc-50 dark:shadow-[0_1px_4px_rgba(0,0,0,0.35),0_0_0_0.5px_rgba(255,255,255,0.06)]"

const SEGMENT_IDLE =
  "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"

const TOP_TABS: { id: LibraryTopTab; label: string }[] = [
  { id: "plaza", label: "Plaza" },
  { id: "mine", label: "My libraries" },
]

function NavIconButton({
  onClick,
  ariaLabel,
  children,
  active,
}: {
  onClick: () => void
  ariaLabel: string
  children: ReactNode
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full transition-[transform,background-color,color,box-shadow]",
        active
          ? "bg-mind/12 text-mind ring-1 ring-mind/20"
          :         "text-zinc-600 hover:bg-zinc-900/[0.06] hover:text-zinc-800 dark:text-zinc-300 dark:hover:bg-white/[0.1] dark:hover:text-zinc-100",
        mx.pressableChip
      )}
    >
      {children}
    </button>
  )
}

function LibrarySubTabRow({
  tabs,
  activeId,
  onChange,
  showDotForId,
}: {
  tabs: { id: string; label: string }[]
  activeId: string
  onChange: (id: string) => void
  showDotForId?: string
}) {
  return (
    <div
      className="flex justify-center gap-5 overflow-x-auto px-2 pb-0.5 pt-0.5 scrollbar-hide"
      role="tablist"
    >
      {tabs.map((tab) => {
        const selected = activeId === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative shrink-0 whitespace-nowrap pb-1 text-center text-[15px] transition-colors",
              selected
                ? "font-semibold text-zinc-900 dark:text-zinc-50"
                : "font-normal text-zinc-500 dark:text-zinc-400"
            )}
          >
            {tab.label}
            {showDotForId === tab.id ? (
              <span
                className="absolute -right-1.5 top-0 h-[5px] w-[5px] rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950"
                aria-hidden
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

/** Mobile — two-row nav: centered Plaza | My libraries + search top-right, then centered sub-tabs */
export function LibraryMobileTwoRowNav({
  topTab,
  onTopTabChange,
  subTabs,
  activeSubTab,
  onSubTabChange,
  showSubscribedDot,
  onSearch,
  searchActive,
  searchSlot,
  showSubTabs = true,
}: {
  topTab: LibraryTopTab
  onTopTabChange: (tab: LibraryTopTab) => void
  subTabs: { id: string; label: string }[]
  activeSubTab: string
  onSubTabChange: (id: string) => void
  showSubscribedDot?: boolean
  onSearch?: () => void
  searchActive?: boolean
  searchSlot?: ReactNode
  /** My libraries only — Plaza renders categories inside the plaza feed */
  showSubTabs?: boolean
}) {
  return (
    <header className={HEADER_GLASS}>
      <div
        className="relative flex items-center justify-center px-4 pb-0 pt-3"
        role="tablist"
        aria-label="Library sections"
      >
        <div className="flex items-center justify-center gap-8">
          {TOP_TABS.map((tab) => {
            const selected = topTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onTopTabChange(tab.id)}
                className="relative shrink-0 pb-2.5 text-center"
              >
                <span
                  className={cn(
                    "text-[17px] font-semibold tracking-[-0.02em] transition-colors",
                    selected ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400 dark:text-zinc-500"
                  )}
                >
                  {tab.label}
                </span>
                {selected ? (
                  <span
                    className="absolute bottom-0 left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full bg-mind"
                    aria-hidden
                  />
                ) : null}
              </button>
            )
          })}
        </div>
        {onSearch ? (
          <div className="absolute right-4 top-[calc(50%-2px)] -translate-y-1/2">
            <NavIconButton onClick={onSearch} ariaLabel="Search libraries" active={searchActive}>
              <SmartSearchIcon className="h-[15px] w-[15px]" strokeWidth={2.1} />
            </NavIconButton>
          </div>
        ) : null}
      </div>

      {showSubTabs ? (
        <div className="flex justify-center px-3 pb-2.5 pt-1">
          <LibrarySubTabRow
            tabs={subTabs}
            activeId={activeSubTab}
            onChange={onSubTabChange}
            showDotForId={showSubscribedDot ? "subscribed" : undefined}
          />
        </div>
      ) : (
        <div className="pb-1" aria-hidden />
      )}
      {searchSlot}
    </header>
  )
}

/** Floating create button — bottom-right above tab bar */
export function LibraryCreateFab({
  onClick,
  label,
  className,
}: {
  onClick: () => void
  label: string
  className?: string
}) {
  return (
    <MindAddFab
      onClick={onClick}
      ariaLabel={label}
      variant="fab-light"
      wrapperClassName={cn(
        "right-5 bottom-[max(5.25rem,calc(4.75rem+env(safe-area-inset-bottom)))]",
        className
      )}
    />
  )
}

type LibraryCategoryNavProps = {
  categories: { id: KBCategory; label: string }[]
  activeId: KBCategory
  onChange: (id: KBCategory) => void
  showSubscribedDot?: boolean
  compact?: boolean
}

export function LibraryCategorySegmented({
  categories,
  activeId,
  onChange,
  showSubscribedDot,
  compact = false,
}: LibraryCategoryNavProps) {
  return (
    <div
      className={cn("px-4 pb-3 pt-1", compact && "px-2 pb-2")}
      role="tablist"
      aria-label="Library categories"
    >
      <div className={cn(SEGMENTED_SHELL, "grid grid-cols-3 gap-[2px]")}>
        {categories.map((cat) => {
          const selected = activeId === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(cat.id)}
              className={cn(
                "relative flex min-h-[32px] items-center justify-center rounded-[8px] px-2",
                "text-center text-[13px] font-semibold tracking-[-0.02em] transition-[color,background-color,box-shadow,transform] duration-200 ease-out",
                compact ? "min-h-[28px] text-[12px]" : "min-h-[32px]",
                selected ? SEGMENT_SELECTED : SEGMENT_IDLE
              )}
            >
              <span className="relative z-[1]">{cat.label}</span>
              {cat.id === "subscribed" && showSubscribedDot ? (
                <span
                  className="absolute right-2 top-2 z-[2] h-[5px] w-[5px] rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-700"
                  aria-hidden
                />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type LibraryHomeNavProps = {
  showCreate: boolean
  createLabel: string
  onCreate: () => void
  onOpenPlaza: () => void
  categories: { id: KBCategory; label: string }[]
  activeCategory: KBCategory
  onCategoryChange: (id: KBCategory) => void
  showSubscribedDot?: boolean
  /** Desktop sidebar rail */
  variant?: "page" | "rail"
}

export function LibraryHomeNav({
  showCreate,
  createLabel,
  onCreate,
  onOpenPlaza,
  categories,
  activeCategory,
  onCategoryChange,
  showSubscribedDot,
  variant = "page",
}: LibraryHomeNavProps) {
  const isRail = variant === "rail"

  if (isRail) {
    return (
      <header className={cn(HEADER_GLASS, "px-2.5 pb-2 pt-2")}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
            Libraries
          </span>
          <button
            type="button"
            onClick={onOpenPlaza}
            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-mind hover:bg-mind/10"
          >
            Plaza
          </button>
        </div>
        <LibraryCategorySegmented
          categories={categories}
          activeId={activeCategory}
          onChange={onCategoryChange}
          showSubscribedDot={showSubscribedDot}
          compact
        />
      </header>
    )
  }

  return null
}

type LibraryDetailViewId = "content" | "graph" | "factory"

const DETAIL_VIEWS: { id: LibraryDetailViewId; label: string }[] = [
  { id: "content", label: "Material" },
  { id: "graph", label: "AI view" },
  { id: "factory", label: "Studio" },
]

export function LibraryDetailViewNav({
  activeView,
  onViewChange,
  emphasizeView,
}: {
  activeView: LibraryDetailViewId
  onViewChange: (id: LibraryDetailViewId) => void
  /** Draw attention to Material when the library has no sources yet */
  emphasizeView?: LibraryDetailViewId
}) {
  return (
    <div className={cn(HEADER_GLASS, "px-4 pb-3 pt-2")} role="tablist" aria-label="Library views">
      <div className={cn(SEGMENTED_SHELL, "grid grid-cols-3 gap-[2px]")}>
        {DETAIL_VIEWS.map((mode) => {
          const selected = activeView === mode.id
          const emphasize = emphasizeView === mode.id && !selected
          return (
            <button
              key={mode.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onViewChange(mode.id)}
              className={cn(
                "flex min-h-[34px] items-center justify-center rounded-[8px] px-1",
                "text-[13px] font-semibold tracking-[-0.02em] transition-[color,background-color,box-shadow] duration-200 ease-out",
                selected ? SEGMENT_SELECTED : SEGMENT_IDLE,
                emphasize && "ring-2 ring-mind/35 ring-offset-1 ring-offset-transparent"
              )}
            >
              {mode.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
