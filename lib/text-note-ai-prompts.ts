/** Quick actions in text-note AI assist (ima-style). */
export type TextNoteAiPromptId = "summarize" | "mindmap" | "quiz" | "podcast"

export const TEXT_NOTE_AI_PROMPTS: {
  id: TextNoteAiPromptId
  label: string
  prompt: string
}[] = [
  { id: "summarize", label: "Summarize", prompt: "Summarize this note in clear bullet points." },
  { id: "mindmap", label: "Mind map", prompt: "Turn this note into a mind-map outline." },
  { id: "quiz", label: "Quiz", prompt: "Create a short quiz from this note." },
  { id: "podcast", label: "Podcast", prompt: "Draft a podcast intro from this note." },
]
