import type { LucideIcon } from "lucide-react"
import { Folder, FolderKanban, FolderOpen } from "lucide-react"

export type FolderIconKey = "folder" | "folderOpen" | "folderKanban"

export interface NoteFolder {
  id: string
  name: string
  /** Stroke / accent color (hex) */
  color: string
  iconKey: FolderIconKey
}

/** Preset swatches aligned with product reference (灰 / 浅蓝 / 薄荷 / 桃橙 / 青 / 珊瑚 / 紫) */
export const FOLDER_COLOR_SWATCHES = [
  { id: "slate", hex: "#475569" },
  { id: "sky", hex: "#7dd3fc" },
  { id: "mint", hex: "#5eead4" },
  { id: "orange", hex: "#fb923c" },
  { id: "cyan", hex: "#22d3ee" },
  { id: "rose", hex: "#fb7185" },
  { id: "violet", hex: "#a78bfa" },
] as const

export const DEFAULT_FOLDER_COLOR = FOLDER_COLOR_SWATCHES[0].hex

export function folderIconComponent(key: FolderIconKey): LucideIcon {
  switch (key) {
    case "folderOpen":
      return FolderOpen
    case "folderKanban":
      return FolderKanban
    default:
      return Folder
  }
}
