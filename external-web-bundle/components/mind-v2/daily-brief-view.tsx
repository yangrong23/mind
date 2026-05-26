"use client"

import { Calendar, CornerDownLeft, ExternalLink, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DailyBriefAction, DailyBriefContent } from "@/lib/daily-brief-content"

function BriefActionIcon({ kind }: { kind?: DailyBriefAction["kind"] }) {
  if (kind === "calendar") return <Calendar className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
  if (kind === "link") return <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
  return <Mail className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
}

function renderLeadText(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-zinc-900 dark:text-zinc-100">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

export function DailyBriefView({
  content,
  onSuggestedPrompt,
  onAction,
  className,
}: {
  content: DailyBriefContent
  onSuggestedPrompt?: (prompt: string) => void
  onAction?: (actionId: string, itemId: string) => void
  className?: string
}) {
  return (
    <div className={cn("space-y-8", className)}>
      <header>
        <h2 className="text-[22px] font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-[24px]">
          {content.greeting}
        </h2>
        {content.subline ? (
          <p className="mt-2 text-[14px] text-zinc-500 dark:text-zinc-400">{content.subline}</p>
        ) : null}
      </header>

      {content.sections.map((section) => (
        <section key={section.id} aria-labelledby={`brief-${section.id}`}>
          <h3
            id={`brief-${section.id}`}
            className="text-[17px] font-semibold tracking-tight text-zinc-800 dark:text-zinc-100"
          >
            {section.title}
          </h3>
          <ul className="mt-4 space-y-5">
            {section.items.map((item) => (
              <li key={item.id} className="relative pl-4">
                <span
                  className="absolute left-0 top-[0.55rem] h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500"
                  aria-hidden
                />
                <p className="text-[15px] leading-[1.65] text-zinc-800 dark:text-zinc-200">
                  {renderLeadText(item.lead)}
                </p>
                {item.note ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                    <span className="font-medium text-zinc-600 dark:text-zinc-300">Note: </span>
                    {item.note}
                  </p>
                ) : null}
                {item.context ? (
                  <p className="mt-2 text-[14px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.context}
                  </p>
                ) : null}
                {item.actions?.length ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {item.actions.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => onAction?.(action.id, item.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border border-stone-200/90 bg-white px-3 py-1.5",
                          "text-[12px] font-medium text-zinc-700 transition-colors hover:bg-stone-50",
                          "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        )}
                      >
                        <BriefActionIcon kind={action.kind} />
                        {action.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {content.suggestedPrompts.length > 0 ? (
        <section aria-label="Suggested follow-ups">
          <p className="mb-3 text-[13px] font-medium text-zinc-500 dark:text-zinc-400">
            Continue the conversation
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            {content.suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onSuggestedPrompt?.(prompt)}
                className={cn(
                  "flex min-h-[44px] flex-1 items-center justify-between gap-3 rounded-2xl border border-stone-200/90",
                  "bg-stone-50/80 px-4 py-3 text-left text-[14px] font-medium leading-snug text-zinc-800",
                  "transition-colors hover:border-stone-300 hover:bg-white",
                  "dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:border-zinc-600"
                )}
              >
                <span className="min-w-0 flex-1">{prompt}</span>
                <CornerDownLeft className="h-4 w-4 shrink-0 text-zinc-400" strokeWidth={2} aria-hidden />
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
