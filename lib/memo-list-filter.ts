import type { Note } from "@/lib/note-types"
import { isNoteRecording } from "@/lib/note-status"

export type MemoTimeSpan = "all" | "today" | "week" | "month" | "older"
export type MemoSortMode = "newest" | "oldest" | "az" | "za"

const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
}

/** Best-effort parse for demo date strings on memo rows. */
export function parseMemoDateMs(note: Note, now = new Date()): number {
  const raw = note.date.trim()
  const lower = raw.toLowerCase()
  if (!raw || lower === "just now" || lower === "draft") return now.getTime()
  if (lower.startsWith("today")) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  }
  if (lower.startsWith("yesterday")) {
    const y = new Date(now)
    y.setDate(y.getDate() - 1)
    return new Date(y.getFullYear(), y.getMonth(), y.getDate()).getTime()
  }

  const monthDay = raw.match(/^([A-Za-z]{3,})\s+(\d{1,2})(?:\s*·|\s|$)/i)
  if (monthDay) {
    const month = MONTH_INDEX[monthDay[1].toLowerCase().slice(0, 3)]
    const day = parseInt(monthDay[2], 10)
    if (month != null && !Number.isNaN(day)) {
      return new Date(now.getFullYear(), month, day).getTime()
    }
  }

  const isoInTitle = note.title.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (isoInTitle) {
    return new Date(+isoInTitle[1], +isoInTitle[2] - 1, +isoInTitle[3]).getTime()
  }

  return 0
}

export function memoMatchesTimeSpan(note: Note, span: MemoTimeSpan, now = new Date()): boolean {
  if (span === "all") return true
  const ms = parseMemoDateMs(note, now)
  if (ms <= 0) return false

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const weekAgo = startOfToday - 7 * 86_400_000
  const monthAgo = startOfToday - 30 * 86_400_000

  switch (span) {
    case "today":
      return ms >= startOfToday
    case "week":
      return ms >= weekAgo
    case "month":
      return ms >= monthAgo
    case "older":
      return ms < monthAgo
    default:
      return true
  }
}

export function memoMatchesQuery(note: Note, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (note.title.toLowerCase().includes(q)) return true
  if (note.preview?.toLowerCase().includes(q)) return true
  if (note.source?.toLowerCase().includes(q)) return true
  return false
}

export function sortMemos(notes: Note[], mode: MemoSortMode, now = new Date()): Note[] {
  const active = notes.filter((n) => isNoteRecording(n))
  const rest = notes.filter((n) => !isNoteRecording(n))
  const sorted = [...rest]

  switch (mode) {
    case "newest":
      sorted.sort((a, b) => parseMemoDateMs(b, now) - parseMemoDateMs(a, now))
      break
    case "oldest":
      sorted.sort((a, b) => parseMemoDateMs(a, now) - parseMemoDateMs(b, now))
      break
    case "az":
      sorted.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }))
      break
    case "za":
      sorted.sort((a, b) => b.title.localeCompare(a.title, undefined, { sensitivity: "base" }))
      break
  }

  return [...active, ...sorted]
}

export function memoSearchIsActive(
  query: string,
  timeSpan: MemoTimeSpan,
  sortMode: MemoSortMode
): boolean {
  return query.trim().length > 0 || timeSpan !== "all" || sortMode !== "newest"
}
