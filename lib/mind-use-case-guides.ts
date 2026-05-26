/**
 * Use-case playbooks — steps tied to real web / product surfaces.
 */

export type UseCaseScene = "study" | "plaza" | "meeting" | "deliver" | "inspire" | "personal"

export type UseCaseGuideStep = {
  where: string
  action: string
  detail?: string
}

export type UseCaseGuide = {
  id: string
  title: string
  desc: string
  summary: string
  tint: string
  scene: UseCaseScene
  outcome: string
  starterPrompt: string
  steps: UseCaseGuideStep[]
}

export const USE_CASE_SECTION = {
  title: "How you can use Mindar",
  subtitle:
    "Each scenario ties a knowledge library to a scoped Mindar agent — subscribe on the plaza or build your own, then ask with citations.",
} as const

export const USE_CASE_GUIDES: UseCaseGuide[] = [
  {
    id: "study",
    title: "Exam prep",
    desc: "Course library + cited Q&A, flashcards, and quizzes from the same sources.",
    summary:
      "Import syllabi and papers into a course library, ask Mindar with sources checked, then run Studio flashcards or quizzes before exams.",
    tint: "from-sky-50/90 to-white/40",
    scene: "study",
    outcome: "One library per course with traceable answers and review artifacts.",
    starterPrompt:
      "From my course library only: summarize the three topics I'm weakest on and generate five practice questions with short answers.",
    steps: [
      {
        where: "Web · Library",
        action: "Create or open a library named after your course.",
      },
      {
        where: "Library · upload",
        action: "Add slides, PDFs, and readings; wait until items are searchable.",
      },
      {
        where: "Open workspace",
        action: "Open the notebook view — check Sources on the left.",
      },
      {
        where: "Workspace · Ask",
        action: "Ask focused questions; expand citations to verify passages.",
      },
      {
        where: "Studio",
        action: "Generate Flashcards or Quiz for the same topic.",
      },
      {
        where: "Agent · @",
        action: "Optional: continue on Agent home with @ set to this library.",
      },
    ],
  },
  {
    id: "plaza-agent",
    title: "Plaza library + agent",
    desc: "Subscribe to a ready-made library and chat with its scoped expert agent.",
    summary:
      "Square hosts libraries that ship with domain skills and context — subscribe once, then open the library's agent so answers stay grounded in that pack (not generic chat).",
    tint: "from-violet-50/90 to-white/40",
    scene: "plaza",
    outcome: "High-quality answers from a curated corpus without building a library from scratch.",
    starterPrompt:
      "Using only the subscribed Middle school history library: explain causes of the Opium War in bullet points and cite the source for each point.",
    steps: [
      {
        where: "Web · Square",
        action: "Browse plaza libraries — filter by Education, Work, Tech, etc.",
        detail: "Pick a pack that matches your job (e.g. history essentials, product research, compliance FAQ).",
      },
      {
        where: "Library card · Subscribe",
        action: "Subscribe — the library appears under Library → Subscribed.",
      },
      {
        where: "Library · Open workspace or Agent",
        action: "Open the library workspace, or launch chat scoped to this library.",
        detail: "Prefer the library's dedicated agent when shown — it carries the pack's skills and tone.",
      },
      {
        where: "Composer · @",
        action: "Confirm @ points at this library (not All libraries).",
        detail: "Answers should cite items inside the subscribed pack only.",
      },
      {
        where: "Agent home",
        action: "Reuse starter prompts from the guide panel for common questions.",
      },
      {
        where: "Studio (optional)",
        action: "Turn a cited answer into a Report or Slides deck from the same sources.",
      },
    ],
  },
  {
    id: "meeting",
    title: "Meetings & decisions",
    desc: "Drop notes into one work library — recap meetings and list owners in minutes.",
    summary:
      "Centralize meeting notes and reference docs in a single work library, then ask Mindar for action items, risks, and executive summaries with citations — no separate doc hunt.",
    tint: "from-orange-50/90 to-white/40",
    scene: "meeting",
    outcome: "Faster weekly recaps and decision logs tied to your actual notes.",
    starterPrompt:
      "From my work library only: list decisions and owners from the last three meeting notes, plus open risks mentioned but not assigned.",
    steps: [
      {
        where: "Web · Library · My or Team",
        action: "Open your work library (e.g. “Work — Q2”).",
      },
      {
        where: "Upload",
        action: "Add this week's meeting notes (doc, PDF, or paste).",
      },
      {
        where: "Workspace · Sources",
        action: "Select only the notes you want in context.",
      },
      {
        where: "Center · Ask",
        action: "Ask for action items, deltas vs last week, or a one-page briefing.",
      },
      {
        where: "Agent",
        action: "For ad-hoc follow-ups, New chat with @ → this library.",
      },
      {
        where: "Studio · Report",
        action: "Generate a Briefing doc to email stakeholders.",
      },
    ],
  },
  {
    id: "deliver",
    title: "Ship stakeholder updates",
    desc: "Team library for specs and research — slides or reports from the same sources.",
    summary:
      "Keep PRDs, research, and decision logs in one team library, align in grounded chat, then deliver slides or reports from Studio without re-exporting context.",
    tint: "from-emerald-50/90 to-white/40",
    scene: "deliver",
    outcome: "Shared project truth with permissioned access and deliverables from one corpus.",
    starterPrompt:
      "From our MVP project library: what blocks release according to specs and meeting notes, and draft a 5-slide executive update.",
    steps: [
      {
        where: "Library · Team",
        action: "Open the project library — confirm Team permissions.",
      },
      {
        where: "Hub",
        action: "Upload PRDs, competitive notes, and decision logs.",
      },
      {
        where: "Workspace · Overview",
        action: "Skim auto overview to see how sources connect.",
      },
      {
        where: "Ask",
        action: "Query cross-doc risks, scope changes, or milestone slips.",
      },
      {
        where: "Studio · Slides or Report",
        action: "Generate stakeholder update — same sources as chat.",
      },
      {
        where: "Share",
        action: "Share library link so reviewers ask Mindar instead of pinging you.",
      },
    ],
  },
  {
    id: "inspire",
    title: "Capture & expand ideas",
    desc: "Clip a spark into a library, then brainstorm with Mindar the same day.",
    summary:
      "Capture ideas in Notes or upload, file them in a lightweight library, and use Agent to stress-test or structure them — factory chips for quick outputs.",
    tint: "from-amber-50/90 to-white/40",
    scene: "inspire",
    outcome: "Ideas become searchable sources with AI expansion paths.",
    starterPrompt:
      "I added a rough product idea today. Expand it into three experiments with pros, cons, and what to validate first.",
    steps: [
      {
        where: "Notes or upload",
        action: "Capture the idea immediately — text, voice, or clip.",
      },
      {
        where: "Library · Ideas",
        action: "Move the capture into a small personal library.",
      },
      {
        where: "Agent home",
        action: "Paste the rough thought; use factory chips if you want a deck or brief.",
      },
      {
        where: "@ menu",
        action: "Link the Ideas library so replies stay grounded.",
      },
      {
        where: "Chat",
        action: "Ask Mindar to brainstorm, rank, or outline next steps.",
      },
    ],
  },
  {
    id: "personal",
    title: "Long-term personal corpus",
    desc: "Subscribe on the plaza, add your imports, and ask across months of learning.",
    summary:
      "Combine plaza subscriptions with a personal library, use Me insights for reflection, and ask Agent longitudinal questions over everything you saved.",
    tint: "from-teal-50/90 to-white/40",
    scene: "personal",
    outcome: "A compounding personal knowledge base — not a folder of dead files.",
    starterPrompt:
      "Across my personal and subscribed libraries: what themes did I explore most this month and what should I read next?",
    steps: [
      {
        where: "Square",
        action: "Subscribe to 1–2 plaza packs that match your interests.",
      },
      {
        where: "Library · My",
        action: "Create “Personal” for your own articles, PDFs, and audio.",
      },
      {
        where: "Workspace · Graph",
        action: "When available, open the graph to see topic links.",
      },
      {
        where: "Me · insights",
        action: "Review capture diary and run a monthly AI insight.",
      },
      {
        where: "Agent · @ → All libraries",
        action: "Ask longitudinal questions across subscribed + personal scope.",
      },
    ],
  },
]

export function getUseCaseGuide(id: string) {
  return USE_CASE_GUIDES.find((g) => g.id === id)
}
