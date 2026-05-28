import type { AgentExamplePrompt } from "@/lib/agent-chat-example-prompts"

/** Web Notes — AI writing panel quick questions (grounded on current note) */
export const NOTE_WRITING_PROMPTS: AgentExamplePrompt[] = [
  {
    id: "outline",
    label: "Outline this note",
    prompt: "Turn this note into a clear outline with sections and bullet points.",
  },
  {
    id: "polish",
    label: "Polish for clarity",
    prompt: "Polish this note for clarity and flow without changing the meaning.",
  },
  {
    id: "shorten",
    label: "Shorten to one page",
    prompt: "Shorten this note to one page while keeping the key arguments.",
  },
  {
    id: "actions",
    label: "Extract action items",
    prompt: "List action items from this note with owners and due dates.",
  },
  {
    id: "summary",
    label: "Executive summary",
    prompt: "Write a three-paragraph executive summary of this note.",
  },
  {
    id: "expand",
    label: "Expand key section",
    prompt: "Expand the weakest section with more detail and examples.",
  },
  {
    id: "tone",
    label: "More professional tone",
    prompt: "Rewrite this note in a professional tone suitable for stakeholders.",
  },
  {
    id: "bullets",
    label: "Convert to bullets",
    prompt: "Convert the main ideas into scannable bullet points.",
  },
]
