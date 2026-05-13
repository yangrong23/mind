"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { ChevronRight, Store } from "lucide-react"
import { LibraryPlazaView } from "@/components/mind-v2/library-plaza-view"
import {
  MOCK_KNOWLEDGE_BASES,
  type KnowledgeBase,
  type KBCategory,
} from "@/lib/mock-knowledge-bases"

export { MOCK_KNOWLEDGE_BASES, type KnowledgeBase, type KBCategory } from "@/lib/mock-knowledge-bases"

interface KnowledgeTabProps {
  onKBClick: (kb: KnowledgeBase) => void
}

export function KnowledgeTab({ onKBClick }: KnowledgeTabProps) {
  const [activeCategory, setActiveCategory] = useState<KBCategory>("mine")
  const [showDiscover, setShowDiscover] = useState(false)

  const filteredKBs = MOCK_KNOWLEDGE_BASES.filter((kb) => kb.category === activeCategory)

  const categories = [
    { id: "mine" as KBCategory, label: "Mine" },
    { id: "team" as KBCategory, label: "Team" },
    { id: "subscribed" as KBCategory, label: "Following" },
  ]

  if (showDiscover) {
    return <LibraryPlazaView onBack={() => setShowDiscover(false)} />
  }

  return (
    <div className={cn("relative flex h-full min-h-0 flex-col", mx.shellCanvas)}>
      <div className={cn("shrink-0 border-b", mx.shellHairline, mx.shellSurface)}>
        <div className="flex items-center justify-between px-5 py-3">
          <h1 className={cn("text-[17px] font-semibold tracking-tight", mx.shellInk)}>Knowledge</h1>
          <button
            type="button"
            onClick={() => setShowDiscover(true)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium transition-colors",
              "text-sky-800 hover:bg-sky-50/90 dark:text-sky-200 dark:hover:bg-zinc-800"
            )}
          >
            <Store className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Plaza
          </button>
        </div>
      </div>

      <div className={cn("shrink-0 border-b px-5 py-2", mx.shellHairline, mx.shellSurface)}>
        <div className="grid grid-cols-3 gap-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "border-b-2 py-2.5 text-center text-[14px] font-medium transition-colors",
                activeCategory === cat.id
                  ? "border-sky-500 text-zinc-900 dark:border-sky-400 dark:text-zinc-100"
                  : cn("border-transparent", mx.shellMuted, "hover:text-zinc-700 dark:hover:text-zinc-300")
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-5 py-4">
          <div className="space-y-2.5">
            {filteredKBs.map((kb) => (
              <button
                key={kb.id}
                type="button"
                onClick={() => onKBClick(kb)}
                className={cn("w-full text-left transition-transform active:scale-[0.99]")}
              >
                <div className={cn("p-3.5", mx.shellCard)}>
                  <div className="flex items-start gap-3">
                    <img
                      src={kb.coverImage}
                      alt=""
                      width={48}
                      height={48}
                      className="h-12 w-12 shrink-0 rounded-2xl object-cover ring-1 ring-black/[0.04] dark:ring-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center justify-between gap-2">
                        <h3 className={cn("text-[15px] font-semibold leading-snug", mx.shellInk)}>{kb.name}</h3>
                        <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300 dark:text-zinc-600" strokeWidth={1.75} />
                      </div>
                      <p className={cn("line-clamp-1 text-[13px] leading-relaxed", mx.shellMuted)}>{kb.description}</p>
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

          {activeCategory === "subscribed" && (
            <button
              type="button"
              onClick={() => setShowDiscover(true)}
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-3.5 text-[14px] font-medium transition-colors",
                "border-sky-200/90 bg-sky-50/50 text-sky-900 hover:bg-sky-50 dark:border-sky-800/50 dark:bg-sky-950/25 dark:text-sky-100 dark:hover:bg-sky-950/40"
              )}
            >
              <Store className="h-5 w-5" strokeWidth={1.75} />
              Browse library plaza
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
