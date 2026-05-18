"use client"

import { useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import {
  MIND_FEATURED_INSIGHT_PERSPECTIVES,
  MIND_INSIGHT_GALLERY_CATEGORIES,
  type InsightPerspective,
} from "@/lib/mind-insight-perspectives"
import { ChevronRight, Clock, Plus, Share2, X } from "lucide-react"

type View = "picker" | "gallery" | "result"

export type MeAiInsightsProps = {
  onClose: () => void
  noteCount?: number
  /** Knowledge library items in the insight corpus (notes + libraries). */
  libraryItemCount?: number
  tagCount?: number
  dayCount?: number
  onShare?: (title: string, preview: string) => void
}

function PerspectiveIcon({ icon: Icon }: { icon: InsightPerspective["icon"] }) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
        mx.settingsIconWell
      )}
    >
      <Icon className={cn("h-5 w-5", mx.settingsIconInk)} strokeWidth={1.75} aria-hidden />
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

export function MeAiInsights({
  onClose,
  noteCount = 156,
  libraryItemCount = 234,
  tagCount = 12,
  dayCount = 23,
  onShare,
}: MeAiInsightsProps) {
  const [view, setView] = useState<View>("picker")
  const [selected, setSelected] = useState<InsightPerspective | null>(null)
  const [generating, setGenerating] = useState(false)

  const runPerspective = (p: InsightPerspective) => {
    setSelected(p)
    setGenerating(true)
    setView("result")
    window.setTimeout(() => setGenerating(false), 650)
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

  return (
    <div className="absolute inset-0 z-[65] flex flex-col bg-white dark:bg-zinc-950 animate-in slide-in-from-right duration-200 dark:bg-zinc-950">
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
          <div className="flex items-center gap-0.5 rounded-full border border-stone-200/90 bg-white dark:bg-zinc-950 p-0.5 dark:border-zinc-700 dark:bg-zinc-800/80">
            <button
              type="button"
              onClick={() =>
                toast.message("Custom perspective", {
                  description: "Would open the perspective builder (demo).",
                })
              }
              className="rounded-full p-1.5 hover:bg-white dark:hover:bg-zinc-700"
              aria-label="Create perspective"
            >
              <Plus className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
            </button>
            <button
              type="button"
              onClick={() =>
                toast.message("Insight history", {
                  description: "Past runs would appear here (demo).",
                })
              }
              className="rounded-full p-1.5 hover:bg-white dark:hover:bg-zinc-700"
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
          <button
            type="button"
            className="rounded-full p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800"
            aria-label="Share"
            onClick={() => {
              if (!selected) return
              const preview =
                selected.sampleBody.length > 200
                  ? selected.sampleBody.slice(0, 200) + "…"
                  : selected.sampleBody
              onShare?.(selected.title, preview)
            }}
          >
            <Share2 className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
          </button>
        )}
      </div>

      {view === "picker" && (
        <div className="min-h-0 flex-1 overflow-y-auto pb-6">
            <div className="px-5 pt-5 pb-3">
              <p className={cn("text-[15px] font-semibold", mx.accentBlue)}>Select a perspective to start</p>
              <p className="mt-1 text-[12px] leading-snug text-zinc-400">
                Insights use your notes and knowledge libraries to reflect what you capture and what you are learning.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-1.5 text-[13px] text-zinc-500">
                <span className="tabular-nums">
                  {noteCount} notes · {libraryItemCount} library items · {tagCount} tags · {dayCount} days
                </span>
                <span className="text-zinc-300">·</span>
                <button
                  type="button"
                  className={cn("font-medium", mx.citationLink)}
                  onClick={() =>
                    toast.message("Filter range", {
                      description:
                        "Filter notes, libraries, tags, and dates for this run (demo).",
                    })
                  }
                >
                  Filter range
                </button>
              </div>
            </div>

            <div className="mx-4 space-y-2">
              {MIND_FEATURED_INSIGHT_PERSPECTIVES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => runPerspective(p)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-stone-200/80 bg-white px-3.5 py-3.5 text-left shadow-sm shadow-stone-900/[0.03] transition-colors hover:border-stone-300/90 hover:bg-white dark:bg-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
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
                    className="relative flex min-h-[168px] flex-col rounded-2xl border border-stone-200/85 bg-white p-3 text-left shadow-sm shadow-stone-900/[0.03] transition-colors hover:border-stone-300 hover:bg-stone-50/60 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
                  >
                    <GalleryAddButton
                      onClick={() =>
                        toast.success("Added to shortcuts", {
                          description: `${p.title} will appear on the main list (demo).`,
                        })
                      }
                    />
                    <p.icon className="h-7 w-7 text-zinc-800 dark:text-zinc-200" strokeWidth={1.5} />
                    <p className="mt-3 text-[14px] font-bold leading-snug text-zinc-900 dark:text-zinc-100">
                      {p.title}
                    </p>
                    <p className="mt-1 line-clamp-3 flex-1 text-[11px] leading-relaxed text-zinc-500">
                      {p.description}
                    </p>
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
              className={cn("font-medium", mx.citationLink)}
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

      {view === "result" && selected && (
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {generating ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-18 border-t-mind" />
              <p className="mt-4 text-sm text-zinc-500">Generating insight…</p>
            </div>
          ) : (
            <>
              <p className="mb-3 border-l-2 border-stone-200 pl-2 text-xs font-medium text-mind/85 dark:text-mind/90">
                AI-generated · <span className={mx.citationMuted}>{selected.title}</span>
              </p>
              <p className="mb-3 text-xs text-zinc-500">
                Range · {selected.rangeLabel} · by {selected.author}
              </p>
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-35 dark:bg-zinc-900">
                <p className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {selected.sampleBody}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

