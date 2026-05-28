"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { WebAgentWorkspace } from "@/components/mind-v2/web-agent-workspace"
import { agentFromPublicKbSettings, libraryAssistantChatMeta } from "@/lib/plaza-agent-runtime"
import { getKbAgentSuggestions } from "@/lib/kb-agent-suggestions"
import type { LibraryChatLaunchContext } from "@/components/mind-v2/knowledge-detail"
import type { PublicKbSettings } from "@/lib/public-kb-settings"
import type { KBCategory } from "@/lib/mock-knowledge-bases"
import type { LibraryCoverVariant } from "@/lib/product-media"

export type WebLibraryChatKb = {
  id?: number
  name: string
  description?: string
  coverVariant?: LibraryCoverVariant
  category?: KBCategory
  isPublicKb?: boolean
  publicSettings?: PublicKbSettings
  publisherName?: string
}

export function WebLibraryChatDialog({
  open,
  onClose,
  kb,
  context,
  requireAuthThen,
}: {
  open: boolean
  onClose: () => void
  kb: WebLibraryChatKb | null
  context: LibraryChatLaunchContext | null
  requireAuthThen?: (run: () => void) => void
}) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open || !kb || !context) return null

  const agent = agentFromPublicKbSettings(kb.publicSettings, kb.name)
  const assistant = libraryAssistantChatMeta(kb.publicSettings, kb.name)
  const suggestions = getKbAgentSuggestions({
    name: kb.name,
    description: kb.description,
    category: kb.category,
    coverVariant: kb.coverVariant,
    isPublicKb: kb.isPublicKb,
    exampleQuestions: kb.publicSettings?.exampleQuestions,
  })

  return (
    <div className="fixed inset-0 z-[140] flex items-stretch justify-center p-0 sm:p-4 md:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        aria-label="Close chat"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Chat with ${kb.name}`}
        className={cn(
          "relative z-10 flex min-h-0 w-full max-w-[920px] flex-col overflow-hidden bg-white shadow-2xl",
          "sm:my-auto sm:max-h-[min(92vh,820px)] sm:rounded-2xl sm:ring-1 sm:ring-black/[0.08]",
          "dark:bg-zinc-950 dark:sm:ring-white/10"
        )}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-stone-100 px-4 py-3 dark:border-zinc-800">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-zinc-800 dark:text-zinc-100">
              {assistant.displayName}
            </p>
            <p className="truncate text-[12px] text-zinc-500">Grounded on “{kb.name}”</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-stone-100 hover:text-zinc-800 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>
        <div className="min-h-0 flex-1">
          <WebAgentWorkspace
            agent={agent}
            initialPrompt={context.initialPrompt}
            onBack={onClose}
            requireAuthThen={requireAuthThen}
            libraryAssistant={assistant}
            librarySuggestions={suggestions}
            scopedLibraryName={kb.name}
          />
        </div>
      </div>
    </div>
  )
}
