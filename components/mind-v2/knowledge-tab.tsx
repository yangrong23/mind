"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { ChevronDown, Store } from "lucide-react"
import { LibraryPlazaView } from "@/components/mind-v2/library-plaza-view"
import {
  LibraryCreateFab,
  LibraryHomeNav,
  LibraryMobileTwoRowNav,
  type LibraryTopTab,
} from "@/components/mind-v2/library-nav"
import { LibraryEmptyState } from "@/components/mind-v2/library-empty-state"
import { LibraryPlazaPromoStrip } from "@/components/mind-v2/library-plaza-promo-strip"
import { CreateLibrarySheet } from "@/components/mind-v2/create-library-sheet"
import { SmartSearchIcon } from "@/components/ui/smart-search-icon"
import {
  SwipeableKnowledgeBaseRow,
  readPinnedKbIds,
  sortKnowledgeBasesWithPins,
  writePinnedKbIds,
} from "@/components/mind-v2/swipeable-knowledge-base-row"
import {
  MOCK_KNOWLEDGE_BASES,
  knowledgeBaseFromCreate,
  type KnowledgeBase,
  type KBCategory,
  type SubscribedKbRole,
} from "@/lib/mock-knowledge-bases"
import {
  type PlazaCategoryId,
} from "@/lib/mock-plaza-libraries"
import type { CreateLibraryPayload } from "@/components/mind-v2/create-library-sheet"

export { MOCK_KNOWLEDGE_BASES, type KnowledgeBase, type KBCategory } from "@/lib/mock-knowledge-bases"

interface KnowledgeTabProps {
  onKBClick: (kb: KnowledgeBase, options?: { openTeamInfo?: boolean }) => void
  requireAuthThen?: (run: () => void) => void
  customKBs: KnowledgeBase[]
  onCustomKBsChange: (kbs: KnowledgeBase[]) => void
  /** Desktop rail: compact list, no page title; optional selection highlight */
  layout?: "page" | "rail"
  selectedKbId?: number | null
}

