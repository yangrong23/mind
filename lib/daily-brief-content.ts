/** Conversational daily brief copy — Me Daily review & timeline day detail */

export type DailyBriefAction = {
  id: string
  label: string
  kind?: "calendar" | "link" | "default"
}

export type DailyBriefOutputKind = "report" | "audio" | "flashcards" | "slides" | "quiz"

export type DailyBriefOutputFile = {
  id: string
  title: string
  kind: DailyBriefOutputKind
  kindLabel: string
  time?: string
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

export type DailyBriefContent = {
  greeting: string
  subline?: string
  sections: DailyBriefSection[]
  outputFiles: DailyBriefOutputFile[]
}

const OUTPUT_FROM_CAPTURE: {
  kind: DailyBriefOutputKind
  kindLabel: string
  name: (title: string) => string
}[] = [
  { kind: "report", kindLabel: "Report", name: (t) => `${t} — recap report` },
  { kind: "audio", kindLabel: "Audio", name: (t) => `${t} — audio brief` },
  { kind: "flashcards", kindLabel: "Flashcards", name: (t) => `${t} — study deck` },
  { kind: "slides", kindLabel: "Slides", name: (t) => `${t} — slide deck` },
  { kind: "quiz", kindLabel: "Quiz", name: (t) => `${t} — review quiz` },
]

function buildOutputFilesFromUploads(
  uploads: { id: string; title: string; time?: string; source?: string }[]
): DailyBriefOutputFile[] {
  return uploads.map((u, i) => {
    const template = OUTPUT_FROM_CAPTURE[i % OUTPUT_FROM_CAPTURE.length]
    return {
      id: `out-${u.id}`,
      title: template.name(u.title),
      kind: template.kind,
      kindLabel: template.kindLabel,
      time: u.time,
    }
  })
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
}): DailyBriefContent {
  const name = firstName(input.displayName)
  const dayRef = input.weekdayLabel?.toLowerCase() ?? "today"

  const topItems: DailyBriefItem[] = []

  if (input.uploads?.length) {
    for (const u of input.uploads.slice(0, 3)) {
      topItems.push({
        id: u.id,
        lead: `Revisit **${u.title}**${u.time ? ` from ${u.time}` : ""}—it still carries the strongest thread from ${dayRef}.`,
        note:
          u.source === "Mindar Recorder"
            ? "Hardware capture tends to hold more verbatim detail; skim for the decision you left implicit."
            : undefined,
      })
    }
  } else {
    topItems.push({
      id: "headline",
      lead: input.headline.endsWith(".") ? input.headline : `${input.headline}.`,
      context: input.body,
    })
  }

  input.highlights.slice(0, 2).forEach((h, i) => {
    if (topItems.length >= 4) return
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
    outputFiles: buildOutputFilesFromUploads(input.uploads ?? []),
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

  const topItems: DailyBriefItem[] = input.uploads.length
    ? input.uploads.map((u) => ({
        id: u.id,
        lead: `**${u.title}**${u.time ? ` · ${u.time}` : ""}${u.source ? ` (${u.source})` : ""}.`,
        note:
          u.source === "Phone"
            ? "Phone memos cluster well—consider tagging this to a library before the thread goes cold."
            : undefined,
      }))
    : [
        {
          id: "quiet",
          lead: "No new captures landed—treat this as breathing room, not a miss.",
          context: input.summary,
        },
      ]

  if (input.uploads.length > 0 && topItems[0]) {
    topItems[0] = {
      ...topItems[0],
      context: input.summary,
    }
  }

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
    outputFiles: buildOutputFilesFromUploads(input.uploads),
  }
}
