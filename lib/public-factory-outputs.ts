import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import { factoryKindShortLabel } from "@/components/mind-v2/content-factory-progress-panel"

export type PublicFactoryOutput = {
  id: string
  kbId: number
  kbName: string
  kind: FactoryModalKind
  title: string
  author: string
  createdAt: string
  excerpt: string
  viewCount: number
}

/** Demo community-visible Studio outputs for public / subscribed libraries */
export const DEMO_PUBLIC_FACTORY_OUTPUTS: PublicFactoryOutput[] = [
  // Legacy subscribed list (Knowledge tab)
  {
    id: "pub-6-report",
    kbId: 6,
    kbName: "Patent knowledge base",
    kind: "report",
    title: "Office-action response outline",
    author: "CN & global patents desk",
    createdAt: "May 12, 2026",
    excerpt: "Structured rebuttal mapped to claim 1–12 with prior-art table and amendment options.",
    viewCount: 1842,
  },
  {
    id: "pub-6-slides",
    kbId: 6,
    kbName: "Patent knowledge base",
    kind: "slides",
    title: "Prosecution timeline deck",
    author: "Community",
    createdAt: "May 8, 2026",
    excerpt: "12-slide narrative for stakeholders: filing dates, OA rounds, and divisional strategy.",
    viewCount: 920,
  },
  {
    id: "pub-8-audio",
    kbId: 8,
    kbName: "Deep reading room",
    kind: "audio",
    title: "Weekly deep-read briefing",
    author: "You",
    createdAt: "May 10, 2026",
    excerpt: "18-minute audio digest of three long-form essays with pull quotes for subscribers.",
    viewCount: 4100,
  },
  {
    id: "pub-8-flash",
    kbId: 8,
    kbName: "Deep reading room",
    kind: "flashcards",
    title: "Argument flashcards — May week",
    author: "Product guild",
    createdAt: "May 6, 2026",
    excerpt: "42 cards covering thesis, counter-arguments, and cited passages from the reading list.",
    viewCount: 2103,
  },
  {
    id: "pub-7-quiz",
    kbId: 7,
    kbName: "PM growth",
    kind: "quiz",
    title: "Discovery cadence quiz",
    author: "Product guild",
    createdAt: "May 4, 2026",
    excerpt: "Self-check on interview synthesis, opportunity sizing, and rollout retros from the playbook hub.",
    viewCount: 1560,
  },
  // Plaza — featured & popular
  {
    id: "pub-101-report",
    kbId: 101,
    kbName: "Middle school history · Essentials",
    kind: "report",
    title: "Tang–Song transition one-pager",
    author: "History Lab",
    createdAt: "May 14, 2026",
    excerpt: "Timeline, cause–effect chains, and essay frames with citations to sources in this library.",
    viewCount: 6200,
  },
  {
    id: "pub-101-flash",
    kbId: 101,
    kbName: "Middle school history · Essentials",
    kind: "flashcards",
    title: "Ming dynasty review deck",
    author: "History Lab",
    createdAt: "May 11, 2026",
    excerpt: "36 flashcards: key figures, dates, and common exam mistakes pulled from curated units.",
    viewCount: 3840,
  },
  {
    id: "pub-101-slides",
    kbId: 101,
    kbName: "Middle school history · Essentials",
    kind: "slides",
    title: "Exam week slide pack",
    author: "Community",
    createdAt: "May 9, 2026",
    excerpt: "10 slides for classroom review — maps, prompts, and source callouts per section.",
    viewCount: 2910,
  },
  {
    id: "pub-102-report",
    kbId: 102,
    kbName: "High school math · Quick reference",
    kind: "report",
    title: "Calculus theorem digest",
    author: "Liuqing AI",
    createdAt: "May 13, 2026",
    excerpt: "Limits, derivatives, and integrals with proof sketches and drill links to library PDFs.",
    viewCount: 5100,
  },
  {
    id: "pub-102-quiz",
    kbId: 102,
    kbName: "High school math · Quick reference",
    kind: "quiz",
    title: "Geometry proof practice set",
    author: "Liuqing AI",
    createdAt: "May 7, 2026",
    excerpt: "15 questions with step hints and references to worked examples in the knowledge base.",
    viewCount: 2780,
  },
  {
    id: "pub-104-report",
    kbId: 104,
    kbName: "Cardiology study notes",
    kind: "report",
    title: "Heart-failure guideline digest",
    author: "SnailMD",
    createdAt: "May 15, 2026",
    excerpt: "Structured summary of dosing tables, contraindications, and case pearls — learning use only.",
    viewCount: 8900,
  },
  {
    id: "pub-104-audio",
    kbId: 104,
    kbName: "Cardiology study notes",
    kind: "audio",
    title: "Morning rounds audio brief",
    author: "SnailMD",
    createdAt: "May 12, 2026",
    excerpt: "22-minute walkthrough of new cases and guideline deltas with timestamped citations.",
    viewCount: 4450,
  },
  {
    id: "pub-104-infographic",
    kbId: 104,
    kbName: "Cardiology study notes",
    kind: "infographic",
    title: "Beta-blocker comparison chart",
    author: "Community",
    createdAt: "May 5, 2026",
    excerpt: "Visual panel comparing agents, renal dosing notes, and library source footnotes.",
    viewCount: 3320,
  },
  {
    id: "pub-103-slides",
    kbId: 103,
    kbName: "Elementary resource pack",
    kind: "slides",
    title: "Printable unit overview deck",
    author: "Ms Snail",
    createdAt: "May 10, 2026",
    excerpt: "Parent-friendly slides for language, math, and English units with homework prompts.",
    viewCount: 1680,
  },
  {
    id: "pub-103-flash",
    kbId: 103,
    kbName: "Elementary resource pack",
    kind: "flashcards",
    title: "Mental math drill cards",
    author: "Ms Snail",
    createdAt: "May 3, 2026",
    excerpt: "Print-ready card set aligned to grade-level sheets in this library.",
    viewCount: 1240,
  },
]

function buildFallbackPublicOutputs(kbId: number, kbName: string): PublicFactoryOutput[] {
  const kinds: FactoryModalKind[] = ["report", "slides", "audio"]
  return kinds.map((kind, i) => ({
    id: `pub-${kbId}-${kind}`,
    kbId,
    kbName,
    kind,
    title: `${factoryKindShortLabel(kind)} — ${kbName}`,
    author: "Mindar Studio",
    createdAt: i === 0 ? "May 12, 2026" : i === 1 ? "May 8, 2026" : "May 4, 2026",
    excerpt: `Publisher-shared ${factoryKindShortLabel(kind).toLowerCase()} generated from “${kbName}” sources — open to browse.`,
    viewCount: 240 + i * 180,
  }))
}

export function publicFactoryOutputsForKb(
  kbId: number,
  kbName: string,
  shareEnabled: boolean
): PublicFactoryOutput[] {
  if (!shareEnabled) return []
  const fromDemo = DEMO_PUBLIC_FACTORY_OUTPUTS.filter((o) => o.kbId === kbId)
  if (fromDemo.length > 0) return fromDemo
  return buildFallbackPublicOutputs(kbId, kbName)
}

export function bodyForPublicFactoryOutput(output: PublicFactoryOutput): string[] {
  return [
    output.excerpt,
    `This ${factoryKindShortLabel(output.kind).toLowerCase()} was produced in Studio from sources in “${output.kbName}”. In production you would open the full export, playback, or slide viewer here.`,
    `Published by ${output.author} · ${output.createdAt}. Browse-only for subscribers — generation credits stay on your account when you make your own outputs.`,
  ]
}
