/**
 * Landing page copy (English) — aligned with design mock & MIND_MARKETING_COPY_FULL.md
 */

/** Primary entry for the marketing site — web app demo */
export const LANDING_WEB_APP_HREF = "/web"

export const LANDING_SIGN_IN_HREF = "/sign-in"

export const MEDRIX_SCIENTIST_HREF = "https://scientist.medrixai.com/workspace"

export const LANDING_COPY = {
  brand: "Mindar",
  header: {
    nav: [
      { label: "Product", href: "#capture" },
      { label: "Solutions", href: "#use-cases" },
      { label: "Resources", href: "#plaza" },
    ],
    signIn: "Sign in",
    cta: "Try web app",
  },
  hero: {
    badge: "AI-powered knowledge management",
    title: "Mind Copilot,",
    titleLine2: "wisdom grows with your library",
    description:
      "An AI knowledge platform that helps you capture, organize, digest, share, and deliver — so every piece of knowledge creates value.",
    ctaPrimary: "Start in browser",
    ctaSecondary: "See how it works",
    socialProof: "Join knowledge workers who think smarter with Mindar",
    sidebar: ["Home", "Favorites", "Recent", "My library", "Projects", "Team space", "Mindar"],
    cards: [
      "Product requirements",
      "Competitive analysis",
      "User research notes",
      "Industry library",
      "Meeting notes",
      "Study notes",
    ],
  },
  team: {
    eyebrow: "Medrix research ecosystem",
    title: "Built by a team that lives in the lab and the library",
    description:
      "Mindar comes from Medrix — researchers and engineers who ship AI tools for real scientific workflows. We organize evidence the way teams actually work: sources you trust, dialogue you can cite, and deliverables you can publish.",
    scientistName: "Medrix Scientist",
    scientistTagline: "Accelerate your research — from hypothesis to publication, powered by AI",
    scientistDescription:
      "Our companion workspace for wet-lab and computational science: single-cell analysis, publication-ready writing, figures, clinical evidence, and reproducible code — on CPU or GPU, in one project.",
    scientistCta: "Explore Medrix Scientist",
    scientistHighlights: [
      "Single-cell & spatial workflows",
      "Journal-ready papers & methods",
      "Graphs & figure pipelines",
      "Clinical & systematic reviews",
    ],
  },
  capture: {
    title: "Capture knowledge fragments effortlessly",
    subtitle:
      "Import from the web, files, and mobile — or subscribe to curated libraries on the plaza. Content is parsed deeply so you can start fast.",
    features: [
      {
        title: "Web clipping",
        desc: "Save pages and articles to your library in one click.",
        icon: "globe" as const,
        tint: "bg-sky-50 text-sky-600",
      },
      {
        title: "File upload & parsing",
        desc: "PDF, Word, PPT, Excel, and more — interpreted for search and Q&A.",
        icon: "upload" as const,
        tint: "bg-emerald-50 text-emerald-600",
      },
      {
        title: "Capture on any device",
        desc: "Notes, voice, and photos on phone or web — same account, same library.",
        icon: "phone" as const,
        tint: "bg-violet-50 text-violet-600",
      },
    ],
    tableTitle: "My knowledge base",
    columns: ["Title", "Source", "Type", "Added"],
    rows: [
      ["Product weekly.pdf", "Upload", "PDF", "May 12"],
      ["Industry library", "Plaza", "Library", "May 10"],
      ["Meeting recording", "Mobile", "Audio", "May 9"],
      ["Competitive brief.docx", "Web", "Word", "May 8"],
    ],
  },
  qa: {
    title: "Precise Q&A from your knowledge base — Mindar delivers results",
    subtitle:
      "Answers are grounded in sources you trust, with citations back to the original text.",
    bullets: [
      "Understands your question in context",
      "Cited sources — reliable and traceable",
      "Multi-turn dialogue and complex tasks",
    ],
    question: "Who are our core target users?",
    answer:
      "Based on user research and interview notes in your library, core segments include:",
    answerPoints: [
      "Knowledge workers who manage many documents",
      "Teams that need one shared source of truth",
      "Learners building personal knowledge systems",
    ],
    citations: ["User research report.pdf", "Interview notes"],
  },
  notes: {
    title: "AI notes — a creative partner that gets you",
    subtitle:
      "Full AI-assisted writing: capture ideas, polish expression, and move finished notes into your library.",
    docTitle: "Product requirements",
    docBody:
      "This release focuses on library-grounded Q&A and the content factory. Mobile and web should share the same library and Mindar experience…",
    menu: ["Continue writing", "Polish", "Summarize", "Translate", "Expand ideas"],
    features: [
      {
        title: "Smart completion",
        desc: "Continue and complete from context in your notes.",
        tint: "bg-sky-100 text-sky-600",
      },
      {
        title: "Format & clarity",
        desc: "Improve structure and readability in one step.",
        tint: "bg-emerald-100 text-emerald-600",
      },
      {
        title: "Translate & polish",
        desc: "Multilingual drafts with tone you control.",
        tint: "bg-violet-100 text-violet-600",
      },
    ],
  },
  useCases: {
    title: "How you can use Mindar",
    subtitle:
      "Libraries on the plaza ship with scoped agents — subscribe, ask with citations, and deliver from Studio.",
  },
  collab: {
    sharedTitle: "Our shared brain",
    sharedBullets: [
      "Real-time collaboration — everyone stays on the same page",
      "Comments and discussions that improve the knowledge",
      "Version history so important changes are traceable",
    ],
    docTitle: "Q2 product plan",
    docSnippet:
      "Consensus this week: prioritize library Q&A and the content factory; Mindar and Studio share the same sources…",
    comment: "@team Updated research summary in the library.",
    permissionsTitle: "Flexible permissions",
    permissions: [
      { title: "Private", desc: "Personal — only you" },
      { title: "Team", desc: "Shared with your group" },
      { title: "Public", desc: "Publish or subscribe on the plaza" },
    ],
  },
  flow: {
    title: "Let knowledge flow",
    subtitle: "Start in the browser — same library, Mindar, and Studio on the web.",
    platforms: ["Web app", "Library", "Mindar", "Studio", "Team space"],
  },
  resources: {
    title: "Access massive professional knowledge — ready to use",
    subtitle: "Subscribe on the library plaza — no need to build from zero on day one.",
    cards: [
      { label: "Library templates", stat: "1,000+" },
      { label: "Industry reports", stat: "5,000+" },
      { label: "Study materials", stat: "10,000+" },
      { label: "Case studies", stat: "3,000+" },
      { label: "Dev docs", stat: "2,000+" },
      { label: "Community", stat: "Millions" },
    ],
  },
  footer: {
    title: "Start your knowledge journey in the browser",
    subtitle:
      "Open the web app — capture, organize, and ask Mindar with the same library on desktop.",
    cta: "Try web app now",
    links: ["About", "Terms", "Help", "Contact"],
    copyright: "© Mindar. All rights reserved.",
  },
} as const
