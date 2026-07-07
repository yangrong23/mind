"use client"

import {
  Calendar,
  ChevronRight,
  ExternalLink,
  FileText,
  HelpCircle,
  Layers,
  Mail,
  Presentation,
  Volume2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import type {
  DailyBriefAction,
  DailyBriefContent,
  DailyBriefOutputFile,
  DailyBriefOutputKind,
} from "@/lib/daily-brief-content"

function BriefActionIcon({ kind }: { kind?: DailyBriefAction["kind"] }) {
  if (kind === "calendar") return <Calendar className="h-3 w-3" strokeWidth={2} aria-hidden />
  if (kind === "link") return <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
  return <Mail className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
}

function OutputFileIcon({ kind }: { kind: DailyBriefOutputKind }) {
  const className = "h-[17px] w-[17px] shrink-0"
  switch (kind) {
    case "audio":
      return <Volume2 className={className} strokeWidth={1.85} aria-hidden />
    case "flashcards":
      return <Layers className={className} strokeWidth={1.85} aria-hidden />
    case "slides":
      return <Presentation className={className} strokeWidth={1.85} aria-hidden />
    case "quiz":
      return <HelpCircle className={className} strokeWidth={1.85} aria-hidden />
    default:
      return <FileText className={className} strokeWidth={1.85} aria-hidden />
  }
}

function outputFileTone(kind: DailyBriefOutputKind) {
  switch (kind) {
    case "audio":
      return "bg-cyan-500/12 text-cyan-700 dark:bg-cyan-500/18 dark:text-cyan-300"
    case "flashcards":
      return "bg-blue-500/12 text-blue-700 dark:bg-blue-500/18 dark:text-blue-300"
    case "slides":
      return "bg-violet-500/12 text-violet-700 dark:bg-violet-500/18 dark:text-violet-300"
    case "quiz":
      return "bg-amber-500/12 text-amber-800 dark:bg-amber-500/18 dark:text-amber-300"
    default:
      return "bg-mind/10 text-mind dark:bg-mind/15 dark:text-sky-300"
  }
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
  onOutputFileClick,
  onAction,
  className,
}: {
  content: DailyBriefContent
  onOutputFileClick?: (file: DailyBriefOutputFile) => void
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

      {content.outputFiles.length > 0 ? (
        <section aria-label="Files from this day">
          <p className="mb-3 text-[13px] font-medium text-zinc-500 dark:text-zinc-400">Files from this day</p>
          <div className="space-y-2">
            {content.outputFiles.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => onOutputFileClick?.(file)}
                className={cn(
                  mx.elevatedCard,
                  "flex w-full items-center gap-3 px-3.5 py-3 text-left transition-all",
                  "hover:border-[#E9ECEF] active:scale-[0.99] dark:hover:border-zinc-600",
                  mx.brandFocusRing
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    outputFileTone(file.kind)
                  )}
                  aria-hidden
                >
                  <OutputFileIcon kind={file.kind} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
                    {file.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    {file.kindLabel}
                    {file.time ? ` · ${file.time}` : ""}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" strokeWidth={1.75} aria-hidden />
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
