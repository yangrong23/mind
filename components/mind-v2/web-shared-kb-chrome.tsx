"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { LibraryCover, LibraryCoverWithUpdateBadge } from "@/components/mind-v2/library-cover"
import { PersonAvatar } from "@/components/mind-v2/mind-media-art"
import type { LibraryCoverVariant } from "@/lib/product-media"
import { KbUploadFileIcon } from "@/components/mind-v2/kb-upload-file-icon"
import {
  ArrowUpDown,
  BookmarkPlus,
  Lock,
  LogOut,
  MoreHorizontal,
  Pencil,
  Search,
  Share2,
} from "lucide-react"

export const SHARED_KB_PRODUCT_LINE = "Medrix Mind knowledge"

const iconBtn =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-white/90 hover:text-zinc-800"

export function WebSharedKbHeader({
  title,
  description,
  coverVariant,
  ownerName,
  memberCount,
  createdLabel,
  size = "compact",
  onShare,
  overflowOpen,
  onOverflowToggle,
  onEditInfo,
  onPermissionSettings,
  onAddQuickAccess,
  onLeaveLibrary,
}: {
  title: string
  description?: string
  coverVariant: LibraryCoverVariant
  ownerName?: string
  memberCount?: number
  createdLabel?: string
  size?: "compact" | "detail"
  onShare: () => void
  overflowOpen: boolean
  onOverflowToggle: () => void
  onEditInfo: () => void
  onPermissionSettings: () => void
  onAddQuickAccess: () => void
  onLeaveLibrary: () => void
}) {
  const owner = ownerName ?? "Team"
  const coverClass =
    size === "detail" ? "h-[4.5rem] w-[4.5rem] rounded-2xl" : "h-12 w-12 rounded-xl"
  return (
    <div className="shrink-0 border-b border-black/[0.04] bg-transparent px-5 pb-4 pt-5 lg:px-8">
      <div className="flex items-start gap-4">
        <div className={cn("shrink-0 overflow-hidden ring-1 ring-black/[0.04]", coverClass)}>
          <LibraryCover name={title} coverVariant={coverVariant} showMiniUi={false} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h1
            className={cn(
              "font-semibold leading-snug text-zinc-800",
              size === "detail" ? "text-[22px] tracking-tight" : "text-[20px]"
            )}
          >
            {title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <div className="flex items-center gap-2">
              <PersonAvatar name={owner} size="sm" className="h-6 w-6 text-[10px] ring-1 ring-black/[0.06]" />
              <span className="text-[13px] font-medium text-zinc-600">{owner}</span>
            </div>
            {createdLabel ? (
              <span className="text-[12px] text-zinc-400">{createdLabel}</span>
            ) : null}
          </div>
          {description ? (
            <p
              className={cn(
                "mt-2 leading-relaxed text-zinc-500",
                size === "detail" ? "line-clamp-3 text-[13px]" : "line-clamp-2 text-[12px]"
              )}
            >
              {description}
            </p>
          ) : (
            <p className="mt-2 text-[12px] text-zinc-400">{SHARED_KB_PRODUCT_LINE}</p>
          )}
          {memberCount != null ? (
            <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-zinc-500">
              <span className="font-semibold tabular-nums text-zinc-600">{memberCount}</span>
              <span>joined</span>
              <span className="h-1.5 w-1.5 rounded-full bg-red-500/90" aria-hidden />
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button type="button" className={iconBtn} onClick={onShare} aria-label="Share library" title="Share">
            <Share2 className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <WebKbOverflowMenu
            open={overflowOpen}
            onToggle={onOverflowToggle}
            onEditInfo={onEditInfo}
            onPermissionSettings={onPermissionSettings}
            onAddQuickAccess={onAddQuickAccess}
            onLeaveLibrary={onLeaveLibrary}
            leaveLabel="Leave library"
          />
        </div>
      </div>
    </div>
  )
}

export function WebKbOverflowMenu({
  open,
  onToggle,
  onEditInfo,
  onPermissionSettings,
  onAddQuickAccess,
  onLeaveLibrary,
  leaveLabel = "Leave library",
  showPermissions = true,
  showLeave = true,
}: {
  open: boolean
  onToggle: () => void
  onEditInfo?: () => void
  onPermissionSettings?: () => void
  onAddQuickAccess: () => void
  onLeaveLibrary?: () => void
  leaveLabel?: string
  showPermissions?: boolean
  showLeave?: boolean
}) {
  const items = [
    ...(onEditInfo ? [{ icon: Pencil, label: "Edit info", action: onEditInfo }] : []),
    ...(showPermissions && onPermissionSettings
      ? [{ icon: Lock, label: "Permission settings", action: onPermissionSettings }]
      : []),
    { icon: BookmarkPlus, label: "Add to quick access", action: onAddQuickAccess },
    ...(showLeave && onLeaveLibrary
      ? [{ icon: LogOut, label: leaveLabel, action: onLeaveLibrary, danger: true as const }]
      : []),
  ]
  return (
    <div className="relative">
      <button
        type="button"
        className={iconBtn}
        onClick={onToggle}
        aria-label="More actions"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={onToggle} aria-hidden />
          <div className="absolute right-0 top-full z-50 mt-1 w-[11.5rem] overflow-hidden rounded-2xl border border-stone-200/90 bg-white py-1.5 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.14)]">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  onToggle()
                  item.action()
                }}
                className={cn(
                  "flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[14px] transition-colors hover:bg-stone-50",
                  "danger" in item && item.danger ? "text-red-600" : "text-zinc-700"
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0 text-zinc-500" strokeWidth={1.75} />
                {item.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

export function WebPersonalKbHeader({
  title,
  description,
  coverVariant,
  hasContentUpdate,
  overflowOpen,
  onOverflowToggle,
  onEditInfo,
  onAddQuickAccess,
  onDeleteLibrary,
}: {
  title: string
  description?: string
  coverVariant: LibraryCoverVariant
  /** Subscribed libraries — show update badge in header */
  hasContentUpdate?: boolean
  overflowOpen: boolean
  onOverflowToggle: () => void
  onEditInfo?: () => void
  onAddQuickAccess: () => void
  onDeleteLibrary?: () => void
}) {
  return (
    <div className="shrink-0 border-b border-black/[0.04] bg-transparent px-6 pb-4 pt-5">
      <div className="flex items-start gap-3">
        <LibraryCoverWithUpdateBadge
          kb={{ id: 0, name: title, coverVariant }}
          hasUpdate={hasContentUpdate}
          coverClassName="h-12 w-12 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-[20px] font-semibold leading-snug text-zinc-800">{title}</h1>
          {description ? (
            <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">{description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <WebKbOverflowMenu
            open={overflowOpen}
            onToggle={onOverflowToggle}
            onEditInfo={onEditInfo}
            onAddQuickAccess={onAddQuickAccess}
            onLeaveLibrary={onDeleteLibrary}
            leaveLabel="Remove library"
            showPermissions={false}
            showLeave={Boolean(onDeleteLibrary)}
          />
        </div>
      </div>
    </div>
  )
}

export function WebSharedKbContentBar({
  itemCount,
  resultCount,
  searching,
  contentSearch,
  onContentSearchChange,
  onToggleSearch,
  sortOpen,
  onSortToggle,
  sortControl,
  onAddClick,
  addMenu,
}: {
  itemCount: number
  resultCount?: number
  searching: boolean
  contentSearch: string
  onContentSearchChange: (v: string) => void
  onToggleSearch: () => void
  sortOpen: boolean
  onSortToggle: () => void
  sortControl: ReactNode
  onAddClick: () => void
  addMenu?: ReactNode
}) {
  const label =
    contentSearch.trim() && resultCount != null
      ? `Content (${resultCount})`
      : `Content (${itemCount})`

  return (
    <div className="shrink-0 border-b border-black/[0.04] px-6 pb-3 pt-1">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[15px] font-semibold text-zinc-700">{label}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className={cn(iconBtn, searching && "bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]")}
            onClick={onToggleSearch}
            aria-label="Search content"
            aria-pressed={searching}
          >
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <div className="relative">
            <button
              type="button"
              className={cn(iconBtn, sortOpen && "bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]")}
              onClick={onSortToggle}
              aria-label="Sort"
              aria-expanded={sortOpen}
            >
              <ArrowUpDown className="h-5 w-5" strokeWidth={1.75} />
            </button>
            {sortOpen ? (
              <>
                <div className="fixed inset-0 z-40" onClick={onSortToggle} aria-hidden />
                <div className="absolute right-0 top-full z-50 mt-1 min-w-[10rem]">{sortControl}</div>
              </>
            ) : null}
          </div>
          <div className="relative">
            <button type="button" className={iconBtn} onClick={onAddClick} aria-label="Add files">
              <KbUploadFileIcon className="h-5 w-5" />
            </button>
            {addMenu}
          </div>
        </div>
      </div>
      {searching ? (
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={contentSearch}
            onChange={(e) => onContentSearchChange(e.target.value)}
            placeholder="Search this library"
            autoFocus
            className="w-full rounded-full bg-white/80 py-2 pl-9 pr-3 text-[13px] ring-1 ring-black/[0.04] outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-mind/20"
            aria-label="Search this library"
          />
        </div>
      ) : null}
    </div>
  )
}
