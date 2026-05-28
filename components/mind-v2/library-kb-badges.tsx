"use client"

import { cn } from "@/lib/utils"
import type { KnowledgeBase, SubscribedKbRole, TeamMembershipRole } from "@/lib/mock-knowledge-bases"

export function KbTeamRoleBadge({
  role,
  className,
}: {
  role: TeamMembershipRole
  className?: string
}) {
  const isOwner = role === "owner"
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-1.5 py-px text-[10px] font-semibold leading-none ring-1",
        isOwner
          ? "bg-amber-50 text-amber-900 ring-amber-200/80"
          : "bg-zinc-100 text-zinc-600 ring-zinc-200/80",
        className
      )}
    >
      {isOwner ? "Owner" : "Member"}
    </span>
  )
}

export function KbSubscribedRoleBadge({
  role,
  className,
}: {
  role: SubscribedKbRole
  className?: string
}) {
  const published = role === "published"
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-1.5 py-px text-[10px] font-semibold leading-none ring-1",
        published
          ? "bg-violet-50 text-violet-800 ring-violet-200/70"
          : "bg-sky-50 text-sky-800 ring-sky-200/70",
        className
      )}
    >
      {published ? "Published" : "Subscribed"}
    </span>
  )
}

export function KbListMetaBadges({ kb, className }: { kb: KnowledgeBase; className?: string }) {
  if (kb.category === "team" && kb.teamRole) {
    return <KbTeamRoleBadge role={kb.teamRole} className={className} />
  }
  if (kb.category === "subscribed" && kb.subscribedRole) {
    return <KbSubscribedRoleBadge role={kb.subscribedRole} className={className} />
  }
  if (kb.isPublicPublished || kb.publicSettings?.isPublic) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 rounded-full bg-mind/10 px-1.5 py-px text-[10px] font-semibold text-mind ring-1 ring-mind/20",
          className
        )}
      >
        Plaza
      </span>
    )
  }
  return null
}
