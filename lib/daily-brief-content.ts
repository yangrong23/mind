/** Conversational daily brief copy — Me Daily review & timeline day detail */

export type DailyBriefAction = {
  id: string
  label: string
  kind?: "calendar" | "link" | "default"
}

export type DailyBriefItem = {
  id: string
  lead: string
  note?: string
  context?: string
  actions?: DailyBriefAction[]
}

export type DailyBriefSection = {
  id: string
  title: string
  items: DailyBriefItem[]
}

export type DailyBriefSourceFile = {
  id: string
  title: string
  time?: string
  source?: string
}

export type DailyBriefContent = {
  greeting: string
  subline?: string
  sections: DailyBriefSection[]
  suggestedPrompts: string[]
  /** Files touched on this day / period — shown once at the end, not per bullet */
  sourceFiles?: DailyBriefSourceFile[]
}

function firstName(displayName: string) {
  const t = displayName.trim().split(/\s+/)[0]
  return t || "there"
}

export function buildTodayDailyBrief(input: {
  displayName: string
  dateLabel: string
  weekdayLabel?: string
  headline: string
  body: string
  highlights: readonly string[]
  uploads?: { id: string; title: string; time?: string; source?: string }[]
  sourceFiles?: DailyBriefSourceFile[]
}): DailyBriefContent {
  const name = firstName(input.displayName)
  const dayRef = input.weekdayLabel?.toLowerCase() ?? "today"

  const topItems: DailyBriefItem[] = [
    {
      id: "headline",
      lead: input.headline.endsWith(".") ? input.headline : `${input.headline}.`,
      context: input.body,
    },
  ]

  if (input.uploads?.length) {
    topItems.push({
      id: "captures-roll",
      lead: `**${input.uploads.length}** capture${input.uploads.length === 1 ? "" : "s"} shaped ${dayRef} — themes are summarized above; see files from this period below.`,
    })
  }

  input.highlights.slice(0, 3).forEach((h, i) => {
    if (topItems.length >= 5) return
    topItems.push({
      id: `highlight-${i}`,
      lead: h.endsWith(".") ? h : `${h}.`,
    })
  })

  const aheadItems: DailyBriefItem[] = input.highlights.slice(2).map((h, i) => ({
    id: `ahead-${i}`,
    lead: h.endsWith(".") ? h : `${h}.`,
  }))

  if (aheadItems.length === 0) {
    aheadItems.push({
      id: "ahead-default",
      lead: "Tomorrow, try ending your first capture with one line that starts with “So we will…”—it makes weekly review much faster.",
      context: "You often end strong on context; naming the decision out loud closes the loop.",
    })
  }

  return {
    greeting: `Hey ${name} 👋 here's what ${dayRef} looks like`,
    subline: input.dateLabel,
    sections: [
      { id: "top", title: "Top of mind", items: topItems },
      { id: "ahead", title: "Looking ahead", items: aheadItems },
    ],
    suggestedPrompts: [
      "What should I prioritize from today's captures?",
      "Draft a one-line decision for my top recording",
      "Link today's best quote to my library",
    ],
    sourceFiles:
      input.sourceFiles ??
      input.uploads?.map((u) => ({
        id: u.id,
        title: u.title,
        time: u.time,
        source: u.source,
      })),
  }
}

export function buildDayTimelineBrief(input: {
  displayName: string
  weekdayLabel: string
  dateLabel: string
  summary: string
  timeRange?: string
  location?: string
  uploads: { id: string; title: string; time: string; source: string }[]
}): DailyBriefContent {
  const name = firstName(input.displayName)
  const dayRef = input.weekdayLabel.toLowerCase()

  const topItems: DailyBriefItem[] =
    input.uploads.length > 0
      ? [
          {
            id: "day-summary",
            lead: input.summary.endsWith(".") ? input.summary : `${input.summary}.`,
            note:
              input.uploads.length > 1
                ? `${input.uploads.length} files were added or updated this day — listed at the end.`
                : "One file anchored this day — see the footer for the source.",
          },
          {
            id: "thread",
            lead: "The through-line is **context first, decision second** — name one “so we will…” line in your next capture to close the loop.",
          },
        ]
      : [
          {
            id: "quiet",
            lead: "No new captures landed—treat this as breathing room, not a miss.",
            context: input.summary,
          },
        ]

  const metaNote = [
    input.timeRange && input.timeRange !== "—" ? `Span: ${input.timeRange}` : null,
    input.location && input.location !== "—" ? `Around ${input.location}` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  const aheadItems: DailyBriefItem[] = [
    {
      id: "ahead-1",
      lead: "If anything from this day is still open, pin one follow-up to tomorrow morning's first capture.",
      note: metaNote || undefined,
    },
  ]

  return {
    greeting: `Hey ${name} 👋 here's what ${dayRef} looked like`,
    subline: input.dateLabel,
    sections: [
      { id: "top", title: "Top of mind", items: topItems },
      { id: "ahead", title: "Looking ahead", items: aheadItems },
    ],
    suggestedPrompts: [
      "Summarize this day in three bullets",
      "What decision was I circling on?",
      "Turn the strongest capture into a library note",
    ],
    sourceFiles: input.uploads.map((u) => ({
      id: u.id,
      title: u.title,
      time: u.time,
      source: u.source,
    })),
  }
}
