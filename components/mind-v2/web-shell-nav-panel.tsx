"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavListItem } from "@/components/mind-v2/web-nav-selection"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import { getMindAccount, type MindAccountId } from "@/lib/mind-accounts"
import type { WebTabType } from "@/components/mind-v2/web-sidebar-nav"
import { Compass, Layers, NotebookPen, Sparkles } from "lucide-react"
import { WebShellLibraryRecents } from "@/components/mind-v2/web-shell-library-recents"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"

const PRIMARY_TABS: {
  id: WebTabType
  label: string
  icon: LucideIcon
}[] = [
  { id: "plaza", label: "Plaza", icon: Compass },
  { id: "memos", label: "Notes", icon: NotebookPen },
  { id: "library", label: "Library", icon: Layers },
  { id: "agent", label: "Mindar", icon: Sparkles },
]

/** Primary shell navigation — flat destinations; library tree mounts below when active. */
export function WebShellNavPanel({
  activeTab,
  onTabChange,
  onOpenAgent,
  activeAccountId = "work",
  libraryNav,
  recentLibraries = [],
  selectedKbId,
  onOpenLibraryKb,
  onMoreLibraries,
  className,
}: {
  activeTab: WebTabType
  onTabChange: (tab: WebTabType) => void
  /** Single Mindar agent — open latest conversation instead of a roster. */
  onOpenAgent: () => void
  activeAccountId?: MindAccountId
  /** Full library tree when Library tab is active. */
  libraryNav?: ReactNode
  recentLibraries?: KnowledgeBase[]
  selectedKbId?: number | null
  onOpenLibraryKb?: (kb: KnowledgeBase) => void
  onMoreLibraries?: () => void
  className?: string
}) {
  const account = getMindAccount(activeAccountId)

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col overflow-hidden",
        activeTab === "library" ? "w-[min(320px,34vw)] min-w-[240px] max-w-[360px]" : web.primaryNavWidth,
        web.primaryNavSurface,
        webNavMotion.panelEnter,
        className
      )}
      aria-label="Main navigation"
    >
      <div className="shrink-0 px-3 pb-3 pt-4">
        <Link
          href="/landing"
          className="block w-full min-w-0 overflow-hidden rounded-lg transition-opacity hover:opacity-90"
          title="Mindar"
          aria-label="Go to Mindar home"
        >
          <MindarLogo
            height={web.primaryNavLogoHeight}
            priority
            className="w-full max-w-full object-contain object-left"
          />
        </Link>
      </div>

      <nav className="shrink-0 px-3 pb-2" aria-label="App sections">
        <ul className={cn("space-y-0.5 p-2", web.primaryNavWell)}>
          {PRIMARY_TABS.map((tab) => {
            const active = activeTab === tab.id
            const Icon = tab.icon
            return (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => (tab.id === "agent" ? onOpenAgent() : onTabChange(tab.id))}
                  className={webNavListItem(active, {
                    className: cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left",
                      web.primaryNavItem
                    ),
                  })}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      web.sectionIconWell,
                      active && "ring-1 ring-mind/25"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1 font-semibold">{tab.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {onOpenLibraryKb && onMoreLibraries ? (
        <WebShellLibraryRecents
          recentKbs={recentLibraries}
          selectedKbId={selectedKbId}
          libraryTabActive={activeTab === "library"}
          onOpenKb={onOpenLibraryKb}
          onMore={onMoreLibraries}
        />
      ) : null}

      {activeTab === "library" && libraryNav ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-black/[0.05]">
          {libraryNav}
        </div>
      ) : (
        <div className="min-h-0 flex-1" aria-hidden />
      )}

      <div className="shrink-0 border-t border-white/40 bg-white/18 px-3 py-3.5 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => onTabChange("me")}
          className={webNavListItem(activeTab === "me", {
            className: cn(
              "flex w-full items-center gap-2.5 px-2.5 py-2.5 text-left",
              web.primaryNavFooterItem
            ),
          })}
          title={`${account.displayName} — Me`}
        >
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm",
              "bg-mind shadow-[0_4px_12px_-4px_color-mix(in_oklch,var(--mind-blue)_35%,transparent)]"
            )}
          >
            {account.initial}
          </span>
          <span className="min-w-0 truncate">Me</span>
        </button>
      </div>
    </aside>
  )
}

/** @deprecated Use WebShellNavPanel */
export const WebRecentsNavPanel = WebShellNavPanel
export const WebPrimaryNavPanel = WebShellNavPanel
