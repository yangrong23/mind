"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronRight, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavListItem } from "@/components/mind-v2/web-nav-selection"
import { LibraryListThumbnail } from "@/components/mind-v2/library-list-thumbnail"
import { KbListMetaBadges } from "@/components/mind-v2/library-kb-badges"
import { LIBRARY_HUB_SECTIONS, type LibraryHubSectionId } from "@/lib/library-hub-sections"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { readPinnedKbIds, sortKbsPinnedFirst } from "@/lib/web-pinned-kbs"

type GroupedKbs = Record<LibraryHubSectionId, KnowledgeBase[]>

function LibraryNavSection({
  sectionId,
  label,
  items,
  expanded,
  onToggle,
  selectedKbId,
  onSelectKb,
  onCreate,
  canCreate,
  nested = false,
}: {
  sectionId: LibraryHubSectionId
  label: string
  items: KnowledgeBase[]
  expanded: boolean
  onToggle: () => void
  selectedKbId: number | null
  onSelectKb: (kb: KnowledgeBase) => void
  onCreate?: () => void
  canCreate?: boolean
  /** Nested under Subscribed — no extra section dividers */
  nested?: boolean
}) {
  return (
    <div className={cn(!nested && "mb-0.5")}>
      <div className="flex items-start gap-1 px-2 py-2">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex min-w-0 flex-1 items-start gap-2 rounded-lg py-1 pl-1 pr-0.5 text-left transition-colors hover:bg-white/50",
            web.typeNavSection
          )}
          aria-expanded={expanded}
        >
          <ChevronDown
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0 text-zinc-400 transition-transform",
              !expanded && "-rotate-90"
            )}
            strokeWidth={2.25}
            aria-hidden
          />
          <span className={cn("min-w-0 flex-1", web.typeNavSectionTitle)}>{label}</span>
        </button>
        {canCreate && onCreate ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onCreate()
            }}
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-mind transition-colors hover:bg-mind/10"
            aria-label={`New ${label} library`}
          >
            <Plus className="h-4 w-4" strokeWidth={2.25} />
          </button>
        ) : null}
      </div>
      {expanded ? (
        <ul className="space-y-0.5 px-1 pb-2.5 pl-2">
          {items.length === 0 ? (
            <li className="px-2 py-2">
              <p className={web.typeNavEmpty}>No libraries yet</p>
            </li>
          ) : (
            items.map((kb) => {
              const active = selectedKbId === kb.id
              return (
                <li key={`${sectionId}-${kb.id}`}>
                  <button
                    type="button"
                    onClick={() => onSelectKb(kb)}
                    className={webNavListItem(active, {
                      className: cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left",
                        web.typeNavItem
                      ),
                    })}
                  >
                    <LibraryListThumbnail kb={kb} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block break-words", web.typeNavItemTitle)}>{kb.name}</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-1">
                        <KbListMetaBadges kb={kb} />
                      </span>
                    </span>
                    {active ? (
                      <ChevronRight className="h-4 w-4 shrink-0 text-mind" strokeWidth={2} aria-hidden />
                    ) : null}
                  </button>
                </li>
              )
            })
          )}
        </ul>
      ) : null}
    </div>
  )
}

/** Middle column — collapsible personal / shared / subscribed library lists */
export function WebLibraryNavPanel({
  grouped,
  selectedKbId,
  searchQuery,
  onSearchQueryChange,
  onSelectKb,
  onCreateInSection,
  className,
}: {
  grouped: GroupedKbs
  selectedKbId: number | null
  searchQuery: string
  onSearchQueryChange: (q: string) => void
  onSelectKb: (kb: KnowledgeBase) => void
  onCreateInSection: (sectionId: LibraryHubSectionId) => void
  className?: string
}) {
  const [expanded, setExpanded] = useState<Record<LibraryHubSectionId, boolean>>({
    mine: true,
    team: true,
    followed: true,
    published: true,
  })

  const pinnedKbIds = useMemo(() => readPinnedKbIds(), [selectedKbId])

  const subscribedSections = useMemo(
    () => LIBRARY_HUB_SECTIONS.filter((s) => s.id === "followed" || s.id === "published"),
    []
  )
  const topSections = useMemo(
    () => LIBRARY_HUB_SECTIONS.filter((s) => s.id === "mine" || s.id === "team"),
    []
  )

  useEffect(() => {
    if (selectedKbId == null) return
    const section = (Object.keys(grouped) as LibraryHubSectionId[]).find((id) =>
      grouped[id].some((k) => k.id === selectedKbId)
    )
    if (section) {
      setExpanded((prev) => ({ ...prev, [section]: true }))
    }
  }, [selectedKbId, grouped])

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-white/50 bg-white/40 backdrop-blur-md",
        web.libraryNavWidth,
        className
      )}
      aria-label="Library browser"
    >
      <div className="shrink-0 space-y-2 border-b border-black/[0.05] px-3 py-3.5">
        <h2 className={cn("px-0.5", web.typeNavPanelTitle)}>My Library</h2>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search libraries"
            className={cn("w-full py-2 pl-8 pr-2", web.typeInput)}
            aria-label="Search libraries"
          />
        </div>
      </div>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {topSections.map((section) => (
          <LibraryNavSection
            key={section.id}
            sectionId={section.id}
            label={section.label}
            items={sortKbsPinnedFirst(grouped[section.id], pinnedKbIds)}
            expanded={expanded[section.id]}
            onToggle={() => setExpanded((p) => ({ ...p, [section.id]: !p[section.id] }))}
            selectedKbId={selectedKbId}
            onSelectKb={onSelectKb}
            canCreate={section.canCreate}
            onCreate={
              section.canCreate ? () => onCreateInSection(section.id) : undefined
            }
          />
        ))}

        <div className="mt-2 border-t border-black/[0.06] pt-2">
          <button
            type="button"
            onClick={() => {
              const next = !(expanded.followed && expanded.published)
              setExpanded((p) => ({ ...p, followed: next, published: next }))
            }}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/50",
              web.typeNavSection
            )}
            aria-expanded={expanded.followed || expanded.published}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-zinc-400 transition-transform",
                !(expanded.followed || expanded.published) && "-rotate-90"
              )}
              strokeWidth={2.25}
              aria-hidden
            />
            <span className={web.typeNavSectionTitle}>Subscribed</span>
          </button>
          {expanded.followed || expanded.published ? (
            <div className="ml-2 border-l border-black/[0.05] pl-1">
              {subscribedSections.map((section) => (
                <LibraryNavSection
                  key={section.id}
                  sectionId={section.id}
                  label={section.id === "published" ? "Published by me" : "From plaza"}
                  nested
                  items={sortKbsPinnedFirst(grouped[section.id], pinnedKbIds)}
                  expanded={expanded[section.id]}
                  onToggle={() =>
                    setExpanded((p) => ({ ...p, [section.id]: !p[section.id] }))
                  }
                  selectedKbId={selectedKbId}
                  onSelectKb={onSelectKb}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
