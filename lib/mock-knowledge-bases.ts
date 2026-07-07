import type { LibraryCoverVariant } from "@/lib/product-media"
import { libraryCoverVariantForId } from "@/lib/product-media"
import type { PublicKbSettings } from "@/lib/public-kb-settings"

export type KBCategory = "mine" | "team" | "subscribed"

/** Subscribed section — libraries you publish vs libraries you follow */
export type SubscribedKbRole = "published" | "followed"

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
  /** @deprecated Prefer `coverVariant` + LibraryCoverArt in UI */
  coverImage?: string
  /** Branded cover preview (matches web library cards) */
  coverVariant: LibraryCoverVariant
  /** Team libraries only — Library information screen */
  teamSettings?: TeamLibrarySettings
  /** Shared libraries — curator shown in library header */
  ownerName?: string
  /** Your role in a team library — shown in the list */
  teamMembershipRole?: "owner" | "member"
  /** Subscribed libraries — publisher pushed new sources since last visit */
  hasContentUpdate?: boolean
  /** Subscribed libraries — published by you vs followed from plaza */
  subscribedRole?: SubscribedKbRole
  /** Owner published this library to the public plaza (web) */
  isPublicPublished?: boolean
  /** Public plaza agent binding + skills + Studio sharing (web) */
  publicSettings?: PublicKbSettings
}

/** Demo helper when creating a library from the Knowledge tab sheet. */
export function knowledgeBaseFromCreate(
  payload: Pick<KnowledgeBase, "name" | "description" | "color" | "category"> & {
    coverVariant?: LibraryCoverVariant
    teamSettings?: TeamLibrarySettings
  },
  id: number
): KnowledgeBase {
  return {
    id,
    name: payload.name,
    description: payload.description,
    category: payload.category,
    count: 0,
    lastUpdate: "Just now",
    color: payload.color,
    coverVariant: payload.coverVariant ?? libraryCoverVariantForId(id, payload.name),
    ...(payload.category === "team"
      ? {
          ownerName: "You",
          teamMembershipRole: "owner",
          teamSettings: payload.teamSettings ?? { ...DEFAULT_TEAM_LIBRARY_SETTINGS },
        }
      : {}),
  }
}

/** Web create/edit dialog — preserves cover and team settings from the form. */
export function knowledgeBaseFromWebCreate(
  payload: {
    name: string
    description: string
    coverVariant: LibraryCoverVariant
    category: "mine" | "team"
    teamSettings?: TeamLibrarySettings
    publicSettings?: PublicKbSettings
  },
  id: number
): KnowledgeBase {
  const pub = payload.publicSettings
  const isPublicPublished = Boolean(pub?.isPublic)
  return {
    id,
    name: payload.name,
    description: payload.description || (payload.category === "team" ? "Shared library" : "Personal library"),
    category: payload.category,
    count: 0,
    lastUpdate: "Just now",
    color: "from-zinc-500 to-zinc-600",
    coverVariant: payload.coverVariant,
    ...(isPublicPublished
      ? {
          isPublicPublished: true,
          publicSettings: pub,
          subscribers: 0,
          viewCount: 0,
          publicTagline: "Public · Mindar agent",
          publisherName: "You",
        }
      : {}),
    ...(payload.category === "team"
      ? {
          ownerName: "You",
          teamSettings: payload.teamSettings ?? { ...DEFAULT_TEAM_LIBRARY_SETTINGS },
        }
      : {}),
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
    coverVariant: "product",
  },
  {
    id: 2,
    name: "Study notes",
    description: "Personal learning log",
    category: "mine",
    count: 89,
    lastUpdate: "1h ago",
    color: "from-zinc-500 to-zinc-600",
    coverVariant: "study",
  },
  {
    id: 3,
    name: "Reading list",
    description: "Book notes and quotes",
    category: "mine",
    count: 45,
    lastUpdate: "Yesterday",
    color: "from-zinc-500 to-zinc-600",
    coverVariant: "reading",
  },
  {
    id: 4,
    name: "Engineering docs",
    description: "Team playbooks and ADRs",
    category: "team",
    count: 234,
    lastUpdate: "2h ago",
    color: "from-zinc-500 to-zinc-600",
    coverVariant: "engineering",
    ownerName: "熊斌",
    teamMembershipRole: "member",
    teamSettings: {
      ...DEFAULT_TEAM_LIBRARY_SETTINGS,
      recommendedQuestions: [
        "Summarize open ADRs and who owns each decision",
        "Draft an onboarding checklist from our playbooks",
        "Where do runbooks disagree with the API reference?",
      ],
    },
  },
  {
    id: 5,
    name: "Design system",
    description: "UI/UX guidelines",
    category: "team",
    count: 67,
    lastUpdate: "3d ago",
    color: "from-zinc-500 to-zinc-600",
    coverVariant: "design",
    ownerName: "You",
    teamMembershipRole: "owner",
    teamSettings: {
      ...DEFAULT_TEAM_LIBRARY_SETTINGS,
      joinMode: "Admin approval",
      recommendedQuestions: [
        "Audit component rules for inconsistencies",
        "List accessibility fixes per component",
        "Build a color and type token glossary",
      ],
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
    coverVariant: "legal",
    hasContentUpdate: true,
    subscribedRole: "followed",
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
    coverVariant: "work",
    subscribedRole: "followed",
  },
  {
    id: 8,
    name: "Deep reading room",
    description: "Curated long-form essays and book notes published to subscribers.",
    category: "subscribed",
    count: 1280,
    lastUpdate: "2h ago",
    color: "from-zinc-500 to-zinc-600",
    subscribers: 4200,
    viewCount: 18600,
    publicTagline: "Weekly deep reads",
    publisherName: "You",
    coverVariant: "reading",
    subscribedRole: "published",
  },
  {
    id: 9,
    name: "US equities desk",
    description: "Earnings summaries, sector maps, and macro notes for public markets.",
    category: "subscribed",
    count: 2104,
    lastUpdate: "Today",
    color: "from-zinc-500 to-zinc-600",
    subscribers: 6100,
    viewCount: 9400,
    publicTagline: "Markets · weekly brief",
    publisherName: "Medrix markets",
    coverVariant: "finance",
    hasContentUpdate: true,
    subscribedRole: "followed",
  },
]
