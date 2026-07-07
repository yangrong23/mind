import type { LucideIcon } from "lucide-react"
import {
  Network,
  Scale,
  Undo2,
  GitBranch,
  UserCircle,
  Sun,
  Lightbulb,
  Radar,
  Users,
  TrendingUp,
  CircleDot,
  GraduationCap,
  Atom,
} from "lucide-react"

export type InsightPerspective = {
  id: string
  title: string
  author: string
  description: string
  rangeLabel: string
  icon: LucideIcon
  /** Mock generated insight body when user runs this lens */
  sampleBody: string
  /** Shown on the main picker (figure 3) */
  featured?: boolean
}

export type InsightPerspectiveCategory = {
  id: string
  label: string
  perspectives: InsightPerspective[]
}

const defaultInsight: InsightPerspective = {
  id: "default",
  title: "Default insight",
  author: "Mindar",
  description: "Uncover hidden thinking patterns and deeper themes across your notes.",
  rangeLabel: "All notes",
  icon: Network,
  featured: true,
  sampleBody:
    "Across your recent captures, three threads repeat: product narrative, customer proof, and execution risk. You tend to open with context-rich framing but close without an explicit decision. A productive next step is to tag one “so we will…” line at the end of each meeting note for the next two weeks.",
}

export const MIND_FEATURED_INSIGHT_PERSPECTIVES: InsightPerspective[] = [
  defaultInsight,
  {
    id: "value-clarity",
    title: "Value clarification",
    author: "@shaonan",
    description: "Surface what you truly value from scattered notes, from words to priorities.",
    rangeLabel: "Last 3 months",
    icon: Scale,
    featured: true,
    sampleBody:
      "Your notes weight speed and craft almost equally, but when forced to choose you defer to stakeholder alignment. Values that show up as non-negotiable: clarity for the team, evidence before roadmap bets, and protecting focus time. Gaps: explicit tradeoffs and saying no in writing.",
  },
  {
    id: "reverse-thinking",
    title: "Reverse thinking",
    author: "Mindar",
    description: "Stress-test assumptions in your notes using Munger-style inversion.",
    rangeLabel: "Last year",
    icon: Undo2,
    featured: true,
    sampleBody:
      "If this plan failed, the likely causes are: unclear owner after meetings, too many parallel bets, and summaries that stop at context. Inverting each risk suggests one guardrail—single DRI per initiative, cap work-in-progress to three themes, and end every capture with one next action.",
  },
  {
    id: "second-order",
    title: "Second-order thinking",
    author: "@shaonan",
    description: "Spot problems in your notes and trace second-order consequences.",
    rangeLabel: "Last 6 months",
    icon: GitBranch,
    featured: true,
    sampleBody:
      "Several notes optimize for short-term velocity (ship the demo, unblock sales). Second-order effects: tech debt in tagging, uneven library hygiene, and review fatigue. Consider a weekly 15-minute “consequence scan” on the top three open bets.",
  },
  {
    id: "mbti",
    title: "Knowledge processing style",
    author: "Mindar",
    description:
      "MBTI-inspired read of how you acquire, connect, and turn notes into usable knowledge—not a personality test.",
    rangeLabel: "All notes",
    icon: UserCircle,
    featured: true,
    sampleBody:
      "You tend to gather broadly first—many parallel threads from meetings and voice—then consolidate when a theme feels stake-worthy. Linking ideas beats step-by-step manuals; closure shows up when shipping or presenting. Intuition + judging cues dominate over detail-by-detail sensing. Treat this as a hypothesis about how you learn and process—not a fixed type label.",
  },
]

