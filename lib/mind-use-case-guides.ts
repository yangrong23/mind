/**
 * Use-case playbooks — steps tied to real web / product surfaces.
 */

export type UseCaseScene = "study" | "work" | "project" | "inspire" | "team" | "personal"

export type UseCaseGuideStep = {
  /** Where in the product (matches visible UI labels) */
  where: string
  /** What to do there */
  action: string
  /** Optional detail or what you should see */
  detail?: string
}

export type UseCaseGuide = {
  id: string
  title: string
  /** Card teaser */
  desc: string
  /** Expanded intro in the guide panel */
  summary: string
  tint: string
  scene: UseCaseScene
  /** What success looks like */
  outcome: string
  starterPrompt: string
  steps: UseCaseGuideStep[]
}

export const USE_CASE_SECTION = {
  title: "How you can use Mindar",
  subtitle: "Pick a scenario — open the step-by-step guide tied to the real web workspace.",
} as const

export const USE_CASE_GUIDES: UseCaseGuide[] = [
  {
    id: "study",
    title: "Study notes",
    desc: "Turn lectures and papers into a library you can quiz and summarize.",
    summary:
      "Import course PDFs and clips into a personal library, ask Mindar to explain concepts, then generate flashcards or a study guide from the same sources.",
    tint: "from-sky-50/90 to-white/40",
    scene: "study",
    outcome: "One library per course with cited answers and Studio outputs you can review before exams.",
    starterPrompt:
      "I'm preparing for an exam. Summarize the key concepts from my course library and list five practice questions with brief answers.",
    steps: [
      {
        where: "Web · left rail → Library",
        action: "Create or select a library named after your course (e.g. “Biochemistry Spring”).",
        detail: "The left sidebar lists My / Team / Subscribed sections — pick an empty slot or use + on a section header.",
      },
      {
        where: "Library · header actions",
        action: "Upload syllabi, slides, and readings (PDF, Word, or web clip).",
        detail: "Files appear in the library hub list; wait for parsing so they become searchable sources.",
      },
      {
        where: "Library · Open workspace",
        action: "Open the notebook workspace for that library.",
        detail: "You should see three columns: Sources (left), Overview & chat (center), Studio (right).",
      },
      {
        where: "Workspace · Sources panel",
        action: "Check the sources you want in context for this session.",
        detail: "Selected count shows at the top of the center column (“N sources in context”).",
      },
      {
        where: "Workspace · center · Ask bar",
        action: "Ask a focused question (definitions, compare two readings, outline a chapter).",
        detail: "Answers cite your sources — expand citations to jump to the original passage.",
      },
      {
        where: "Workspace · Studio (right)",
        action: "Run Flashcards or Quiz with your topic filled in.",
        detail: "Pick a format tile → set count/difficulty → Generate. Completed runs appear under the grid.",
      },
      {
        where: "Web · left rail → Agent",
        action: "Optional: continue on the Agent home with the same question.",
        detail: "Use @ on the composer to link the same library before sending.",
      },
    ],
  },
  {
    id: "work",
    title: "Work documents",
    desc: "Keep reports, meetings, and research in one queryable place.",
    summary:
      "Centralize meeting notes and reference docs, then use library-grounded chat for drafts and Studio for client-ready reports or slide outlines.",
    tint: "from-orange-50/90 to-white/40",
    scene: "work",
    outcome: "Faster first drafts and meeting recaps with traceable citations to your own files.",
    starterPrompt:
      "Draft a one-page executive summary of this week's meetings and open risks, using only my work library sources.",
    steps: [
      {
        where: "Web · left rail → Library",
        action: "Select your work library (or create “Work — Q2”).",
      },
      {
        where: "Library detail · right pane",
        action: "Upload new meeting notes or drop in email exports.",
        detail: "Use search in the library header to find an older doc before adding duplicates.",
      },
      {
        where: "Open workspace",
        action: "Enter the three-column notebook view for that library.",
      },
      {
        where: "Center · dialogue",
        action: "Ask Mindar to compare versions, extract action items, or draft a section.",
        detail: "Try: “List decisions and owners from the last three meeting notes.”",
      },
      {
        where: "Studio · Report",
        action: "Generate a Report — choose Briefing doc or Custom format.",
        detail: "Set page length, then describe tone (internal vs. client-facing) in the topic field.",
      },
      {
        where: "Agent · New chat (sidebar)",
        action: "For ad-hoc questions, open Agent → New chat and attach library scope with @.",
        detail: "Agent sidebar shows Knowledge Base / Mindar Agent links and recent threads.",
      },
    ],
  },
  {
    id: "project",
    title: "Project management",
    desc: "One library per initiative — the whole team asks the same sources.",
    summary:
      "Use a team library for specs and research, align in chat, and ship deliverables from Studio without copying context into separate tools.",
    tint: "from-emerald-50/90 to-white/40",
    scene: "project",
    outcome: "Shared truth for the project with permissions you control (private, team, or plaza).",
    starterPrompt:
      "What are the open dependencies blocking our MVP, based on specs and meeting notes in the project library?",
    steps: [
      {
        where: "Web · left rail → Library",
        action: "Under Team, open the project library (or create one with +).",
        detail: "Team libraries show member count and last update in the list row.",
      },
      {
        where: "Library · overflow · Permissions",
        action: "Confirm team access (Team) vs. personal draft (Private).",
        detail: "Shared brains work best when everyone can read the same hub items.",
      },
      {
        where: "Add sources",
        action: "Upload PRDs, competitive notes, and decision logs to the hub.",
      },
      {
        where: "Workspace · Overview",
        action: "Read the auto overview to see how sources connect before asking questions.",
      },
      {
        where: "Center chat",
        action: "Ask cross-document questions (“timeline slip risks”, “scope changes since v2”).",
      },
      {
        where: "Studio · Slides or Report",
        action: "Generate a stakeholder update — slides for review meetings, report for email.",
      },
      {
        where: "Share",
        action: "Use Share on the library header to send a link (demo shows toast).",
      },
    ],
  },
  {
    id: "inspire",
    title: "Inspiration",
    desc: "Capture ideas fast — voice, web clip, then refine with Mindar.",
    summary:
      "When a thought appears, clip or record it, tag it to a lightweight library, and let Agent help you expand or structure it later.",
    tint: "from-amber-50/90 to-white/40",
    scene: "inspire",
    outcome: "Ideas are never lost; each spark can grow into a note or library item with AI help.",
    starterPrompt:
      "I captured a rough idea today. Help me expand it into three concrete product experiments with pros and cons.",
    steps: [
      {
        where: "Mobile · Notes tab (or web upload)",
        action: "Capture the idea immediately — text note, voice memo, or photo.",
        detail: "On web, use Library upload or Agent composer attachment (upload icon).",
      },
      {
        where: "Web · Library → “Ideas” library",
        action: "File the capture into a small personal library so it is searchable.",
      },
      {
        where: "Web · left rail → Agent",
        action: "Open Mindar home — paste or voice your rough thought in the composer.",
        detail: "Content factory chips sit directly under the input for quick Studio runs.",
      },
      {
        where: "Composer · @ menu",
        action: "Link Auto or a specific library so answers stay grounded.",
      },
      {
        where: "Agent chat",
        action: "Ask Mindar to brainstorm, stress-test, or outline next steps.",
      },
      {
        where: "Save to library (message actions)",
        action: "When a reply is useful, save it back to the library from chat actions (demo).",
      },
    ],
  },
  {
    id: "team",
    title: "Team wiki",
    desc: "Ask the library before you ask the team again.",
    summary:
      "Build a team wiki library with policies and how-tos; newcomers query Mindar first and cite the exact internal doc.",
    tint: "from-violet-50/90 to-white/40",
    scene: "team",
    outcome: "Fewer repeated questions in chat channels — answers link to canonical internal pages.",
    starterPrompt:
      "How do we request production access? Answer only from our team wiki library and cite the source.",
    steps: [
      {
        where: "Web · left rail → Library · Team",
        action: "Open the team wiki library (create if missing).",
      },
      {
        where: "Library settings",
        action: "Set description and cover so teammates recognize the wiki.",
      },
      {
        where: "Populate hub",
        action: "Upload onboarding docs, runbooks, and FAQ exports.",
        detail: "Prefer one item per policy so citations stay precise.",
      },
      {
        where: "Workspace",
        action: "Verify sources are checked in the left Sources column.",
      },
      {
        where: "Center · Ask",
        action: "Encourage questions like “What is our review process for PRs?”",
        detail: "Share the library link from the header Share button.",
      },
      {
        where: "Agent · @ → All libraries",
        action: "For cross-team questions, use Agent with @ set to All libraries or pick multiple.",
      },
      {
        where: "Plaza (optional)",
        action: "Subscribe to a public template library from Square if you need a starter wiki pack.",
        detail: "Left rail → Square browses subscribe-ready libraries.",
      },
    ],
  },
  {
    id: "personal",
    title: "Personal library",
    desc: "Subscribe, import, and grow a long-term knowledge base.",
    summary:
      "Start from the plaza, subscribe to curated packs, merge with your imports, and use Me + Agent to see patterns over time.",
    tint: "from-teal-50/90 to-white/40",
    scene: "personal",
    outcome: "A durable personal corpus that compounds — not a folder of dead files.",
    starterPrompt:
      "Based on everything I added this month, what themes am I exploring most and what should I read next?",
    steps: [
      {
        where: "Web · left rail → Square",
        action: "Browse plaza libraries and subscribe to templates that match your interests.",
        detail: "Subscribed libraries appear under Library → Subscribed.",
      },
      {
        where: "Library · My",
        action: "Create “Personal — 2026” for your own imports alongside subscriptions.",
      },
      {
        where: "Import",
        action: "Add articles (web), PDFs, and audio over time — same hub list for all types.",
      },
      {
        where: "Workspace · Graph (when available)",
        action: "Open the knowledge graph view to see how topics connect.",
        detail: "From library workspace navigation in the center column header area.",
      },
      {
        where: "Me tab · Capture diary",
        action: "On mobile/web Me, review daily capture summaries (short titles per day).",
        detail: "Tap a day for timeline + AI summary of what you collected.",
      },
      {
        where: "Me · AI insights",
        action: "Run a perspective insight on notes + libraries for monthly reflection.",
      },
      {
        where: "Agent home",
        action: "Ask longitudinal questions (“what did I learn about X this quarter?”).",
      },
    ],
  },
]

export function getUseCaseGuide(id: string) {
  return USE_CASE_GUIDES.find((g) => g.id === id)
}
