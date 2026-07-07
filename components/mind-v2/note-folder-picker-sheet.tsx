"use client"

import { cn } from "@/lib/utils"
import { ChevronRight, FolderPlus, X } from "lucide-react"
import type { NoteFolder } from "@/lib/note-folders"
import { folderIconComponent } from "@/lib/note-folders"

export function NoteFolderPickerSheet({
  open,
  onClose,
  folders,
  onSelectFolder,
  onCreateFolder,
  title = "Save to folder",
  subtitle,
}: {
  open: boolean
  onClose: () => void
  folders: NoteFolder[]
  onSelectFolder: (folderId: string) => void
  onCreateFolder: () => void
  title?: string
  subtitle?: string
}) {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-[55] flex flex-col justify-end">
      <button type="button" className="absolute inset-0 bg-zinc-900/35" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative flex max-h-[min(78vh,640px)] flex-col rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1 w-10 rounded-full bg-zinc-300" />
        </div>
        <div className="flex items-start justify-between border-b border-zinc-100 px-5 pb-4">
          <div>
            <h2 className="text-[20px] font-bold tracking-tight text-zinc-900">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-[13px] text-zinc-500">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-zinc-100"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-zinc-500" strokeWidth={2} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
          <button
            type="button"
            onClick={onCreateFolder}
            className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-3.5 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-zinc-200">
              <FolderPlus className="h-5 w-5 text-mind" strokeWidth={2} aria-hidden />
            </span>
            <span className="flex-1 text-[15px] font-semibold text-zinc-900">New folder</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
          </button>

          {folders.length === 0 ? (
            <p className="px-1 py-6 text-center text-[14px] text-zinc-500">No folders yet — create one above.</p>
          ) : (
            <div className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-100">
              {folders.map((folder) => {
                const Icon = folderIconComponent(folder.iconKey)
                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => onSelectFolder(folder.id)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-zinc-50 active:bg-zinc-100/80"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 ring-1 ring-sky-100/80"
                      aria-hidden
                    >
                      <Icon className="h-5 w-5" style={{ color: folder.color }} strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-zinc-900">{folder.name}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
