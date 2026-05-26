"use client"

import { PlazaLibraryAgentIntro } from "@/components/mind-v2/plaza-library-agent-intro"
import { publicSettingsForPlazaRow } from "@/lib/plaza-agent-profiles"
import { getKbAgentSuggestions } from "@/lib/kb-agent-suggestions"
import type { PlazaLibraryRow } from "@/lib/mock-plaza-libraries"

export function PlazaLibraryAgentIntroSheet({
  row,
  open,
  onClose,
  onStartThread,
  onBrowseLibrary,
}: {
  row: PlazaLibraryRow | null
  open: boolean
  onClose: () => void
  onStartThread: (prompt?: string) => void
  onBrowseLibrary: () => void
}) {
  if (!open || !row) return null

  const publicSettings = publicSettingsForPlazaRow(row)
  const suggestions = getKbAgentSuggestions({
    name: row.title,
    description: row.description,
    coverVariant: row.coverVariant,
    isPublicKb: true,
    exampleQuestions: publicSettings.exampleQuestions,
  })
  const exampleQuestions =
    publicSettings.exampleQuestions.length > 0
      ? publicSettings.exampleQuestions
      : suggestions.map((s) => s.prompt)

  return (
    <div className="fixed inset-0 z-[120] flex flex-col justify-end">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[min(92vh,720px)] overflow-hidden rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom duration-200 dark:bg-zinc-950"
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700" aria-hidden />
        <div className="scrollbar-hide overflow-y-auto px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
          <PlazaLibraryAgentIntro
            libraryName={row.title}
            libraryDescription={row.description}
            contentCount={row.contentCount}
            kbId={row.kbId}
            publicSettings={publicSettings}
            exampleQuestions={exampleQuestions}
            onStartThread={(prompt) => {
              onClose()
              onStartThread(prompt)
            }}
            onBrowseLibrary={() => {
              onClose()
              onBrowseLibrary()
            }}
            onClose={onClose}
            variant="sheet"
          />
        </div>
      </div>
    </div>
  )
}
