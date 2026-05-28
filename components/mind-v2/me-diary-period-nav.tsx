"use client"

import { cn } from "@/lib/utils"
import type { ActivityTimelineDay } from "@/lib/mock-activity-timeline"
import { activityTimelineDotClass } from "@/lib/activity-heatmap-classes"
import type { DiaryPeriod } from "@/lib/me-diary-period"

const PERIOD_TABS: { id: DiaryPeriod; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
]

export function MeDiaryPeriodTabs({
  period,
  onChange,
  className,
}: {
  period: DiaryPeriod
  onChange: (period: DiaryPeriod) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl bg-stone-100/90 p-1 ring-1 ring-black/[0.04] dark:bg-zinc-900 dark:ring-white/10",
        className
      )}
      role="tablist"
      aria-label="Diary period"
    >
      {PERIOD_TABS.map((tab) => {
        const selected = period === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-[13px] font-semibold transition-colors",
              selected
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            )}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export function MeDiaryDayTimeline({
  days,
  selectedIso,
  onSelect,
  className,
}: {
  days: ActivityTimelineDay[]
  selectedIso: string
  onSelect: (day: ActivityTimelineDay) => void
  className?: string
}) {
  return (
    <div
      className={cn("scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1", className)}
      role="tablist"
      aria-label="Days"
    >
      {days.map((day) => {
        const selected = day.isoDate === selectedIso
        return (
          <button
            key={day.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(day)}
            className={cn(
              "flex shrink-0 flex-col items-center gap-1 rounded-xl border px-3 py-2 transition-colors",
              selected
                ? "border-mind/30 bg-mind/[0.06] text-zinc-900 dark:text-zinc-50"
                : "border-transparent bg-stone-50/80 text-zinc-600 hover:bg-stone-100 dark:bg-zinc-900/50 dark:text-zinc-300"
            )}
          >
            <span
              className={cn("h-2 w-2 rounded-full", activityTimelineDotClass(day.activity))}
              aria-hidden
            />
            <span className="text-[11px] font-semibold tabular-nums">{day.homeDateLabel}</span>
            <span className="max-w-[72px] truncate text-[10px] text-zinc-500">{day.weekdayLabel.slice(0, 3)}</span>
          </button>
        )
      })}
    </div>
  )
}

export function MeDiaryMonthTimeline({
  months,
  selectedMonthKey,
  onSelect,
  className,
}: {
  months: { monthKey: string; monthLabel: string; count: number }[]
  selectedMonthKey: string
  onSelect: (monthKey: string) => void
  className?: string
}) {
  return (
    <div
      className={cn("scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1 pb-1", className)}
      role="tablist"
      aria-label="Months"
    >
      {months.map((m) => {
        const selected = m.monthKey === selectedMonthKey
        return (
          <button
            key={m.monthKey}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(m.monthKey)}
            className={cn(
              "shrink-0 rounded-xl border px-3.5 py-2 text-left transition-colors",
              selected
                ? "border-mind/30 bg-mind/[0.06]"
                : "border-transparent bg-stone-50/80 hover:bg-stone-100 dark:bg-zinc-900/50"
            )}
          >
            <span className="block text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">
              {m.monthLabel}
            </span>
            <span className="mt-0.5 text-[11px] text-zinc-500">{m.count} days</span>
          </button>
        )
      })}
    </div>
  )
}

export function MeDiaryYearTimeline({
  years,
  selectedYear,
  onSelect,
  className,
}: {
  years: number[]
  selectedYear: number
  onSelect: (year: number) => void
  className?: string
}) {
  return (
    <div
      className={cn("flex flex-wrap gap-2", className)}
      role="tablist"
      aria-label="Years"
    >
      {years.map((year) => {
        const selected = year === selectedYear
        return (
          <button
            key={year}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(year)}
            className={cn(
              "rounded-xl border px-4 py-2 text-[15px] font-semibold tabular-nums transition-colors",
              selected
                ? "border-mind/30 bg-mind/[0.06] text-zinc-900"
                : "border-stone-200/80 bg-stone-50/80 text-zinc-600 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-900/50"
            )}
          >
            {year}
          </button>
        )
      })}
    </div>
  )
}
