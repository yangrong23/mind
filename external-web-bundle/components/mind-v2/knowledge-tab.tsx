"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavListItem } from "@/components/mind-v2/web-nav-selection"
import { Plus, Store } from "lucide-react"
import { LibraryPlazaView } from "@/components/mind-v2/library-plaza-view"
import { CreateLibrarySheet } from "@/components/mind-v2/create-library-sheet"
import {
  MOCK_KNOWLEDGE_BASES,
  knowledgeBaseFromCreate,
  type KnowledgeBase,
  type KBCategory,
  type SubscribedKbRole,
} from "@/lib/mock-knowledge-bases"
import { LibraryCoverFromKb, LibraryCoverWithUpdateBadge } from "@/components/mind-v2/library-cover"
import type { CreateLibraryPayload } from "@/components/mind-v2/create-library-sheet"

export { MOCK_KNOWLEDGE_BASES, type KnowledgeBase, type KBCategory } from "@/lib/mock-knowledge-bases"

interface KnowledgeTabProps {
  onKBClick: (kb: KnowledgeBase, options?: { openTeamInfo?: boolean }) => void
  requireAuthThen?: (run: () => void) => void
  /** Desktop rail: compact list, no page title; optional selection highlight */
  layout?: "page" | "rail"
  selectedKbId?: number | null
}

