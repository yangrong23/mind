"use client"

import { SmartSearchIcon } from "@/components/ui/smart-search-icon"
import { cn } from "@/lib/utils"

export type LibraryHubPrimary = "plaza" | "libraries"

export type LibraryHubSubTab = {
  id: string
  label: string
}

const PRIMARY_TABS: { id: LibraryHubPrimary; label: string }[] = [
  { id: "plaza", label: "Plaza" },
  { id: "libraries", label: "My Library" },
]

/** Two-row hub nav — primary tabs + scrollable sub-tabs (reference: 广场 / 动态 layout). */
export function WebLibraryHubHeader({
  primary,
  onPrimaryChange,
  subTabs,
  activeSubId,
  onSubChange,
  onSearchClick,
  searchActive = false,
  className,
}: {
  primary: LibraryHubPrimary
  onPrimaryChange: (id: LibraryHubPrimary) => void
  subTabs: LibraryHubSubTab[]
  activeSubId: string
  onSubChange: (id: string) => void
  onSearchClick?: () => void
  searchActive?: boolean
  className?: string
}) {
  return (
    <header
      className={cn(
        "shrink-0 border-b border-stone-200/90 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95",
        className
      )}
    >
      <div className="flex items-center gap-2 px-4 pt-3 pb-1 sm:px-5">
        <div className="flex min-w-0 flex-1 items-end gap-6 sm:gap-8" role="tablist" aria-label="Library hub">
          {PRIMARY_TABS.map((tab) => {
            const active = primary === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onPrimaryChange(tab.id)}
                className={cn(
                  "relative shrink-0 pb-2 text-[17px] tracking-tight transition-colors",
                  active
                    ? "font-semibold text-zinc-900 dark:text-zinc-50"
                    : "font-medium text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                )}
              >
                {tab.label}
                {active ? (
                  <span
                    className="absolute bottom-0 left-1/2 h-[3px] w-7 -translate-x-1/2 rounded-full bg-zinc-900 dark:bg-zinc-100"
                    aria-hidden
                  />
                ) : null}
              </button>
            )
          })}
        </div>
        {onSearchClick ? (
          <button
            type="button"
            onClick={onSearchClick}
            className={cn(
              "mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
              searchActive
                ? "bg-stone-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-600 hover:bg-stone-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            )}
            aria-label="Search"
            aria-pressed={searchActive}
          >
            <SmartSearchIcon className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      {subTabs.length > 0 ? (
        <div
          className="scrollbar-hide flex gap-5 overflow-x-auto px-4 pb-2.5 pt-1 sm:gap-6 sm:px-5"
          role="tablist"
          aria-label={primary === "plaza" ? "Plaza categories" : "Library sections"}
        >
          {subTabs.map((tab) => {
            const active = activeSubId === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSubChange(tab.id)}
                className={cn(
                  "shrink-0 whitespace-nowrap py-1 text-[14px] transition-colors",
                  active
                    ? "font-semibold text-zinc-900 dark:text-zinc-100"
                    : "font-normal text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </header>
  )
}
