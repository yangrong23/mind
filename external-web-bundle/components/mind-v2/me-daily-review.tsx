"use client"

import { useMemo } from "react"
import { ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { MindViralShareCard } from "@/components/mind-v2/mind-viral-share-card"
import { DailyBriefView } from "@/components/mind-v2/daily-brief-view"
import { buildTodayDailyBrief } from "@/lib/daily-brief-content"
import { buildDailyReviewSharePayload } from "@/lib/mind-share-payload"
import type { MindSharePayload } from "@/lib/mind-share-payload"

export const DAILY_REVIEW_HEADLINE = "You captured with intent — close the loop on one decision"

export const DAILY_REVIEW_HIGHLIGHTS = [
  "Product narrative & customer proof dominated captures",
  "Strong context; decisions often implicit at the end",
  "Steady energy — library links would compound summaries",
] as const

export type MeDailyReviewProps = {
  onClose: () => void
  onShare: (payload: MindSharePayload) => void
  /** Open today's activity timeline (heatmap day detail). */
  onOpenTodayActivity?: () => void
  onSuggestedPrompt?: (prompt: string) => void
  displayName?: string
  body?: string
  headline?: string
  highlights?: readonly string[]
  streakDays?: number
  captureCountToday?: number
  uploads?: { id: string; title: string; time?: string; source?: string }[]
}

function formatReviewDate(d = new Date()) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export function MeDailyReview({
  onClose,
  onShare,
  onOpenTodayActivity,
  onSuggestedPrompt,
  displayName = "You",
  body = "Today’s recap is tuned to your recent captures: you spent more time on product narrative and customer proof than last week. One pattern stands out—you often end strong on context but leave the decision implicit. Try appending a single “so we will…” line at the end of the next two recordings. Your energy is consistent; keep linking standout quotes to your library so summaries stay grounded.",
  headline = DAILY_REVIEW_HEADLINE,
  highlights = DAILY_REVIEW_HIGHLIGHTS,
  streakDays = 7,
  captureCountToday = 3,
  uploads,
}: MeDailyReviewProps) {
  const dateLabel = formatReviewDate()
  const weekdayLabel = new Date().toLocaleDateString("en-US", { weekday: "long" })

  const brief = useMemo(
    () =>
      buildTodayDailyBrief({
        displayName,
        dateLabel,
        weekdayLabel,
        headline,
        body,
        highlights,
        uploads,
      }),
    [displayName, dateLabel, weekdayLabel, headline, body, highlights, uploads]
  )

  const sharePayload = buildDailyReviewSharePayload({
    displayName,
    dateLabel,
    headline,
    body,
    highlights,
    streakDays,
    captureCountToday,
  })

  const openShare = () => onShare(sharePayload)

  return (
    <div className="absolute inset-0 z-[65] flex flex-col bg-white animate-in slide-in-from-right duration-200 dark:bg-zinc-950">
      <header className="flex shrink-0 items-center border-b border-stone-100/85 bg-white px-3 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800"
          aria-label="Back"
        >
          <ChevronRight className="h-6 w-6 rotate-180 text-zinc-600 dark:text-zinc-300" />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold text-zinc-900 dark:text-zinc-100">
          Daily brief
        </h1>
        <div className="w-8 shrink-0" aria-hidden />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 pb-8">
        <MindViralShareCard
          card={sharePayload.card}
          displayName={displayName}
          onShare={openShare}
          className="mb-5"
        />

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-mind/10 px-2.5 py-1 text-[11px] font-semibold text-mind">
            <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
            AI-generated
          </span>
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {streakDays}-day streak
          </span>
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {captureCountToday} captures today
          </span>
        </div>

        <DailyBriefView content={brief} onSuggestedPrompt={onSuggestedPrompt} />

        {onOpenTodayActivity ? (
          <button
            type="button"
            onClick={onOpenTodayActivity}
            className={cn(
              "mt-8 flex w-full items-center justify-between rounded-2xl border border-stone-200/90 px-4 py-3.5 text-left transition-colors",
              "hover:bg-stone-50 dark:border-zinc-800 dark:hover:bg-zinc-900/80",
              "focus-visible:ring-2 focus-visible:ring-mind/35 focus-visible:ring-offset-2"
            )}
          >
            <span className="text-[14px] font-medium text-zinc-800 dark:text-zinc-200">View today&apos;s activity</span>
            <ChevronRight className="h-5 w-5 text-zinc-400" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
