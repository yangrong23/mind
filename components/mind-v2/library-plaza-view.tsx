"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { ChevronLeft, RefreshCw } from "lucide-react"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"
import { MOCK_KNOWLEDGE_BASES, type KnowledgeBase } from "@/lib/mock-knowledge-bases"

const plazaCategories = ["For you", "Tech", "Education", "Work", "Finance", "Life"]

export interface LibraryPlazaViewProps {
  onBack: () => void
  /** When set (e.g. from Agent scope picker), tapping a row adds it and optionally closes. */
  onPickLibrary?: (kb: KnowledgeBase) => void
  /** Subcopy under title */
  subtitle?: string
}

export function LibraryPlazaView({ onBack, onPickLibrary, subtitle }: LibraryPlazaViewProps) {
  const [query, setQuery] = useState("")
  const [activeChip, setActiveChip] = useState(0)

  const filtered = MOCK_KNOWLEDGE_BASES.filter(
    (kb) =>
      kb.name.toLowerCase().includes(query.trim().toLowerCase()) ||
      kb.description.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <div className={cn("flex h-full min-h-0 flex-col", mx.shellCanvas)}>
      <div className={cn("shrink-0 border-b px-5 pb-3 pt-4", mx.shellHairline, mx.shellSurface)}>
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-sky-50/80 hover:text-zinc-800 dark:hover:bg-zinc-800"
            aria-label="Back"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className={cn("text-[17px] font-semibold tracking-tight", mx.shellInk)}>Library plaza</h1>
            <p className={cn("mt-0.5 text-[13px] leading-snug", mx.shellMuted)}>
              {subtitle ?? "Browse and tap a library to link it to your session."}
            </p>
          </div>
        </div>

        <div className="relative">
          <SmartSearchIcon
            className={cn("pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2", mx.shellIcon)}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search libraries"
            className={cn(
              "w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none transition-shadow",
              mx.shellHairline,
              "bg-sky-50/40 text-zinc-900 placeholder:text-zinc-400 focus:border-sky-200 focus:ring-2 focus:ring-sky-100/80 dark:bg-zinc-800/60 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-sky-800/50 dark:focus:ring-sky-900/40"
            )}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className={cn("text-[15px] font-semibold", mx.shellInk)}>Featured</span>
            <button
              type="button"
              className={cn("flex items-center gap-1 text-[13px] font-medium", mx.shellMuted, "hover:text-zinc-700")}
            >
              <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
              Refresh
            </button>
          </div>

          <div className="space-y-2.5">
            {filtered.map((kb) => (
              <button
                key={kb.id}
                type="button"
                onClick={() => onPickLibrary?.(kb)}
                className={cn(
                  "w-full text-left transition-transform active:scale-[0.99]",
                  onPickLibrary && "cursor-pointer"
                )}
              >
                <div className={cn("p-3.5", mx.shellCard)}>
                  <div className="flex items-start gap-3">
                    <img
                      src={kb.coverImage}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-black/[0.04] dark:ring-white/10"
                      width={56}
                      height={56}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className={cn("text-[15px] font-semibold leading-snug", mx.shellInk)}>{kb.name}</h3>
                      <p className={cn("mt-0.5 line-clamp-2 text-[13px] leading-relaxed", mx.shellMuted)}>
                        {kb.description}
                      </p>
                      <div className={cn("mt-2 flex flex-wrap items-center gap-x-2 text-[11px]", mx.shellIcon)}>
                        <span>{kb.count} items</span>
                        <span aria-hidden>·</span>
                        <span>Updated {kb.lastUpdate}</span>
                        {kb.subscribers != null ? (
                          <>
                            <span aria-hidden>·</span>
                            <span>{(kb.subscribers / 1000).toFixed(1)}k followers</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-6">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {plazaCategories.map((cat, i) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveChip(i)}
                className={cn(
                  "whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors",
                  activeChip === i
                    ? "bg-sky-600 text-white shadow-sm shadow-sky-600/20"
                    : cn(mx.shellPillInactive, "hover:bg-stone-200/80 dark:hover:bg-zinc-700")
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
