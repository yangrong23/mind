"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { FileText, ImageIcon, Layers, Link2 } from "lucide-react"
import { MOCK_KNOWLEDGE_BASES, type KnowledgeBase } from "@/lib/mock-knowledge-bases"
import { LibraryCoverFromKb } from "@/components/mind-v2/library-cover"
import { knowledgeBaseIconForTitle } from "@/components/mind-v2/knowledge-base-icon"

/** Overseas product — no WeChat / Moments share targets. */
const SHARE_ACTIONS = [
  {
    id: "link",
    label: "Copy link",
    color: "bg-zinc-100",
    glyph: <Link2 className="h-6 w-6 text-zinc-600" strokeWidth={2} aria-hidden />,
  },
  {
    id: "long-image",
    label: "Long image",
    color: "bg-zinc-100",
    glyph: <ImageIcon className="h-6 w-6 text-zinc-600" strokeWidth={2} aria-hidden />,
  },
  {
    id: "pdf",
    label: "Export PDF",
    color: "bg-zinc-100",
    glyph: <FileText className="h-6 w-6 text-zinc-600" strokeWidth={2} aria-hidden />,
  },
] as const

function LibraryGroup({
  title,
  items,
  onSelect,
}: {
  title: string
  items: KnowledgeBase[]
  onSelect: (kb: KnowledgeBase) => void
}) {
  if (items.length === 0) return null
  return (
    <div className="mb-3">
      <p className="mb-2 px-0.5 text-[12px] font-medium text-zinc-500">{title}</p>
      <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white">
        {items.map((kb, index) => {
          const FallbackIcon = knowledgeBaseIconForTitle(kb.name, kb.category)
          return (
            <button
              key={kb.id}
              type="button"
              onClick={() => onSelect(kb)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-mind/5 active:bg-mind/8",
                index > 0 && "border-t border-zinc-100"
              )}
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-sky-50 ring-1 ring-sky-100/80">
                <LibraryCoverFromKb kb={kb} showMiniUi={false} />
              </div>
              <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-zinc-900">{kb.name}</span>
              <FallbackIcon className="h-4 w-4 shrink-0 text-zinc-300 opacity-0" aria-hidden />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export type NoteSaveToLibraryOptions = {
  removeFromMemos: boolean
}

/** Inline prompt after note is ready — pairs with the share / library sheet */
export function NoteSaveToLibraryBar({
  removeFromMemos,
  onRemoveFromMemosChange,
  onChooseLibrary,
  onDismiss,
  className,
}: {
  removeFromMemos: boolean
  onRemoveFromMemosChange: (next: boolean) => void
  onChooseLibrary: () => void
  onDismiss?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-mind/25 bg-gradient-to-br from-mind/[0.09] via-white to-white p-3.5 dark:border-mind/30 dark:from-mind/15 dark:via-zinc-900 dark:to-zinc-900",
        mx.elevatedShadow,
        className
      )}
    >
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-2 top-2 rounded-full p-1 text-zinc-400 hover:bg-stone-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          aria-label="Dismiss"
        >
          <span className="sr-only">Dismiss</span>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      ) : null}
      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mind/12 text-mind">
          <Layers className="h-5 w-5" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">Save to library</h3>
          <p className="mt-0.5 text-[13px] leading-snug text-zinc-500 dark:text-zinc-400">
            Turn this memo into a library item — the fastest way to keep it long-term.
          </p>
        </div>
      </div>
      <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200/90 bg-white/90 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-950/60">
        <input
          type="checkbox"
          checked={removeFromMemos}
          onChange={(e) => onRemoveFromMemosChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-stone-300 text-mind focus:ring-mind/30"
        />
        <span className="text-[13px] leading-snug text-zinc-700 dark:text-zinc-300">
          Remove from Memos after saving
          <span className="mt-0.5 block text-[12px] text-zinc-400 dark:text-zinc-500">
            Reduces clutter — the copy lives in Library.
          </span>
        </span>
      </label>
      <button
        type="button"
        onClick={onChooseLibrary}
        className={cn(
          "mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[14px] font-semibold text-white",
          mx.brandCta,
          mx.brandFocusRing
        )}
      >
        <Layers className="h-4 w-4" strokeWidth={2} aria-hidden />
        Choose library
      </button>
    </div>
  )
}

export function NoteShareLibrarySheet({
  open,
  onClose,
  noteTitle,
  notePreview,
  noteId,
  selectionCount = 1,
  onSaveToLibrary,
  removeFromMemos: removeFromMemosProp,
  onRemoveFromMemosChange,
  presentation = "save",
}: {
  open: boolean
  onClose: () => void
  noteTitle: string
  notePreview?: string
  noteId?: number
  /** When greater than 1, bulk move — hides per-note share actions */
  selectionCount?: number
  onSaveToLibrary: (kb: KnowledgeBase, options: NoteSaveToLibraryOptions) => void
  /** Sync checkbox with inline bar on note detail */
  removeFromMemos?: boolean
  onRemoveFromMemosChange?: (next: boolean) => void
  /** `share` — note editor ellipsis sheet (share row first, then libraries) */
  presentation?: "save" | "share"
}) {
  const [removeFromMemosInternal, setRemoveFromMemosInternal] = useState(true)
  const removeFromMemos = removeFromMemosProp ?? removeFromMemosInternal
  const setRemoveFromMemos = onRemoveFromMemosChange ?? setRemoveFromMemosInternal

  useEffect(() => {
    if (open && removeFromMemosProp == null) {
      setRemoveFromMemosInternal(true)
    }
  }, [open, removeFromMemosProp])

  if (!open) return null

  const personalLibraries = MOCK_KNOWLEDGE_BASES.filter((kb) => kb.category === "mine")
  const sharedLibraries = MOCK_KNOWLEDGE_BASES.filter((kb) => kb.category === "team")
  const isBulk = selectionCount > 1
  const isShareSheet = presentation === "share" && !isBulk
  const displayTitle = isBulk ? `${selectionCount} memos` : noteTitle.trim() || "Untitled note"

  function handleShare(actionId: (typeof SHARE_ACTIONS)[number]["id"]) {
    const shareUrl = `https://mind.app/s/n/${noteId ?? 0}`
    switch (actionId) {
      case "link":
        void navigator.clipboard?.writeText(shareUrl).then(
          () => toast.success("Link copied"),
          () => toast.message("Copy link", { description: shareUrl })
        )
        break
      case "long-image":
        toast.message("Long image", { description: "Generating shareable image (demo)." })
        break
      case "pdf":
        toast.message("Export PDF", { description: "Preparing PDF export (demo)." })
        break
    }
  }

  function pickLibrary(kb: KnowledgeBase) {
    onSaveToLibrary(kb, { removeFromMemos })
    onClose()
  }

  return (
    <div className="absolute inset-0 z-[50] flex flex-col justify-end">
      <button type="button" className="absolute inset-0 bg-zinc-900/30" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[min(88vh,780px)] flex-col rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1 w-10 rounded-full bg-zinc-300" />
        </div>

        {isShareSheet ? (
          <div className="flex items-center gap-3 px-5 pb-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lime-100 to-cyan-100">
              <FileText className="h-5 w-5 text-emerald-700" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="min-w-0 flex-1 truncate text-[15px] font-medium text-zinc-800 dark:text-zinc-100">
              {displayTitle}
            </p>
          </div>
        ) : (
        <div className="flex items-center gap-3 border-b border-zinc-100 px-5 pb-4 dark:border-zinc-800">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mind/10 text-mind">
            <Layers className="h-5 w-5" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-50">
              {isBulk ? "Move to library" : "Save to library"}
            </p>
            <p className="mt-0.5 truncate text-[13px] text-zinc-500 dark:text-zinc-400">{displayTitle}</p>
          </div>
        </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {isShareSheet && notePreview?.trim() ? (
            <div className="mb-4 flex items-start gap-3 rounded-xl bg-stone-50 px-3 py-3 dark:bg-zinc-900/50">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lime-50 to-cyan-50">
                <FileText className="h-5 w-5 text-emerald-700" strokeWidth={1.75} aria-hidden />
              </div>
              <p className="line-clamp-3 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                {notePreview}
              </p>
            </div>
          ) : null}

          {!isShareSheet ? (
          <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200/90 bg-stone-50/80 px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-900/50">
            <input
              type="checkbox"
              checked={removeFromMemos}
              onChange={(e) => setRemoveFromMemos(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-stone-300 text-mind focus:ring-mind/30"
            />
            <span className="text-[13px] leading-snug text-zinc-700 dark:text-zinc-300">
              Remove from Memos after saving
              <span className="mt-0.5 block text-[12px] text-zinc-400 dark:text-zinc-500">
                {isBulk
                  ? "Clears your inbox — copies live in Library."
                  : "Keeps your inbox clean — the copy lives in Library."}
              </span>
            </span>
          </label>
          ) : null}

          {isShareSheet ? (
            <>
              <div className={cn("flex gap-3 overflow-x-auto pb-1 scrollbar-hide", "mb-2")}>
                {SHARE_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleShare(action.id)}
                    className="flex w-[4.5rem] shrink-0 flex-col items-center gap-2"
                  >
                    <span
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/[0.04]",
                        action.color
                      )}
                    >
                      {action.glyph}
                    </span>
                    <span className="text-center text-[11px] leading-tight text-zinc-600">{action.label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {!isShareSheet ? (
            <>
              <LibraryGroup title="Personal libraries" items={personalLibraries} onSelect={pickLibrary} />
              <LibraryGroup title="Shared libraries" items={sharedLibraries} onSelect={pickLibrary} />
            </>
          ) : null}

          {!isShareSheet && !isBulk ? (
            <>
          <p className="mb-3 mt-6 text-[12px] font-semibold uppercase tracking-wide text-zinc-400">Share elsewhere</p>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {SHARE_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => handleShare(action.id)}
                className="flex w-[4.5rem] shrink-0 flex-col items-center gap-2"
              >
                <span
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/[0.04]",
                    action.color
                  )}
                >
                  {action.glyph}
                </span>
                <span className="text-center text-[11px] leading-tight text-zinc-600">{action.label}</span>
              </button>
            ))}
          </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
