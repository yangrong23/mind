import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import type { LibraryCoverVariant } from "@/lib/product-media"
import type { PublicKbSettings } from "@/lib/public-kb-settings"

const BASE: Pick<PublicKbSettings, "skills" | "shareFactoryOutputsWithEveryone"> = {
  skills: [],
  shareFactoryOutputsWithEveryone: true,
}

/** Default plaza / subscribed agent binding when publisher settings are missing (demo). */
export const SUBSCRIBED_KB_AGENT_BY_VARIANT: Partial<Record<LibraryCoverVariant, PublicKbSettings>> = {
  legal: {
    isPublic: false,
    agentTagline: "Patent memos, office-action angles, and prior-art tables from this library",
    agentCapabilities: ["Claim mapping", "OA drafts", "Prior-art tables", "Cited memos"],
    recommendedQuestions: [
      "Map independent claims to specification paragraphs with a feature table.",
      "Draft response angles for the latest office action using only this library.",
    ],
    disclaimer: "Informational only — not legal advice. Consult qualified counsel for filings.",
    ...BASE,
  },
  work: {
    isPublic: false,
    agentTagline: "Product craft, discovery, and rollout notes grounded in this library",
    agentCapabilities: ["Prioritization lens", "Discovery synthesis", "Rollout retros", "Cited briefs"],
    recommendedQuestions: [
      "Which prioritization frameworks in this library fit our current bet?",
      "Synthesize discovery interviews into pains and testable assumptions.",
    ],
    ...BASE,
  },
  reading: {
    isPublic: false,
    agentTagline: "Deep reads, themes, and review outlines from curated essays and notes",
    agentCapabilities: ["Theme maps", "Pull quotes", "Reading plans", "Review Q&A"],
    recommendedQuestions: [
      "Compare recurring themes across essays in this library.",
      "Suggest a two-week reading plan from what I have not finished yet.",
    ],
    ...BASE,
  },
  finance: {
    isPublic: false,
    agentTagline: "Markets, filings, and macro notes with cited sources only",
    agentCapabilities: ["Earnings digests", "Sector maps", "Macro briefs", "Cited answers"],
    recommendedQuestions: [
      "Summarize the latest earnings themes across sources in this library.",
      "Build a sector map with disagreements called out and cited.",
    ],
    ...BASE,
  },
  study: {
    isPublic: false,
    agentTagline: "Summaries, drills, and review maps from course materials",
    agentCapabilities: ["Key-point summaries", "Mind maps", "Exam Q&A", "Source citations"],
    recommendedQuestions: [
      "Build a one-page review sheet for the densest unit in this library.",
      "Turn the hardest chapter into flashcard-style Q&A.",
    ],
    ...BASE,
  },
  education: {
    isPublic: false,
    agentTagline: "Study support from publisher-curated courseware and drills",
    agentCapabilities: ["Timeline maps", "Essay scaffolds", "Exam Q&A", "Source citations"],
    recommendedQuestions: [
      "What are the three most common mistakes called out in this library?",
      "Build a review timeline for the next exam from cited sources only.",
    ],
    disclaimer: "For study support only — not a substitute for classroom instruction.",
    ...BASE,
  },
  health: {
    isPublic: false,
    agentTagline: "Guideline summaries and case discussions grounded in library sources",
    agentCapabilities: ["Guideline digests", "Case walkthroughs", "Comparisons", "Cited answers"],
    recommendedQuestions: [
      "Summarize guideline updates mentioned across these sources.",
      "What open clinical questions remain in this library?",
    ],
    disclaimer: "For learning only — not medical advice. Consult a licensed clinician.",
    ...BASE,
  },
  tech: {
    isPublic: false,
    agentTagline: "Engineering notes — architecture, evals, and runbooks from one thread",
    agentCapabilities: ["Architecture Q&A", "Eval checklists", "Cost tradeoffs", "Runbook drafts"],
    recommendedQuestions: [
      "What production pitfalls are called out across these notes?",
      "Draft an eval checklist based only on sources in this library.",
    ],
    ...BASE,
  },
  engineering: {
    isPublic: false,
    agentTagline: "ADRs, runbooks, and onboarding grounded in engineering sources",
    agentCapabilities: ["ADR summaries", "Onboard guides", "Doc drift checks", "Cited answers"],
    recommendedQuestions: [
      "Summarize open ADRs and which decision we should align on this sprint.",
      "Where do API docs and runbooks disagree? List drift with citations.",
    ],
    ...BASE,
  },
  product: {
    isPublic: false,
    agentTagline: "PRDs, research, and release context in one grounded thread",
    agentCapabilities: ["PRD Q&A", "Compare specs", "Release checklists", "Cited briefs"],
    recommendedQuestions: [
      "Compare the latest PRDs and list conflicting requirements.",
      "Draft a release checklist grounded only in this library.",
    ],
    ...BASE,
  },
  design: {
    isPublic: false,
    agentTagline: "Design system rules, tokens, and accessibility from saved specs",
    agentCapabilities: ["Component audit", "Token glossary", "A11y pass", "Cited memos"],
    recommendedQuestions: [
      "Audit component rules for inconsistencies across products.",
      "Build a color and type token glossary with usage notes.",
    ],
    ...BASE,
  },
  lifestyle: {
    isPublic: false,
    agentTagline: "Turn saved clips into outlines, checklists, and practical guides",
    agentCapabilities: ["How-to outlines", "Checklists", "Before/after briefs", "Source citations"],
    recommendedQuestions: [
      "Turn the best before/after examples into a step-by-step checklist.",
      "Draft a short guide from the highest-rated sources here.",
    ],
    ...BASE,
  },
  research: {
    isPublic: false,
    agentTagline: "Industry maps, policy milestones, and supplier context with citations",
    agentCapabilities: ["Supply-chain maps", "Policy timelines", "Company briefs", "Cited scans"],
    recommendedQuestions: [
      "Map key companies from materials to retail with cited sources.",
      "Summarize policy milestones on a single timeline.",
    ],
    ...BASE,
  },
  humanities: {
    isPublic: false,
    agentTagline: "Annotated texts, commentary, and guided reading from this library",
    agentCapabilities: ["Passage glosses", "Theme maps", "Compare editions", "Review Q&A"],
    recommendedQuestions: [
      "Compare how two commentators interpret the same passage.",
      "Build a theme map across the annotated texts in this library.",
    ],
    ...BASE,
  },
}

