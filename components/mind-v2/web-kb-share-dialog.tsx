"use client"

import { useState } from "react"
import { ChevronRight, Link2, QrCode, Share2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { LibraryCover } from "@/components/mind-v2/library-cover"
import { PersonAvatar } from "@/components/mind-v2/mind-media-art"
import type { LibraryCoverVariant } from "@/lib/product-media"
import type { TeamJoinMode } from "@/lib/mock-knowledge-bases"

export function WebKbShareDialog({
  open,
  onClose,
  name,
  description,
  coverVariant,
  creatorName,
  tags,
  joinMode = "Admin approval",
  onJoinModeClick,
}: {
  open: boolean
  onClose: () => void
  name: string
  description?: string
  coverVariant: LibraryCoverVariant
  creatorName?: string
  tags?: string
  joinMode?: TeamJoinMode
  onJoinModeClick?: () => void
}) {
  const [copied, setCopied] = useState(false)

  if (!open) return null

  const joinLabel =
    joinMode === "Open join"
      ? "Members can view content · open join"
      : "Members can view content · join requires approval"

  const copyLink = async () => {
    const url = `https://mindar.app/library/demo/${encodeURIComponent(name)}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.message("Copy link", { description: url })
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/35" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-zinc-600" />
            <h2 className="text-[16px] font-semibold text-zinc-800">Share</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-stone-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="rounded-2xl border border-stone-200/90 bg-stone-50/50 p-4">
            <div className="flex gap-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-black/[0.04]">
                <LibraryCover name={name} coverVariant={coverVariant} showMiniUi={false} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold leading-snug text-zinc-800">{name}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <PersonAvatar name={creatorName ?? "You"} size="sm" className="h-5 w-5 text-[9px]" />
                  <span className="text-[12px] text-zinc-500">Created by {creatorName ?? "You"}</span>
                </div>
                {tags || description ? (
                  <p className="mt-2 line-clamp-2 text-[12px] text-zinc-400">
                    {tags ?? description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onJoinModeClick}
            className="mt-4 flex w-full items-center justify-between rounded-xl py-2 text-left text-[13px] text-zinc-600 hover:bg-stone-50"
          >
            <span className="font-medium text-zinc-700">Sharing method</span>
            <span className="flex items-center gap-0.5 text-[12px] text-zinc-500">
              {joinLabel}
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </button>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-4 text-[13px] font-semibold text-zinc-700 hover:bg-stone-50"
            >
              <Link2 className="h-5 w-5 text-zinc-600" />
              {copied ? "Copied" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={() =>
                toast.message("Knowledge code", {
                  description: "QR / invite code generated (demo).",
                })
              }
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-4 text-[13px] font-semibold text-zinc-700 hover:bg-stone-50"
            >
              <QrCode className="h-5 w-5 text-zinc-600" />
              Knowledge code
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
