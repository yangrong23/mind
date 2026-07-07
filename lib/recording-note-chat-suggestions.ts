export type RecordingNoteChatSuggestion = {
  id: string
  text: string
  prompt: string
}

/** Demo follow-up questions in recording note AI chat. */
export const RECORDING_NOTE_CHAT_SUGGESTIONS: RecordingNoteChatSuggestion[] = [
  {
    id: "continuity",
    text: "Does the multi-device roadmap account for task continuity across contexts?",
    prompt: "Does the multi-device roadmap account for task continuity across contexts?",
  },
  {
    id: "nav-overload",
    text: "What information-overload risks come from showing recents in the nav bar?",
    prompt: "What information-overload risks come from showing recents in the nav bar?",
  },
  {
    id: "kb-weight",
    text: "How should we balance public vs. private library recommendations?",
    prompt: "How should we balance public vs. private library recommendations?",
  },
]
