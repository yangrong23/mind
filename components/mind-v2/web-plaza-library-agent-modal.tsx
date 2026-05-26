"use client"

import { useEffect } from "react"
import { PlazaLibraryAgentIntro } from "@/components/mind-v2/plaza-library-agent-intro"
import { publicSettingsForPlazaRow } from "@/lib/plaza-agent-profiles"
import { getKbAgentSuggestions } from "@/lib/kb-agent-suggestions"
import type { PlazaLibraryRow } from "@/lib/mock-plaza-libraries"
import { cn } from "@/lib/utils"

export function WebPlazaLibraryAgentModal({
  row,
  open,
  onClose,
  onStartThread,
  onBrowseLibrary,
  chatDisabled,
  chatDisabledReason,
}: {
  row: PlazaLibraryRow | null
  open: boolean
  onClose: () => void
  onStartThread: (prompt?: string) => void
  onBrowseLibrary: () => void
  chatDisabled?: boolean
  chatDisabledReason?: string
}) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

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
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="plaza-agent-intro-title"
        className={cn(
          "relative z-10 flex max-h-[min(90vh,820px)] w-full max-w-[720px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl",
          "dark:bg-zinc-950"
        )}
      >
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-7">
          <PlazaLibraryAgentIntro
            libraryName={row.title}
            libraryDescription={row.description}
            contentCount={row.contentCount}
            kbId={row.kbId}
            publicSettings={publicSettings}
            exampleQuestions={exampleQuestions}
            onStartThread={onStartThread}
            onBrowseLibrary={onBrowseLibrary}
            onClose={onClose}
            chatDisabled={chatDisabled}
            chatDisabledReason={chatDisabledReason}
            variant="dialog"
          />
        </div>
      </div>
    </div>
  )
}
