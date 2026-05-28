/** Demo article body paragraphs for library source items. */
export function bodyForLibraryDocument(id: number, title: string, excerpt: string): string[] {
  const common = [
    excerpt,
    "This entry is part of your notebook corpus. In production, the full text, attachments, and revision history would load here.",
    `Sections below expand on “${title}” with structured headings, pull quotes, and links back to the original capture or import.`,
  ]
  if (id === 1) {
    return [
      ...common,
      "Operational guidance: start with a single collection per project, version your embedding model explicitly, and log chunk boundaries so you can diff retrieval quality after changes.",
    ]
  }
  if (id === 3) {
    return [
      ...common,
      "From the recording: emphasize lightweight contribution flows—if publishing a note takes more than one step, most updates never leave private drafts.",
    ]
  }
  return common
}
