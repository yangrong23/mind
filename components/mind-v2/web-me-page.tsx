"use client"

import { useState } from "react"
import { toast } from "sonner"
import { ChevronRight, Sparkles } from "lucide-react"
import { MeTimelineLinearDayList } from "@/components/mind-v2/me-activity-timeline"
import { DEMO_CAPTURE_DIARY } from "@/lib/me-capture-diary-helpers"
import { getMindAccount, type MindAccountId } from "@/lib/mind-accounts"
import { WebPageCanvas } from "@/components/mind-v2/web-app-chrome"
import { MeDailyReview, DAILY_REVIEW_HEADLINE } from "@/components/mind-v2/me-daily-review"

const lifetimeStats = [
  { label: "Notes created", value: "1,284" },
  { label: "Libraries", value: "23" },
  { label: "AI sessions", value: "326" },
  { label: "Studio outputs", value: "89" },
]

export function WebMePage({
  activeAccountId,
}: {
  activeAccountId: MindAccountId
}) {
  const account = getMindAccount(activeAccountId)
  const [showDaily, setShowDaily] = useState(false)

  return (
    <WebPageCanvas>
      <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-teal-500 p-6 text-white shadow-xl shadow-sky-500/25 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur-sm ring-2 ring-white/30">
                {account.initial}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[24px] font-semibold">{account.displayName}</h1>
                  <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                    Pro Plan
                  </span>
                </div>
                <p className="mt-1 text-[14px] text-white/85">{account.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {lifetimeStats.map((s) => (
                <div key={s.label} className="text-center sm:text-right">
                  <p className="text-[20px] font-semibold tabular-nums">{s.value}</p>
                  <p className="text-[11px] text-white/75">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <section className="flex min-h-[min(720px,calc(100vh-220px))] flex-col rounded-2xl border border-white/90 bg-white p-5 shadow-sm">
            <div className="flex shrink-0 items-center justify-between">
              <h2 className="text-[15px] font-semibold text-zinc-700">Daily diary</h2>
              <button
                type="button"
                onClick={() => toast.message("Timeline", { description: "Open full diary (demo)." })}
                className="text-[12px] font-semibold text-mind hover:text-mind/90"
              >
                See all
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowDaily(true)}
              className="mt-4 flex w-full shrink-0 items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/80 p-4 text-left hover:bg-stone-100"
            >
              <Sparkles className="h-5 w-5 text-teal-600" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-zinc-700">Daily review</p>
                <p className="mt-0.5 line-clamp-2 text-[12px] text-zinc-500">{DAILY_REVIEW_HEADLINE}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-400" />
            </button>
            <div className="scrollbar-hide mt-4 min-h-0 flex-1 overflow-y-auto">
              <MeTimelineLinearDayList days={DEMO_CAPTURE_DIARY} />
            </div>
          </section>

          <section className="rounded-2xl border border-white/90 bg-white p-4 shadow-sm">
            <h2 className="text-[14px] font-semibold text-zinc-700">Connected apps</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Google", "Slack", "Notion", "Drive"].map((name) => (
                <span
                  key={name}
                  className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-[13px] font-medium text-zinc-600"
                >
                  {name}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

      {showDaily ? <MeDailyReview onClose={() => setShowDaily(false)} onShare={() => {}} /> : null}
    </WebPageCanvas>
  )
}
