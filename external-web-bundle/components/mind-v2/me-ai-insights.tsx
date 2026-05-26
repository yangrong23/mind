"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mockInsightRunResult } from "@/lib/me-insight-run-mock"
import {
  MIND_FEATURED_INSIGHT_PERSPECTIVES,
  MIND_INSIGHT_GALLERY_CATEGORIES,
  type InsightPerspective,
} from "@/lib/mind-insight-perspectives"
import { MindChatThinking } from "@/components/mind-v2/mind-chat-thinking"
import { MindViralShareCard } from "@/components/mind-v2/mind-viral-share-card"
import { buildInsightSharePayload, type MindSharePayload } from "@/lib/mind-share-payload"
import { ChevronRight, Clock, Plus, X } from "lucide-react"

type View = "picker" | "gallery" | "result"

const MOCK_HISTORY = [
  { id: "h1", title: "Value clarification", range: "Last 3 months", ago: "2 days ago" },
  { id: "h2", title: "Reverse thinking", range: "Last year", ago: "1 week ago" },
  { id: "h3", title: "Default insight", range: "All notes", ago: "2 weeks ago" },
] as const

export type MeAiInsightsProps = {
  onClose: () => void
  displayName?: string
  noteCount?: number
  libraryItemCount?: number
  tagCount?: number
  dayCount?: number
  onShare?: (payload: MindSharePayload) => void
}

function PerspectiveIcon({ icon: Icon }: { icon: InsightPerspective["icon"] }) {
  return (
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", "bg-[#f0eeec] dark:bg-zinc-800")}>
      <Icon className={cn("h-5 w-5", "text-zinc-600 dark:text-zinc-300")} strokeWidth={1.75} aria-hidden />
    </div>
  )
}

function GalleryAddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-400 text-white shadow-sm transition-colors hover:bg-mind"
      aria-label="Add perspective"
    >
      <Plus className="h-4 w-4" strokeWidth={2.5} />
    </button>
  )
}

