"use client"

import { useMemo, useState, type ReactNode } from "react"
import {
  BookOpen,
  ChevronRight,
  FileText,
  MessageCircle,
  Search,
  Sparkles,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import { LibraryCoverFromKb } from "@/components/mind-v2/library-cover"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { libraryCoverVariantForId } from "@/lib/product-media"
import {
  groupThreadSummariesByCalendarDay,
  threadScopeHint,
  type AgentThreadScope,
  type AgentThreadSummary,
} from "@/lib/agent-chat-threads"

function SidebarShortcut({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
        "hover:bg-stone-50/90 active:bg-stone-100/70 dark:hover:bg-zinc-900/50 dark:active:bg-zinc-900/70"
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 dark:bg-zinc-800/90">
        {icon}
      </span>
      <span className={cn("min-w-0 flex-1 text-[15px] font-medium", mx.shellInk)}>{label}</span>
      <ChevronRight className={cn("h-4 w-4 shrink-0", mx.shellIcon)} strokeWidth={1.75} aria-hidden />
    </button>
  )
}

function ThreadScopeIcon({ scope }: { scope: AgentThreadScope }) {
  if (scope.type === "kb") {
    const kbStub: Pick<KnowledgeBase, "id" | "name" | "coverVariant"> = {
      id: 0,
      name: scope.kbName,
      coverVariant: libraryCoverVariantForId(0, scope.kbName),
    }
    return (
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-stone-200/90 dark:ring-zinc-700/80">
        <LibraryCoverFromKb kb={kbStub} showMiniUi={false} />
      </div>
    )
  }
  const Icon = scope.type === "note" ? FileText : MessageCircle
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-zinc-800/90">
      <Icon className={cn("h-4 w-4", mx.shellMuted)} strokeWidth={1.75} aria-hidden />
    </span>
  )
}

function HistoryRow({
  thread,
  onClick,
}: {
  thread: AgentThreadSummary
  onClick: () => void
}) {
  const hint = threadScopeHint(thread.scope)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full gap-3 px-4 py-2.5 text-left transition-colors",
        "hover:bg-stone-50/90 active:bg-stone-100/60 dark:hover:bg-zinc-900/45 dark:active:bg-zinc-900/65"
      )}
    >
      <div className="mt-0.5">
        <ThreadScopeIcon scope={thread.scope} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-[15px] font-medium leading-snug", mx.shellInk)}>{thread.title}</p>
        {hint ? (
          <p className={cn("mt-1 flex min-w-0 items-center gap-1.5 truncate text-[12px]", mx.shellMuted)}>
            {thread.scope.type === "kb" ? (
              <BookOpen className="h-3 w-3 shrink-0 opacity-70" strokeWidth={1.75} aria-hidden />
            ) : thread.scope.type === "note" ? (
              <FileText className="h-3 w-3 shrink-0 opacity-70" strokeWidth={1.75} aria-hidden />
            ) : (
              <Sparkles className="h-3 w-3 shrink-0 opacity-70" strokeWidth={1.75} aria-hidden />
            )}
            <span className="truncate">{hint}</span>
          </p>
        ) : thread.preview ? (
          <p className={cn("mt-1 line-clamp-1 text-[12px]", mx.shellIcon)}>{thread.preview}</p>
        ) : null}
      </div>
    </button>
  )
}

