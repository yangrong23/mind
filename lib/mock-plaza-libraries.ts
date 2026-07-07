import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import type { LibraryCoverVariant } from "@/lib/product-media"
import type { PublicKbSettings } from "@/lib/public-kb-settings"
import { resolveKbPublicSettings } from "@/lib/subscribed-kb-agent-presets"

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
  publicTagline?: string
  publisherName?: string
  publicSettings?: PublicKbSettings
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
    publisherName: "History Lab",
    publicSettings: {
      isPublic: true,
      agentTagline: "Timelines, essay frames, and exam drills from this history library",
      agentCapabilities: ["Timeline maps", "Essay scaffolds", "Exam Q&A", "Source citations"],
      recommendedQuestions: [
        "Build a one-page timeline for the Tang–Song transition with cited sources.",
        "What are the three most common essay mistakes in this library?",
        "Turn the Ming section into flashcard-style Q&A for review tonight.",
      ],
      disclaimer: "For study support only — not a substitute for classroom instruction.",
      skills: [],
      shareFactoryOutputsWithEveryone: true,
    },
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
    publicSettings: {
      isPublic: true,
      agentTagline: "Functions, proofs, and drills from this math reference library",
      agentCapabilities: ["Formula sheets", "Proof walkthroughs", "Practice drills", "Cited steps"],
      recommendedQuestions: [
        "Summarize the key theorems for calculus in this library.",
        "Walk through a proof for the trickiest geometry problem cited here.",
      ],
      skills: [],
      shareFactoryOutputsWithEveryone: true,
    },
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
    publicSettings: {
      isPublic: true,
      agentTagline: "Print-ready unit sheets and drills from elementary resource packs",
      agentCapabilities: ["Unit summaries", "Printable sheets", "Drill cards", "Parent guides"],
      recommendedQuestions: [
        "Turn the math unit sheets into a one-week practice plan.",
        "List character lists and mental-math cards by grade level.",
      ],
      skills: [],
      shareFactoryOutputsWithEveryone: true,
    },
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
    publisherName: "SnailMD",
    publicSettings: {
      isPublic: true,
      agentTagline: "Guideline summaries and case discussions grounded in cardiology sources",
      agentCapabilities: ["Guideline digests", "Med comparisons", "Case walkthroughs", "Cited answers"],
      recommendedQuestions: [
        "Summarize the latest heart-failure guideline updates in this library.",
        "Compare beta-blocker choices mentioned across these case notes.",
        "What open clinical questions remain across the sources here?",
      ],
      disclaimer: "For learning only — not medical advice. Always consult a licensed clinician.",
      skills: [],
      shareFactoryOutputsWithEveryone: true,
    },
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
    publicTagline: "RAG · evals · cost",
    publisherName: "Arch Weekly",
    publicSettings: {
      isPublic: true,
      agentTagline: "Production LLM notes — RAG, evals, and cost control from one thread",
      agentCapabilities: ["Architecture Q&A", "Eval checklists", "Cost tradeoffs", "Runbook drafts"],
      recommendedQuestions: [
        "What RAG pitfalls are called out across these production notes?",
        "Draft an eval checklist based only on sources in this library.",
        "Compare cost-control strategies mentioned in the latest articles.",
      ],
      skills: [],
      shareFactoryOutputsWithEveryone: true,
    },
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
    publicSettings: {
      isPublic: true,
      agentTagline: "PRD retrospectives, growth experiments, and dashboard playbooks",
      agentCapabilities: ["Case synthesis", "PRD Q&A", "Experiment briefs", "Cited retros"],
      recommendedQuestions: [
        "Compare rollout retros and extract a repeatable launch checklist.",
        "Which prioritization frameworks in this library fit a B2B SaaS bet?",
      ],
      skills: [],
      shareFactoryOutputsWithEveryone: true,
    },
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
    publicSettings: {
      isPublic: true,
      agentTagline: "Financial statement checks and red flags with cited filings",
      agentCapabilities: ["Statement triage", "Cash-flow quality", "Red-flag scans", "Cited memos"],
      recommendedQuestions: [
        "List common red flags called out across these financial primers.",
        "Compare cash-flow quality checks for the examples in this library.",
      ],
      skills: [],
      shareFactoryOutputsWithEveryone: true,
    },
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
    publicSettings: {
      isPublic: true,
      agentTagline: "EV supply-chain maps and policy timelines with citations",
      agentCapabilities: ["Supply-chain maps", "Policy timelines", "Company briefs", "Sector scans"],
      recommendedQuestions: [
        "Map key companies from materials to retail with cited sources.",
        "Summarize policy milestones affecting EV supply chains in this library.",
      ],
      skills: [],
      shareFactoryOutputsWithEveryone: true,
    },
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
    publicSettings: {
      isPublic: true,
      agentTagline: "Civil-code Q&A with case pointers grounded in this practice library",
      agentCapabilities: ["Issue spotting", "Case pointers", "Clause compare", "Cited memos"],
      recommendedQuestions: [
        "Compare contract vs tort answers for a high-frequency fact pattern here.",
        "List case-law pointers cited for property disputes in this library.",
      ],
      disclaimer: "Informational only — not legal advice. Consult qualified counsel.",
      skills: [],
      shareFactoryOutputsWithEveryone: true,
    },
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
    publicSettings: {
      isPublic: true,
      agentTagline: "Annotated classical texts and guided reading from this humanities library",
      agentCapabilities: ["Passage glosses", "Theme maps", "Edition compare", "Review Q&A"],
      recommendedQuestions: [
        "Compare how two commentators interpret the same passage.",
        "Build a theme map across annotated texts in this library.",
      ],
      skills: [],
      shareFactoryOutputsWithEveryone: true,
    },
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
    publicSettings: {
      isPublic: true,
      agentTagline: "Storage layouts, flow checklists, and before/after guides for small homes",
      agentCapabilities: ["Layout briefs", "Cabinet sizing", "Flow checklists", "Before/after guides"],
      recommendedQuestions: [
        "Turn the best before/after examples into a step-by-step checklist.",
        "Draft a flow checklist for a tight galley kitchen using sources here.",
      ],
      skills: [],
      shareFactoryOutputsWithEveryone: true,
    },
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
    publisherName: "Global Patents",
    publicSettings: {
      isPublic: true,
      agentTagline: "Patent drafting tips and office-action angles from curated references",
      agentCapabilities: ["Claim mapping", "OA drafts", "Prior-art tables", "Cited memos"],
      recommendedQuestions: [
        "Map independent claims to specification paragraphs with a feature table.",
        "Draft response angles for the latest office action using only this library.",
        "Build a prior-art comparison for the closest references cited here.",
      ],
      disclaimer: "Informational only — not legal advice. Consult qualified counsel for filings.",
      skills: [],
      shareFactoryOutputsWithEveryone: true,
    },
  },
]

/** Home Library tab — horizontal plaza promo strip */
export function getFeaturedPlazaRows(limit = 6): PlazaLibraryRow[] {
  const featured = MOCK_PLAZA_LIBRARIES.filter((r) => r.featured)
  const pool = featured.length > 0 ? featured : MOCK_PLAZA_LIBRARIES.slice(0, limit)
  return pool.slice(0, limit)
}

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
  const kb: KnowledgeBase = {
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
    publisherName: row.publisherName ?? row.authorHandle.replace(/^@/, ""),
    coverVariant: row.coverVariant,
    publicSettings: row.publicSettings,
  }
  return { ...kb, publicSettings: resolveKbPublicSettings(kb) }
}
