/** Knowledge scenarios for the agent plaza and default roster. */
export type AgentScenarioId = "learning" | "creation" | "office" | "life"

export type AgentScenarioTabId = "featured" | AgentScenarioId

/** What this agent is best at — shown as chips in contacts, plaza, and chat. */
export type AgentCapabilityProfile = {
  /** One-line focus under the name */
  tagline: string
  /** 3–4 short strength labels */
  capabilities: string[]
  /**
   * Team Knowledge only — spans product, content, engineering, and design
   * like ima’s cross-functional team library demo.
   */
  multiRole?: boolean
  teamRoles?: string[]
  /** Extra line for plaza / empty chat (optional) */
  strengthDetail?: string
}

export type MindAgent = {
  id: number
  name: string
  description: string
  avatar: string
  color: string
  scenario: AgentScenarioId
  chatCount?: string
  author?: string
  isOfficial?: boolean
  /** Short line under the name in the contacts list */
  contactPreview?: string
  profile: AgentCapabilityProfile
}

export const MINDAR_COPILOT_PROFILE: AgentCapabilityProfile = {
  tagline: "Copilot across libraries, notes, and deliverables",
  capabilities: ["@ Any library", "Cross-source answers", "Studio handoff"],
  strengthDetail: "Default entry when you need one thread tied to everything you’ve captured.",
}

export const AGENT_SCENARIO_TABS: { id: AgentScenarioTabId; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "learning", label: "Learning" },
  { id: "creation", label: "Creation" },
  { id: "office", label: "Office" },
  { id: "life", label: "Life" },
]

/** Six scenario agents + Mindar (id 0) = default contact roster. */
export const MINDAR_DEFAULT_SCENARIO_AGENTS: MindAgent[] = [
  {
    id: 201,
    name: "Research Partner",
    description:
      "Synthesize PDFs, reports, meetings, and interviews into briefs, comparisons, and decision-ready notes.",
    avatar: "🔍",
    color: "from-sky-400 to-zinc-600",
    scenario: "office",
    isOfficial: true,
    author: "Mindar",
    chatCount: "12.4M chats",
    contactPreview: "Turn sources in your library into clear research briefs",
    profile: {
      tagline: "Deep reads → decision-ready briefs",
      capabilities: ["Source synthesis", "Compare & contrast", "Cited summaries", "Industry scans"],
      strengthDetail: "Best when you’ve imported reports, policies, or interview notes and need a grounded take—not generic web answers.",
    },
  },
  {
    id: 202,
    name: "Meeting Recap",
    description:
      "Pull decisions, owners, and next steps from recordings and meeting notes—ready to share.",
    avatar: "📋",
    color: "from-zinc-500 to-stone-600",
    scenario: "office",
    isOfficial: true,
    author: "Mindar",
    chatCount: "18.1M chats",
    contactPreview: "Decisions, action items, and follow-ups from your meetings",
    profile: {
      tagline: "Recordings → decisions & owners",
      capabilities: ["Action items", "Decision log", "Speaker threads", "Follow-up drafts"],
      strengthDetail: "Optimized for voice captures and meeting notes—surfaces who owns what and what’s still open.",
    },
  },
  {
    id: 203,
    name: "Study & Learn",
    description:
      "Summarize courseware and readings, build mind maps, flashcards, and review outlines from your notes.",
    avatar: "📚",
    color: "from-amber-400 to-zinc-600",
    scenario: "learning",
    isOfficial: true,
    author: "Mindar",
    chatCount: "15.8M chats",
    contactPreview: "Mind maps, flashcards, and study guides from your materials",
    profile: {
      tagline: "Courseware → maps, cards & review",
      capabilities: ["Key-point summaries", "Mind maps", "Flashcards", "Exam-style Q&A"],
      strengthDetail: "Built for lectures, readings, and revision—turns dense material into structures you can rehearse.",
    },
  },
  {
    id: 204,
    name: "Writing & Docs",
    description:
      "Draft and polish emails, memos, proposals, and long-form docs grounded in your knowledge base.",
    avatar: "✍️",
    color: "from-zinc-400 to-stone-600",
    scenario: "creation",
    isOfficial: true,
    author: "Mindar",
    chatCount: "14.2M chats",
    contactPreview: "Polish and expand business writing with your sources",
    profile: {
      tagline: "Grounded drafts & polished docs",
      capabilities: ["Email & memo polish", "Proposal outlines", "Tone matching", "Source-backed edits"],
      strengthDetail: "Use when the deliverable is words—emails, memos, proposals—anchored to what’s already in your library.",
    },
  },
  {
    id: 205,
    name: "Content Studio",
    description:
      "Turn topics and library clips into outlines, scripts, posts, and newsletters for creators and marketers.",
    avatar: "🎬",
    color: "from-violet-400 to-zinc-600",
    scenario: "creation",
    isOfficial: true,
    author: "Mindar",
    chatCount: "9.6M chats",
    contactPreview: "Outlines, scripts, and social posts from your research",
    profile: {
      tagline: "Research clips → publishable content",
      capabilities: ["Content outlines", "Scripts & hooks", "Newsletter drafts", "Social post variants"],
      strengthDetail: "Starts from topics and saved clips—strong on structure and creative angles, not just proofreading.",
    },
  },
  {
    id: 206,
    name: "Team Knowledge",
    description:
      "Answer from shared team libraries—PRDs, interviews, release logs, and design specs in one thread.",
    avatar: "👥",
    color: "from-teal-400 to-zinc-600",
    scenario: "office",
    isOfficial: true,
    author: "Mindar",
    chatCount: "7.3M chats",
    contactPreview: "Multi-hat across product, content, engineering & design",
    profile: {
      tagline: "Multi-hat teammate",
      capabilities: ["PRD & research Q&A", "User interviews", "Release logs", "Design specs"],
      multiRole: true,
      teamRoles: ["Product", "Content", "Engineering", "Design"],
      strengthDetail: "one thread for your whole team stack, no agent-hopping",
    },
  },
]

