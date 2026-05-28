"use client"

import { useMemo, useState } from "react"
import { ChevronRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { MindViralShareCard } from "@/components/mind-v2/mind-viral-share-card"
import { DailyBriefView } from "@/components/mind-v2/daily-brief-view"
import {
  MeDiaryDayTimeline,
  MeDiaryMonthTimeline,
  MeDiaryPeriodTabs,
  MeDiaryYearTimeline,
} from "@/components/mind-v2/me-diary-period-nav"
import { buildTodayDailyBrief } from "@/lib/daily-brief-content"
import { buildDailyReviewSharePayload } from "@/lib/mind-share-payload"
import type { MindSharePayload } from "@/lib/mind-share-payload"
import type { ActivityTimelineDay } from "@/lib/mock-activity-timeline"
import { getTodayTimelineDay } from "@/lib/mock-activity-timeline"
import { DEMO_CAPTURE_DIARY, getDayUploads, getDailyReviewForDay } from "@/lib/me-capture-diary-helpers"
import {
  buildDiaryDayBrief,
  buildMonthPeriodBrief,
  buildYearPeriodBrief,
  daysInMonth,
  daysInYear,
  monthGroupsFromDays,
  type DiaryPeriod,
  uniqueYearsFromDays,
  uploadsToSourceFiles,
} from "@/lib/me-diary-period"

export const DAILY_REVIEW_HEADLINE = "You captured with intent — close the loop on one decision"

export const DAILY_REVIEW_HIGHLIGHTS = [
  "Product narrative & customer proof dominated captures",
  "Strong context; decisions often implicit at the end",
  "Steady energy — library links would compound summaries",
] as const

export type MeDailyReviewProps = {
  onClose: () => void
  onShare: (payload: MindSharePayload) => void
  onOpenTodayActivity?: () => void
  onSuggestedPrompt?: (prompt: string) => void
  displayName?: string
  body?: string
  headline?: string
  highlights?: readonly string[]
  streakDays?: number
  captureCountToday?: number
  uploads?: { id: string; title: string; time?: string; source?: string }[]
  days?: ActivityTimelineDay[]
  getUploads?: (isoDate: string, activity: number) => {
    id: string
    title: string
    time: string
    source: string
  }[]
  presentation?: "overlay" | "page"
}

export function MeDailyReview({
  onClose,
  onShare,
  onOpenTodayActivity,
  onSuggestedPrompt,
  displayName = "You",
  body,
  headline = DAILY_REVIEW_HEADLINE,
  highlights = DAILY_REVIEW_HIGHLIGHTS,
  streakDays = 7,
  captureCountToday = 3,
  uploads,
  days = DEMO_CAPTURE_DIARY,
  getUploads = getDayUploads,
  presentation = "overlay",
}: MeDailyReviewProps) {
  const timelineDays = days
  const todayDay = getTodayTimelineDay(timelineDays)
  const monthGroups = useMemo(() => monthGroupsFromDays(timelineDays), [timelineDays])
  const years = useMemo(() => uniqueYearsFromDays(timelineDays), [timelineDays])

  const [period, setPeriod] = useState<DiaryPeriod>("day")
  const [selectedDay, setSelectedDay] = useState<ActivityTimelineDay>(todayDay)
  const [selectedMonthKey, setSelectedMonthKey] = useState(monthGroups[0]?.monthKey ?? todayDay.monthKey)
  const [selectedYear, setSelectedYear] = useState(
    new Date(todayDay.isoDate + "T12:00:00").getFullYear()
  )

  const monthOptions = useMemo(
    () =>
      monthGroups.map((g) => ({
        monthKey: g.monthKey,
        monthLabel: g.monthLabel,
        count: g.days.length,
      })),
    [monthGroups]
  )

  const brief = useMemo(() => {
    if (period === "day") {
      const dayUploads = getUploads(selectedDay.isoDate, selectedDay.activity)
      if (selectedDay.isoDate === todayDay.isoDate && !body) {
        return buildTodayDailyBrief({
          displayName,
          dateLabel: new Date(selectedDay.isoDate + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          }),
          weekdayLabel: selectedDay.weekdayLabel,
          headline,
          body:
            body ??
            getDailyReviewForDay(selectedDay.isoDate, selectedDay.activity),
          highlights,
          uploads: uploads ?? dayUploads,
          sourceFiles: uploadsToSourceFiles(uploads ?? dayUploads),
        })
      }
      return buildDiaryDayBrief({
        displayName,
        day: selectedDay,
        uploads: dayUploads,
      })
    }

    if (period === "month") {
      const monthDays = daysInMonth(timelineDays, selectedMonthKey)
      const label = monthGroups.find((g) => g.monthKey === selectedMonthKey)?.monthLabel ?? selectedMonthKey
      const files = monthDays.flatMap((d) => getUploads(d.isoDate, d.activity))
      return buildMonthPeriodBrief({
        displayName,
        monthLabel: label,
        days: monthDays,
        sourceFiles: uploadsToSourceFiles(files),
      })
    }

    const yearDays = daysInYear(timelineDays, selectedYear)
    const files = yearDays.flatMap((d) => getUploads(d.isoDate, d.activity))
    return buildYearPeriodBrief({
      displayName,
      year: selectedYear,
      days: yearDays,
      sourceFiles: uploadsToSourceFiles(files),
    })
  }, [
    period,
    selectedDay,
    selectedMonthKey,
    selectedYear,
    displayName,
    headline,
    body,
    highlights,
    uploads,
    getUploads,
    timelineDays,
    monthGroups,
    todayDay.isoDate,
  ])

  const sharePayload = buildDailyReviewSharePayload({
    displayName,
    dateLabel: brief.subline ?? formatReviewDate(),
    headline,
    body: body ?? getDailyReviewForDay(selectedDay.isoDate, selectedDay.activity),
    highlights,
    streakDays,
    captureCountToday,
  })

  const shellClass =
    presentation === "page"
      ? cn("relative flex h-full min-h-0 flex-col", web.canvas)
      : "absolute inset-0 z-[65] flex flex-col bg-white animate-in slide-in-from-right duration-200 dark:bg-zinc-950"

  return (
    <div className={shellClass}>
      <header
        className={cn(
          "flex shrink-0 items-center gap-2 border-b border-stone-100/85 px-3 py-3 dark:border-zinc-800",
          presentation === "page" ? "bg-transparent" : "bg-white dark:bg-zinc-900"
        )}
      >
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
        <div className="w-8 shrink-0" aria-hidden />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 pb-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <MeDiaryPeriodTabs period={period} onChange={setPeriod} />
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-mind/10 px-2.5 py-1 text-[11px] font-semibold text-mind">
              <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
              AI-generated
            </span>
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {streakDays}-day streak
            </span>
          </div>
        </div>

        <div className="mb-6">
          {period === "day" ? (
            <MeDiaryDayTimeline
              days={timelineDays.slice(0, 21)}
              selectedIso={selectedDay.isoDate}
              onSelect={setSelectedDay}
            />
          ) : period === "month" ? (
            <MeDiaryMonthTimeline
              months={monthOptions}
              selectedMonthKey={selectedMonthKey}
              onSelect={setSelectedMonthKey}
            />
          ) : (
            <MeDiaryYearTimeline years={years} selectedYear={selectedYear} onSelect={setSelectedYear} />
          )}
        </div>

        <MindViralShareCard
          card={sharePayload.card}
          displayName={displayName}
          onShare={() => onShare(sharePayload)}
          className="mb-5"
        />

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
            <span className="text-[14px] font-medium text-zinc-800 dark:text-zinc-200">
              Open full activity log
            </span>
            <ChevronRight className="h-5 w-5 text-zinc-400" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

function formatReviewDate(d = new Date()) {
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}
