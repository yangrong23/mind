"use client"

import { cn } from "@/lib/utils"
import { webNavListItem } from "@/components/mind-v2/web-nav-selection"
import { LibraryCoverFromKb } from "@/components/mind-v2/library-cover"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import type { Agent } from "@/components/mind-v2/agent-tab"
import { Bot, ChevronRight, Layers, Sparkles } from "lucide-react"

function AgentMiniAvatar({ agent }: { agent: Agent }) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm ring-1 ring-black/[0.06]",
        agent.color
      )}
      aria-hidden
    >
      {/^https?:\/\//i.test(agent.avatar) ? (
        <img src={agent.avatar} alt="" className="h-full w-full rounded-full object-cover" />
      ) : agent.avatar.length <= 2 ? (
        agent.avatar
      ) : (
        <Bot className="h-3.5 w-3.5 text-white/90" />
      )}
    </span>
  )
}

/** Agent home — recent libraries & agents before full lists. */
export function WebQuickRecentsPanel({
  recentKbs,
  recentAgents,
  onOpenKb,
  onOpenAgent,
  onSeeAllLibraries,
  onSeeAllAgents,
  className,
}: {
  recentKbs: KnowledgeBase[]
  recentAgents: Agent[]
  onOpenKb: (kb: KnowledgeBase) => void
  onOpenAgent: (agent: Agent) => void
  onSeeAllLibraries: () => void
  onSeeAllAgents: () => void
  className?: string
}) {
  if (recentKbs.length === 0 && recentAgents.length === 0) return null

  return (
    <section
      className={cn("mx-auto w-full max-w-2xl px-2", className)}
      aria-label="Recent libraries and agents"
    >
      {recentAgents.length > 0 ? (
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-zinc-500">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Recent agents
            </div>
            <button
              type="button"
              onClick={onSeeAllAgents}
              className="inline-flex items-center gap-0.5 text-[12px] font-medium text-mind hover:underline"
            >
              All agents
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <ul className="grid gap-1 sm:grid-cols-2">
            {recentAgents.map((agent) => (
              <li key={agent.id}>
                <button
                  type="button"
                  onClick={() => onOpenAgent(agent)}
                  className={webNavListItem(false, {
                    className: "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left",
                  })}
                >
                  <AgentMiniAvatar agent={agent} />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-zinc-800">
                    {agent.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {recentKbs.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-zinc-500">
              <Layers className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Recent libraries
            </div>
            <button
              type="button"
              onClick={onSeeAllLibraries}
              className="inline-flex items-center gap-0.5 text-[12px] font-medium text-mind hover:underline"
            >
              All libraries
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <ul className="grid gap-1 sm:grid-cols-2">
            {recentKbs.map((kb) => (
              <li key={kb.id}>
                <button
                  type="button"
                  onClick={() => onOpenKb(kb)}
                  className={webNavListItem(false, {
                    className: "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left",
                  })}
                >
                  <div className="h-7 w-7 shrink-0 overflow-hidden rounded-md">
                    <LibraryCoverFromKb kb={kb} showMiniUi={false} />
                  </div>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-zinc-800">
                    {kb.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
