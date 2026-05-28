"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"
import { webNavListItem } from "@/components/mind-v2/web-nav-selection"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import type { AgentChatScope } from "@/lib/web-agent-scope"
import { agentChatScopeKey, scopeLabel } from "@/lib/web-agent-scope"
import { threadsForScope, type WebAgentThread } from "@/lib/web-agent-threads"
import { MessageCirclePlus, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react"

export type { WebAgentThread }

export function WebAgentSidebar({
  chatScope,
  selectedThreadId,
  collapsed = false,
  onToggleCollapsed,
  onNewChat,
  onSelectThread,
  onOpenScopedChat,
  onSearchThreads,
}: {
  chatScope: AgentChatScope
  selectedThreadId?: string | null
  collapsed?: boolean
  onToggleCollapsed?: () => void
  onNewChat: () => void
  onSelectThread?: (thread: WebAgentThread) => void
  /** Open a different scope (e.g. from thread in another KB) */
  onOpenScopedChat?: (scope: AgentChatScope, initialPrompt?: string) => void
  onSearchThreads?: () => void
}) {
  const scopeKey = agentChatScopeKey(chatScope)
  const threads = threadsForScope(chatScope)
  const scopeTitle = scopeLabel(chatScope)

  if (collapsed) {
    return (
      <aside
        className={cn(
          "flex h-full w-11 shrink-0 flex-col items-center border-r border-white/40 py-3",
          web.chromeColumn
        )}
        aria-label="Mindar conversations"
      >
        <button
          type="button"
          onClick={onToggleCollapsed}
          className={cn("rounded-lg p-2 text-zinc-500 hover:bg-zinc-900/[0.05]", webNavMotion.pressable)}
          aria-label="Expand agent sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" strokeWidth={2} />
        </button>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        "flex h-full w-[14.5rem] shrink-0 flex-col border-r border-white/40",
        web.chromeColumn,
        webNavMotion.panelEnter
      )}
      aria-label="Mindar conversations"
    >
      <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
        <Link
          href="/web/agent"
          className="min-w-0 flex-1 overflow-hidden transition-opacity hover:opacity-90"
          aria-label="Mindar chats"
        >
          <MindarLogo height={24} priority className="max-w-full object-contain object-left" />
        </Link>
        <div className="flex shrink-0 items-center gap-0.5">
          {onSearchThreads ? (
            <button
              type="button"
              onClick={onSearchThreads}
              className={cn("rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900/[0.05]", webNavMotion.pressable)}
              aria-label="Search chats"
            >
              <Search className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn("rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900/[0.05]", webNavMotion.pressable)}
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
            "flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900/[0.05] py-2.5 text-[14px] font-semibold text-zinc-800 transition-colors hover:bg-zinc-900/[0.08]",
            webNavMotion.pressable
          )}
        >
          <MessageCirclePlus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        <p className={cn("px-2 pb-2", web.primaryNavCategoryTitle)}>{scopeTitle}</p>
        {threads.length === 0 ? (
          <p className={cn("px-2.5 py-4", web.primaryNavItemMeta)}>
            No threads in this scope yet. Each library or note keeps its own history.
          </p>
        ) : (
          <ul className="space-y-1 pb-3">
            {threads.map((thread) => {
              const selected = selectedThreadId === thread.id
              return (
                <li key={thread.id}>
                  <button
                    type="button"
                    onClick={() => onSelectThread?.(thread)}
                    className={webNavListItem(selected, {
                      subtle: true,
                      className: "w-full px-2 py-2 text-left",
                    })}
                  >
                    <p className={cn("truncate", web.primaryNavItem)}>{thread.title}</p>
                    <p className={cn("mt-0.5", web.primaryNavItemMeta)}>{thread.timeLabel}</p>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {scopeKey !== "global" ? (
          <button
            type="button"
            onClick={() => onOpenScopedChat?.({ type: "global" })}
            className="mx-2 mb-3 w-[calc(100%-1rem)] rounded-lg px-2 py-1.5 text-left text-[11px] font-medium text-mind hover:bg-white/50"
          >
            Open general chats →
          </button>
        ) : null}
      </div>
    </aside>
  )
}
