export type MeLeaderboardMetricId = "memos" | "streak" | "days"

export type MeLeaderboardPeriod = "week" | "all"

export type MeUserStatsSnapshot = {
  memos: number
  streak: number
  usedDays: number
}

export type MeLeaderboardRow = {
  rank: number
  displayName: string
  initials: string
  memos: number
  streak: number
  usedDays: number
  isYou?: boolean
}

export type MeLeaderboardSnapshot = {
  period: MeLeaderboardPeriod
  periodLabel: string
  participantCount: number
  yourRanks: Record<MeLeaderboardMetricId, number>
  yourPercentiles: Record<MeLeaderboardMetricId, number>
  rows: MeLeaderboardRow[]
}

const MOCK_POOL: Omit<MeLeaderboardRow, "rank" | "isYou">[] = [
  { displayName: "Lin · Research", initials: "LR", memos: 412, streak: 28, usedDays: 86 },
  { displayName: "Maya K.", initials: "MK", memos: 388, streak: 21, usedDays: 72 },
  { displayName: "Product Guild", initials: "PG", memos: 356, streak: 19, usedDays: 68 },
  { displayName: "Chen Wei", initials: "CW", memos: 298, streak: 14, usedDays: 54 },
  { displayName: "Study Circle", initials: "SC", memos: 276, streak: 12, usedDays: 49 },
  { displayName: "Alex R.", initials: "AR", memos: 241, streak: 11, usedDays: 41 },
  { displayName: "Doc Team", initials: "DT", memos: 219, streak: 9, usedDays: 38 },
  { displayName: "Sam P.", initials: "SP", memos: 198, streak: 8, usedDays: 34 },
  { displayName: "Nova", initials: "NV", memos: 172, streak: 6, usedDays: 29 },
  { displayName: "Jules", initials: "JL", memos: 164, streak: 5, usedDays: 26 },
]

function sortRows(
  rows: MeLeaderboardRow[],
  metric: MeLeaderboardMetricId
): MeLeaderboardRow[] {
  const key = metric === "days" ? "usedDays" : metric === "memos" ? "memos" : "streak"
  return [...rows].sort((a, b) => (b[key] as number) - (a[key] as number)).map((r, i) => ({ ...r, rank: i + 1 }))
}

function estimateRank(value: number, sortedDesc: number[]): number {
  const above = sortedDesc.filter((v) => v > value).length
  return above + 1
}

function percentile(rank: number, total: number): number {
  if (total <= 1) return 99
  return Math.min(99, Math.max(1, Math.round(((total - rank) / (total - 1)) * 100)))
}

export function buildMeLeaderboardSnapshot(
  you: MeUserStatsSnapshot,
  yourName: string,
  period: MeLeaderboardPeriod = "week"
): MeLeaderboardSnapshot {
  const youRow: MeLeaderboardRow = {
    rank: 0,
    displayName: yourName,
    initials: yourName.slice(0, 2).toUpperCase() || "ME",
    memos: you.memos,
    streak: you.streak,
    usedDays: you.usedDays,
    isYou: true,
  }

  const pool = period === "week" ? MOCK_POOL.map((r) => ({
    ...r,
    memos: Math.round(r.memos * 0.22),
    streak: Math.min(r.streak, 14),
    usedDays: Math.max(1, Math.round(r.usedDays * 0.18)),
  })) : MOCK_POOL

  const allRows = [...pool.map((r) => ({ ...r, rank: 0 })), youRow]
  const participantCount = 2_400 + (period === "week" ? 180 : 0)

  const memosSorted = sortRows(allRows, "memos")
  const streakSorted = sortRows(allRows, "streak")
  const daysSorted = sortRows(allRows, "days")

  const yourRanks: Record<MeLeaderboardMetricId, number> = {
    memos: memosSorted.find((r) => r.isYou)?.rank ?? estimateRank(you.memos, memosSorted.map((r) => r.memos)),
    streak: streakSorted.find((r) => r.isYou)?.rank ?? estimateRank(you.streak, streakSorted.map((r) => r.streak)),
    days:
      daysSorted.find((r) => r.isYou)?.rank ??
      estimateRank(you.usedDays, daysSorted.map((r) => r.usedDays)),
  }

  return {
    period,
    periodLabel: period === "week" ? "This week" : "All time",
    participantCount,
    yourRanks,
    yourPercentiles: {
      memos: percentile(yourRanks.memos, memosSorted.length),
      streak: percentile(yourRanks.streak, streakSorted.length),
      days: percentile(yourRanks.days, daysSorted.length),
    },
    rows: memosSorted,
  }
}

export const LEADERBOARD_METRIC_LABELS: Record<
  MeLeaderboardMetricId,
  { label: string; unit: string; format: (v: number) => string }
> = {
  memos: { label: "Memos", unit: "notes", format: (v) => String(v) },
  streak: { label: "Streak", unit: "days", format: (v) => `${v}d` },
  days: { label: "Days", unit: "days", format: (v) => `${v}d` },
}
