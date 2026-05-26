/** Structured share payloads for Daily review, AI insights, and timeline cards. */

export type MindShareVariant = "daily" | "insight" | "timeline"

export type MindShareCardModel = {
  variant: MindShareVariant
  eyebrow: string
  headline: string
  hook?: string
  excerpt?: string
  bullets?: string[]
  chips: string[]
}

export type MindSharePayload = {
  variant: MindShareVariant
  /** Social post title */
  title: string
  /** Full text for copy / messengers */
  body: string
  card: MindShareCardModel
  displayName: string
}

export function combineMindShareText(title: string, body: string) {
  const t = title.trim()
  const b = body.trim()
  if (t && b) return `${t}\n\n${b}`
  return t || b
}

export function buildDailyReviewSharePayload(input: {
  displayName: string
  dateLabel: string
  headline: string
  body: string
  highlights: readonly string[]
  streakDays: number
  captureCountToday: number
}): MindSharePayload {
  const hook = "Ideas decay in memory. They compound when you review them."
  const bullets = input.highlights.slice(0, 3)
  const excerpt = input.body.length > 200 ? `${input.body.slice(0, 200)}…` : input.body
  const body = [
    hook,
    "",
    input.headline,
    "",
    excerpt,
    "",
    ...bullets.map((b) => `• ${b}`),
    "",
    `${input.dateLabel} · ${input.streakDays}-day streak · ${input.captureCountToday} captures today`,
    `— ${input.displayName} on Mind`,
  ]
    .filter((line, i, arr) => line !== "" || (i > 0 && arr[i - 1] !== ""))
    .join("\n")

  return {
    variant: "daily",
    title: `Daily review · ${input.dateLabel}`,
    body,
    displayName: input.displayName,
    card: {
      variant: "daily",
      eyebrow: "Daily review",
      headline: input.headline,
      hook,
      excerpt,
      bullets,
      chips: [
        `${input.streakDays}-day streak`,
        `${input.captureCountToday} captures today`,
        input.dateLabel,
      ],
    },
  }
}

export function buildTimelineSharePayload(input: {
  displayName: string
  dateLabel: string
  slogan: string
  activityLine: string
  streakDays: number
  body: string
}): MindSharePayload {
  return {
    variant: "timeline",
    title: input.slogan.replace(/\n/g, " "),
    body: input.body,
    displayName: input.displayName,
    card: {
      variant: "timeline",
      eyebrow: "Mind timeline",
      headline: input.slogan,
      hook: input.dateLabel,
      excerpt: input.activityLine,
      chips: [`${input.streakDays}-day streak`, input.dateLabel],
    },
  }
}

export function buildInsightSharePayload(input: {
  displayName: string
  perspectiveTitle: string
  rangeLabel: string
  author: string
  headline: string
  bodyMarkdown: string
  suggestedNextStep: string
}): MindSharePayload {
  const hook = `Perspective · ${input.perspectiveTitle}`
  const excerpt =
    input.bodyMarkdown.length > 220 ? `${input.bodyMarkdown.slice(0, 220)}…` : input.bodyMarkdown
  const body = [
    hook,
    "",
    input.headline,
    "",
    excerpt,
    "",
    `Next step: ${input.suggestedNextStep}`,
    "",
    `Range · ${input.rangeLabel} · by ${input.author}`,
    `— ${input.displayName} on Mind`,
  ].join("\n")

  return {
    variant: "insight",
    title: `AI insight · ${input.perspectiveTitle}`,
    body,
    displayName: input.displayName,
    card: {
      variant: "insight",
      eyebrow: "AI insight",
      headline: input.headline,
      hook,
      excerpt,
      bullets: [input.suggestedNextStep],
      chips: [input.perspectiveTitle, input.rangeLabel],
    },
  }
}
