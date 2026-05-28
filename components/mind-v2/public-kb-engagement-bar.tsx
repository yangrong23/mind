"use client"

import { Heart, MessageCircle, Sparkles, UserPlus, UserCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { formatEngagementCount } from "@/lib/plaza-kb-engagement"

export type PublicKbEngagementMetrics = {
  subscriberCount: number
  likeCount: number
  commentCount: number
}

function formatViewCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (n >= 10_000) return `${Math.round(n / 1000)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return String(n)
}

export function PublicKbEngagementStats({
  metrics,
  viewCount,
  className,
}: {
  metrics: PublicKbEngagementMetrics
  viewCount?: number
  className?: string
}) {
  const parts = [
    { value: formatEngagementCount(metrics.subscriberCount), label: "subscribers" },
    ...(viewCount != null && viewCount > 0
      ? [{ value: formatViewCount(viewCount), label: "views & Q&A" }]
      : []),
    { value: formatEngagementCount(metrics.likeCount), label: "likes" },
    { value: formatEngagementCount(metrics.commentCount), label: "comments" },
  ]

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] tabular-nums text-zinc-500",
        className
      )}
    >
      {parts.map((part, i) => (
        <span key={part.label} className="inline-flex items-center gap-2">
          {i > 0 ? (
            <span className="text-zinc-300" aria-hidden>
              ·
            </span>
          ) : null}
          <span>
            <strong className="font-semibold text-zinc-800">{part.value}</strong> {part.label}
          </span>
        </span>
      ))}
    </div>
  )
}

export function PublicKbEngagementBar({
  metrics,
  subscribed,
  liked,
  onToggleSubscribe,
  onToggleLike,
  onOpenComments,
  onOpenChat,
  showChat = true,
  subscribeLabel,
  className,
}: {
  metrics: PublicKbEngagementMetrics
  subscribed: boolean
  liked: boolean
  onToggleSubscribe: () => void
  onToggleLike: () => void
  onOpenComments: () => void
  onOpenChat?: () => void
  showChat?: boolean
  subscribeLabel?: { follow: string; following: string }
  className?: string
}) {
  const follow = subscribeLabel?.follow ?? "Subscribe"
  const following = subscribeLabel?.following ?? "Subscribed"

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <button
        type="button"
        onClick={onToggleSubscribe}
        className={cn(
          "inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors",
          subscribed
            ? "bg-mind/10 text-mind ring-1 ring-mind/20 hover:bg-mind/14"
            : cn(web.kbPrimaryBtn, "shadow-sm")
        )}
        aria-pressed={subscribed}
      >
        {subscribed ? (
          <UserCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        ) : (
          <UserPlus className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        )}
        {subscribed ? following : follow}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onToggleLike}
          className={cn(
            web.kbPill,
            "inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 text-[13px]",
            liked && web.kbPillActive
          )}
          aria-pressed={liked}
          aria-label={`Like · ${metrics.likeCount}`}
        >
          <Heart className={cn("h-3.5 w-3.5 shrink-0", liked && "fill-current")} strokeWidth={2} aria-hidden />
          {formatEngagementCount(metrics.likeCount)}
        </button>

        <button
          type="button"
          onClick={onOpenComments}
          className={cn(
            web.kbPill,
            "inline-flex w-full items-center justify-center gap-1.5 px-3 py-2 text-[13px]",
            web.kbRowHover
          )}
          aria-label={`Comments · ${metrics.commentCount}`}
        >
          <MessageCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          {formatEngagementCount(metrics.commentCount)}
        </button>
      </div>

      {showChat && onOpenChat ? (
        <button
          type="button"
          onClick={onOpenChat}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-white shadow-sm",
            web.kbPrimaryBtn
          )}
        >
          <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
          Chat
        </button>
      ) : null}
    </div>
  )
}
