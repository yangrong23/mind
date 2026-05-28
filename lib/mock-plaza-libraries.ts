import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import type { LibraryCoverVariant } from "@/lib/product-media"
import { publicSettingsForPlazaRow } from "@/lib/plaza-agent-profiles"
import {
  formatPlazaFreshness,
  plazaCapabilitySummary,
  publicAgentDisplayName,
} from "@/lib/public-kb-settings"
import { engagementMetricsForKb, formatEngagementCount } from "@/lib/plaza-kb-engagement"

function plazaCoverVariant(categories: PlazaCategoryId[]): LibraryCoverVariant {
  if (categories.includes("education")) return "education"
  if (categories.includes("health")) return "health"
  if (categories.includes("tech")) return "tech"
  if (categories.includes("workplace")) return "work"
  if (categories.includes("finance")) return "finance"
  if (categories.includes("law")) return "legal"
  if (categories.includes("humanities")) return "humanities"
  if (categories.includes("life")) return "lifestyle"
  if (categories.includes("industry")) return "research"
  return "default"
}

/** Plaza “Discover” category ids */
export type PlazaCategoryId =
  | "recommended"
  | "tech"
  | "education"
  | "workplace"
  | "finance"
  | "industry"
  | "health"
  | "law"
  | "humanities"
  | "life"

export const PLAZA_CATEGORY_TABS: { id: PlazaCategoryId; label: string }[] = [
  { id: "recommended", label: "For you" },
  { id: "tech", label: "Tech" },
  { id: "education", label: "Education" },
  { id: "workplace", label: "Work" },
  { id: "finance", label: "Finance" },
  { id: "industry", label: "Industry" },
  { id: "health", label: "Health" },
  { id: "law", label: "Law" },
  { id: "humanities", label: "Arts" },
  { id: "life", label: "Life" },
]

export type PlazaLibraryRow = {
  kbId: number
  title: string
  description: string
  coverVariant: LibraryCoverVariant
  subscriberCount: number
  contentCount: number
  authorHandle: string
  verified?: boolean
  verifyTone?: "blue" | "gold"
  plazaCategories: PlazaCategoryId[]
  featured?: boolean
  lastUpdate?: string
  color: string
  viewCount?: number
  likeCount?: number
  commentCount?: number
  publicTagline?: string
  /** Capability tags for plaza card one-liner */
  assistantCapabilities?: string[]
  freshnessLabel?: string
}

