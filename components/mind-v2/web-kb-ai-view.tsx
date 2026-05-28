"use client"

import { ChevronRight, Network, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { KnowledgeGraphPreview } from "@/components/mind-v2/knowledge-detail-web-shell"
import {
  kbAiInsights,
  kbAiSummaryParagraph,
  kbAiTopicChips,
} from "@/lib/kb-ai-view"

export type WebKbCenterSurface = "chat" | "ai"

export function WebKbAiViewChatToggle({
  mode,
  onChange,
  className,
}: {
  mode: WebKbCenterSurface
  onChange: (mode: WebKbCenterSurface) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex w-[15rem] shrink-0 justify-center rounded-xl bg-stone-100/90 p-1 ring-1 ring-black/[0.05]",
        className
      )}
      role="tablist"
      aria-label="Chat or AI view"
    >
      {(
        [
          { id: "chat" as const, label: "Chat" },
          { id: "ai" as const, label: "AI view" },
        ] as const
      ).map((tab) => {
        const selected = mode === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "min-w-[6.25rem] flex-1 rounded-lg px-3 py-2 text-center text-[13px] font-semibold leading-none transition-colors",
              selected ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

/** Pinned strip above chat scroll — stays visible while messages grow. */
export function WebKbAiViewEntry({
  libraryName,
  sourceCount,
  onOpen,
  className,
}: {
  libraryName: string
  sourceCount: number
  onOpen: () => void
  className?: string
}) {
  const topics = kbAiTopicChips(libraryName, sourceCount).slice(0, 2)

  return (
    <section
      className={cn("shrink-0 border-b border-stone-100/90 px-3 py-2", className)}
      aria-label="AI view entry"
    >
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
          web.kbPlazaWell,
          "hover:bg-white/90"
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/15 to-sky-500/20 ring-1 ring-violet-100/80">
          <Sparkles className="h-[18px] w-[18px] text-violet-600" strokeWidth={2} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-zinc-800">AI view</span>
          <span className="mt-0.5 block truncate text-[11px] text-zinc-500">
            Summary · {sourceCount} {sourceCount === 1 ? "source" : "sources"}
            {topics.length > 0 ? ` · ${topics.join(", ")}` : ""}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-0.5 text-[12px] font-semibold text-mind">
          Open
          <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
      </button>
    </section>
  )
}

export function WebKbAiViewPanel({
  libraryName,
  sourceCount,
  description,
  expanded = false,
  compact = false,
  className,
  onExpand,
}: {
  libraryName: string
  sourceCount: number
  description?: string
  expanded?: boolean
  compact?: boolean
  className?: string
  onExpand?: () => void
}) {
  const summary = kbAiSummaryParagraph(libraryName, sourceCount, description)
  const insights = kbAiInsights(sourceCount)
  const topics = kbAiTopicChips(libraryName, sourceCount)

  return (
    <div
      className={cn(
        "flex flex-col",
        expanded ? "min-h-0 flex-1" : compact ? "" : "px-1",
        className
      )}
    >
      <div
        className={cn(
          expanded ? "scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 py-4" : "px-3 py-3",
          !expanded && web.kbPlazaWell,
          compact && !expanded && "py-2.5"
        )}
      >
        <div className="flex items-start gap-2">
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/15 to-sky-500/15 ring-1 ring-violet-100/70",
              expanded ? "h-9 w-9" : "h-8 w-8"
            )}
          >
            <Sparkles
              className={cn("text-violet-600", expanded ? "h-[18px] w-[18px]" : "h-4 w-4")}
              strokeWidth={2}
              aria-hidden
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3
                className={cn(
                  "font-semibold text-zinc-800",
                  expanded ? "text-[15px]" : "text-[13px]"
                )}
              >
                AI summary
              </h3>
              {onExpand && !expanded ? (
                <button
                  type="button"
                  className="shrink-0 text-[11px] font-semibold text-mind hover:underline"
                  onClick={onExpand}
                >
                  Expand
                </button>
              ) : null}
            </div>
            <p
              className={cn(
                "mt-1.5 leading-relaxed text-zinc-600",
                expanded ? "text-[14px] leading-[1.65]" : "text-[12px] leading-[1.55]"
              )}
            >
              {summary}
            </p>
          </div>
        </div>

        <ul className={cn("mt-3 space-y-1.5", compact && !expanded && "mt-2")}>
          {insights.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex gap-2 text-zinc-600",
                expanded ? "text-[13px] leading-snug" : "text-[11px] leading-snug"
              )}
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-violet-400" aria-hidden />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>

        {topics.length > 0 ? (
          <div className={cn("mt-3 flex flex-wrap gap-1.5", compact && !expanded && "mt-2")}>
            {topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-zinc-600 ring-1 ring-black/[0.06]"
              >
                {topic}
              </span>
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            "mt-4 border-t border-black/[0.05] pt-4",
            compact && !expanded && "mt-3 pt-3"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white ring-1 ring-sky-100/80">
                <Network className="h-3.5 w-3.5 text-sky-600" strokeWidth={1.85} aria-hidden />
              </span>
              <span className="text-[12px] font-semibold text-zinc-700">Knowledge graph</span>
            </div>
            {expanded && onExpand ? (
              <button
                type="button"
                className="text-[11px] font-semibold text-mind hover:underline"
                onClick={onExpand}
              >
                Full screen
              </button>
            ) : null}
          </div>
          <div
            className={cn(
              "mt-3 flex flex-col items-center",
              expanded ? "py-4" : "py-2"
            )}
          >
            <KnowledgeGraphPreview compact={!expanded && (compact ?? true)} />
            <p
              className={cn(
                "mt-2 text-center text-zinc-500",
                expanded ? "max-w-md text-[12px] leading-relaxed" : "max-w-[240px] text-[11px] leading-snug"
              )}
            >
              Nodes link sources and concepts — select one to jump to the document or ask Mindar about it.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
