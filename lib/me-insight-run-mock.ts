import type { InsightPerspective } from "@/lib/mind-insight-perspectives"

export type InsightRunResult = {
  headline: string
  bodyMarkdown: string
  materialBasis: string
  blindSpots: string[]
  questions: string[]
  suggestedNextStep: string
}

export function mockInsightRunResult(p: InsightPerspective): InsightRunResult {
  const headlines: Record<string, string> = {
    default: "Context-rich captures, decisions left implicit",
    "value-clarity": "Speed and craft compete until alignment wins",
    "reverse-thinking": "Failure modes cluster around ownership gaps",
    "second-order": "Short-term velocity taxes library hygiene",
    mbti: "You gather wide, then consolidate when stakes rise",
    "daily-affirmation": "Small wins are already in yesterday's log",
    "action-guide": "Open loops want owners and dates",
    "meaning-radar": "Meaning peaks when work becomes legible",
    "key-figures": "Three relationships shape your sharpest notes",
    "compound-flywheel": "Capture works; retrieval is the missing tooth",
    "main-contradiction": "Move fast vs. document thoroughly",
    munger: "Invert failure before celebrating progress",
    aristotle: "Essence is accountable knowledge from voice",
  }

  const questionsByKind: Record<string, string[]> = {
    mbti: [
      "When do you prefer breadth over depth in a capture session?",
      "What signal tells you a thread is worth consolidating into a library?",
      "Where might labeling this as a fixed type limit your next experiment?",
    ],
    default: [
      "Which recurring theme deserves a dedicated library this month?",
      "What decision did you defer in your last three captures?",
      "Who should see your next summary before you archive it?",
    ],
  }

  const defaultQuestions = [
    "What pattern in this report surprised you?",
    "Which evidence would change your mind about the headline?",
    "What is one small action you can take in the next 48 hours?",
  ]

  return {
    headline: headlines[p.id] ?? "A through-line is forming across your corpus",
    bodyMarkdown: p.sampleBody,
    materialBasis: `Included: notes and knowledge items in range · ${p.rangeLabel} · perspective “${p.title}”`,
    blindSpots: [
      "Captures without a closing decision line may be under-weighted.",
      "Library-only learning signals are summarized, not quoted verbatim.",
    ],
    questions: questionsByKind[p.id] ?? defaultQuestions,
    suggestedNextStep:
      p.id === "action-guide"
        ? "Pick one open loop and write owner + date in the next note you create."
        : "Add one “so we will…” line at the end of your next recording.",
  }
}