export const MOCK_PLAZA_LIBRARIES: PlazaLibraryRow[] = [
  {
    kbId: 101,
    title: "Middle school history · Essentials",
    description: "Timelines, essay templates, and common mistakes for exam prep and review.",
    coverVariant: plazaCoverVariant(["recommended", "education"]),
    subscriberCount: 23950,
    contentCount: 450,
    authorHandle: "@HistoryLab",
    verified: true,
    verifyTone: "blue",
    plazaCategories: ["recommended", "education"],
    featured: true,
    lastUpdate: "Today",
    color: "from-mind/12 to-mind/10",
    viewCount: 12000,
    publicTagline: "Curricula & key points",
  },
  {
    kbId: 102,
    title: "High school math · Quick reference",
    description: "Useful conclusions and proofs for functions, calculus, and geometry—with drills.",
    coverVariant: plazaCoverVariant(["education"]),
    subscriberCount: 18640,
    contentCount: 186,
    authorHandle: "@LiuqingAI",
    verified: true,
    verifyTone: "gold",
    plazaCategories: ["education"],
    lastUpdate: "Yesterday",
    color: "from-mind/12 to-mind/10",
    viewCount: 9800,
    publicTagline: "Mind maps & conclusions",
  },
  {
    kbId: 103,
    title: "Elementary resource pack",
    description: "Language, math, and English unit sheets, character lists, and mental math cards—print-ready.",
    coverVariant: plazaCoverVariant(["recommended", "education", "life"]),
    subscriberCount: 5280,
    contentCount: 320,
    authorHandle: "@MsSnail",
    verified: false,
    plazaCategories: ["recommended", "education", "life"],
    featured: true,
    lastUpdate: "3 days ago",
    color: "from-mind/12 to-mind/10",
    viewCount: 4100,
  },
  {
    kbId: 104,
    title: "Cardiology study notes",
    description: "Guideline summaries, meds, and case discussions—for learning only, not medical advice.",
    coverVariant: plazaCoverVariant(["health"]),
    subscriberCount: 33780,
    contentCount: 1063,
    authorHandle: "@SnailMD",
    verified: true,
    verifyTone: "gold",
    plazaCategories: ["recommended", "health"],
    featured: true,
    lastUpdate: "Today",
    color: "from-mind/12 to-mind/10",
    viewCount: 22100,
    publicTagline: "Cardiology · guides & cases",
  },
  {
    kbId: 105,
    title: "LLM apps in production",
    description: "Engineering notes on RAG, evals, and cost control—practical, not buzzword-heavy.",
    coverVariant: plazaCoverVariant(["tech"]),
    subscriberCount: 18200,
    contentCount: 210,
    authorHandle: "@ArchWeekly",
    verified: true,
    verifyTone: "blue",
    plazaCategories: ["recommended", "tech", "workplace"],
    featured: true,
    lastUpdate: "1h ago",
    color: "from-mind/12 to-mind/10",
    viewCount: 15600,
  },
  {
    kbId: 106,
    title: "Product manager case book",
    description: "Real retrospectives on PRDs, growth experiments, and dashboards—with templates.",
    coverVariant: plazaCoverVariant(["workplace"]),
    subscriberCount: 8900,
    contentCount: 892,
    authorHandle: "@PMWeekly",
    verified: false,
    plazaCategories: ["workplace", "finance"],
    lastUpdate: "Yesterday",
    color: "from-mind/12 to-mind/10",
    viewCount: 5120,
    publicTagline: "PM craft & cases",
  },
  {
    kbId: 107,
    title: "Reading A-share financials",
    description: "Quick checks for the three statements, cash flow quality, and common red flags.",
    coverVariant: plazaCoverVariant(["finance"]),
    subscriberCount: 12400,
    contentCount: 156,
    authorHandle: "@FinanceStudy",
    verified: true,
    verifyTone: "blue",
    plazaCategories: ["finance", "law"],
    lastUpdate: "This week",
    color: "from-mind/12 to-mind/10",
    viewCount: 7800,
  },
  {
    kbId: 108,
    title: "EV supply chain map",
    description: "Key companies from materials to retail, plus policy milestones on a timeline.",
    coverVariant: plazaCoverVariant(["industry"]),
    subscriberCount: 9600,
    contentCount: 88,
    authorHandle: "@IndustryWatch",
    verified: false,
    plazaCategories: ["industry", "finance"],
    lastUpdate: "5 days ago",
    color: "from-mind/12 to-mind/10",
    viewCount: 4300,
  },
  {
    kbId: 109,
    title: "Civil code Q&A (practice)",
    description: "High-frequency questions on contracts, property, and tort—with case-law pointers.",
    coverVariant: plazaCoverVariant(["law"]),
    subscriberCount: 15100,
    contentCount: 420,
    authorHandle: "@LegalNotebook",
    verified: true,
    verifyTone: "gold",
    plazaCategories: ["law", "workplace"],
    lastUpdate: "Today",
    color: "from-mind/12 to-mind/10",
    viewCount: 6700,
  },
  {
    kbId: 110,
    title: "Classical Chinese literature",
    description: "Annotated texts from antiquity to modernity, selected commentary, and short guides.",
    coverVariant: plazaCoverVariant(["humanities"]),
    subscriberCount: 6720,
    contentCount: 240,
    authorHandle: "@ArtsEvening",
    verified: false,
    plazaCategories: ["humanities", "education", "life"],
    lastUpdate: "Last week",
    color: "from-mind/12 to-mind/10",
    viewCount: 2900,
  },
  {
    kbId: 111,
    title: "Small-home storage & flow",
    description: "Before/after layouts, cabinet sizes, and flow checklists for tight spaces.",
    coverVariant: plazaCoverVariant(["life"]),
    subscriberCount: 4180,
    contentCount: 95,
    authorHandle: "@LifeEditorial",
    verified: false,
    plazaCategories: ["life"],
    lastUpdate: "2 weeks ago",
    color: "from-stone-400/90 to-stone-600/85",
    viewCount: 1800,
  },
  {
    kbId: 113,
    title: "Production LLM notes",
    description: "RAG, evals, and cost control patterns from production teams — one thread for your stack.",
    coverVariant: plazaCoverVariant(["tech", "workplace"]),
    subscriberCount: 8420,
    contentCount: 210,
    authorHandle: "@MindarOps",
    verified: true,
    verifyTone: "blue",
    plazaCategories: ["recommended", "tech", "workplace", "industry"],
    featured: true,
    lastUpdate: "Today",
    color: "from-teal-500/90 to-emerald-700/85",
    viewCount: 12400,
    publicTagline: "RAG, evals, and cost control from one thread",
  },
  {
    kbId: 112,
    title: "Patent desk reference",
    description: "Drafting tips for invention and utility models, office action replies, and rule updates.",
    coverVariant: plazaCoverVariant(["law"]),
    subscriberCount: 25270,
    contentCount: 4505,
    authorHandle: "@GlobalPatents",
    verified: true,
    verifyTone: "blue",
    plazaCategories: ["recommended", "law", "tech", "industry"],
    featured: true,
    lastUpdate: "Today",
    color: "from-mind/12 to-mind/10",
    viewCount: 8750,
    publicTagline: "Patents · CN & abroad",
  },
]

