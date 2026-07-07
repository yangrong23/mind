import type { KBCategory } from "@/lib/mock-knowledge-bases"
import type { LibraryCoverVariant } from "@/lib/product-media"

export type KbAgentSuggestion = {
  id: string
  /** Short chip label */
  label: string
  /** Full prompt sent to the agent */
  prompt: string
}

export type KbAgentSuggestionInput = {
  name: string
  description?: string
  category?: KBCategory
  coverVariant?: LibraryCoverVariant
  isPublicKb?: boolean
  recommendedQuestions?: string[]
}

function truncateLabel(text: string, max = 42) {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

const BY_NAME: Record<string, KbAgentSuggestion[]> = {
  "product library": [
    { id: "prd", label: "Compare PRDs", prompt: "Compare the latest PRDs in this library and list conflicting requirements." },
    { id: "roadmap", label: "Roadmap gaps", prompt: "What roadmap gaps show up across specs and meeting notes in this library?" },
    { id: "ship", label: "Ship checklist", prompt: "Draft a release checklist grounded only in sources selected for this library." },
  ],
  "study notes": [
    { id: "exam", label: "Exam prep sheet", prompt: "Build an exam prep sheet from my study notes with key terms and likely questions." },
    { id: "concept", label: "Concept map", prompt: "Map the main concepts in this library and how they depend on each other." },
    { id: "flash", label: "Flashcard set", prompt: "Turn the densest notes here into a flashcard-style Q&A list I can review tonight." },
  ],
  "reading list": [
    { id: "themes", label: "Compare themes", prompt: "Compare recurring themes across books and articles in this reading list." },
    { id: "quotes", label: "Pull quotes", prompt: "Pull the most quotable passages and tag each with the source title." },
    { id: "plan", label: "Reading plan", prompt: "Suggest a two-week reading plan based on what I have not finished yet." },
  ],
  "engineering docs": [
    { id: "adr", label: "ADR summary", prompt: "Summarize open ADRs and which decision each team should align on this sprint." },
    { id: "onboard", label: "Onboard guide", prompt: "Create a newcomer onboarding guide from playbooks in this engineering library." },
    { id: "drift", label: "Doc vs code drift", prompt: "Where do API docs and runbooks disagree? List drift with source citations." },
  ],
  "design system": [
    { id: "audit", label: "Component audit", prompt: "Audit component usage rules in this library and flag inconsistencies across products." },
    { id: "a11y", label: "Accessibility pass", prompt: "List accessibility gaps called out in guidelines and how to fix them per component." },
    { id: "tokens", label: "Token glossary", prompt: "Build a token glossary (color, type, spacing) with when to use each token." },
  ],
  "patent knowledge base": [
    { id: "claims", label: "Claim mapping", prompt: "Map independent claims to specification paragraphs with a feature table." },
    { id: "oa", label: "Office action draft", prompt: "Draft response angles for the latest office action using only sources in this library." },
    { id: "prior", label: "Prior art table", prompt: "Build a prior-art comparison table for the closest references cited here." },
  ],
  "pm growth": [
    { id: "prio", label: "Prioritization lens", prompt: "Which prioritization frameworks in this library fit our current bet? Compare tradeoffs." },
    { id: "discovery", label: "Discovery synthesis", prompt: "Synthesize discovery interviews into pains, evidence, and testable assumptions." },
    { id: "retro", label: "Rollout retro", prompt: "Summarize rollout retros and extract repeatable launch checklist items." },
  ],
}

const BY_VARIANT: Partial<Record<LibraryCoverVariant, KbAgentSuggestion[]>> = {
  product: BY_NAME["product library"],
  study: BY_NAME["study notes"],
  reading: BY_NAME["reading list"],
  engineering: BY_NAME["engineering docs"],
  design: BY_NAME["design system"],
  legal: BY_NAME["patent knowledge base"],
  work: BY_NAME["pm growth"],
}

const GENERIC_MINE: KbAgentSuggestion[] = [
  { id: "sum", label: "Library summary", prompt: "Summarize this library in five bullets with citations to specific sources." },
  { id: "open", label: "Open questions", prompt: "What important questions are still unanswered across these sources?" },
  { id: "next", label: "Next actions", prompt: "List concrete next actions implied by the selected sources only." },
]

const GENERIC_TEAM: KbAgentSuggestion[] = [
  { id: "align", label: "Team alignment", prompt: "What do teammates need to align on based on the latest docs in this library?" },
  { id: "risks", label: "Risk register", prompt: "Extract risks and mitigations mentioned across team sources." },
  { id: "faq", label: "FAQ for newcomers", prompt: "Draft an FAQ newcomers can read before their first project week." },
]

const GENERIC_PUBLIC: KbAgentSuggestion[] = [
  { id: "brief", label: "Executive brief", prompt: "Write a one-page executive brief grounded in this curated library." },
  { id: "compare", label: "Compare sources", prompt: "Compare the strongest sources here and note where authors disagree." },
  { id: "cite", label: "Cited answer", prompt: "Answer my question with inline citations to specific library items only." },
]

export function getKbAgentSuggestions(input: KbAgentSuggestionInput): KbAgentSuggestion[] {
  const fromTeam = input.recommendedQuestions?.filter(Boolean).slice(0, 4)
  if (fromTeam?.length) {
    return fromTeam.map((q, i) => ({
      id: `team-${i}`,
      label: truncateLabel(q),
      prompt: q,
    }))
  }

  const key = input.name.trim().toLowerCase()
  if (BY_NAME[key]?.length) return BY_NAME[key]

  if (input.coverVariant && BY_VARIANT[input.coverVariant]?.length) {
    return BY_VARIANT[input.coverVariant]!
  }

  if (input.isPublicKb || input.category === "subscribed") return GENERIC_PUBLIC
  if (input.category === "team") return GENERIC_TEAM
  return GENERIC_MINE
}
