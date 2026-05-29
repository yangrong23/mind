"use client"

import { Calendar, ExternalLink, FileText, Mail } from "lucide-react"
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
  onAction,
  className,
}: {
  content: DailyBriefContent
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
                          "inline-flex items-center gap-1.5 rounded-xl bg-mind/[0.06] px-3.5 py-2",
                          "text-[13px] font-semibold text-mind transition-colors hover:bg-mind/10",
                          "dark:bg-mind/12 dark:hover:bg-mind/16"
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

      {content.sourceFiles && content.sourceFiles.length > 0 ? (
        <section
          aria-label="Files for this period"
          className="rounded-2xl border border-stone-200/90 bg-stone-50/60 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <h3 className="flex items-center gap-2 text-[14px] font-semibold text-zinc-800 dark:text-zinc-100">
            <FileText className="h-4 w-4 text-zinc-500" strokeWidth={2} aria-hidden />
            Files from this period
          </h3>
          <p className="mt-1 text-[12px] text-zinc-500 dark:text-zinc-400">
            Sources you captured or edited — open from your library or device log.
          </p>
          <ul className="mt-3 divide-y divide-stone-200/80 dark:divide-zinc-800">
            {content.sourceFiles.map((file) => (
              <li key={file.id} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-black/[0.05] dark:bg-zinc-950 dark:ring-white/10">
                  <FileText className="h-3.5 w-3.5 text-zinc-500" strokeWidth={2} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium leading-snug text-zinc-800 dark:text-zinc-100">
                    {file.title}
                  </p>
                  <p className="mt-0.5 text-[12px] text-zinc-500 dark:text-zinc-400">
                    {[file.time, file.source].filter(Boolean).join(" · ") || "Capture"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
