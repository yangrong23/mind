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
]

export function publicFactoryOutputsForKb(
  kbId: number,
  kbName: string,
  shareEnabled: boolean
): PublicFactoryOutput[] {
  if (!shareEnabled) return []
  const fromDemo = DEMO_PUBLIC_FACTORY_OUTPUTS.filter((o) => o.kbId === kbId)
  if (fromDemo.length > 0) return fromDemo
  return [
    {
      id: `pub-${kbId}-welcome`,
      kbId,
      kbName,
      kind: "report",
      title: `${factoryKindShortLabel("report")} — getting started`,
      author: "Mindar Studio",
      createdAt: "Just now",
      excerpt: `Sample ${factoryKindShortLabel("report")} output from “${kbName}” — visible to all users while public sharing is on.`,
      viewCount: 12,
    },
  ]
}
