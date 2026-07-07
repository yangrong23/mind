export type AgentExamplePrompt = {
  id: string
  label: string
  prompt: string
}

const BY_AGENT_ID: Record<number, AgentExamplePrompt[]> = {
  0: [
    { id: "sum", label: "Summarize my libraries", prompt: "Summarize the most important updates across my libraries this week." },
    { id: "plan", label: "What should I do next?", prompt: "Based on my notes and libraries, what are the top three next actions?" },
    { id: "report", label: "Draft a brief", prompt: "Draft a one-page brief from my latest meeting notes and product library." },
  ],
  201: [
    { id: "brief", label: "Research brief", prompt: "Turn my latest research uploads into a decision-ready brief with citations." },
    { id: "compare", label: "Compare sources", prompt: "Compare the two main reports in my library and list agreements and conflicts." },
    { id: "scan", label: "Industry scan", prompt: "What industry trends show up across my saved sources this month?" },
  ],
  202: [
    { id: "actions", label: "My action items", prompt: "List my action items from the latest meeting with owners and due dates." },
    { id: "decisions", label: "Key decisions", prompt: "What decisions were made in my last three meetings?" },
    { id: "follow", label: "Follow-up email", prompt: "Draft a follow-up email summarizing decisions and open items from yesterday's call." },
  ],
  203: [
    { id: "map", label: "Mind map outline", prompt: "Build a mind map outline from my study notes for the next exam." },
    { id: "cards", label: "Flashcard set", prompt: "Create flashcard-style Q&A from the densest pages in my study library." },
    { id: "review", label: "Quick review", prompt: "Give me a 10-minute review plan based on what I studied last week." },
  ],
  204: [
    { id: "polish", label: "Polish this draft", prompt: "Polish my latest memo for clarity and a professional tone, keeping the same structure." },
    { id: "email", label: "Email version", prompt: "Turn my notes into a concise email for stakeholders." },
    { id: "proposal", label: "Proposal outline", prompt: "Outline a one-page proposal grounded in my product library sources." },
  ],
  205: [
    { id: "outline", label: "Content outline", prompt: "Create a content outline from my saved clips and research notes." },
    { id: "script", label: "Short script", prompt: "Write a 60-second script hook based on my topic notes." },
    { id: "posts", label: "Social variants", prompt: "Draft three social post variants from the same source material." },
  ],
  206: [
    { id: "prd", label: "PRD questions", prompt: "What open questions remain in our latest PRD based on the team library?" },
    { id: "release", label: "Release timeline", prompt: "When did the features in the release log ship, and what is still pending?" },
    { id: "spec", label: "Design spec Q&A", prompt: "How should we use the primary button component according to design spec 3.0?" },
  ],
  207: [
    { id: "summary", label: "Chapter summary", prompt: "Summarize this week's lecture slides into key points I can review tonight." },
    { id: "map", label: "Exam mind map", prompt: "Build a mind map from my course library for the midterm topics." },
    { id: "plan", label: "Review plan", prompt: "Give me a three-day review plan based on my weakest units in the library." },
  ],
  208: [
    { id: "lesson", label: "Lesson outline", prompt: "Draft a 45-minute lesson outline from my saved teaching materials." },
    { id: "slides", label: "Slide talking points", prompt: "Turn my unit notes into slide talking points for next class." },
    { id: "guide", label: "Student study guide", prompt: "Create a one-page study guide students can use before the quiz." },
  ],
  209: [
    { id: "timeline", label: "Case timeline", prompt: "Build a timeline of facts and filings from my case library." },
    { id: "issues", label: "Issue spotting", prompt: "What legal issues stand out across the documents I uploaded?" },
    { id: "draft", label: "Draft pleading", prompt: "Draft an outline for a motion based on the strongest sources in my library." },
  ],
  210: [
    { id: "policy", label: "Policy read", prompt: "Explain the latest policy circular in plain language with the official clauses cited." },
    { id: "memo", label: "Internal memo", prompt: "Draft an internal memo summarizing the policy change and who it affects." },
    { id: "reply", label: "Stakeholder reply", prompt: "Draft a reply to stakeholders grounded in the meeting notes I saved." },
  ],
  211: [
    { id: "newsletter", label: "Newsletter draft", prompt: "Turn my saved clips into a newsletter draft with sections and hooks." },
    { id: "script", label: "Video script", prompt: "Write a 3-minute video script from my topic notes and research clips." },
    { id: "series", label: "Content series", prompt: "Outline a four-part content series from the same source material." },
  ],
  1: [
    { id: "hint", label: "Homework hint", prompt: "Walk me through this problem step by step without giving the final answer." },
    { id: "concept", label: "Explain concept", prompt: "Explain the core concept behind this question in simple terms." },
    { id: "practice", label: "Practice drill", prompt: "Give me three practice questions similar to what I'm studying." },
  ],
  3: [
    { id: "speak", label: "Speaking practice", prompt: "Let's practice a short conversation about my weekend—correct my grammar gently." },
    { id: "grammar", label: "Fix my sentence", prompt: "Fix the grammar in this sentence and explain the rule briefly." },
    { id: "write", label: "Writing polish", prompt: "Polish this paragraph for natural, professional English." },
  ],
  4: [
    { id: "shorten", label: "Shorten copy", prompt: "Shorten this caption by half while keeping the same tone." },
    { id: "tone", label: "Change tone", prompt: "Rewrite this post to sound warmer and more conversational." },
    { id: "headline", label: "Headline options", prompt: "Give me five headline options for this announcement." },
  ],
  7: [
    { id: "brief", label: "Industry brief", prompt: "Synthesize my interview notes and market scans into a one-page industry brief." },
    { id: "comp", label: "Competitor scan", prompt: "What do my saved sources say about competitor moves this quarter?" },
    { id: "risk", label: "Risk flags", prompt: "List the top risks mentioned across my analyst library this month." },
  ],
  2: [
    { id: "day", label: "How was today?", prompt: "Help me reflect on today—what went well and what felt heavy?" },
    { id: "wind", label: "Wind down", prompt: "Suggest a gentle way to unwind before bed based on what I shared." },
    { id: "gratitude", label: "Gratitude prompt", prompt: "Give me three gratitude prompts based on my recent notes." },
  ],
  5: [
    { id: "pros", label: "Pros and cons", prompt: "List pros and cons for the decision I'm weighing, without pushing one side." },
    { id: "angle", label: "Another angle", prompt: "What perspective am I missing on this small decision?" },
    { id: "nudge", label: "Gentle nudge", prompt: "Offer a thoughtful nudge—not a command—about what to do next." },
  ],
}

const GENERIC: AgentExamplePrompt[] = [
  { id: "help", label: "Where do I start?", prompt: "What should I read first in my libraries to answer my question?" },
  { id: "sum", label: "Quick summary", prompt: "Summarize the most relevant sources for my question in five bullets." },
  { id: "next", label: "Next steps", prompt: "What concrete next steps do my sources suggest?" },
]

export function getAgentExamplePrompts(agentId: number): AgentExamplePrompt[] {
  return BY_AGENT_ID[agentId] ?? GENERIC
}
