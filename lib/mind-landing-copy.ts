/**
 * Landing page copy (English) — aligned with design mock & MIND_MARKETING_COPY_FULL.md
 */

/** Primary entry for the marketing site — web app demo */
export const LANDING_WEB_APP_HREF = "/web"

export const LANDING_SIGN_IN_HREF = "/sign-in"

export const MEDRIX_SCIENTIST_HREF = "https://scientist.medrixai.com/workspace"

export type LandingSolutionId = "research" | "learning" | "management"

export const LANDING_COPY = {
  brand: "Mindar",
  header: {
    product: { label: "Product", href: "#product" },
    solutions: {
      label: "Solutions",
      href: "#solutions",
      items: [
        {
          id: "research" as const,
          title: "Research",
          tagline: "Evidence you can cite",
          description:
            "Build libraries from papers, protocols, and lab notes. Mindar answers with passages linked to sources — then Studio turns synthesis into slides, reports, or figures.",
          bullets: [
            "Systematic reviews & methods drafts",
            "Single-library or cross-corpus Q&A",
            "Publication-ready Studio outputs",
          ],
          videoLabel: "Watch research workflow",
          poster: {
            src: "/images/systematic-review.jpg",
            alt: "Researcher reviewing literature on screen",
            objectPosition: "center 40%",
          },
        },
        {
          id: "learning" as const,
          title: "Learning",
          tagline: "Study smarter, not longer",
          description:
            "Subscribe to curated plaza libraries or build course packs. Flashcards, quizzes, and cited explanations stay grounded in the same materials you trust.",
          bullets: [
            "Exam prep with source-checked answers",
            "Plaza libraries by subject & level",
            "Flashcards & quizzes from your corpus",
          ],
          videoLabel: "Watch learning workflow",
          poster: {
            src: "/images/single-cell-atlas.jpg",
            alt: "Study materials and atlas visualizations",
            objectPosition: "center 35%",
          },
        },
        {
          id: "management" as const,
          title: "Management",
          tagline: "One brain for the team",
          description:
            "Shared libraries, permissions, and Mindar threads scoped to projects. Leadership gets traceable briefs without another siloed chatbot.",
          bullets: [
            "Team libraries with roles",
            "Meeting capture → shared knowledge",
            "Deliverables from the same sources",
          ],
          videoLabel: "Watch team workflow",
          poster: {
            src: "/images/grant-proposal.jpg",
            alt: "Team planning with documents and dashboards",
            objectPosition: "center 42%",
          },
        },
      ],
    },
    resources: {
      label: "Resources",
      href: "#resources",
    },
    help: {
      label: "Help",
      href: "#help",
    },
    signIn: "Sign in",
    cta: "Try web app",
  },
  plazaCarousel: {
    eyebrow: "Public knowledge plaza",
    title: "Subscribe to expert libraries — start asking in seconds",
    subtitle:
      "Curated public knowledge bases with scoped agents, real sources, and Studio outputs. Browse featured libraries below or explore the full plaza in the app.",
    cta: "Explore plaza",
    ctaSecondary: "Try web app",
  },
  featured: {
    title: "Built for how you actually work",
    subtitle:
      "Capture once, organize in libraries, ask with citations, and deliver — on web, with the same account everywhere.",
    items: [
      {
        title: "Library-grounded Q&A",
        subtitle: "Answers with citations — not generic chat",
        image: {
          src: "/images/figure-generation.jpg",
          alt: "Mindar chat with cited sources",
          objectPosition: "center 50%",
        },
        href: "#features",
      },
      {
        title: "Public knowledge plaza",
        subtitle: "Subscribe to ready-made expert libraries",
        image: {
          src: "/images/card-backgrounds.png",
          alt: "Public library covers on the plaza",
          objectPosition: "center 40%",
        },
        href: "#plaza",
      },
      {
        title: "Capture from anywhere",
        subtitle: "Web, files, and mobile — one library",
        image: {
          src: "/images/cards-new.png",
          alt: "Capture on web and mobile",
          objectPosition: "left 18% center",
        },
        href: "#capture",
      },
      {
        title: "AI notes",
        subtitle: "Write, polish, and file into your corpus",
        image: {
          src: "/images/publication-figures.jpg",
          alt: "AI-assisted notes editor",
          objectPosition: "center 55%",
        },
        href: "#notes",
      },
      {
        title: "Content Studio",
        subtitle: "Reports, slides, audio, and quizzes",
        image: {
          src: "/images/clinical-trial.jpg",
          alt: "Studio outputs from library sources",
          objectPosition: "center center",
        },
        href: "#product",
      },
      {
        title: "Team libraries",
        subtitle: "Shared brain with flexible permissions",
        image: {
          src: "/images/spatial-transcriptomics.jpg",
          alt: "Collaborative team workspace",
          objectPosition: "center center",
        },
        href: "#collab",
      },
    ],
  },
  helpSection: {
    title: "Help",
    subtitle: "Quick answers and step-by-step guides to get productive on day one.",
    faq: {
      title: "Common questions",
      items: [
        {
          q: "What is a public library on the plaza?",
          a: "A curated knowledge base published by a domain expert. Subscribe once to chat with its scoped agent and use the same sources in Studio.",
        },
        {
          q: "How is Mindar different from general AI chat?",
          a: "Replies are grounded in libraries you control or subscribe to, with citations back to the original passages.",
        },
        {
          q: "Can I use Mindar on mobile?",
          a: "Yes — capture and browse on mobile; the full workspace and Studio are optimized for web.",
        },
        {
          q: "Who can see my private libraries?",
          a: "Only you until you share with a team or publish to the plaza with explicit permissions.",
        },
      ],
    },
    guides: {
      title: "Operation guide",
      items: [
        { label: "Create your first library", href: "#capture" },
        { label: "Subscribe on the plaza", href: "#plaza" },
        { label: "Ask with citations", href: "#features" },
        { label: "Use Studio outputs", href: "#product" },
        { label: "Browse use cases", href: "#resources" },
        { label: "Open web app", href: LANDING_WEB_APP_HREF },
      ],
    },
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
    title: "Use cases",
    subtitle:
      "Pick a scenario — each playbook maps to real surfaces in the web app: Library, Mindar, and Studio.",
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
