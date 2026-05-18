import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"

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
  coverImage: string
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
  publicTagline?: string
}

export const MOCK_PLAZA_LIBRARIES: PlazaLibraryRow[] = [
  {
    kbId: 101,
    title: "Middle school history · Essentials",
    description: "Timelines, essay templates, and common mistakes for exam prep and review.",
    coverImage: "https://picsum.photos/seed/plazaedu01/384/384",
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
    coverImage: "https://picsum.photos/seed/plazaedu02/384/384",
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
    coverImage: "https://picsum.photos/seed/plazaedu03/384/384",
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
    coverImage: "https://picsum.photos/seed/plazahealth01/384/384",
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
    coverImage: "https://picsum.photos/seed/plazatech01/384/384",
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
    coverImage: "https://picsum.photos/seed/plazawork01/384/384",
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
    coverImage: "https://picsum.photos/seed/plazafin01/384/384",
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
    coverImage: "https://picsum.photos/seed/plazaind01/384/384",
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
    coverImage: "https://picsum.photos/seed/plazalaw01/384/384",
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
    coverImage: "https://picsum.photos/seed/plazahum01/384/384",
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
    coverImage: "https://picsum.photos/seed/plazalife01/384/384",
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
    kbId: 112,
    title: "Patent desk reference",
    description: "Drafting tips for invention and utility models, office action replies, and rule updates.",
    coverImage: "https://picsum.photos/seed/plazalaw02/384/384",
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

export function plazaRowToKnowledgeBase(row: PlazaLibraryRow): KnowledgeBase {
  return {
    id: row.kbId,
    name: row.title,
    description: row.description,
    category: "subscribed",
    count: row.contentCount,
    lastUpdate: row.lastUpdate ?? "Recently",
    color: row.color,
    subscribers: row.subscriberCount,
    viewCount: row.viewCount,
    publicTagline: row.publicTagline,
    coverImage: row.coverImage,
  }
}
