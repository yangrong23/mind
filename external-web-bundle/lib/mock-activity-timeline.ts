/** Demo activity timeline entries — Me capture diary */

export type ActivityTimelineDay = {
  id: string
  isoDate: string
  monthKey: string
  monthLabel: string
  dateLabel: string
  homeDateLabel: string
  weekdayLabel: string
  /** ≤10 words — Me home & left rail */
  title: string
  /** One-line for list cards (optional) */
  previewLine: string
  /** Full AI narrative — right panel only */
  summary: string
  photoCount: number
  timeRange: string
  location: string
  activity: number
  heroImage: string
  thumbImages: string[]
}

/** Short headlines (≤10 words) for home + timeline rail */
const NARRATIVE_TITLES = [
  "Light shifted through the day",
  "Calm morning, full evening",
  "Coffee and sharp focus",
  "Rain-night idea fragments",
  "After the meeting recap",
  "Three lines on a walk",
  "Library links connect",
  "Quiet productive afternoon",
  "Ideas into clear structure",
  "Slow weekend captures",
  "Customer call takeaways",
  "Late-night weekly threads",
] as const

const PREVIEW_LINES = [
  "Morning light, work notes, and an evening sync—one thread about what actually moved forward.",
  "Steady product and customer context; the decision landed in an evening memo.",
  "Hardware recording plus two phone memos—keep citations on library items, not in chat.",
  "Light day, but one long recording is worth a second listen.",
  "Photos and voice alternated; the span from early morning to night is easy to reopen.",
] as const

const NARRATIVE_SUMMARIES = [
  "Morning light threaded through your captures—work, coffee, and a short evening sync. The summary stays focused on what advanced, not a minute-by-minute log.",
  "The morning leaned toward product and customer proof; afternoon was quieter, then a short memo nailed the decision you had been circling.",
  "Captures clustered around midday: one hardware take and two phone memos. The through-line is evidence—pin quotes to library entries instead of leaving them in chat.",
  "A lighter day with one long recording worth revisiting. The tone flags hesitation without scolding; tomorrow’s first capture could end with a clear “so we will…”.",
  "Voice and photos paired the same storyline. Timestamps from early morning through night make it easy to reopen the moment instead of only the abstract.",
] as const

function hashDateString(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i)
  return Math.abs(h)
}

function monthLabelFromIso(iso: string) {
  const d = new Date(iso + "T12:00:00")
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function dateLabelFromIso(iso: string) {
  const d = new Date(iso + "T12:00:00")
  const mo = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${mo}/${day}`
}

function homeDateLabelFromIso(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function weekdayFromIso(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", { weekday: "long" })
}

function timeRangeForDay(iso: string, activity: number) {
  const h = hashDateString(iso)
  const startH = 6 + (h % 4)
  const startM = (h % 60).toString().padStart(2, "0")
  const endH = startH + 1 + (activity % 3)
  const endM = ((h >> 3) % 60).toString().padStart(2, "0")
  return `${startH}:${startM} – ${endH}:${endM}`
}

export function buildActivityTimelineDay(
  isoDate: string,
  activity: number
): ActivityTimelineDay {
  const h = hashDateString(isoDate)
  const photoCount = activity <= 0 ? 0 : Math.min(6 + (h % 12), 18)
  const seed = encodeURIComponent(isoDate)
  const idx = h % NARRATIVE_TITLES.length
  return {
    id: isoDate,
    isoDate,
    monthKey: isoDate.slice(0, 7),
    monthLabel: monthLabelFromIso(isoDate),
    dateLabel: dateLabelFromIso(isoDate),
    homeDateLabel: homeDateLabelFromIso(isoDate),
    weekdayLabel: weekdayFromIso(isoDate),
    title: activity > 0 ? NARRATIVE_TITLES[idx] : "A quiet day",
    previewLine:
      activity > 0
        ? PREVIEW_LINES[idx % PREVIEW_LINES.length]
        : "No new captures—room for tomorrow’s first recording.",
    summary:
      activity > 0
        ? NARRATIVE_SUMMARIES[idx % NARRATIVE_SUMMARIES.length]
        : "Nothing new was added to your diary. Empty days still count—you can start fresh with a short voice note tomorrow.",
    photoCount,
    timeRange: activity > 0 ? timeRangeForDay(isoDate, activity) : "—",
    location: h % 3 === 0 ? "Shanghai" : h % 3 === 1 ? "Hangzhou" : "Unknown",
    activity,
    heroImage: "",
    thumbImages: [],
  }
}

export function buildActivityTimelineFromHeatmap(
  heatmap: { date: string; value: number }[]
): ActivityTimelineDay[] {
  return heatmap
    .filter((d) => d.value > 0)
    .map((d) => buildActivityTimelineDay(d.date, d.value))
    .sort((a, b) => b.isoDate.localeCompare(a.isoDate))
}

/** Stable demo diary — deterministic, no heatmap grid */
export function buildDemoActivityTimeline(spanDays = 120): ActivityTimelineDay[] {
  const days: ActivityTimelineDay[] = []
  const today = new Date()
  for (let i = 0; i < spanDays; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const h = hashDateString(iso)
    if (h % 5 >= 2) {
      days.push(buildActivityTimelineDay(iso, (h % 4) + 1))
    }
  }
  return days.sort((a, b) => b.isoDate.localeCompare(a.isoDate))
}

export function getTodayTimelineDay(days: ActivityTimelineDay[]): ActivityTimelineDay {
  const today = new Date().toISOString().slice(0, 10)
  return (
    days.find((d) => d.isoDate === today) ??
    days[0] ??
    buildActivityTimelineDay(today, 2)
  )
}

export function groupTimelineByMonth(days: ActivityTimelineDay[]) {
  const map = new Map<string, { monthLabel: string; days: ActivityTimelineDay[] }>()
  for (const day of days) {
    const existing = map.get(day.monthKey)
    if (existing) {
      existing.days.push(day)
    } else {
      map.set(day.monthKey, { monthLabel: day.monthLabel, days: [day] })
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([monthKey, group]) => ({ monthKey, ...group }))
}
