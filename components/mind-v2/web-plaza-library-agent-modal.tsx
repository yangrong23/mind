"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { PlazaLibraryAgentIntro } from "@/components/mind-v2/plaza-library-agent-intro"
import { publicSettingsForPlazaRow } from "@/lib/plaza-agent-profiles"
import { getKbAgentSuggestions } from "@/lib/kb-agent-suggestions"
import { publicAgentDisplayName } from "@/lib/public-kb-settings"
import type { PlazaLibraryRow } from "@/lib/mock-plaza-libraries"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"

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
  const agentName = publicAgentDisplayName(publicSettings)
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
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-8">
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
          "relative z-10 flex max-h-[min(92vh,860px)] w-full max-w-[680px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/[0.06]",
          "dark:bg-zinc-950 dark:ring-white/10"
        )}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-100 px-6 py-4 sm:px-8 dark:border-zinc-800">
          <p className="text-[13px] font-medium text-zinc-500">Library preview</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-stone-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 py-7 sm:px-8 sm:py-8">
          <PlazaLibraryAgentIntro
            libraryName={row.title}
            libraryDescription={row.description}
            contentCount={row.contentCount}
            kbId={row.kbId}
            publisherLabel={row.authorHandle}
            publicSettings={publicSettings}
            exampleQuestions={exampleQuestions}
            onStartThread={onStartThread}
            chatDisabled={chatDisabled}
            chatDisabledReason={chatDisabledReason}
            variant="dialog"
          />
        </div>

        <footer className="shrink-0 space-y-3 border-t border-stone-100 bg-stone-50/40 px-6 py-5 sm:px-8 dark:border-zinc-800 dark:bg-zinc-900/40">
          <button
            type="button"
            disabled={chatDisabled}
            title={chatDisabled ? chatDisabledReason : undefined}
            onClick={() => onStartThread()}
            className={cn(
              "w-full rounded-xl py-3.5 text-[15px] font-semibold text-white transition-colors",
              chatDisabled ? "cursor-not-allowed bg-zinc-200 text-zinc-500" : web.kbPrimaryBtn
            )}
          >
            Start a thread with {agentName}
          </button>
          <button
            type="button"
            onClick={onBrowseLibrary}
            className="w-full rounded-xl border border-stone-200/90 bg-white py-3 text-[14px] font-semibold text-zinc-700 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Browse library
          </button>
          {chatDisabled && chatDisabledReason ? (
            <p className="text-center text-[12px] leading-relaxed text-zinc-500">{chatDisabledReason}</p>
          ) : null}
        </footer>
      </div>
    </div>
  )
}
