"use client"

import { cn } from "@/lib/utils"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"
import { webNavListItem } from "@/components/mind-v2/web-nav-selection"
import {
  MINDAR_COPILOT_AGENT,
  MINDAR_DEMO_MY_AGENTS,
  type Agent,
} from "@/components/mind-v2/agent-tab"
import {
  getMindAgentCatalog,
  getMindAgentProfile,
  MINDAR_COPILOT_PROFILE,
} from "@/lib/mind-agent-catalog"
import { Bot, LayoutDashboard, MessageCirclePlus, PanelLeftClose, Search } from "lucide-react"

export type AgentChatThread = {
  id: string
  agentId: number
  title: string
  timeLabel: string
}

const DEMO_THREADS: AgentChatThread[] = [
  { id: "m1", agentId: 0, title: "Summarize my knowledge base", timeLabel: "Today" },
  { id: "m2", agentId: 0, title: "NotebookLM vs Mindar workflow", timeLabel: "Yesterday" },
  { id: "m3", agentId: 0, title: "Product experience meeting notes", timeLabel: "Mon" },
  { id: "r1", agentId: 201, title: "Competitive landscape brief", timeLabel: "Today" },
  { id: "r2", agentId: 201, title: "Patent response strategy outline", timeLabel: "3d ago" },
  { id: "meet1", agentId: 202, title: "Q4 roadmap talking points", timeLabel: "Yesterday" },
  { id: "meet2", agentId: 202, title: "Standup action items", timeLabel: "Sun" },
  { id: "w1", agentId: 203, title: "Blog draft — AI knowledge tools", timeLabel: "Tue" },
  { id: "l1", agentId: 204, title: "Spanish vocab from travel notes", timeLabel: "Last week" },
]

const AGENT_ROSTER: Agent[] = [MINDAR_COPILOT_AGENT, ...MINDAR_DEMO_MY_AGENTS]

function agentAvatarIsRemoteUrl(avatar: string) {
  return /^https?:\/\//i.test(avatar) || avatar.startsWith("/")
}

function AgentSidebarAvatar({ agent, size = 32 }: { agent: Agent; size?: number }) {
  const remote = agentAvatarIsRemoteUrl(agent.avatar) && agent.id !== MINDAR_COPILOT_AGENT.id
  const iconSize = Math.max(14, Math.round(size * 0.45))
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base ring-1 ring-black/[0.06]",
        agent.color
      )}
      style={{ width: size, height: size }}
    >
      {agent.id === MINDAR_COPILOT_AGENT.id ? (
        <Bot className="text-white/95" style={{ width: iconSize, height: iconSize }} aria-hidden />
      ) : remote ? (
        <img src={agent.avatar} alt="" className="h-full w-full rounded-full object-cover" />
      ) : (
        <span aria-hidden>{agent.avatar}</span>
      )}
    </div>
  )
}

function agentTagline(agent: Agent) {
  if (agent.id === MINDAR_COPILOT_AGENT.id) return MINDAR_COPILOT_PROFILE.tagline
  const catalog = getMindAgentCatalog(agent.id)
  return catalog?.contactPreview ?? catalog?.profile?.tagline ?? agent.description
}

export function WebAgentSidebar({
  selectedAgentId,
  onSelectAgent,
  onNewChat,
  selectedThreadId,
  onSelectThread,
  onDiscoverAgents,
  onSearchAgents,
}: {
  selectedAgentId: number
  onSelectAgent: (agent: Agent) => void
  onNewChat: () => void
  selectedThreadId?: string | null
  onSelectThread?: (thread: AgentChatThread) => void
  onDiscoverAgents?: () => void
  onSearchAgents?: () => void
}) {
  const threadsForAgent = DEMO_THREADS.filter((t) => t.agentId === selectedAgentId)
  const selectedAgent = AGENT_ROSTER.find((a) => a.id === selectedAgentId) ?? MINDAR_COPILOT_AGENT

  return (
    <aside
      className={cn(
        "flex h-full w-[15.5rem] shrink-0 flex-col border-r border-black/[0.04] bg-[#f5f5f6]/90",
        webNavMotion.panelEnter
      )}
      aria-label="Agent conversations"
    >
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <h2 className="text-[15px] font-semibold text-zinc-800">Agents</h2>
        <div className="flex items-center gap-0.5">
          {onSearchAgents ? (
            <button
              type="button"
              onClick={onSearchAgents}
              className={cn("rounded-lg p-1.5 text-zinc-400 hover:bg-white/80", webNavMotion.pressable)}
              aria-label="Search agents"
            >
              <Search className="h-4 w-4" />
            </button>
          ) : null}
          {onDiscoverAgents ? (
            <button
              type="button"
              onClick={onDiscoverAgents}
              className={cn("rounded-lg p-1.5 text-zinc-400 hover:bg-white/80", webNavMotion.pressable)}
              aria-label="Discover agents"
            >
              <LayoutDashboard className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            className={cn("rounded-lg p-1.5 text-zinc-400 hover:bg-white/80", webNavMotion.pressable)}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={onNewChat}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-xl bg-sky-50/70 py-2.5 text-[14px] font-medium text-zinc-700 shadow-sm shadow-sky-100/50 hover:bg-sky-50/95",
            webNavMotion.pressable
          )}
        >
          <MessageCirclePlus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          Your agents
        </p>
        <ul className="space-y-0.5 pb-3">
          {AGENT_ROSTER.map((agent) => {
            const active = selectedAgentId === agent.id
            const profile = agent.profile ?? getMindAgentProfile(agent.id)
            return (
              <li key={agent.id}>
                <button
                  type="button"
                  onClick={() => onSelectAgent(agent)}
                  className={webNavListItem(active, {
                    className: "flex w-full items-center gap-2.5 px-2.5 py-2 text-left",
                  })}
                >
                  <AgentSidebarAvatar agent={agent} size={30} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-zinc-800">{agent.name}</p>
                    <p className="truncate text-[11px] text-zinc-500">
                      {profile?.tagline ?? agentTagline(agent)}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>

        <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          Chats · {selectedAgent.name}
        </p>
        {threadsForAgent.length === 0 ? (
          <p className="px-2.5 py-4 text-[12px] text-zinc-500">No threads yet — start a new chat.</p>
        ) : (
          <ul className="space-y-0.5 pb-3">
            {threadsForAgent.map((thread) => {
              const selected = selectedThreadId === thread.id
              return (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() => onSelectThread?.(thread)}
                    className={webNavListItem(selected, {
                      subtle: true,
                      className: "w-full px-2.5 py-2 text-left",
                    })}
                  >
                    <p className="truncate text-[13px] text-zinc-700">{thread.title}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-400">{thread.timeLabel}</p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
