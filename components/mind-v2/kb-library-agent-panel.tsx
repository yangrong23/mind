"use client"

import { ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import type { PublicKbAgentDisplay } from "@/lib/public-kb-agent-display"

const sectionLabel = "text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500"

function AgentAvatar({
  agent,
  size = "md",
}: {
  agent: Pick<PublicKbAgentDisplay, "avatar" | "color">
  size?: "md" | "lg"
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-lg shadow-sm ring-1 ring-black/[0.04] dark:ring-white/10",
        size === "lg" ? "h-12 w-12 text-xl" : "h-11 w-11",
        agent.color
      )}
      aria-hidden
    >
      {agent.avatar}
      <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-950" />
    </div>
  )
}

/** Plaza / subscribed library — agent-first entry; library title stays in the page header only. */
export function PublicKbLibraryAgentEntry({
  agent,
  onOpen,
  onQuickPrompt,
  className,
}: {
  agent: PublicKbAgentDisplay
  onOpen: () => void
  onQuickPrompt?: (prompt: string) => void
  className?: string
}) {
  const starters = agent.recommendedQuestions.slice(0, 2)
  const capabilityPills = agent.capabilities.slice(0, 3)

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-stone-200/80 bg-gradient-to-br from-white via-white to-stone-50/80 shadow-[0_10px_30px_-10px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.03] dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900/80 dark:ring-white/5",
        className
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-start gap-3 p-4 pb-3 text-left transition-colors hover:bg-stone-50/60 dark:hover:bg-zinc-900/40"
        aria-label={`Open ${agent.name}`}
      >
        <AgentAvatar agent={agent} />
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[15px] font-semibold leading-tight text-zinc-900 dark:text-zinc-100">{agent.name}</p>
            <span className="shrink-0 pt-0.5 text-[11px] font-semibold text-mind">Open</span>
          </div>
          <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-zinc-600 dark:text-zinc-400">{agent.tagline}</p>
          <p className="mt-2 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400">{agent.greetingLine}</p>
        </div>
      </button>

      {capabilityPills.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {capabilityPills.map((cap) => (
            <span
              key={cap}
              className="rounded-full border border-sky-100/90 bg-sky-50/60 px-2.5 py-1 text-[10px] font-medium text-mind dark:border-sky-900/45 dark:bg-sky-950/35"
            >
              {cap}
            </span>
          ))}
        </div>
      ) : null}

      {starters.length > 0 ? (
        <div className="space-y-1.5 px-4 pb-3">
          {starters.map((q) => (
            <button
              key={q}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (onQuickPrompt) onQuickPrompt(q)
                else onOpen()
              }}
              className="flex w-full items-center gap-2 rounded-xl border border-stone-100/90 bg-white/90 px-3 py-2.5 text-left transition-colors hover:border-sky-200/80 hover:bg-sky-50/50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-sky-800/50 dark:hover:bg-sky-950/30"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-mind/80" strokeWidth={2} aria-hidden />
              <span className="min-w-0 flex-1 text-[12px] leading-snug text-zinc-700 dark:text-zinc-300">{q}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" strokeWidth={2} aria-hidden />
            </button>
          ))}
        </div>
      ) : null}

      <p className="border-t border-stone-100/90 px-4 py-2 text-[11px] font-medium text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
        {agent.contextMeta}
      </p>
    </div>
  )
}

export function KbLibraryAgentPanel({
  agent,
  onStartChat,
  onSelectPrompt,
  embedded = false,
  className,
}: {
  agent: PublicKbAgentDisplay
  onStartChat: () => void
  onSelectPrompt: (prompt: string) => void
  embedded?: boolean
  className?: string
}) {
  const starters = agent.recommendedQuestions.slice(0, 3)

  return (
    <section className={cn(!embedded && "px-4 pb-3", className)} aria-labelledby="kb-library-agent-title">
      <div className={cn(embedded ? "px-4 py-3" : cn(mx.shellCard, "overflow-hidden p-4"))}>
        {!embedded ? (
          <div className="flex items-start gap-3 border-b border-stone-100/90 pb-4 dark:border-zinc-800">
            <AgentAvatar agent={agent} size="lg" />
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 id="kb-library-agent-title" className="text-[17px] font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
                {agent.name}
              </h2>
              <p className="mt-1 text-[13px] leading-snug text-zinc-500 dark:text-zinc-400">{agent.tagline}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-400">{agent.greetingLine}</p>
            </div>
          </div>
        ) : (
          <p className="mb-1 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">{agent.greetingLine}</p>
        )}

        {agent.capabilities.length > 0 ? (
          <div className={cn(!embedded && "mt-4", embedded && "mt-3")}>
            <p className={sectionLabel}>What I can do</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {agent.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="flex min-h-[2.75rem] items-center justify-center rounded-xl border border-sky-100/90 bg-sky-50/70 px-2.5 py-2 text-center text-[11px] font-medium leading-snug text-mind dark:border-sky-900/50 dark:bg-sky-950/40"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 rounded-xl border border-stone-100/90 bg-stone-50/60 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mind" strokeWidth={2} aria-hidden />
            <span>{agent.groundingLabel}</span>
          </p>
          <p className="mt-2 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">{agent.contextMeta}</p>
          {agent.disclaimer ? (
            <p className="mt-2 border-t border-stone-200/70 pt-2 text-[11px] leading-relaxed text-amber-700/90 dark:border-zinc-700 dark:text-amber-400/90">
              {agent.disclaimer}
            </p>
          ) : null}
        </div>

        {starters.length > 0 ? (
          <div className="mt-4">
            <p className={cn(sectionLabel, "flex items-center gap-1.5")}>
              <Sparkles className="h-3 w-3 shrink-0 text-mind" strokeWidth={2} aria-hidden />
              Try asking
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              {starters.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onSelectPrompt(q)}
                  className="flex items-center gap-2 rounded-xl border border-stone-100/90 bg-white px-3 py-2.5 text-left transition-colors hover:border-sky-200/80 hover:bg-sky-50/50 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-sky-800/50 dark:hover:bg-sky-950/30"
                >
                  <span className="min-w-0 flex-1 text-[12px] leading-snug text-zinc-700 dark:text-zinc-300">{q}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" strokeWidth={2} aria-hidden />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onStartChat}
          className={cn("mt-5 w-full rounded-xl py-2.5 text-[14px] font-semibold", mx.brandCta, mx.brandFocusRing)}
        >
          Start a thread with {agent.name}
        </button>
      </div>
    </section>
  )
}
