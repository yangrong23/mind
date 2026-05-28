import type { ActivityTimelineDay } from "@/lib/mock-activity-timeline"
import { groupTimelineByMonth } from "@/lib/mock-activity-timeline"
import type { DailyBriefContent, DailyBriefSourceFile } from "@/lib/daily-brief-content"
import { buildDayTimelineBrief, buildTodayDailyBrief } from "@/lib/daily-brief-content"

export type DiaryPeriod = "day" | "month" | "year"

export function uniqueYearsFromDays(days: ActivityTimelineDay[]): number[] {
  const years = new Set(days.map((d) => new Date(d.isoDate + "T12:00:00").getFullYear()))
  return Array.from(years).sort((a, b) => b - a)
}

export function monthGroupsFromDays(days: ActivityTimelineDay[]) {
  return groupTimelineByMonth(days)
}

export function daysInMonth(days: ActivityTimelineDay[], monthKey: string) {
  return days.filter((d) => d.monthKey === monthKey)
}

export function daysInYear(days: ActivityTimelineDay[], year: number) {
  return days.filter((d) => new Date(d.isoDate + "T12:00:00").getFullYear() === year)
}

export function uploadsToSourceFiles(
  uploads: { id: string; title: string; time?: string; source?: string }[]
): DailyBriefSourceFile[] {
  return uploads.map((u) => ({
    id: u.id,
    title: u.title,
    time: u.time,
    source: u.source,
  }))
}

export function buildMonthPeriodBrief(input: {
  displayName: string
  monthLabel: string
  days: ActivityTimelineDay[]
  sourceFiles: DailyBriefSourceFile[]
}): DailyBriefContent {
  const active = input.days.filter((d) => d.activity > 0)
  const lead =
    active.length === 0
      ? `**${input.monthLabel}** was quiet in your capture log — a good stretch to reset before the next sprint of notes.`
      : `Across **${active.length} active day${active.length === 1 ? "" : "s"}** in ${input.monthLabel}, your captures kept returning to the same product and customer threads.`

  return buildTodayDailyBrief({
    displayName: input.displayName,
    dateLabel: input.monthLabel,
    weekdayLabel: input.monthLabel,
    headline: lead.replace(/\*\*/g, ""),
    body:
      active.length > 0
        ? "Month view rolls up daily narratives without repeating every citation inline — open a specific day on the timeline for the full thread. Files you touched this month are listed at the end."
        : "Try one short capture this week to keep the monthly arc visible.",
    highlights: active.slice(0, 3).map((d) => d.previewLine || d.title),
    sourceFiles: input.sourceFiles,
  })
}

export function buildYearPeriodBrief(input: {
  displayName: string
  year: number
  days: ActivityTimelineDay[]
  sourceFiles: DailyBriefSourceFile[]
}): DailyBriefContent {
  const active = input.days.filter((d) => d.activity > 0)
  const months = new Set(active.map((d) => d.monthKey)).size

  return buildTodayDailyBrief({
    displayName: input.displayName,
    dateLabel: String(input.year),
    weekdayLabel: String(input.year),
    headline: `${input.year} in review`,
    body:
      active.length > 0
        ? `You logged activity on **${active.length}** days across **${months}** month${months === 1 ? "" : "s"} this year. Year view highlights momentum and recurring themes — drill into a month or day for specifics.`
        : `No captures logged for ${input.year} yet.`,
    highlights: [
      `${active.length} active days`,
      `${months} months with captures`,
      "Link recurring themes to libraries so year-end review stays grounded",
    ],
    sourceFiles: input.sourceFiles.slice(0, 12),
  })
}

export function buildDiaryDayBrief(input: {
  displayName: string
  day: ActivityTimelineDay
  uploads: { id: string; title: string; time: string; source: string }[]
}): DailyBriefContent {
  return buildDayTimelineBrief({
    displayName: input.displayName,
    weekdayLabel: input.day.weekdayLabel,
    dateLabel: new Date(input.day.isoDate + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    summary: input.day.summary,
    timeRange: input.day.timeRange,
    location: input.day.location,
    uploads: input.uploads,
  })
}