/** Plaza-only agents aligned to IMA-style role scenarios (大学生 / 教师 / 分析师 / 律师 / 企政 / 创作者). */
export const AGENT_PLAZA_EXTRAS: MindAgent[] = [
  {
    id: 207,
    name: "Course Companion",
    description:
      "Import courseware and class notes—get key-point summaries, mind maps, and review plans grounded in your materials.",
    avatar: "🎓",
    color: "from-amber-400 to-orange-500",
    scenario: "learning",
    chatCount: "11.2M chats",
    author: "Mindar",
    isOfficial: true,
    contactPreview: "Summaries, mind maps, and review from your course library",
    profile: {
      tagline: "Courseware → summaries & review maps",
      capabilities: ["Key-point summaries", "Mind maps", "Exam review plans", "Audio review briefs"],
      strengthDetail: "Built for students—turns lectures, slides, and readings into structures you can rehearse before exams.",
    },
  },
  {
    id: 208,
    name: "Lesson Planner",
    description:
      "Pull from your teaching library to draft lesson plans, slides, and study guides—grounded in what you already saved.",
    avatar: "👩‍🏫",
    color: "from-rose-400 to-zinc-600",
    scenario: "learning",
    chatCount: "5.8M chats",
    author: "Mindar",
    isOfficial: true,
    contactPreview: "Lesson plans and slides from your teaching materials",
    profile: {
      tagline: "Teaching library → plans & slides",
      capabilities: ["Lesson outlines", "Slide talking points", "Study guides", "Q&A for students"],
      strengthDetail: "For teachers and TAs—reuses your accumulated materials instead of starting from a blank deck.",
    },
  },
  {
    id: 1,
    name: "Study buddy",
    description: "Step-by-step help across subjects—explain concepts, drill practice, and clear homework blocks.",
    avatar: "📐",
    color: "from-zinc-400 to-zinc-600",
    scenario: "learning",
    chatCount: "23.2M chats",
    author: "EduTeam",
    isOfficial: true,
    contactPreview: "Homework help with hints, not just final answers",
    profile: {
      tagline: "Homework help across subjects",
      capabilities: ["Step-by-step hints", "Concept explainers", "Practice drills"],
      strengthDetail: "Best for problem sets and concept checks when you want reasoning, not a copy-paste answer.",
    },
  },
  {
    id: 3,
    name: "Owen · English tutor",
    description: "Practice conversation, grammar, and pronunciation with a patient English coach.",
    avatar: "🗣️",
    color: "from-zinc-500 to-stone-500",
    scenario: "learning",
    chatCount: "19.7M chats",
    author: "Official",
    isOfficial: true,
    contactPreview: "Speaking, grammar, and writing practice in English",
    profile: {
      tagline: "Conversation-first English coach",
      capabilities: ["Speaking practice", "Grammar fixes", "Pronunciation tips"],
    },
  },
  {
    id: 211,
    name: "Script & Newsletter",
    description:
      "Turn saved clips and topic notes into newsletters, scripts, and post variants—creative angles from your library.",
    avatar: "📰",
    color: "from-fuchsia-400 to-violet-600",
    scenario: "creation",
    chatCount: "8.4M chats",
    author: "Mindar",
    isOfficial: true,
    contactPreview: "Newsletters and scripts from your research clips",
    profile: {
      tagline: "Clips → newsletters & scripts",
      capabilities: ["Newsletter drafts", "Video scripts", "Hook variants", "Series outlines"],
      strengthDetail: "For creators and marketers who already collect sources—strong on serial content, not generic proofreading.",
    },
  },
  {
    id: 4,
    name: "Quick Copy Polish",
    description: "Shorten, sharpen, and retone emails, posts, and captions while keeping your original structure.",
    avatar: "✨",
    color: "from-zinc-300 to-stone-500",
    scenario: "creation",
    chatCount: "13.5M chats",
    author: "Official",
    isOfficial: true,
    contactPreview: "Fast polish for short copy and captions",
    profile: {
      tagline: "Short copy, faster polish",
      capabilities: ["Rewrite & shorten", "Tone shifts", "Headline options", "Caption variants"],
    },
  },
  {
    id: 209,
    name: "Legal Case Map",
    description:
      "Organize case facts, statutes, and filings—surface timelines, disputes, and draft litigation materials from your library.",
    avatar: "⚖️",
    color: "from-slate-500 to-zinc-700",
    scenario: "office",
    chatCount: "4.2M chats",
    author: "Mindar",
    isOfficial: true,
    contactPreview: "Case timelines and draft filings from your case library",
    profile: {
      tagline: "Facts, statutes & filing drafts",
      capabilities: ["Case timelines", "Issue spotting", "Dispute summaries", "Draft pleadings"],
      strengthDetail: "For counsel who keep matter files in a library—grounds answers in your uploads, not generic legal chat.",
    },
  },
  {
    id: 210,
    name: "Policy & Gov Docs",
    description:
      "Interpret policy circulars, meeting notes, and office memos—draft briefs and replies grounded in official wording.",
    avatar: "🏛️",
    color: "from-stone-500 to-teal-700",
    scenario: "office",
    chatCount: "5.1M chats",
    author: "Mindar",
    isOfficial: true,
    contactPreview: "Policy reads and official-document drafts",
    profile: {
      tagline: "Policy files → briefs & replies",
      capabilities: ["Policy interpretation", "Memo drafts", "Meeting briefs", "FAQ for stakeholders"],
      strengthDetail: "For government and enterprise staff—reads the exact policy language you imported before suggesting wording.",
    },
  },
  {
    id: 7,
    name: "Industry Analyst",
    description:
      "Synthesize interviews, market scans, and competitor notes into decision-ready industry briefs with citations.",
    avatar: "📈",
    color: "from-slate-500 to-zinc-700",
    scenario: "office",
    chatCount: "6.1M chats",
    author: "Mindar",
    isOfficial: true,
    contactPreview: "Industry briefs from interviews and market libraries",
    profile: {
      tagline: "Interviews → industry briefs",
      capabilities: ["Competitive scans", "Expert interview synthesis", "Risk flags", "Executive summaries"],
      strengthDetail: "Matches the analyst workflow—multiple source types in one library, one grounded thread for the readout.",
    },
  },
  {
    id: 2,
    name: "Chatty Ning",
    description: "A friendly companion to reflect on your day and unwind—light, supportive conversation.",
    avatar: "💬",
    color: "from-stone-400 to-zinc-500",
    scenario: "life",
    chatCount: "20.0M chats",
    author: "Official",
    isOfficial: true,
    contactPreview: "Light daily reflection and supportive chat",
    profile: {
      tagline: "Light, supportive check-ins",
      capabilities: ["Daily reflection", "Gentle prompts", "Low-stakes chat"],
    },
  },
  {
    id: 5,
    name: "Book of answers",
    description: "When you’re stuck on small decisions, open a page for a thoughtful nudge.",
    avatar: "📖",
    color: "from-stone-500 to-zinc-600",
    scenario: "life",
    chatCount: "15.6M chats",
    author: "MossOak",
    contactPreview: "Pros, cons, and perspective on everyday choices",
    profile: {
      tagline: "Small decisions, quick nudges",
      capabilities: ["Pros & cons", "Perspective prompts", "Short reads"],
    },
  },
]