export const MIND_INSIGHT_GALLERY_CATEGORIES: InsightPerspectiveCategory[] = [
  {
    id: "review",
    label: "Review & organize",
    perspectives: [
      {
        id: "daily-affirmation",
        title: "Daily affirmation",
        author: "Mindar",
        description: "Find small wins in your diary worth celebrating; encourage steady growth.",
        rangeLabel: "Last day",
        icon: Sun,
        sampleBody:
          "Yesterday you closed a loop on customer proof, shipped a clearer summary, and protected focus time despite interruptions. Name one thing you did well before planning tomorrow—momentum compounds when you notice it.",
      },
      {
        id: "action-guide",
        title: "Action guide",
        author: "Mindar",
        description: "Turn confusion and hesitation in notes into concrete next steps.",
        rangeLabel: "Last year",
        icon: Lightbulb,
        sampleBody:
          "Open loops cluster around roadmap sequencing and stakeholder updates. Convert each into: owner, date, and smallest verifiable step. Three items can move this week without new meetings.",
      },
    ],
  },
  {
    id: "self-awareness",
    label: "Self-awareness",
    perspectives: [
      {
        id: "meaning-radar",
        title: "Meaning radar",
        author: "Mindar",
        description: "Map sources and gaps of meaning in your notes; locate core motivation.",
        rangeLabel: "Last 6 months",
        icon: Radar,
        sampleBody:
          "Meaning peaks when work connects to customer outcomes and craft. It dips during pure status coordination. Your core motivator looks like “make complex things legible for others”—design rituals that preserve that, not just throughput.",
      },
      {
        id: "key-figures",
        title: "Key figures",
        author: "Mindar",
        description: "Discover recurring people in your notes and their impact on you.",
        rangeLabel: "Last 3 months",
        icon: Users,
        sampleBody:
          "Three names recur as amplifiers: a design partner (clarity), a customer champion (evidence), and a skeptical exec (focus). Notes involving the exec produce sharper decisions but more stress—schedule those captures when you can write a closing decision line.",
      },
    ],
  },
  {
    id: "thinking",
    label: "Thinking & decisions",
    perspectives: [
      {
        id: "compound-flywheel",
        title: "Compound flywheel",
        author: "@ChengJia",
        description: "Find needs and strengths in your notes; shape them into a reusable flywheel.",
        rangeLabel: "Last year · work reflections",
        icon: TrendingUp,
        sampleBody:
          "Strength loop: capture → summarize → tag → reuse in library → better meetings. Missing tooth: explicit retrieval prompts after each upload. Adding one “link to library” habit could close the flywheel within a month.",
      },
      {
        id: "main-contradiction",
        title: "Main contradiction",
        author: "Mindar",
        description: "Identify the primary tension in your thinking using a contradiction lens.",
        rangeLabel: "Last 3 months",
        icon: CircleDot,
        sampleBody:
          "Dominant tension: move fast vs. document thoroughly. It shows up as rich context with delayed decisions. Resolve by time-boxing: 80% context, 20% forced decision line in the same session.",
      },
    ],
  },
  {
    id: "masters",
    label: "Master perspectives",
    perspectives: [
      {
        id: "munger",
        title: "Charlie Munger",
        author: "@HEXIN",
        description: "Analyze your notes from multiple angles using Munger-style mental models.",
        rangeLabel: "All notes",
        icon: GraduationCap,
        sampleBody:
          "Inversion: what would make this quarter forgettable?—unclear bets, noisy meetings, no library hygiene. Incentives: who wins if we ship without evidence? Checklist: circle of competence, margin of safety, and one disconfirming fact per major claim.",
      },
      {
        id: "aristotle",
        title: "Aristotle",
        author: "Mindar",
        description: "Deconstruct notes with first principles—essence, cause, and purpose.",
        rangeLabel: "All notes",
        icon: Atom,
        sampleBody:
          "Essence: you are building a capture system that turns voice into accountable knowledge. Cause: fragmented tools and meeting overload. Purpose: reduce rework and make decisions auditable. Strip decorative features until each serves that purpose.",
      },
    ],
  },
]

export function getInsightPerspectiveById(id: string): InsightPerspective | undefined {
  if (id === defaultInsight.id) return defaultInsight
  for (const p of MIND_FEATURED_INSIGHT_PERSPECTIVES) {
    if (p.id === id) return p
  }
  for (const cat of MIND_INSIGHT_GALLERY_CATEGORIES) {
    const found = cat.perspectives.find((p) => p.id === id)
    if (found) return found
  }
  return undefined
}

export function allGalleryPerspectives(): InsightPerspective[] {
  return MIND_INSIGHT_GALLERY_CATEGORIES.flatMap((c) => c.perspectives)
}
