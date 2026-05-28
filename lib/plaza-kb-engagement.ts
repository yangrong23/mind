/** Per–public-library engagement metrics and demo comment threads. */

export type PublicKbComment = {
  id: string
  user: string
  isAuthor?: boolean
  meta: string
  body: string
}

const COMMENT_SEEDS: Record<number, PublicKbComment[]> = {
  6: [
    {
      id: "pc-6-1",
      user: "Patent desk",
      isAuthor: true,
      meta: "Publisher · Dec 10, 2025",
      body:
        "Step 1: Map claims to the specification so formal objections are easy to preempt.\nStep 2: Build a feature table against the closest prior art before drafting the response.",
    },
    {
      id: "pc-6-2",
      user: "Mia L.",
      meta: "Shanghai · Dec 8, 2025",
      body: "The office-action reply template saved our team a full day on the CN utility model filing.",
    },
    {
      id: "pc-6-3",
      user: "Alex K.",
      meta: "Dec 5, 2025",
      body: "Would love a side-by-side view for divisional vs parent claims—any plans?",
    },
  ],
  7: [
    {
      id: "pc-7-1",
      user: "Product guild",
      isAuthor: true,
      meta: "Publisher · Yesterday",
      body: "New rollout retrospective is live—compare narrative tests from Q4 launches.",
    },
    {
      id: "pc-7-2",
      user: "Jordan",
      meta: "2d ago",
      body: "The discovery cadence checklist is exactly what we needed for stakeholder reviews.",
    },
  ],
  101: [
    {
      id: "pc-101-1",
      user: "HistoryLab",
      isAuthor: true,
      meta: "Publisher · Today",
      body: "Exam week bundle posted—start with the timeline essay template in Content.",
    },
    {
      id: "pc-101-2",
      user: "Student desk",
      meta: "Today",
      body: "The May 4 movement summary helped me structure my oral exam. Thank you!",
    },
    {
      id: "pc-101-3",
      user: "Chen Wei",
      meta: "Yesterday",
      body: "Could you add a compare/contrast prompt for two dynasties?",
    },
    {
      id: "pc-101-4",
      user: "Parent circle",
      meta: "2d ago",
      body: "Subscribed for my kid's history class—clear and exam-focused.",
    },
  ],
  112: [
    {
      id: "pc-112-1",
      user: "GlobalPatents",
      isAuthor: true,
      meta: "Publisher · Today",
      body: "Updated CN office action playbook—see Content tab for the December rule changes.",
    },
    {
      id: "pc-112-2",
      user: "IP associate",
      meta: "Dec 11, 2025",
      body: "Claim chart against prior art is gold. Used it in a response we filed Monday.",
    },
  ],
}

const DEFAULT_THREAD: PublicKbComment[] = [
  {
    id: "pc-default-1",
    user: "Library curator",
    isAuthor: true,
    meta: "Publisher · This week",
    body: "Ask scoped questions in Chat—answers stay grounded on sources in this library.",
  },
  {
    id: "pc-default-2",
    user: "Subscriber",
    meta: "3d ago",
    body: "Great curation. The weekly sync makes it easy to keep up.",
  },
]

export function demoCommentsForKb(kbId: number): PublicKbComment[] {
  const seed = COMMENT_SEEDS[kbId] ?? DEFAULT_THREAD
  return seed.map((c) => ({ ...c }))
}

export function engagementMetricsForKb(
  kbId: number,
  subscriberCount: number,
  overrides?: { likeCount?: number; commentCount?: number }
) {
  const thread = demoCommentsForKb(kbId)
  const commentCount = overrides?.commentCount ?? Math.max(thread.length, 8 + (kbId % 40))
  const likeCount = overrides?.likeCount ?? Math.round(subscriberCount * 0.14 + (kbId % 97) * 11)
  return { likeCount, commentCount, threadLength: thread.length }
}

const LIKED_KEY = "mind-v2-plaza-liked-kbs"

export function readPlazaLikedKbIds(): Set<number> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(LIKED_KEY)
    if (!raw) return new Set()
    const ids = JSON.parse(raw) as number[]
    return new Set(Array.isArray(ids) ? ids : [])
  } catch {
    return new Set()
  }
}

export function writePlazaLikedKbIds(ids: Set<number>) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...ids]))
  } catch {
    /* ignore */
  }
}

export function formatEngagementCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (n >= 10_000) return `${Math.round(n / 1000)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return n.toLocaleString("en-US")
}