export function KnowledgeTab({
  onKBClick,
  requireAuthThen,
  layout = "page",
  selectedKbId = null,
}: KnowledgeTabProps) {
  const isRail = layout === "rail"
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
    { id: "subscribed" as KBCategory, label: "Subscribed" },
  ]

  const SUBSCRIBED_GROUPS: { id: SubscribedKbRole; label: string }[] = [
    { id: "published", label: "Published" },
    { id: "followed", label: "Following" },
  ]

  function subscribedRoleOf(kb: KnowledgeBase): SubscribedKbRole {
    return kb.subscribedRole === "published" ? "published" : "followed"
  }

  const subscribedByRole = useMemo(() => {
    const items = allKBs.filter((kb) => kb.category === "subscribed")
    return {
      published: items.filter((kb) => subscribedRoleOf(kb) === "published"),
      followed: items.filter((kb) => subscribedRoleOf(kb) === "followed"),
    }
  }, [allKBs])

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
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-col",
        isRail ? "bg-transparent" : "bg-[#fafaf9] dark:bg-zinc-950"
      )}
    >
      {isRail ? (
        <div className="flex shrink-0 items-center justify-between border-b border-stone-200/90 px-3 py-2.5 dark:border-zinc-800">
          <span className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">Libraries</span>
          <button
            type="button"
            onClick={() => setShowDiscover(true)}
            className="rounded-lg px-2 py-1 text-[12px] font-medium text-mind hover:bg-mind/8"
          >
            Plaza
          </button>
        </div>
      ) : (
        <div className={cn("shrink-0 border-b", "border-[#e5e3df] dark:border-zinc-800", "bg-[#f6f5f4]/95 dark:bg-zinc-900/95")}>
          <div className="flex items-center justify-between px-5 py-3">
            <h1 className={cn("text-[17px] font-semibold tracking-tight", "text-[#1a1a1a] dark:text-zinc-100")}>Knowledge</h1>
            <button
              type="button"
              onClick={() => setShowDiscover(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium transition-colors",
                "text-mind",
                "hover:bg-mind/8 dark:hover:bg-mind/12"
              )}
            >
              <Store className={cn("h-4 w-4", "text-mind")} strokeWidth={1.75} aria-hidden />
              Plaza
            </button>
          </div>
        </div>
      )}

      <div className={cn("shrink-0 py-0", isRail ? "px-2" : cn("px-5", "bg-[#f6f5f4]/95 dark:bg-zinc-900/95"))}>
        <div className="grid grid-cols-3 gap-0">
          {categories.map((cat) => {
            const selected = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "relative flex items-center justify-center border-b-2 border-transparent text-center font-medium transition-colors",
                  isRail ? "py-2 text-[12px]" : "py-2.5 text-[14px]",
                  selected
                    ? "text-zinc-900 dark:text-zinc-100"
                    : cn("text-[#787671] dark:text-zinc-400", "hover:text-zinc-700 dark:hover:text-zinc-300")
                )}
              >
                {cat.label}
                {cat.id === "subscribed" &&
                allKBs.some((kb) => kb.category === "subscribed" && kb.hasContentUpdate) ? (
                  <span
                    className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500"
                    aria-hidden
                  />
                ) : null}
                {selected ? (
                  <span
                    className={cn(
                      "absolute bottom-0 left-1/2 h-[2px] w-10 -translate-x-1/2 rounded-full",
                      "bg-mind/20 dark:bg-mind/25"
                    )}
                    aria-hidden
                  />
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className={isRail ? "px-2 py-1" : "px-5 py-2"}>
          {activeCategory === "subscribed" ? (
            <div className={cn(isRail ? "space-y-2" : "space-y-4")}>
              {SUBSCRIBED_GROUPS.map((group) => {
                const groupItems = subscribedByRole[group.id]
                if (groupItems.length === 0) return null
                return (
                  <div key={group.id}>
                    <p
                      className={cn(
                        "font-medium text-zinc-500",
                        isRail ? "mb-1 px-1 text-[11px]" : "mb-2 text-[13px]"
                      )}
                    >
                      {group.label}
                    </p>
                    <div className={cn(isRail ? "space-y-0.5" : "divide-y divide-zinc-100/80 dark:divide-zinc-800/60")}>
                      {groupItems.map((kb) => {
                        const rowSelected = isRail && selectedKbId === kb.id
                        return (
                          <button
                            key={kb.id}
                            type="button"
                            onClick={() => onKBClick(kb)}
                            className={cn(
                              "block w-full text-left",
                              isRail ? "rounded-xl px-2 py-2.5" : "py-3.5 first:pt-1",
                              isRail
                                ? webNavListItem(rowSelected)
                                : rowSelected
                                  ? cn(web.kbItemActive)
                                  : "transition-colors hover:bg-black/[0.02] active:scale-[0.99] dark:hover:bg-white/[0.03]"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <LibraryCoverWithUpdateBadge
                                kb={kb}
                                hasUpdate={kb.hasContentUpdate}
                                coverClassName={isRail ? "h-9 w-9" : "h-12 w-12 rounded-xl"}
                              />
                              <div className="min-w-0 flex-1">
                                <h3
                                  className={cn(
                                    "truncate font-semibold leading-snug",
                                    isRail ? "text-[13px]" : "text-[15px]",
                                    "text-[#1a1a1a] dark:text-zinc-100"
                                  )}
                                >
                                  {kb.name}
                                </h3>
                                {!isRail ? (
                                  <>
                                    <p className={cn("mt-0.5 line-clamp-1 text-[13px]", "text-[#787671] dark:text-zinc-400")}>
                                      {kb.publisherName ?? kb.description}
                                    </p>
                                    <p className={cn("mt-2 text-[11px] tabular-nums", "text-[#a4a097] dark:text-zinc-500")}>
                                      Updated {kb.lastUpdate}
                                    </p>
                                  </>
                                ) : (
                                  <p className="mt-0.5 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
                                    Updated {kb.lastUpdate}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={cn(isRail ? "space-y-0.5" : "divide-y divide-zinc-100/80 dark:divide-zinc-800/60")}>
              {filteredKBs.map((kb) => {
                const rowSelected = isRail && selectedKbId === kb.id
                return (
                  <button
                    key={kb.id}
                    type="button"
                    onClick={() => onKBClick(kb)}
                    className={cn(
                      "block w-full text-left",
                      isRail ? "rounded-xl px-2 py-2.5" : "py-3.5 first:pt-1",
                      isRail
                        ? webNavListItem(rowSelected)
                        : rowSelected
                          ? cn(web.kbItemActive)
                          : "transition-colors hover:bg-black/[0.02] active:scale-[0.99] dark:hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={cn(
                          "shrink-0 overflow-hidden rounded-lg ring-1 ring-stone-200/90 dark:ring-zinc-700/80",
                          isRail ? "h-9 w-9" : "h-12 w-12 rounded-xl"
                        )}
                      >
                        <LibraryCoverFromKb kb={kb} showMiniUi={false} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className={cn(
                            "font-semibold leading-snug",
                            isRail ? "text-[13px]" : "mb-0.5 text-[15px]",
                            "text-[#1a1a1a] dark:text-zinc-100"
                          )}
                        >
                          {kb.name}
                        </h3>
                        {!isRail ? (
                          <p className={cn("line-clamp-1 text-[13px] leading-relaxed", "text-[#787671] dark:text-zinc-400")}>
                            {kb.description}
                          </p>
                        ) : null}
                        <div
                          className={cn(
                            "flex flex-wrap items-center gap-x-1.5",
                            isRail ? "mt-0.5 text-[10px]" : cn("mt-2 gap-x-2 text-[11px]", "text-[#a4a097] dark:text-zinc-500")
                          )}
                        >
                          <span>{kb.count} items</span>
                          {!isRail ? (
                            <>
                              <span aria-hidden>·</span>
                              <span>Updated {kb.lastUpdate}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {(activeCategory === "mine" || activeCategory === "team") && (
            <button
              type="button"
              onClick={() => openCreateSheet(activeCategory)}
              className={cn(
                "mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed font-medium transition-colors",
                isRail ? "py-2 text-[11px]" : "mt-4 rounded-2xl py-2.5 text-[12px]",
                "border-stone-200 bg-stone-50 text-zinc-600 hover:border-stone-300 hover:bg-stone-100",
                "dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              )}
            >
              <Plus
                className={cn(
                  "shrink-0 text-zinc-500 dark:text-zinc-400",
                  isRail ? "h-2.5 w-2.5" : "h-2 w-2"
                )}
                strokeWidth={2.25}
                aria-hidden
              />
              {activeCategory === "team" ? "New team library" : "New library"}
            </button>
          )}

          {activeCategory === "subscribed" && (
            <button
              type="button"
              onClick={() => setShowDiscover(true)}
              className={cn(
                "flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed font-medium transition-colors",
                isRail ? "mt-2 py-2 text-[11px]" : "mt-4 rounded-2xl py-2.5 text-[12px]",
                "border-stone-200 bg-stone-50 text-zinc-600 hover:border-stone-300 hover:bg-stone-100",
                "dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              )}
            >
              <Store
                className={cn(
                  "shrink-0 text-zinc-500 dark:text-zinc-400",
                  isRail ? "h-2.5 w-2.5" : "h-2 w-2"
                )}
                strokeWidth={2.25}
                aria-hidden
              />
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