function FilterRangeSheet({
  open,
  onClose,
  noteCount,
  libraryItemCount,
}: {
  open: boolean
  onClose: () => void
  noteCount: number
  libraryItemCount: number
}) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-[80]">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Dismiss" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white pb-6 animate-in slide-in-from-bottom duration-200 dark:bg-zinc-950">
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-stone-300 dark:bg-zinc-600" />
        </div>
        <div className="px-5">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Filter range</h3>
          <p className="mt-1 text-sm text-zinc-500">Notes + knowledge libraries (demo)</p>
          <div className="mt-4 space-y-2">
            {["Last 7 days", "Last 30 days", "Last 3 months", "All time"].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  toast.success("Range updated", { description: `${label} · ${noteCount} notes · ${libraryItemCount} library items` })
                  onClose()
                }}
                className="flex w-full items-center justify-between rounded-xl border border-stone-200/90 px-4 py-3 text-left text-[14px] font-medium text-zinc-800 hover:bg-stone-50 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                {label}
                <ChevronRight className="h-4 w-4 text-zinc-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function HistorySheet({ open, onClose, onOpen }: { open: boolean; onClose: () => void; onOpen: (title: string) => void }) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-[80]">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Dismiss" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[70%] rounded-t-3xl bg-white pb-6 animate-in slide-in-from-bottom duration-200 dark:bg-zinc-950">
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-stone-300 dark:bg-zinc-600" />
        </div>
        <div className="px-5">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Insight history</h3>
          <ul className="mt-3 divide-y divide-stone-100 dark:divide-zinc-800">
            {MOCK_HISTORY.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => {
                    onOpen(h.title)
                    onClose()
                  }}
                  className="flex w-full flex-col gap-0.5 py-3 text-left hover:opacity-80"
                >
                  <span className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">{h.title}</span>
                  <span className="text-[12px] text-zinc-500">
                    {h.range} · {h.ago}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function MeAiInsights({
  onClose,
  displayName = "You",
  noteCount = 156,
  libraryItemCount = 234,
  tagCount = 12,
  dayCount = 23,
  onShare,
}: MeAiInsightsProps) {
  const [view, setView] = useState<View>("picker")
  const [selected, setSelected] = useState<InsightPerspective | null>(null)
  const [generating, setGenerating] = useState(false)
  const [thinkingPhase, setThinkingPhase] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    if (!generating) return
    setThinkingPhase(0)
    const t1 = window.setTimeout(() => setThinkingPhase(1), 900)
    const t2 = window.setTimeout(() => setThinkingPhase(2), 1800)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [generating])

  const runPerspective = (p: InsightPerspective) => {
    setSelected(p)
    setGenerating(true)
    setView("result")
    window.setTimeout(() => setGenerating(false), 2400)
  }

  const handleBack = () => {
    if (view === "result") {
      setView("picker")
      setSelected(null)
      setGenerating(false)
      return
    }
    if (view === "gallery") {
      setView("picker")
      return
    }
    onClose()
  }

  const headerTitle =
    view === "gallery"
      ? "Discover more perspectives"
      : view === "result" && selected
        ? selected.title
        : "AI insights"

  const result = selected ? mockInsightRunResult(selected) : null

  const insightSharePayload =
    selected && result
      ? buildInsightSharePayload({
          displayName,
          perspectiveTitle: selected.title,
          rangeLabel: selected.rangeLabel,
          author: selected.author,
          headline: result.headline,
          bodyMarkdown: result.bodyMarkdown,
          suggestedNextStep: result.suggestedNextStep,
        })
      : null

  const openInsightShare = () => {
    if (!insightSharePayload) return
    onShare?.(insightSharePayload)
  }

  return (
    <div className="absolute inset-0 z-[65] flex flex-col bg-white animate-in slide-in-from-right duration-200 dark:bg-zinc-950">
      <div className="flex shrink-0 items-center gap-2 border-b border-stone-100/85 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-full p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800"
          aria-label={view === "picker" ? "Close" : "Back"}
        >
          {view === "picker" ? (
            <X className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
          ) : (
            <ChevronRight className="h-6 w-6 rotate-180 text-zinc-600 dark:text-zinc-300" />
          )}
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold text-zinc-900 dark:text-zinc-100">
          {headerTitle}
        </h1>
        {view === "picker" ? (
          <div className="flex items-center gap-0.5 rounded-full border border-stone-200/90 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-800/80">
            <button
              type="button"
              onClick={() => setView("gallery")}
              className="rounded-full p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-700"
              aria-label="Discover perspectives"
            >
              <Plus className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
            </button>
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="rounded-full p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-700"
              aria-label="History"
            >
              <Clock className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
            </button>
          </div>
        ) : view === "gallery" ? (
          <button
            type="button"
            onClick={() =>
              toast.message("Submit perspective", {
                description: "Share a template with the community (demo).",
              })
            }
            className="rounded-full p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800"
            aria-label="Add perspective"
          >
            <Plus className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
          </button>
        ) : (
          <div className="w-8 shrink-0" aria-hidden />
        )}
      </div>

      {view === "picker" && (
        <div className="min-h-0 flex-1 overflow-y-auto pb-6">
          <div className="px-5 pt-5 pb-3">
            <p className={cn("text-[15px] font-semibold", "text-mind")}>Select a perspective to start</p>
            <p className="mt-1 text-[12px] leading-snug text-zinc-400">
              Insights use your notes and knowledge libraries to reflect what you capture and what you are learning.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-1.5 text-[13px] text-zinc-500">
              <span className="tabular-nums">
                {noteCount} notes · {libraryItemCount} library items · {tagCount} tags · {dayCount} days
              </span>
              <span className="text-zinc-300">·</span>
              <button type="button" className={cn("font-medium", "text-mind hover:text-mind/90")} onClick={() => setFilterOpen(true)}>
                Filter range
              </button>
            </div>
          </div>

          <div className="mx-4 space-y-2">
            {MIND_FEATURED_INSIGHT_PERSPECTIVES.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => runPerspective(p)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border border-stone-200/80 bg-white px-3.5 py-3.5 text-left shadow-sm shadow-stone-900/[0.03] transition-all",
                  "hover:border-stone-300/90 hover:bg-stone-50/80 active:scale-[0.99]",
                  "dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60",
                  "animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-300"
                )}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <PerspectiveIcon icon={p.icon} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <span className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">{p.title}</span>
                    <span className="text-[12px] text-zinc-400">by {p.author}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[13px] text-zinc-500">{p.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300" />
              </button>
            ))}

            <button
              type="button"
              onClick={() => setView("gallery")}
              className="flex w-full items-center justify-between rounded-2xl border border-dashed border-stone-300/90 bg-stone-50/50 px-4 py-3.5 text-left transition-colors hover:bg-stone-100/80 dark:border-zinc-700 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/50"
            >
              <span className="text-[15px] font-medium text-zinc-700 dark:text-zinc-300">
                Discover more perspectives / Custom
              </span>
              <ChevronRight className="h-5 w-5 text-zinc-400" />
            </button>
          </div>
        </div>
      )}

      {view === "gallery" && (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4">
          {MIND_INSIGHT_GALLERY_CATEGORIES.map((cat) => (
            <section key={cat.id} className="mb-6">
              <h2 className="mb-3 px-0.5 text-[15px] font-bold text-zinc-900 dark:text-zinc-100">{cat.label}</h2>
              <div className="grid grid-cols-2 gap-3">
                {cat.perspectives.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => runPerspective(p)}
                    className="relative flex min-h-[168px] flex-col rounded-2xl border border-stone-200/85 bg-white p-3 text-left shadow-sm shadow-stone-900/[0.03] transition-all hover:border-stone-300 hover:bg-stone-50/60 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
                  >
                    <GalleryAddButton
                      onClick={() =>
                        toast.success("Added to shortcuts", {
                          description: `${p.title} will appear on the main list (demo).`,
                        })
                      }
                    />
                    <p.icon className="h-7 w-7 text-zinc-800 dark:text-zinc-200" strokeWidth={1.5} />
                    <p className="mt-3 text-[14px] font-bold leading-snug text-zinc-900 dark:text-zinc-100">{p.title}</p>
                    <p className="mt-1 line-clamp-3 flex-1 text-[11px] leading-relaxed text-zinc-500">{p.description}</p>
                    <p className="mt-2 text-[10px] text-zinc-400">Range · {p.rangeLabel}</p>
                    <p className="mt-0.5 text-[10px] text-zinc-400">by {p.author}</p>
                  </button>
                ))}
              </div>
            </section>
          ))}

          <p className="px-1 text-center text-[13px] text-zinc-500">
            Have a better idea?{" "}
            <button
              type="button"
              className={cn("font-medium", "text-mind hover:text-mind/90")}
              onClick={() =>
                toast.message("Submit a perspective", {
                  description: "Community templates would open here (demo).",
                })
              }
            >
              Share a perspective
            </button>
          </p>
        </div>
      )}

      {view === "result" && selected && result && (
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 pb-8">
          {generating ? (
            <MindChatThinking phase={thinkingPhase} compact className="py-10" />
          ) : (
            <div className="animate-in fade-in duration-300">
              {insightSharePayload ? (
                <MindViralShareCard
                  card={insightSharePayload.card}
                  displayName={displayName}
                  onShare={openInsightShare}
                  className="mb-5"
                />
              ) : null}
              <p className="mb-3 border-l-2 border-mind/40 pl-2 text-xs font-medium text-mind dark:text-mind/90">
                AI-generated · <span className={"text-zinc-500"}>{selected.title}</span>
              </p>
              <p className="mb-4 text-xs text-zinc-500">
                Range · {selected.rangeLabel} · by {selected.author}
              </p>

              <div className="rounded-2xl border border-stone-200/90 bg-gradient-to-br from-stone-50/90 to-white p-4 shadow-sm dark:border-zinc-800 dark:from-zinc-900/80 dark:to-zinc-900">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Headline</p>
                <p className="mt-1 text-[17px] font-semibold leading-snug text-zinc-900 dark:text-zinc-50">{result.headline}</p>
              </div>

              <div className="mt-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <p className="text-[15px] leading-[1.72] text-zinc-700 dark:text-zinc-300">{result.bodyMarkdown}</p>
              </div>

              <p className="mt-4 text-[12px] leading-relaxed text-zinc-500">{result.materialBasis}</p>

              {result.blindSpots.length > 0 ? (
                <section className="mt-5">
                  <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Blind spots</h3>
                  <ul className="mt-2 space-y-1.5">
                    {result.blindSpots.map((b) => (
                      <li key={b} className="text-[13px] leading-snug text-zinc-600 dark:text-zinc-400">
                        · {b}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section className="mt-5">
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-400">Reflect</h3>
                <ul className="mt-2 space-y-2">
                  {result.questions.map((q) => (
                    <li
                      key={q}
                      className="rounded-xl border border-stone-200/80 bg-stone-50/60 px-3 py-2.5 text-[13px] text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300"
                    >
                      {q}
                    </li>
                  ))}
                </ul>
              </section>

              <div className="mt-5 rounded-2xl border border-mind/20 bg-mind/5 px-4 py-3 dark:border-mind/25 dark:bg-mind/10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mind">Suggested next step</p>
                <p className="mt-1 text-[14px] leading-snug text-zinc-800 dark:text-zinc-200">{result.suggestedNextStep}</p>
              </div>

              <button
                type="button"
                onClick={() => runPerspective(selected)}
                className="mt-5 w-full rounded-xl border border-stone-200 py-2.5 text-[14px] font-medium text-zinc-700 hover:bg-stone-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                Regenerate
              </button>
            </div>
          )}
        </div>
      )}

      <FilterRangeSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        noteCount={noteCount}
        libraryItemCount={libraryItemCount}
      />
      <HistorySheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onOpen={(title) => {
          const p = MIND_FEATURED_INSIGHT_PERSPECTIVES.find((x) => x.title === title) ?? MIND_FEATURED_INSIGHT_PERSPECTIVES[0]
          runPerspective(p!)
        }}
      />
    </div>
  )
}