/** Curated agent order per plaza tab (defaults + scenario extras). */
export const PLAZA_TAB_AGENT_IDS: Record<AgentScenarioTabId, number[]> = {
  featured: [203, 205, 201, 202, 206, 207],
  learning: [203, 207, 208, 1, 3],
  creation: [205, 204, 211, 4],
  office: [206, 201, 202, 210, 209, 7],
  life: [2, 5],
}

/** Optional one-line hint under plaza scenario tabs. */
export const PLAZA_TAB_HINTS: Partial<Record<AgentScenarioTabId, string>> = {
  featured: "Official agents across learning, creation, office, and life—each grounded on your libraries.",
  learning: "Students & teachers—courseware, review maps, lesson plans, and language practice.",
  creation: "Writers & creators—long-form docs, scripts, newsletters, and quick copy polish.",
  office: "Research, meetings, policy, legal work, and team libraries in one place.",
  life: "Reflection, small decisions, and low-stakes conversation.",
}

export const AGENT_PLAZA_ALL: MindAgent[] = [
  ...MINDAR_DEFAULT_SCENARIO_AGENTS,
  ...AGENT_PLAZA_EXTRAS,
]

const CATALOG_BY_ID = new Map(AGENT_PLAZA_ALL.map((a) => [a.id, a]))

export function getMindAgentProfile(agentId: number): AgentCapabilityProfile | undefined {
  if (agentId === 0) return MINDAR_COPILOT_PROFILE
  return CATALOG_BY_ID.get(agentId)?.profile
}

export function getMindAgentCatalog(agentId: number): MindAgent | undefined {
  return CATALOG_BY_ID.get(agentId)
}

export function agentsForPlazaTab(tab: AgentScenarioTabId): MindAgent[] {
  const ids = PLAZA_TAB_AGENT_IDS[tab] ?? []
  return ids
    .map((id) => CATALOG_BY_ID.get(id))
    .filter((agent): agent is MindAgent => agent != null)
}

export function getPlazaTabHint(tab: AgentScenarioTabId): string | undefined {
  return PLAZA_TAB_HINTS[tab]
}

export function scenarioLabel(id: AgentScenarioId): string {
  return AGENT_SCENARIO_TABS.find((t) => t.id === id)?.label ?? id
}
