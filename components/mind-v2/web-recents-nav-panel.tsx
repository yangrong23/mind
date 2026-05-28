"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavListItem } from "@/components/mind-v2/web-nav-selection"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"
import { LibraryCoverFromKb } from "@/components/mind-v2/library-cover"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import { getMindAccount, type MindAccountId } from "@/lib/mind-accounts"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import type { Agent } from "@/components/mind-v2/agent-tab"
import type { Note } from "@/lib/note-types"
import type { WebTabType } from "@/components/mind-v2/web-sidebar-nav"
import {
  Bot,
  ChevronRight,
  Compass,
  Layers,
  NotebookPen,
  Settings,
  MessageCircle,
} from "lucide-react"

const MAX_RECENT_PER_SECTION = 2

function AgentMiniAvatar({ agent }: { agent: Agent }) {
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[11px] ring-1 ring-black/[0.06]",
        agent.color
      )}
      aria-hidden
    >
      {/^https?:\/\//i.test(agent.avatar) ? (
        <img src={agent.avatar} alt="" className="h-full w-full rounded-full object-cover" />
      ) : agent.avatar.length <= 2 ? (
        agent.avatar
      ) : (
        <Bot className="h-3 w-3 text-white/90" />
      )}
    </span>
  )
}

function RecentsSection({
  title,
  icon: Icon,
  items,
  emptyLabel,
  onMore,
  moreLabel,
  renderItem,
  active,
}: {
  title: string
  icon: LucideIcon
  items: ReactNode[]
  emptyLabel: string
  onMore: () => void
  moreLabel: string
  renderItem: boolean
  active?: boolean
}) {
  if (!renderItem && items.length === 0) return null

  return (
    <section
      className={cn(
        "border-t border-black/[0.05] py-4 first:border-t-0 first:pt-2 last:pb-1",
        active && "rounded-xl bg-white/28 ring-1 ring-white/60"
      )}
    >
      <div className="mb-2.5 flex items-center justify-between gap-2 px-0.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              web.sectionIconWell
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </span>
          <h3 className={web.primaryNavCategoryTitle}>{title}</h3>
        </div>
        <button
          type="button"
          onClick={onMore}
          className={cn(
            "inline-flex shrink-0 items-center gap-0.5 rounded-md px-1 py-0.5",
            web.primaryNavMoreLink
          )}
        >
          {moreLabel}
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
      </div>
      {items.length === 0 ? (
        <p className={cn("px-0.5", web.primaryNavItemMeta)}>{emptyLabel}</p>
      ) : (
        <ul className="space-y-0.5">{items}</ul>
      )}
    </section>
  )
}

