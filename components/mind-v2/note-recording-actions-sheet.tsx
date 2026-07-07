"use client"

import { cn } from "@/lib/utils"
import {
  Copy,
  FileSearch,
  FileText,
  FolderInput,
  ImageIcon,
  Link2,
  RefreshCw,
  Trash2,
  UserRound,
  X,
} from "lucide-react"

type SheetRowProps = {
  icon: React.ReactNode
  label: string
  onClick: () => void
  destructive?: boolean
}

function SheetRow({ icon, label, onClick, destructive = false }: SheetRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors",
        "hover:bg-zinc-50/90 active:bg-zinc-100/80 dark:hover:bg-zinc-900/60 dark:active:bg-zinc-900",
        destructive ? "text-red-600 hover:bg-red-50/80 dark:hover:bg-red-950/30" : "text-zinc-900 dark:text-zinc-100"
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center",
          destructive ? "text-red-500" : "text-zinc-500 dark:text-zinc-400"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-[15px]">{label}</span>
    </button>
  )
}

export type NoteRecordingActionsSheetProps = {
  open: boolean
  onClose: () => void
  onMoveToFolder: () => void
  onShareLink: () => void
  onCopyLink: () => void
  onExportLongImage: () => void
  onExportPdf: () => void
  onFindReplace: () => void
  onRetranscribe: () => void
  onNameSpeaker: () => void
  onMoveToTrash: () => void
}

/** Compact recording tools menu — move to folder, find/replace, retranscribe, speakers, trash. */
export function NoteRecordingActionsSheet({
  open,
  onClose,
  onMoveToFolder,
  onShareLink,
  onCopyLink,
  onExportLongImage,
  onExportPdf,
  onFindReplace,
  onRetranscribe,
  onNameSpeaker,
  onMoveToTrash,
}: NoteRecordingActionsSheetProps) {
  if (!open) return null

  function run(action: () => void) {
    onClose()
    action()
  }

  return (
    <div className="absolute inset-0 z-[52]">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/25 backdrop-blur-[2px]"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Recording actions"
        className="absolute bottom-0 left-0 right-0 flex max-h-[70vh] flex-col rounded-t-[1.25rem] bg-white shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom duration-300 dark:bg-zinc-950"
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="flex items-center justify-end px-3 pb-1">
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex flex-col gap-1 px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <SheetRow
            icon={<FolderInput className="h-5 w-5" strokeWidth={1.75} />}
            label="Move to folder"
            onClick={() => run(onMoveToFolder)}
          />
          <SheetRow
            icon={<Link2 className="h-5 w-5" strokeWidth={1.75} />}
            label="Share link"
            onClick={() => run(onShareLink)}
          />
          <SheetRow
            icon={<Copy className="h-5 w-5" strokeWidth={1.75} />}
            label="Copy link"
            onClick={() => run(onCopyLink)}
          />
          <SheetRow
            icon={<ImageIcon className="h-5 w-5" strokeWidth={1.75} />}
            label="Long image"
            onClick={() => run(onExportLongImage)}
          />
          <SheetRow
            icon={<FileText className="h-5 w-5" strokeWidth={1.75} />}
            label="Export PDF"
            onClick={() => run(onExportPdf)}
          />
          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" aria-hidden />
          <SheetRow
            icon={<FileSearch className="h-5 w-5" strokeWidth={1.75} />}
            label="Find and replace"
            onClick={() => run(onFindReplace)}
          />
          <SheetRow
            icon={<RefreshCw className="h-5 w-5" strokeWidth={1.75} />}
            label="Retranscribe"
            onClick={() => run(onRetranscribe)}
          />
          <SheetRow
            icon={<UserRound className="h-5 w-5" strokeWidth={1.75} />}
            label="Name speakers"
            onClick={() => run(onNameSpeaker)}
          />
          <SheetRow
            icon={<Trash2 className="h-5 w-5" strokeWidth={1.75} />}
            label="Move to trash"
            destructive
            onClick={() => run(onMoveToTrash)}
          />
        </div>
      </div>
    </div>
  )
}
