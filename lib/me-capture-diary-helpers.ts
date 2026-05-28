import { buildDemoActivityTimeline } from "@/lib/mock-activity-timeline"

export const DEMO_CAPTURE_DIARY = buildDemoActivityTimeline()

function hashDateString(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i)
  return Math.abs(h)
}

export function formatHeatmapDayLabel(isoDate: string) {
  const d = new Date(isoDate + "T12:00:00")
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
}

export function getDayUploads(isoDate: string, activity: number) {
  if (activity <= 0) return []
  const h = hashDateString(isoDate)
  const titles = [
    "Product requirements sync",
    "Quick voice memo — ideas",
    "1:1 with design",
    "Customer call notes",
    "Sprint planning snippet",
  ]
  const times = ["8:02 AM", "10:18 AM", "12:40 PM", "3:05 PM", "6:22 PM"]
  const count = Math.min(activity + 1, 5)
  return Array.from({ length: count }, (_, i) => ({
    id: `${isoDate}-${i}`,
    title: titles[(h + i) % titles.length],
    time: times[(h + i * 2) % times.length],
    source: (h + i) % 2 === 0 ? "Phone" : "Mind Recorder",
  }))
}

export function getDailyReviewForDay(isoDate: string, activity: number) {
  if (activity <= 0) {
    return "A light day in your capture log—no new uploads. Use the space to reflect or queue one small topic for tomorrow's first recording."
  }
  const h = hashDateString(isoDate)
  const flavors = [
    "You leaned into product and customer context—several threads point to the same roadmap bet. Carry one concrete decision into your next session.",
    "Captures skew toward meetings and async notes. The through-line is clarity on next steps; consider tagging follow-ups so they surface in weekly review.",
    "Mix of device and phone recordings. Energy looks steady; try linking one highlight to your knowledge library so it compounds.",
  ]
  return flavors[h % flavors.length]
}

const HEATMAP_VIRAL_SLOGANS_ACTIVE = [
  "Your future self is built\none square at a time.",
  "Ideas decay in memory.\nThey compound on your timeline.",
  "I didn't wait for inspiration—\nI captured it.",
  "Consistency is the quiet flex\nnobody sees until they do.",
  "Every recorded thought is a vote\nfor who you're becoming.",
  "Show up empty, leave with clarity—\nthat's the whole game.",
  "The best thinkers don't have better ideas.\nThey have better logs.",
] as const

const HEATMAP_VIRAL_SLOGANS_QUIET = [
  "Even quiet days count.\nRest is part of the streak.",
  "Blank squares aren't failure—\nthey're space for tomorrow.",
  "Not every day roars.\nSome days whisper—and that's enough.",
] as const

export function getDayViralSlogan(isoDate: string, activity: number) {
  const h = hashDateString(isoDate)
  const pool = activity > 0 ? HEATMAP_VIRAL_SLOGANS_ACTIVE : HEATMAP_VIRAL_SLOGANS_QUIET
  return pool[h % pool.length]
}

export function buildDayShareCardText(
  isoDate: string,
  activity: number,
  displayName: string,
  streakDays: number
) {
  const slogan = getDayViralSlogan(isoDate, activity).replace(/\n/g, " ")
  const label = formatHeatmapDayLabel(isoDate)
  const captures = getDayUploads(isoDate, activity).length
  const activityLine =
    activity > 0
      ? `${captures} capture${captures === 1 ? "" : "s"} · level ${activity}`
      : "A quiet day on my timeline"
  return `${slogan}\n\n${label} · ${activityLine}\n${streakDays}-day streak on Mind · ${displayName}`
}