export function KnowledgeTab({
  onKBClick,
  requireAuthThen,
  customKBs,
  onCustomKBsChange,
  layout = "page",
  selectedKbId = null,
}: KnowledgeTabProps) {
  const isRail = layout === "rail"
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const [activeCategory, setActiveCategory] = useState<KBCategory>("mine")
  const [libraryTopTab, setLibraryTopTab] = useState<LibraryTopTab>("plaza")
  const [plazaCategory, setPlazaCategory] = useState<PlazaCategoryId>("recommended")
  const [plazaQuery, setPlazaQuery] = useState("")
  const [mineQuery, setMineQuery] = useState("")
  const [showPlazaSearch, setShowPlazaSearch] = useState(false)
  const [showMineSearch, setShowMineSearch] = useState(false)
  const [subscribedGroupCollapsed, setSubscribedGroupCollapsed] = useState<
    Record<SubscribedKbRole, boolean>
  >({
    published: false,
    followed: false,
  })
  const [showDiscover, setShowDiscover] = useState(false)
  const [createSheetOpen, setCreateSheetOpen] = useState(false)
  const [createCategory, setCreateCategory] = useState<"mine" | "team">("mine")
  const [pinnedKbIds, setPinnedKbIds] = useState<number[]>([])

  useEffect(() => {
    setPinnedKbIds(readPinnedKbIds())
  }, [])

  const toggleKbPin = (kbId: number) => {
    setPinnedKbIds((prev) => {
      const next = prev.includes(kbId) ? prev.filter((id) => id !== kbId) : [...prev, kbId]
      writePinnedKbIds(next)
      toast.message(next.includes(kbId) ? "Pinned to top" : "Unpinned", {
        description: next.includes(kbId) ? "This library stays at the top of the list." : undefined,
      })
      return next
    })
  }

  const allKBs = useMemo(() => [...MOCK_KNOWLEDGE_BASES, ...customKBs], [customKBs])
  const filteredKBs = useMemo(() => {
    const q = mineQuery.trim().toLowerCase()
    const rows = sortKnowledgeBasesWithPins(
      allKBs.filter((kb) => kb.category === activeCategory),
      pinnedKbIds
    )
    if (!q) return rows
    return rows.filter(
      (kb) =>
        kb.name.toLowerCase().includes(q) ||
        kb.description.toLowerCase().includes(q)
    )
  }, [allKBs, activeCategory, pinnedKbIds, mineQuery])
  const nextKbId = useMemo(
    () => allKBs.reduce((max, kb) => Math.max(max, kb.id), 0) + 1,
    [allKBs]
  )

  const categories = [
    { id: "mine" as KBCategory, label: "Personal" },
    { id: "team" as KBCategory, label: "Team" },
    { id: "subscribed" as KBCategory, label: "Subscribed" },
  ]

  const openPlazaTab = () => setLibraryTopTab("plaza")

  function toggleSubscribedGroup(id: SubscribedKbRole) {
    setSubscribedGroupCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const SUBSCRIBED_GROUPS: { id: SubscribedKbRole; label: string }[] = [
    {
      id: "published",
      label: "My publications",
    },
    {
      id: "followed",
      label: "Following",
    },
  ]

  const showCreateInHeader =
    activeCategory === "mine" || activeCategory === "team"

  function subscribedRoleOf(kb: KnowledgeBase): SubscribedKbRole {
    return kb.subscribedRole === "published" ? "published" : "followed"
  }

  const subscribedByRole = useMemo(() => {
    const items = allKBs.filter((kb) => kb.category === "subscribed")
    const sortPinned = (rows: KnowledgeBase[]) => sortKnowledgeBasesWithPins(rows, pinnedKbIds)
    return {
      published: sortPinned(items.filter((kb) => subscribedRoleOf(kb) === "published")),
      followed: sortPinned(items.filter((kb) => subscribedRoleOf(kb) === "followed")),
    }
  }, [allKBs, pinnedKbIds])

  const subscribedTotal =
    subscribedByRole.published.length + subscribedByRole.followed.length

  function openCreateSheet(category: "mine" | "team") {
    runWithAuth(() => {
      setCreateCategory(category)
      setCreateSheetOpen(true)
    })
  }

  function handleCreateLibrary(payload: CreateLibraryPayload) {
    const kb = knowledgeBaseFromCreate(payload, nextKbId)
    onCustomKBsChange([kb, ...customKBs])
    toast.success("Library created", {
      description:
        payload.category === "team"
          ? `“${kb.name}” is ready for your team.`
          : `“${kb.name}” is in Mine.`,
    })
    onKBClick(kb, payload.category === "team" ? { openTeamInfo: true } : undefined)
  }

  if (showDiscover && isRail) {
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

  const navSubTabs = categories
  const navActiveSubTab = activeCategory
  const handleNavSubTabChange = (id: string) => {
    setActiveCategory(id as KBCategory)
  }

  const searchOpen = libraryTopTab === "plaza" ? showPlazaSearch : showMineSearch
  const searchQuery = libraryTopTab === "plaza" ? plazaQuery : mineQuery
  const setSearchQuery = libraryTopTab === "plaza" ? setPlazaQuery : setMineQuery

  const searchSlot = searchOpen ? (
    <div className="relative border-t border-stone-100/90 px-4 pb-3 pt-2 dark:border-zinc-800">
      <SmartSearchIcon className="pointer-events-none absolute left-7 top-[calc(50%-1px)] h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search libraries"
        autoFocus
        className="w-full rounded-full border-0 bg-white py-2.5 pl-10 pr-4 text-[14px] text-zinc-900 shadow-sm outline-none ring-1 ring-black/[0.06] placeholder:text-zinc-400 focus:ring-2 focus:ring-stone-200/80 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/10"
      />
    </div>
  ) : null

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-col",
        isRail ? "bg-transparent" : mx.shellCanvas
      )}
    >
      {isRail ? (
        <LibraryHomeNav
          variant="rail"
          showCreate={showCreateInHeader}
          createLabel={activeCategory === "team" ? "New team library" : "New personal library"}
          onCreate={() => openCreateSheet(activeCategory === "team" ? "team" : "mine")}
          onOpenPlaza={() => setShowDiscover(true)}
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          showSubscribedDot={allKBs.some((kb) => kb.category === "subscribed" && kb.hasContentUpdate)}
        />
      ) : (
        <LibraryMobileTwoRowNav
          topTab={libraryTopTab}
          onTopTabChange={(tab) => {
            setLibraryTopTab(tab)
            setShowPlazaSearch(false)
            setShowMineSearch(false)
            if (tab === "plaza") setPlazaCategory("recommended")
          }}
          subTabs={navSubTabs}
          activeSubTab={navActiveSubTab}
          onSubTabChange={handleNavSubTabChange}
          showSubscribedDot={allKBs.some((kb) => kb.category === "subscribed" && kb.hasContentUpdate)}
          onSearch={
            libraryTopTab === "plaza"
              ? undefined
              : () => {
                  setShowMineSearch((v) => !v)
                }
          }
          searchActive={libraryTopTab !== "plaza" && searchOpen}
          searchSlot={libraryTopTab === "plaza" ? null : searchSlot}
          showSubTabs={libraryTopTab !== "plaza"}
        />
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        {!isRail && libraryTopTab === "plaza" ? (
          <LibraryPlazaView
            embedded
            hideOuterNav
            onBack={() => setLibraryTopTab("mine")}
            onPickLibrary={(kb) => onKBClick(kb)}
            activeCategory={plazaCategory}
            onCategoryChange={setPlazaCategory}
            query={plazaQuery}
            onQueryChange={setPlazaQuery}
          />
        ) : (
        <>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className={isRail ? "px-2 py-1" : "px-5 py-2"}>
            {activeCategory === "subscribed" ? (
              subscribedTotal === 0 ? (
                <LibraryEmptyState
                  variant="subscribed"
                  onBrowsePlaza={openPlazaTab}
                />
              ) : (
                <div className={cn(isRail ? "space-y-2" : "space-y-4")}>
                  {SUBSCRIBED_GROUPS.map((group) => {
                    const groupItems = subscribedByRole[group.id]
                    if (groupItems.length === 0) return null
                    const collapsed = subscribedGroupCollapsed[group.id]
                    return (
                      <div key={group.id}>
                        <div
                          className={cn(
                            "mb-2 flex items-center justify-between gap-2",
                            isRail && "mb-1"
                          )}
                        >
                          <p
                            className={cn(
                              "font-medium text-zinc-700 dark:text-zinc-200",
                              isRail ? "text-[11px]" : "text-[13px]"
                            )}
                          >
                            {group.label}
                          </p>
                          <button
                            type="button"
                            onClick={() => toggleSubscribedGroup(group.id)}
                            aria-expanded={!collapsed}
                            aria-label={collapsed ? `Expand ${group.label}` : `Collapse ${group.label}`}
                            className={cn(
                              "flex shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors",
                              "hover:bg-zinc-900/[0.05] hover:text-zinc-600 dark:hover:bg-white/[0.08] dark:hover:text-zinc-200",
                              isRail ? "h-6 w-6" : "h-8 w-8"
                            )}
                          >
                            <ChevronDown
                              className={cn(
                                "transition-transform duration-200",
                                isRail ? "h-3.5 w-3.5" : "h-4 w-4",
                                collapsed && "-rotate-90"
                              )}
                              strokeWidth={2}
                              aria-hidden
                            />
                          </button>
                        </div>
                    {!collapsed ? (
                    <div className={cn(isRail ? "space-y-0.5" : "divide-y divide-zinc-100/80 dark:divide-zinc-800/60")}>
                      {groupItems.map((kb) => (
                        <SwipeableKnowledgeBaseRow
                          key={kb.id}
                          kb={kb}
                          pinned={pinnedKbIds.includes(kb.id)}
                          onTogglePin={() => toggleKbPin(kb.id)}
                          onOpen={() => onKBClick(kb)}
                          isRail={isRail}
                          selected={isRail && selectedKbId === kb.id}
                          showPublisherMeta
                        />
                      ))}
                    </div>
                    ) : null}
                      </div>
                    )
                  })}
                </div>
              )
            ) : filteredKBs.length === 0 ? (
              mineQuery.trim() ? (
                <div className="py-12 text-center text-[14px] text-zinc-500 dark:text-zinc-400">
                  No libraries match “{mineQuery.trim()}”
                </div>
              ) : (
              <LibraryEmptyState
                variant={activeCategory === "team" ? "team" : "personal"}
                onCreate={() => openCreateSheet(activeCategory)}
                onBrowsePlaza={openPlazaTab}
              />
              )
            ) : (
              <div
                className={cn(
                  isRail ? "space-y-0.5" : "divide-y divide-zinc-100/80 dark:divide-zinc-800/60"
                )}
              >
                {filteredKBs.map((kb) => (
                  <SwipeableKnowledgeBaseRow
                    key={kb.id}
                    kb={kb}
                    pinned={pinnedKbIds.includes(kb.id)}
                    onTogglePin={() => toggleKbPin(kb.id)}
                    onOpen={() => onKBClick(kb)}
                    isRail={isRail}
                    selected={isRail && selectedKbId === kb.id}
                    showTeamBadge={activeCategory === "team"}
                  />
                ))}
              </div>
            )}

            {activeCategory === "subscribed" && subscribedTotal > 0 ? (
              <button
                type="button"
                onClick={openPlazaTab}
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
            ) : null}

            {!isRail && libraryTopTab === "mine" ? (
              <LibraryPlazaPromoStrip
                onOpenPlaza={openPlazaTab}
                onPickLibrary={(kb) => onKBClick(kb)}
              />
            ) : null}
          </div>
        </div>

        </>
        )}
      </div>

      {!isRail && libraryTopTab === "mine" && showCreateInHeader ? (
        <LibraryCreateFab
          label={activeCategory === "team" ? "New team library" : "New personal library"}
          onClick={() => openCreateSheet(activeCategory === "team" ? "team" : "mine")}
        />
      ) : null}

      <CreateLibrarySheet
        open={createSheetOpen}
        category={createCategory}
        onClose={() => setCreateSheetOpen(false)}
        onCreate={handleCreateLibrary}
      />
    </div>
  )
}
