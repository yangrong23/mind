"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type MindKbAtMenuItem = { id: number; name: string }
export type MindKbAtMenuNoteItem = { id: number; title: string }

export type MindKbAtMenuShortcut = {
  id: string
  label: string
  selected?: boolean
  onSelect: () => void
}

type MindKbAtMenuProps = {
  items: MindKbAtMenuItem[]
  selectedName?: string | null
  isItemSelected?: (item: MindKbAtMenuItem) => boolean
  onSelect: (item: MindKbAtMenuItem) => void
  noteItems?: MindKbAtMenuNoteItem[]
  isNoteSelected?: (item: MindKbAtMenuNoteItem) => boolean
  onNoteSelect?: (item: MindKbAtMenuNoteItem) => void
  scopeShortcuts?: MindKbAtMenuShortcut[]
  className?: string
}

export function MindKbAtMenu({
  items,
  selectedName,
  isItemSelected,
  onSelect,
  noteItems,
  isNoteSelected,
  onNoteSelect,
  scopeShortcuts,
  className,
}: MindKbAtMenuProps) {
  const hasNotes = Boolean(noteItems && noteItems.length > 0 && onNoteSelect)

  return (
    <div
      role="listbox"
      aria-label="Link sources"
      className={cn(
        "w-[min(12.5rem,calc(100vw-2.5rem))] overflow-hidden rounded-xl border border-zinc-200/90 bg-white py-0.5 shadow-lg dark:border-zinc-700 dark:bg-zinc-900",
        className
      )}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {scopeShortcuts && scopeShortcuts.length > 0 ? (
        <div className="border-b border-zinc-100 px-0.5 py-0.5 dark:border-zinc-800">
          {scopeShortcuts.map((shortcut) => (
            <button
              key={shortcut.id}
              type="button"
              role="option"
              aria-selected={shortcut.selected}
              onClick={() => shortcut.onSelect()}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-[12px] text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              <span className="truncate">{shortcut.label}</span>
              {shortcut.selected ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-mind" strokeWidth={2.5} aria-hidden />
              ) : null}
            </button>
          ))}
        </div>
      ) : (
        <p className="px-2.5 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
          Knowledge base
        </p>
      )}

      <div className="max-h-36 overflow-y-auto overscroll-y-contain scrollbar-hide">
        {items.map((item) => {
          const selected = isItemSelected?.(item) ?? selectedName === item.name
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(item)}
              className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-[12px] text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              <span className="truncate">{item.name}</span>
              {selected ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-mind" strokeWidth={2.5} aria-hidden />
              ) : null}
            </button>
          )
        })}
      </div>

      {hasNotes ? (
        <>
          <div className="border-t border-zinc-100 px-2.5 pb-0.5 pt-1.5 dark:border-zinc-800">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Notes</p>
          </div>
          <div className="max-h-32 overflow-y-auto overscroll-y-contain scrollbar-hide">
            {noteItems!.map((note) => {
              const selected = isNoteSelected?.(note) ?? false
              return (
                <button
                  key={`note-${note.id}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => onNoteSelect!(note)}
                  className="flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-[12px] text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  <span className="truncate">{note.title}</span>
                  {selected ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-mind" strokeWidth={2.5} aria-hidden />
                  ) : null}
                </button>
              )
            })}
          </div>
        </>
      ) : null}
    </div>
  )
}
