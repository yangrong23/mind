"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { Plus, Store } from "lucide-react"
import { LibraryPlazaView } from "@/components/mind-v2/library-plaza-view"
import { CreateLibrarySheet } from "@/components/mind-v2/create-library-sheet"
import {
  MOCK_KNOWLEDGE_BASES,
  knowledgeBaseFromCreate,
  type KnowledgeBase,
  type KBCategory,
} from "@/lib/mock-knowledge-bases"
import type { CreateLibraryPayload } from "@/components/mind-v2/create-library-sheet"

export { MOCK_KNOWLEDGE_BASES, type KnowledgeBase, type KBCategory } from "@/lib/mock-knowledge-bases"

interface KnowledgeTabProps {
  onKBClick: (kb: KnowledgeBase, options?: { openTeamInfo?: boolean }) => void
  requireAuthThen?: (run: () => void) => void
}

export function KnowledgeTab({ onKBClick, requireAuthThen }: KnowledgeTabProps) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const [activeCategory, setActiveCategory] = useState<KBCategory>("mine")
  const [showDiscover, setShowDiscover] = useState(false)
  const [customKBs, setCustomKBs] = useState<KnowledgeBase[]>([])
  const [createSheetOpen, setCreateSheetOpen] = useState(false)
  const [createCategory, setCreateCategory] = useState<"mine" | "team">("mine")

  const allKBs = useMemo(() => [...MOCK_KNOWLEDGE_BASES, ...customKBs], [customKBs])
  const filteredKBs = allKBs.filter((kb) => kb.category === activeCategory)
  const nextKbId = useMemo(
    () => allKBs.reduce((max, kb) => Math.max(max, kb.id), 0) + 1,
    [allKBs]
  )

  const categories = [
    { id: "mine" as KBCategory, label: "Mine" },
    { id: "team" as KBCategory, label: "Team" },
    { id: "subscribed" as KBCategory, label: "Following" },
  ]

  function openCreateSheet(category: "mine" | "team") {
    runWithAuth(() => {
      setCreateCategory(category)
      setCreateSheetOpen(true)
    })
  }

  function handleCreateLibrary(payload: CreateLibraryPayload) {
    const kb = knowledgeBaseFromCreate(payload, nextKbId)
    setCustomKBs((prev) => [kb, ...prev])
    toast.success("Library created", {
      description:
        payload.category === "team"
          ? `“${kb.name}” is ready for your team.`
          : `“${kb.name}” is in Mine.`,
    })
    onKBClick(kb, payload.category === "team" ? { openTeamInfo: true } : undefined)
  }

  if (showDiscover) {
    return (
      <LibraryPlazaView
        onBack={() => setShowDiscover(false)}
        onPickLibrary={(kb) => {
          setShowDiscover(false)
          onKBClick(kb)
        }}
      />
    )
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
              "text-mind hover:bg-stone-50 dark:text-mind/18 dark:hover:bg-zinc-800"
            )}
          >
            <Store className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Plaza
          </button>
        </div>
      </div>

      <div className={cn("shrink-0 px-5 py-2", mx.shellSurface)}>
        <div className="grid grid-cols-3 gap-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "border-b-2 py-2.5 text-center text-[14px] font-medium transition-colors",
                activeCategory === cat.id
                  ? "border-zinc-500 text-zinc-900 dark:border-zinc-400 dark:text-zinc-100"
                  : cn("border-transparent", mx.shellMuted, "hover:text-zinc-700 dark:hover:text-zinc-300")
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-5 py-2">
          <div className="divide-y divide-zinc-100/80 dark:divide-zinc-800/60">
            {filteredKBs.map((kb) => (
              <button
                key={kb.id}
                type="button"
                onClick={() => onKBClick(kb)}
                className="block w-full py-3.5 text-left transition-colors first:pt-1 hover:bg-black/[0.02] active:scale-[0.99] dark:hover:bg-white/[0.03]"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={kb.coverImage}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5">
                      <h3 className={cn("text-[15px] font-semibold leading-snug", mx.shellInk)}>{kb.name}</h3>
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
              </button>
            ))}
          </div>

          {(activeCategory === "mine" || activeCategory === "team") && (
            <button
              type="button"
              onClick={() => openCreateSheet(activeCategory)}
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-3.5 text-[14px] font-medium transition-colors",
                "border-stone-200 bg-stone-50 text-mind hover:bg-stone-50 dark:border-stone-50 dark:bg-zinc-800 dark:text-mind/10 dark:hover:bg-stone-100"
              )}
            >
              <Plus className="h-5 w-5" strokeWidth={1.75} />
              {activeCategory === "team" ? "New team library" : "New library"}
            </button>
          )}

          {activeCategory === "subscribed" && (
            <button
              type="button"
              onClick={() => setShowDiscover(true)}
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed py-3.5 text-[14px] font-medium transition-colors",
                "border-stone-200 bg-stone-50 text-mind hover:bg-stone-50 dark:border-stone-50 dark:bg-zinc-800 dark:text-mind/10 dark:hover:bg-stone-100"
              )}
            >
              <Store className="h-5 w-5" strokeWidth={1.75} />
              Browse library plaza
            </button>
          )}
        </div>
      </div>

      <CreateLibrarySheet
        open={createSheetOpen}
        category={createCategory}
        onClose={() => setCreateSheetOpen(false)}
        onCreate={handleCreateLibrary}
      />
    </div>
  )
}
