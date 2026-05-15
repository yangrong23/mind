export type KBCategory = "mine" | "team" | "subscribed"

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
}

export const MOCK_KNOWLEDGE_BASES: KnowledgeBase[] = [
  {
    id: 1,
    name: "Product library",
    description: "Specs and PRDs",
    category: "mine",
    count: 156,
    lastUpdate: "Just now",
    color: "from-sky-400/90 to-teal-500/85",
    coverImage: "https://picsum.photos/seed/mindkb01/384/384",
  },
  {
    id: 2,
    name: "Study notes",
    description: "Personal learning log",
    category: "mine",
    count: 89,
    lastUpdate: "1h ago",
    color: "from-teal-400/90 to-cyan-600/80",
    coverImage: "https://picsum.photos/seed/mindkb02/384/384",
  },
  {
    id: 3,
    name: "Reading list",
    description: "Book notes and quotes",
    category: "mine",
    count: 45,
    lastUpdate: "Yesterday",
    color: "from-emerald-400/85 to-teal-600/80",
    coverImage: "https://picsum.photos/seed/mindkb03/384/384",
  },
  {
    id: 4,
    name: "Engineering docs",
    description: "Team playbooks and ADRs",
    category: "team",
    count: 234,
    lastUpdate: "2h ago",
    color: "from-sky-500/85 to-indigo-500/80",
    coverImage: "https://picsum.photos/seed/mindkb04/384/384",
  },
  {
    id: 5,
    name: "Design system",
    description: "UI/UX guidelines",
    category: "team",
    count: 67,
    lastUpdate: "3d ago",
    color: "from-violet-400/80 to-indigo-500/85",
    coverImage: "https://picsum.photos/seed/mindkb05/384/384",
  },
  {
    id: 6,
    name: "Patent knowledge base",
    description:
      "Coverage spans invention, utility model, and design patents across major jurisdictions—including CN, US, EP, and JP filings—with weekly refresh of office actions, prosecution tips, and claim-mapping checklists you can reuse in Q&A.",
    category: "subscribed",
    count: 4505,
    lastUpdate: "Today",
    color: "from-cyan-500/80 to-blue-600/80",
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
    color: "from-sky-500/80 to-violet-500/75",
    subscribers: 8900,
    viewCount: 5120,
    publicTagline: "Playbooks and annotated wins",
    publisherName: "Product guild",
    coverImage: "https://picsum.photos/seed/mindkb07/384/384",
  },
]
