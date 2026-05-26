export type NoteAskPromptId = "todos" | "quotes" | "speakers" | "decisions"

export type NoteAskPromptItem = {
  id: NoteAskPromptId
  label: string
  hint: string
  prompt: string
}

export const NOTE_ASK_PROMPTS: NoteAskPromptItem[] = [
  {
    id: "todos",
    label: "My action items",
    hint: "Action items extracted from this meeting",
    prompt: "List my action items from this note with owners and due dates.",
  },
  {
    id: "quotes",
    label: "Meeting quotes",
    hint: "Memorable lines worth revisiting",
    prompt: "Pull out the most memorable quotes from this meeting.",
  },
  {
    id: "speakers",
    label: "Speaker summaries",
    hint: "Points grouped by who spoke",
    prompt: "Summarize what each speaker contributed in this note.",
  },
  {
    id: "decisions",
    label: "Key decisions",
    hint: "Confirmed and pending decisions",
    prompt: "What key decisions were made or are still pending?",
  },
]