/** Shell navigation — recents by category + More; no duplicate primary tab row. */
export function WebRecentsNavPanel({
  activeTab,
  onTabChange,
  activeAccountId = "work",
  onOpenSettings,
  settingsActive = false,
  recentPublicKbs,
  recentPrivateKbs,
  recentAgents,
  recentNotes,
  selectedKbId,
  selectedAgentId,
  selectedNoteId,
  onOpenPublicKb,
  onOpenPrivateKb,
  onOpenAgent,
  onOpenNote,
  onMorePlaza,
  onMorePrivate,
  onMoreAgents,
  onMoreNotes,
  className,
}: {
  activeTab: WebTabType
  onTabChange: (tab: WebTabType) => void
  activeAccountId?: MindAccountId
  onOpenSettings?: () => void
  settingsActive?: boolean
  recentPublicKbs: KnowledgeBase[]
  recentPrivateKbs: KnowledgeBase[]
  recentAgents: Agent[]
  recentNotes: Note[]
  selectedKbId?: number | null
  selectedAgentId?: number
  selectedNoteId?: number | null
  onOpenPublicKb: (kb: KnowledgeBase) => void
  onOpenPrivateKb: (kb: KnowledgeBase) => void
  onOpenAgent: (agent: Agent) => void
  onOpenNote: (note: Note) => void
  onMorePlaza: () => void
  onMorePrivate: () => void
  onMoreAgents: () => void
  onMoreNotes: () => void
  className?: string
}) {
  const account = getMindAccount(activeAccountId)

  const publicItems = recentPublicKbs.slice(0, MAX_RECENT_PER_SECTION).map((kb) => {
    const itemActive = selectedKbId === kb.id
    return (
      <li key={`pub-${kb.id}`}>
        <button
          type="button"
          onClick={() => onOpenPublicKb(kb)}
          className={webNavListItem(itemActive, {
            className: cn(
              "flex w-full items-center gap-2.5 px-2.5 py-2.5 text-left",
              web.primaryNavItem
            ),
          })}
        >
          <div className="h-6 w-6 shrink-0 overflow-hidden rounded-md">
            <LibraryCoverFromKb kb={kb} showMiniUi={false} />
          </div>
          <span className="min-w-0 flex-1 break-words leading-snug">{kb.name}</span>
        </button>
      </li>
    )
  })

  const privateItems = recentPrivateKbs.slice(0, MAX_RECENT_PER_SECTION).map((kb) => {
    const itemActive = selectedKbId === kb.id
    return (
      <li key={`priv-${kb.id}`}>
        <button
          type="button"
          onClick={() => onOpenPrivateKb(kb)}
          className={webNavListItem(itemActive, {
            className: cn(
              "flex w-full items-center gap-2.5 px-2.5 py-2.5 text-left",
              web.primaryNavItem
            ),
          })}
        >
          <div className="h-6 w-6 shrink-0 overflow-hidden rounded-md">
            <LibraryCoverFromKb kb={kb} showMiniUi={false} />
          </div>
          <span className="min-w-0 flex-1 break-words leading-snug">{kb.name}</span>
        </button>
      </li>
    )
  })

  const agentItems = recentAgents.slice(0, MAX_RECENT_PER_SECTION).map((agent) => {
    const itemActive = selectedAgentId === agent.id
    return (
      <li key={`agent-${agent.id}`}>
        <button
          type="button"
          onClick={() => onOpenAgent(agent)}
          className={webNavListItem(itemActive, {
            className: cn(
              "flex w-full items-center gap-2.5 px-2.5 py-2.5 text-left",
              web.primaryNavItem
            ),
          })}
        >
          <AgentMiniAvatar agent={agent} />
          <span className="min-w-0 flex-1 truncate">{agent.name}</span>
        </button>
      </li>
    )
  })

  const noteItems = recentNotes.slice(0, MAX_RECENT_PER_SECTION).map((note) => {
    const itemActive = selectedNoteId === note.id
    return (
      <li key={`note-${note.id}`}>
        <button
          type="button"
          onClick={() => onOpenNote(note)}
          className={webNavListItem(itemActive, {
            className: cn(
              "flex w-full items-center gap-2.5 px-2.5 py-2.5 text-left",
              web.primaryNavItem
            ),
          })}
        >
          <NotebookPen className="h-4 w-4 shrink-0 text-zinc-500" strokeWidth={2} aria-hidden />
          <span className="min-w-0 flex-1 truncate">{note.title}</span>
        </button>
      </li>
    )
  })

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col overflow-hidden",
        web.primaryNavWidth,
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

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
        <nav className={cn("space-y-0.5 p-2.5", web.primaryNavWell)} aria-label="Recent destinations">
          <RecentsSection
            title="Plaza"
            icon={Compass}
            items={publicItems}
            emptyLabel="Discover and follow libraries from the plaza"
            onMore={onMorePlaza}
            moreLabel="More"
            renderItem
            active={activeTab === "plaza"}
          />
          <RecentsSection
            title="My Library"
            icon={Layers}
            items={privateItems}
            emptyLabel="Create or open a personal library"
            onMore={onMorePrivate}
            moreLabel="More"
            renderItem
            active={activeTab === "library"}
          />
          <RecentsSection
            title="Agent"
            icon={MessageCircle}
            items={agentItems}
            emptyLabel="Open a recent conversation"
            onMore={onMoreAgents}
            moreLabel="More"
            renderItem
            active={activeTab === "agent"}
          />
          <RecentsSection
            title="Notes"
            icon={NotebookPen}
            items={noteItems}
            emptyLabel="Open or create a memo"
            onMore={onMoreNotes}
            moreLabel="More"
            renderItem
            active={activeTab === "memos"}
          />
        </nav>
      </div>

      <div className="shrink-0 space-y-0.5 border-t border-white/40 bg-white/18 px-3 py-3.5 backdrop-blur-sm">
        <button
          type="button"
          onClick={onOpenSettings}
          className={webNavListItem(settingsActive, {
            className: cn(
              "flex w-full items-center gap-2.5 px-2.5 py-2.5 text-left",
              web.primaryNavFooterItem
            ),
          })}
        >
          <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", web.sectionIconWell)}>
            <Settings className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden />
          </span>
          <span>Settings</span>
        </button>

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

/** @deprecated Use WebRecentsNavPanel */
export const WebPrimaryNavPanel = WebRecentsNavPanel