export function hasKbChatConfig(settings?: PublicKbSettings | null): boolean {
  return Boolean(
    settings?.recommendedQuestions?.length ||
      settings?.skills?.length ||
      settings?.agentTagline?.trim() ||
      settings?.agentCapabilities?.length
  )
}

/** @deprecated Use hasKbChatConfig */
export const hasKbAgentBinding = hasKbChatConfig

/** Every subscribed library resolves to publisher or default agent settings. */
export function resolveKbPublicSettings(
  kb: Pick<KnowledgeBase, "category" | "publicSettings" | "coverVariant" | "name">
): PublicKbSettings | undefined {
  const existing = kb.publicSettings
  if (existing && (existing.isPublic || hasKbChatConfig(existing))) return existing

  if (kb.category !== "subscribed") return existing

  const byVariant = SUBSCRIBED_KB_AGENT_BY_VARIANT[kb.coverVariant]
  if (byVariant) {
    return {
      ...byVariant,
      isPublic: existing?.isPublic ?? false,
      skills: existing?.skills ?? byVariant.skills,
      shareFactoryOutputsWithEveryone:
        existing?.shareFactoryOutputsWithEveryone ?? byVariant.shareFactoryOutputsWithEveryone,
      recommendedQuestions: existing?.recommendedQuestions?.length
        ? existing.recommendedQuestions
        : byVariant.recommendedQuestions,
    }
  }

  const fallback = SUBSCRIBED_KB_AGENT_BY_VARIANT.study!
  return { ...fallback, isPublic: false }
}
