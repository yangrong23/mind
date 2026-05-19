"use client"

import { ChevronRight, Share2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"

const HIGHLIGHTS = [
  "Product narrative & customer proof dominated captures",
  "Strong context; decisions often implicit at the end",
  "Steady energy — library links would compound summaries",
] as const

const REFLECTION_PROMPTS = [
  "What is the one decision you deferred today?",
  "Which quote deserves a permanent home in your library?",
  "What will you capture first tomorrow morning?",
] as const

export type MeDailyReviewProps = {
  onClose: () => void
  onShare: () => void
  /** Open today's activity timeline (heatmap day detail). */
  onOpenTodayActivity?: () => void
  body?: string
  streakDays?: number
  captureCountToday?: number
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
  body = "Today’s recap is tuned to your recent captures: you spent more time on product narrative and customer proof than last week. One pattern stands out—you often end strong on context but leave the decision implicit. Try appending a single “so we will…” line at the end of the next two recordings. Your energy is consistent; keep linking standout quotes to your library so summaries stay grounded.",
  streakDays = 7,
  captureCountToday = 3,
}: MeDailyReviewProps) {
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
          Daily review
        </h1>
        <button
          type="button"
          onClick={onShare}
          className="rounded-full p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800"
          aria-label="Share"
        >
          <Share2 className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 pb-8">
        <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-zinc-400">
          {formatReviewDate()}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
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

        <h2 className="mt-5 text-[20px] font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
          You captured with intent — close the loop on one decision
        </h2>

        <div
          className={cn(
            "mt-4 rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm",
            "dark:border-zinc-800 dark:bg-zinc-900"
          )}
        >
          <p className="text-[15px] leading-[1.72] text-zinc-700 dark:text-zinc-300">{body}</p>
        </div>

        <section className="mt-6">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Highlights</h3>
          <ul className="mt-2 space-y-2">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item}
                className="flex gap-2 rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-2.5 text-[13px] leading-snug text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mind" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.1em] text-zinc-500">Reflect</h3>
          <ul className="mt-2 space-y-2">
            {REFLECTION_PROMPTS.map((q, i) => (
              <li
                key={q}
                className="rounded-xl border border-stone-200/80 bg-white px-3 py-3 text-[14px] text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
              >
                <span className="mr-1.5 text-[11px] font-semibold tabular-nums text-zinc-400">{i + 1}.</span>
                {q}
              </li>
            ))}
          </ul>
        </section>

        {onOpenTodayActivity ? (
          <button
            type="button"
            onClick={onOpenTodayActivity}
            className={cn(
              "mt-6 flex w-full items-center justify-between rounded-2xl border border-stone-200/90 px-4 py-3.5 text-left transition-colors",
              "hover:bg-stone-50 dark:border-zinc-800 dark:hover:bg-zinc-900/80",
              mx.brandFocusRing
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