export function AgentHomeSidebar({
  open,
  threads,
  libraries,
  onClose,
  onAskMindar,
  onOpenLibraries,
  onOpenThread,
  onOpenLibrary,
}: {
  open: boolean
  threads: AgentThreadSummary[]
  libraries: KnowledgeBase[]
  onClose: () => void
  onAskMindar: () => void
  onOpenLibraries: () => void
  onOpenThread: (thread: AgentThreadSummary) => void
  onOpenLibrary: (kb: KnowledgeBase) => void
}) {
  const [query, setQuery] = useState("")

  const q = query.trim().toLowerCase()

  const filteredThreads = useMemo(() => {
    if (!q) return threads
    return threads.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.preview.toLowerCase().includes(q) ||
        (threadScopeHint(t.scope)?.toLowerCase().includes(q) ?? false)
    )
  }, [threads, q])

  const grouped = useMemo(() => groupThreadSummariesByCalendarDay(filteredThreads), [filteredThreads])

  const matchedLibraries = useMemo(() => {
    if (!q) return []
    return libraries.filter(
      (kb) =>
        kb.name.toLowerCase().includes(q) ||
        kb.description.toLowerCase().includes(q)
    )
  }, [libraries, q])

  if (!open) return null

  return (
    <div className="absolute inset-0 z-[60] flex flex-row" role="presentation">
      <aside
        className={cn(
          "flex h-full w-[min(88%,320px)] shrink-0 flex-col border-r shadow-xl animate-in slide-in-from-left duration-300",
          mx.shellHairline,
          "bg-[var(--mind-page-bg)] dark:bg-zinc-950"
        )}
        role="dialog"
        aria-modal
        aria-label="Mindar menu"
      >
        <div className={cn("flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3", mx.shellHairline)}>
          <MindarLogo variant="inline" className="!h-5 !max-w-[88px]" />
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-stone-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-zinc-500" strokeWidth={1.75} />
          </button>
        </div>

        <div className="shrink-0 px-4 py-3">
          <div className="relative">
            <Search className={cn("pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2", mx.shellIcon)} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search history…"
              className={cn(
                "w-full rounded-xl border-0 py-2.5 pl-9 pr-3 text-[14px] outline-none ring-1 placeholder:text-zinc-400 focus:ring-2",
                "bg-stone-100/90 ring-stone-200/80 focus:ring-stone-200/90",
                "dark:bg-zinc-900 dark:ring-zinc-700/80 dark:focus:ring-zinc-600/80 dark:text-zinc-100"
              )}
            />
          </div>
        </div>

        {!q ? (
          <div className={cn("shrink-0 border-b pb-1", mx.shellHairline)}>
            <SidebarShortcut
              label="Ask Mindar"
              icon={<Sparkles className="h-4 w-4 text-mind" strokeWidth={1.75} aria-hidden />}
              onClick={() => {
                onAskMindar()
                onClose()
              }}
            />
            <SidebarShortcut
              label="Libraries"
              icon={<BookOpen className={cn("h-4 w-4", mx.shellMuted)} strokeWidth={1.75} aria-hidden />}
              onClick={() => {
                onOpenLibraries()
                onClose()
              }}
            />
          </div>
        ) : null}

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
          {matchedLibraries.length > 0 ? (
            <section className="pt-3">
              <h2 className={cn("px-4 pb-1 text-[12px] font-semibold", mx.shellMuted)}>Libraries</h2>
              <ul>
                {matchedLibraries.slice(0, 5).map((kb) => (
                  <li key={kb.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenLibrary(kb)
                        onClose()
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-stone-50/90 dark:hover:bg-zinc-900/45"
                    >
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-stone-200/90 dark:ring-zinc-700/80">
                        <LibraryCoverFromKb kb={kb} showMiniUi={false} />
                      </div>
                      <span className={cn("min-w-0 flex-1 truncate text-[14px] font-medium", mx.shellInk)}>{kb.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="pt-2">
            <h2 className={cn("px-4 pb-2 text-[13px] font-semibold text-left", mx.shellInkSecondary)}>
              Conversation history
            </h2>

            {grouped.length === 0 ? (
              <p className={cn("px-4 py-8 text-left text-[14px]", mx.shellMuted)}>
                {q ? `No matches for “${query.trim()}”.` : "Your threads with Mindar will appear here."}
              </p>
            ) : (
              grouped.map((group) => (
                <div key={group.label} className="mb-1">
                  <p className={cn("px-4 pb-1 pt-3 text-[12px] font-medium tabular-nums", mx.shellIcon)}>
                    {group.label}
                  </p>
                  <ul>
                    {group.threads.map((thread) => (
                      <li key={thread.threadKey}>
                        <HistoryRow
                          thread={thread}
                          onClick={() => {
                            onOpenThread(thread)
                            onClose()
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </section>
        </div>
      </aside>
      <button
        type="button"
        className="min-w-0 flex-1 bg-zinc-900/20 backdrop-blur-[1px]"
        aria-label="Close sidebar"
        onClick={onClose}
      />
    </div>
  )
}
