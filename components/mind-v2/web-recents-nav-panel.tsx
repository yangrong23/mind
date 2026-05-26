"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavListItem } from "@/components/mind-v2/web-nav-selection"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"
import { LibraryCoverFromKb } from "@/components/mind-v2/library-cover"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import type { Agent } from "@/components/mind-v2/agent-tab"
import type { Note } from "@/lib/note-types"
import { Bot, ChevronRight, Compass, Layers, NotebookPen, Sparkles } from "lucide-react"

const MAX_VISIBLE = 8

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
}: {
  title: string
  icon: typeof Layers
  items: ReactNode[]
  emptyLabel: string
  onMore: () => void
  moreLabel: string
  renderItem: boolean
}) {
  if (!renderItem && items.length === 0) return null

  return (
    <section className="pb-3">
      <div className="mb-1.5 flex items-center justify-between gap-2 px-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" strokeWidth={2} aria-hidden />
          <h3 className="truncate text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            {title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onMore}
          className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-mind hover:underline"
        >
          {moreLabel}
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      {items.length === 0 ? (
        <p className="px-2.5 py-1 text-[11px] text-zinc-400">{emptyLabel}</p>
      ) : (
        <ul className="space-y-0.5">{items}</ul>
      )}
    </section>
  )
}

/** Power-user nav: recents per category (public KB → private KB → agent → notes) + plaza entry. */
export function WebRecentsNavPanel({
  recentPublicKbs,
  recentPrivateKbs,
  recentAgents,
  recentNotes,
  selectedKbId,
  selectedAgentId,
  selectedNoteId,
  onOpenPlaza,
  onOpenPublicKb,
  onOpenPrivateKb,
  onOpenAgent,
  onOpenNote,
  onMorePublic,
  onMorePrivate,
  onMoreAgents,
  onMoreNotes,
  className,
}: {
  recentPublicKbs: KnowledgeBase[]
  recentPrivateKbs: KnowledgeBase[]
  recentAgents: Agent[]
  recentNotes: Note[]
  selectedKbId?: number | null
  selectedAgentId?: number
  selectedNoteId?: number | null
  onOpenPlaza: () => void
  onOpenPublicKb: (kb: KnowledgeBase) => void
  onOpenPrivateKb: (kb: KnowledgeBase) => void
  onOpenAgent: (agent: Agent) => void
  onOpenNote: (note: Note) => void
  onMorePublic: () => void
  onMorePrivate: () => void
  onMoreAgents: () => void
  onMoreNotes: () => void
  className?: string
}) {
  const publicItems = recentPublicKbs.slice(0, MAX_VISIBLE).map((kb) => {
    const active = selectedKbId === kb.id
    return (
      <li key={`pub-${kb.id}`}>
        <button
          type="button"
          onClick={() => onOpenPublicKb(kb)}
          className={webNavListItem(active, {
            className: "flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] font-medium",
          })}
        >
          <div className="h-5 w-5 shrink-0 overflow-hidden rounded-md">
            <LibraryCoverFromKb kb={kb} showMiniUi={false} />
          </div>
          <span className="min-w-0 flex-1 truncate text-zinc-700">{kb.name}</span>
        </button>
      </li>
    )
  })

  const privateItems = recentPrivateKbs.slice(0, MAX_VISIBLE).map((kb) => {
    const active = selectedKbId === kb.id
    return (
      <li key={`priv-${kb.id}`}>
        <button
          type="button"
          onClick={() => onOpenPrivateKb(kb)}
          className={webNavListItem(active, {
            className: "flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] font-medium",
          })}
        >
          <div className="h-5 w-5 shrink-0 overflow-hidden rounded-md">
            <LibraryCoverFromKb kb={kb} showMiniUi={false} />
          </div>
          <span className="min-w-0 flex-1 truncate text-zinc-700">{kb.name}</span>
        </button>
      </li>
    )
  })

  const agentItems = recentAgents.slice(0, MAX_VISIBLE).map((agent) => {
    const active = selectedAgentId === agent.id
    return (
      <li key={`agent-${agent.id}`}>
        <button
          type="button"
          onClick={() => onOpenAgent(agent)}
          className={webNavListItem(active, {
            className: "flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] font-medium",
          })}
        >
          <AgentMiniAvatar agent={agent} />
          <span className="min-w-0 flex-1 truncate text-zinc-700">{agent.name}</span>
        </button>
      </li>
    )
  })

  const noteItems = recentNotes.slice(0, MAX_VISIBLE).map((note) => {
    const active = selectedNoteId === note.id
    return (
      <li key={`note-${note.id}`}>
        <button
          type="button"
          onClick={() => onOpenNote(note)}
          className={webNavListItem(active, {
            className: "flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12px] font-medium",
          })}
        >
          <NotebookPen className="h-3.5 w-3.5 shrink-0 text-zinc-400" strokeWidth={2} aria-hidden />
          <span className="min-w-0 flex-1 truncate text-zinc-700">{note.title}</span>
        </button>
      </li>
    )
  })

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-black/[0.04] bg-[#f5f5f6]/95",
        web.secondaryWidth,
        webNavMotion.panelEnter,
        className
      )}
      aria-label="Recent libraries, agents, and notes"
    >
      <div className="shrink-0 p-2.5">
        <button
          type="button"
          onClick={onOpenPlaza}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 px-3 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-sky-300/35",
            webNavMotion.pressable
          )}
        >
          <Compass className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          Library plaza
        </button>
      </div>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-3">
        <RecentsSection
          title="Public libraries"
          icon={Compass}
          items={publicItems}
          emptyLabel="Follow libraries from the plaza"
          onMore={onMorePublic}
          moreLabel="More"
          renderItem
        />
        <RecentsSection
          title="Private libraries"
          icon={Layers}
          items={privateItems}
          emptyLabel="Create or open a personal library"
          onMore={onMorePrivate}
          moreLabel="More"
          renderItem
        />
        <RecentsSection
          title="Agents"
          icon={Sparkles}
          items={agentItems}
          emptyLabel="Start a chat with an agent"
          onMore={onMoreAgents}
          moreLabel="More"
          renderItem
        />
        <RecentsSection
          title="Notes"
          icon={NotebookPen}
          items={noteItems}
          emptyLabel="Open or create a memo"
          onMore={onMoreNotes}
          moreLabel="More"
          renderItem
        />
      </div>
    </aside>
  )
}
