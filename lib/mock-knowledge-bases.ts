export type KBCategory = "mine" | "team" | "subscribed"

export type TeamMemberPermissions = "View & export" | "View only"
export type TeamJoinMode = "Open join" | "Admin approval"

export type TeamLibrarySettings = {
  isPrivate: boolean
  memberPermissions: TeamMemberPermissions
  joinMode: TeamJoinMode
  recommendedQuestions: string[]
}

export const DEFAULT_TEAM_LIBRARY_SETTINGS: TeamLibrarySettings = {
  isPrivate: false,
  memberPermissions: "View & export",
  joinMode: "Open join",
  recommendedQuestions: [],
}

export type KnowledgeBase = {
  id: number
  name: string
  description: string
  category: KBCategory
  count: number
  lastUpdate: string
  icon?: string
  color: string
  subscribers?: number
  /** Browses / Q&A hits for public-style detail */
  viewCount?: number
  /** Subtitle under title on public knowledge detail */
  publicTagline?: string
  /** Curator / publisher line under the title on subscribed detail */
  publisherName?: string
  /** Cover art for list / plaza (photo avatar) */
  coverImage: string
  /** Team libraries only — Library information screen */
  teamSettings?: TeamLibrarySettings
}

/** Demo helper when creating a library from the Knowledge tab sheet. */
export function knowledgeBaseFromCreate(
  payload: Pick<KnowledgeBase, "name" | "description" | "color" | "category">,
  id: number
): KnowledgeBase {
  const seed = encodeURIComponent(`${payload.name}-${id}`)
  return {
    id,
    name: payload.name,
    description: payload.description,
    category: payload.category,
    count: 0,
    lastUpdate: "Just now",
    color: payload.color,
    coverImage: `https://picsum.photos/seed/mindkb-new-${seed}/384/384`,
    ...(payload.category === "team" ? { teamSettings: { ...DEFAULT_TEAM_LIBRARY_SETTINGS } } : {}),
  }
}

export const MOCK_KNOWLEDGE_BASES: KnowledgeBase[] = [
  {
    id: 1,
    name: "Product library",
    description: "Specs and PRDs",
    category: "mine",
    count: 156,
    lastUpdate: "Just now",
    color: "from-zinc-500 to-zinc-600",
    coverImage: "https://picsum.photos/seed/mindkb01/384/384",
  },
  {
    id: 2,
    name: "Study notes",
    description: "Personal learning log",
    category: "mine",
    count: 89,
    lastUpdate: "1h ago",
    color: "from-zinc-500 to-zinc-600",
    coverImage: "https://picsum.photos/seed/mindkb02/384/384",
  },
  {
    id: 3,
    name: "Reading list",
    description: "Book notes and quotes",
    category: "mine",
    count: 45,
    lastUpdate: "Yesterday",
    color: "from-zinc-500 to-zinc-600",
    coverImage: "https://picsum.photos/seed/mindkb03/384/384",
  },
  {
    id: 4,
    name: "Engineering docs",
    description: "Team playbooks and ADRs",
    category: "team",
    count: 234,
    lastUpdate: "2h ago",
    color: "from-zinc-500 to-zinc-600",
    coverImage: "https://picsum.photos/seed/mindkb04/384/384",
    teamSettings: { ...DEFAULT_TEAM_LIBRARY_SETTINGS },
  },
  {
    id: 5,
    name: "Design system",
    description: "UI/UX guidelines",
    category: "team",
    count: 67,
    lastUpdate: "3d ago",
    color: "from-zinc-500 to-zinc-600",
    coverImage: "https://picsum.photos/seed/mindkb05/384/384",
    teamSettings: {
      ...DEFAULT_TEAM_LIBRARY_SETTINGS,
      joinMode: "Admin approval",
    },
  },
  {
    id: 6,
    name: "Patent knowledge base",
    description:
      "Coverage spans invention, utility model, and design patents across major jurisdictions—including CN, US, EP, and JP filings—with weekly refresh of office actions, prosecution tips, and claim-mapping checklists you can reuse in Q&A.",
    category: "subscribed",
    count: 4505,
    lastUpdate: "Today",
    color: "from-zinc-500 to-zinc-600",
    subscribers: 2527,
    viewCount: 8750,
    publicTagline: "Curated · prosecution-ready briefs",
    publisherName: "CN & global patents desk",
    coverImage: "https://picsum.photos/seed/mindkb06/384/384",
  },
  {
    id: 7,
    name: "PM growth",
    description:
      "Product craft, discovery cadences, and case write-ups from teams shipping B2B SaaS. Use it for grounded answers on prioritization, narrative testing, and rollout retros—updated as new notes land.",
    category: "subscribed",
    count: 892,
    lastUpdate: "Yesterday",
    color: "from-zinc-500 to-zinc-600",
    subscribers: 8900,
    viewCount: 5120,
    publicTagline: "Playbooks and annotated wins",
    publisherName: "Product guild",
    coverImage: "https://picsum.photos/seed/mindkb07/384/384",
  },
]
