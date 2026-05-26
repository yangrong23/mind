"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { activityHeatmapCellClass } from "@/lib/activity-heatmap-classes"
import { getMindAccount, type MindAccountId } from "@/lib/mind-accounts"
import { WebPageCanvas } from "@/components/mind-v2/web-app-chrome"
import { MeAiInsights } from "@/components/mind-v2/me-ai-insights"
import { MeDailyReview, DAILY_REVIEW_HEADLINE } from "@/components/mind-v2/me-daily-review"
import { Bell, ChevronRight, Globe, Shield, Sparkles, User } from "lucide-react"

function generateHeatmapData() {
  const data: { date: string; value: number }[] = []
  const today = new Date()
  for (let i = 90; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().slice(0, 10),
      value: Math.floor(Math.random() * 5),
    })
  }
  return data
}

const heatmapData = generateHeatmapData()

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
  const theme = useTheme()
  const [showDaily, setShowDaily] = useState(false)
  const [showInsights, setShowInsights] = useState(false)
  const [notifOn, setNotifOn] = useState(true)

  const appearance =
    theme.resolvedTheme === "dark" ? "Dark" : theme.resolvedTheme === "light" ? "Light" : "System"

  return (
    <WebPageCanvas>
      <div className="mx-auto max-w-[1200px] p-6 lg:p-8">
        {/* Profile banner — Figure 1 screen 6 */}
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
            <section className="rounded-2xl border border-white/90 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-zinc-700">Activity overview</h2>
                <span className="text-[12px] text-zinc-500">Last 13 weeks</span>
              </div>
              <div className="mt-4 grid grid-cols-13 gap-1">
                {heatmapData.slice(-91).map((day, i) => (
                  <div key={`${day.date}-${i}`} className={activityHeatmapCellClass(day.value)} title={day.date} />
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setShowDaily(true)}
                  className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/80 p-4 text-left hover:bg-stone-100"
                >
                  <Sparkles className="h-5 w-5 text-teal-600" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-zinc-700">Daily review</p>
                    <p className="mt-0.5 line-clamp-2 text-[12px] text-zinc-500">{DAILY_REVIEW_HEADLINE}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowInsights(true)}
                  className="flex items-center gap-3 rounded-xl border border-stone-100 bg-stone-50/80 p-4 text-left hover:bg-stone-100"
                >
                  <Sparkles className="h-5 w-5 text-mind" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-zinc-700">AI insights</p>
                    <p className="mt-0.5 text-[12px] text-zinc-500">Patterns across notes & libraries</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-white/90 bg-white shadow-sm">
              <h2 className="border-b border-stone-100 px-4 py-3 text-[14px] font-semibold text-zinc-700">
                Settings
              </h2>
              <ul className="divide-y divide-stone-50">
                {[
                  { label: "Profile information", icon: User, action: () => toast.message("Profile") },
                  { label: "Account settings", icon: User, action: () => toast.message("Account") },
                  {
                    label: "Notifications",
                    icon: Bell,
                    toggle: true,
                  },
                  { label: "Appearance", icon: Globe, value: appearance, action: () => theme.setTheme(theme.resolvedTheme === "dark" ? "light" : "dark") },
                  { label: "Privacy & data", icon: Shield, action: () => toast.message("Privacy") },
                ].map((row) => (
                  <li key={row.label}>
                    {row.toggle ? (
                      <div className="flex items-center justify-between px-4 py-3.5">
                        <span className="flex items-center gap-2 text-[14px] font-medium text-zinc-600">
                          <row.icon className="h-4 w-4 text-zinc-400" />
                          {row.label}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={notifOn}
                          onClick={() => setNotifOn((v) => !v)}
                          className={cn(
                            "relative h-7 w-12 rounded-full transition-colors",
                            notifOn ? "bg-teal-500" : "bg-stone-200"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                              notifOn && "translate-x-5"
                            )}
                          />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={row.action}
                        className="flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-stone-50"
                      >
                        <span className="flex items-center gap-2 text-[14px] font-medium text-zinc-600">
                          <row.icon className="h-4 w-4 text-zinc-400" />
                          {row.label}
                        </span>
                        <span className="flex items-center gap-1 text-[13px] text-zinc-500">
                          {"value" in row ? row.value : null}
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
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
      {showInsights ? <MeAiInsights onClose={() => setShowInsights(false)} /> : null}
    </WebPageCanvas>
  )
}
