"use client"

import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavListItem } from "@/components/mind-v2/web-nav-selection"
import { LibraryCoverFromKb } from "@/components/mind-v2/library-cover"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"

const MAX_RECENT = 3

/** Recent libraries under Library in the shell nav + More. */
export function WebShellLibraryRecents({
  recentKbs,
  selectedKbId,
  libraryTabActive,
  onOpenKb,
  onMore,
}: {
  recentKbs: KnowledgeBase[]
  selectedKbId?: number | null
  libraryTabActive: boolean
  onOpenKb: (kb: KnowledgeBase) => void
  onMore: () => void
}) {
  const items = recentKbs.slice(0, MAX_RECENT)

  return (
    <div
      className={cn(
        "border-t border-black/[0.05] px-3 py-3",
        libraryTabActive && "border-black/[0.04] bg-white/20"
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
        <h3 className={web.primaryNavCategoryTitle}>Recent</h3>
        {libraryTabActive ? (
          <span className="text-[11px] font-medium text-mind">Active</span>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className={cn("px-0.5 pb-1", web.primaryNavItemMeta)}>
          Open or create a library to see recents here.
        </p>
      ) : (
        <ul className="space-y-0.5">
          {items.map((kb) => {
            const itemActive = libraryTabActive && selectedKbId === kb.id
            return (
              <li key={kb.id}>
                <button
                  type="button"
                  onClick={() => onOpenKb(kb)}
                  className={webNavListItem(itemActive, {
                    className: cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left",
                      web.primaryNavItem
                    ),
                  })}
                >
                  <div className="h-6 w-6 shrink-0 overflow-hidden rounded-md">
                    <LibraryCoverFromKb kb={kb} showMiniUi={false} />
                  </div>
                  <span className="min-w-0 flex-1 truncate leading-snug">{kb.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={onMore}
        className={cn(
          "mt-2.5 inline-flex items-center gap-0.5 px-0.5 py-0.5",
          web.primaryNavMoreLink
        )}
      >
        More
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
      </button>
    </div>
  )
}
