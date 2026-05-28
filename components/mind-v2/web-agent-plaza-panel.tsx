"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { WebPlazaDiscoverPage } from "@/components/mind-v2/web-plaza-discover-page"
import { PLAZA_CATEGORY_TABS, type PlazaCategoryId, type PlazaLibraryRow } from "@/lib/mock-plaza-libraries"

/** Compact plaza column for agent-home swipe. */
export function WebAgentPlazaPanel({
  onBrowseLibrary,
  onStartThread,
  extraPlazaRows = [],
  onOpenFullHub,
}: {
  onBrowseLibrary: (row: PlazaLibraryRow) => void
  onStartThread: (row: PlazaLibraryRow, prompt?: string) => void
  extraPlazaRows?: PlazaLibraryRow[]
  onOpenFullHub?: () => void
}) {
  const [category, setCategory] = useState<PlazaCategoryId>("recommended")

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <header className="shrink-0 border-b border-stone-200/90 bg-white/95 px-4 pb-2 pt-4 backdrop-blur-sm sm:px-5 sm:pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[20px] font-semibold tracking-tight text-zinc-900">Library Plaza</h1>
            <p className="mt-0.5 text-[13px] text-zinc-500">Discover public libraries · subscribe to chat with Mindar</p>
          </div>
          {onOpenFullHub ? (
            <button
              type="button"
              onClick={onOpenFullHub}
              className="shrink-0 rounded-full border border-stone-200/90 px-3 py-1.5 text-[12px] font-medium text-zinc-600 transition-colors hover:bg-stone-50"
            >
              Full plaza
            </button>
          ) : null}
        </div>
        <div
          className="mt-3 flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Plaza categories"
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
                  "shrink-0 pb-1 text-[14px] transition-colors",
                  active
                    ? "border-b-2 border-zinc-900 font-semibold text-zinc-900"
                    : "font-normal text-zinc-500 hover:text-zinc-700"
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </header>

      <div className={cn("min-h-0 flex-1 overflow-hidden", web.canvas)}>
        <WebPlazaDiscoverPage
          embedded
          category={category}
          onCategoryChange={setCategory}
          extraPlazaRows={extraPlazaRows}
          onBrowseLibrary={onBrowseLibrary}
          onStartThread={onStartThread}
        />
      </div>
    </div>
  )
}
