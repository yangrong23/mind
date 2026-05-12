"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { X, ChevronRight } from "lucide-react"
import {
  DEFAULT_FOLDER_COLOR,
  FOLDER_COLOR_SWATCHES,
  type FolderIconKey,
  folderIconComponent,
} from "@/lib/note-folders"

export interface CreateFolderSheetProps {
  open: boolean
  onClose: () => void
  onCreate: (payload: { name: string; color: string; iconKey: FolderIconKey }) => void
}

const ICON_OPTIONS: { key: FolderIconKey; label: string }[] = [
  { key: "folder", label: "文件夹" },
  { key: "folderOpen", label: "打开" },
  { key: "folderKanban", label: "看板" },
]

export function CreateFolderSheet({ open, onClose, onCreate }: CreateFolderSheetProps) {
  const [name, setName] = useState("")
  const [color, setColor] = useState<string>(DEFAULT_FOLDER_COLOR)
  const [iconKey, setIconKey] = useState<FolderIconKey>("folder")
  const [showIconPicker, setShowIconPicker] = useState(false)

  useEffect(() => {
    if (!open) {
      setName("")
      setColor(DEFAULT_FOLDER_COLOR)
      setIconKey("folder")
      setShowIconPicker(false)
    }
  }, [open])

  if (!open) return null

  const canSubmit = name.trim().length > 0
  const SelectedIcon = folderIconComponent(iconKey)

  const submit = () => {
    if (!canSubmit) return
    onCreate({ name: name.trim(), color, iconKey })
    onClose()
  }

  return (
    <div className="absolute inset-0 z-[55]">
      <button type="button" className="absolute inset-0 bg-zinc-900/35" aria-label="关闭" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 flex max-h-[min(88vh,780px)] flex-col rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1 w-10 rounded-full bg-zinc-300" />
        </div>
        <div className="flex items-start justify-between border-b border-zinc-100 px-5 pb-4">
          <h2 className="text-[20px] font-bold tracking-tight text-zinc-900">创建新文件夹</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-zinc-100"
            aria-label="关闭"
          >
            <X className="h-5 w-5 text-zinc-500" strokeWidth={2} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {/* 名称 */}
          <div className="flex items-center gap-4 border-b border-zinc-100 py-4">
            <span className="w-12 shrink-0 text-[15px] text-zinc-900">名称</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="必填"
              className="min-w-0 flex-1 border-0 bg-transparent py-1 text-[15px] text-zinc-900 outline-none placeholder:text-zinc-400"
              autoFocus
            />
          </div>

          {/* 颜色 */}
          <div className="border-b border-zinc-100 py-4">
            <div className="mb-3 flex items-center gap-4">
              <span className="w-12 shrink-0 text-[15px] text-zinc-900">颜色</span>
            </div>
            <div className="flex flex-wrap gap-3 pl-[3.25rem]">
              {FOLDER_COLOR_SWATCHES.map((sw) => (
                <button
                  key={sw.id}
                  type="button"
                  onClick={() => setColor(sw.hex)}
                  className={cn(
                    "h-9 w-9 rounded-xl shadow-sm ring-2 ring-offset-2 ring-offset-white transition-transform active:scale-95",
                    color === sw.hex ? "ring-zinc-900 scale-105" : "ring-transparent hover:ring-zinc-200"
                  )}
                  style={{ backgroundColor: sw.hex }}
                  aria-label={`颜色 ${sw.id}`}
                />
              ))}
            </div>
          </div>

          {/* 图标 */}
          <div className="py-2">
            <button
              type="button"
              onClick={() => setShowIconPicker((v) => !v)}
              className="flex w-full items-center gap-4 py-4 text-left"
            >
              <span className="w-12 shrink-0 text-[15px] text-zinc-900">图标</span>
              <span className="min-w-0 flex-1" />
              <SelectedIcon className="h-6 w-6 shrink-0" style={{ color }} strokeWidth={1.75} aria-hidden />
              <ChevronRight
                className={cn("h-5 w-5 shrink-0 text-zinc-400 transition-transform", showIconPicker && "rotate-90")}
              />
            </button>
            {showIconPicker && (
              <div className="mb-2 flex gap-2 pl-[3.25rem]">
                {ICON_OPTIONS.map((opt) => {
                  const Icon = folderIconComponent(opt.key)
                  const selected = iconKey === opt.key
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setIconKey(opt.key)
                        setShowIconPicker(false)
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl border px-3 py-2 transition-colors",
                        selected ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:bg-zinc-50"
                      )}
                    >
                      <Icon className="h-6 w-6" style={{ color }} strokeWidth={1.75} aria-hidden />
                      <span className="text-[11px] text-zinc-500">{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-100 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className={cn(
              "w-full rounded-xl py-3.5 text-[16px] font-semibold transition-colors",
              canSubmit ? "bg-zinc-900 text-white hover:bg-zinc-800" : "cursor-not-allowed bg-zinc-200 text-zinc-400"
            )}
          >
            创建
          </button>
        </div>
      </div>
    </div>
  )
}