export function formatPlazaSubscriber(n: number): string {
  const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(n)
  return `${compact} subscribers`
}

export function formatPlazaContent(n: number): string {
  return `${n.toLocaleString("en-US")} items`
}

export function plazaRowEngagement(row: PlazaLibraryRow) {
  return engagementMetricsForKb(row.kbId, row.subscriberCount, {
    likeCount: row.likeCount,
    commentCount: row.commentCount,
  })
}

export function formatPlazaEngagementLine(row: PlazaLibraryRow): string {
  const { likeCount, commentCount } = plazaRowEngagement(row)
  return `${formatPlazaSubscriber(row.subscriberCount)} · ${formatEngagementCount(likeCount)} likes · ${formatEngagementCount(commentCount)} comments`
}

export function plazaRowToKnowledgeBase(row: PlazaLibraryRow): KnowledgeBase {
  const publicSettings = publicSettingsForPlazaRow(row)
  const engagement = plazaRowEngagement(row)
  return {
    id: row.kbId,
    name: row.title,
    description: row.description,
    category: "subscribed",
    count: row.contentCount,
    lastUpdate: row.lastUpdate ?? "Recently",
    color: row.color,
    subscribers: row.subscriberCount,
    likeCount: engagement.likeCount,
    commentCount: engagement.commentCount,
    viewCount: row.viewCount,
    publicTagline: publicSettings.tagline || row.publicTagline,
    publisherName: row.authorHandle.replace(/^@/, ""),
    coverVariant: row.coverVariant,
    publicSettings,
    isPublicPublished: false,
    subscribedRole: "followed",
  }
}

export function plazaRowCardSummary(row: PlazaLibraryRow): string {
  const settings = publicSettingsForPlazaRow(row)
  const caps = plazaCapabilitySummary(settings.capabilities, 2)
  const fresh = formatPlazaFreshness(settings.lastSyncedAt, row.lastUpdate)
  const parts = [settings.tagline || row.publicTagline, caps, fresh].filter(Boolean)
  return parts.join(" · ")
}

export function plazaRowAgentLabel(row: PlazaLibraryRow): string {
  return publicAgentDisplayName(publicSettingsForPlazaRow(row))
}

/** User-published library from create wizard → discover plaza row */
export function knowledgeBaseToPlazaRow(kb: KnowledgeBase): PlazaLibraryRow {
  const pub = kb.publicSettings
  const caps = pub?.capabilities?.filter(Boolean) ?? []
  const categories: PlazaCategoryId[] = ["recommended"]
  const text = `${kb.name} ${kb.description}`.toLowerCase()
  if (/patent|legal|law/.test(text)) categories.push("law")
  else if (/health|clinical/.test(text)) categories.push("health")
  else if (/study|exam|course/.test(text)) categories.push("education")
  else if (/finance|invest/.test(text)) categories.push("finance")
  else categories.push("tech")

  return {
    kbId: kb.id,
    title: kb.name,
    description: kb.description,
    coverVariant: kb.coverVariant,
    subscriberCount: kb.subscribers ?? 0,
    contentCount: kb.count,
    authorHandle: `@${(kb.publisherName ?? "You").replace(/\s+/g, "")}`,
    verified: false,
    plazaCategories: categories,
    featured: false,
    lastUpdate: "Just now",
    color: kb.color,
    viewCount: kb.viewCount ?? 0,
    publicTagline: kb.publicTagline ?? pub?.tagline,
    assistantCapabilities: caps.length > 0 ? caps : undefined,
    freshnessLabel: "Published just now",
  }
}
