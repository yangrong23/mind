"use client"

import { cn } from "@/lib/utils"
import {
  getMindAgentProfile,
  MINDAR_COPILOT_PROFILE,
  scenarioLabel,
  type AgentCapabilityProfile,
  type AgentScenarioId,
  type MindAgent,
} from "@/lib/mind-agent-catalog"
import { Sparkles } from "lucide-react"

export function AgentScenarioPill({
  scenario,
  className,
}: {
  scenario?: AgentScenarioId
  className?: string
}) {
  if (!scenario) return null
  return (
    <span
      className={cn(
        "shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
        className
      )}
    >
      {scenarioLabel(scenario)}
    </span>
  )
}

const DEFAULT_TEAM_ROLES = ["Product", "Content", "Engineering", "Design"] as const

function formatTeamRolesList(roles: string[]) {
  if (roles.length === 0) return ""
  if (roles.length === 1) return roles[0]!
  if (roles.length === 2) return `${roles[0]} & ${roles[1]}`
  return `${roles.slice(0, -1).join(", ")} & ${roles[roles.length - 1]}`
}

/** Static copy — no motion; highlights multi-hat scope. */
export function AgentMultiRoleBlurb({
  profile,
  variant = "list",
  className,
}: {
  profile: AgentCapabilityProfile
  variant?: "list" | "header" | "hero"
  className?: string
}) {
  if (!profile.multiRole) return null
  const roles = profile.teamRoles?.length ? profile.teamRoles : [...DEFAULT_TEAM_ROLES]
  const scope = formatTeamRolesList(roles)

  if (variant === "header") {
    return (
      <span className={cn("truncate text-[11px] font-medium text-zinc-500 dark:text-zinc-400", className)}>
        Multi-hat · {scope}
      </span>
    )
  }

  if (variant === "hero") {
    return (
      <p
        className={cn(
          "max-w-xs text-center text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400",
          className
        )}
      >
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">Multi-hat · </span>
        Spans {scope} in one agent
      </p>
    )
  }

  return (
    <p className={cn("line-clamp-2 text-[12px] leading-snug text-zinc-600 dark:text-zinc-400", className)}>
      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Multi-hat · </span>
      Spans {scope} in one agent
      {profile.strengthDetail ? (
        <span className="text-zinc-500 dark:text-zinc-500"> — {profile.strengthDetail}</span>
      ) : null}
    </p>
  )
}

/** Flowing marquee / cycle — highlights multi-hat skills without long copy. */
export function AgentMultiRoleFlow({
  roles = [...DEFAULT_TEAM_ROLES],
  variant = "inline",
  className,
}: {
  roles?: string[]
  variant?: "inline" | "hero" | "header"
  className?: string
}) {
  if (roles.length === 0) return null

  const itemClass =
    variant === "hero"
      ? "text-[14px] font-semibold text-teal-800 dark:text-teal-100"
      : variant === "header"
        ? "text-[11px] font-semibold text-teal-700 dark:text-teal-200"
        : "text-[12px] font-semibold text-teal-800/90 dark:text-teal-100/90"

  if (variant === "header") {
    return (
      <span
        className={cn("inline-flex h-[1.125rem] overflow-hidden align-bottom", className)}
        aria-label={`Multi-hat: ${roles.join(", ")}`}
      >
        <span
          className="flex flex-col animate-[agent-role-cycle_10s_ease-in-out_infinite]"
          aria-hidden
        >
          {roles.map((role) => (
            <span key={role} className={cn("h-[1.125rem] leading-[1.125rem]", itemClass)}>
              {role}
            </span>
          ))}
        </span>
      </span>
    )
  }

  const loop = [...roles, ...roles]

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        variant === "hero" ? "mx-auto w-full max-w-xs rounded-xl bg-teal-50/60 py-2 dark:bg-teal-950/35" : "w-full",
        className
      )}
      aria-label={`Multi-hat: ${roles.join(", ")}`}
    >
      <span
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-6 bg-gradient-to-r from-white to-transparent dark:from-zinc-950"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-6 bg-gradient-to-l from-white to-transparent dark:from-zinc-950"
        aria-hidden
      />
      {variant === "hero" ? (
        <>
          <span
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 bg-gradient-to-r from-teal-50/95 to-transparent dark:from-teal-950/90"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 bg-gradient-to-l from-teal-50/95 to-transparent dark:from-teal-950/90"
            aria-hidden
          />
        </>
      ) : null}
      <div
        className={cn(
          "flex w-max items-center gap-5 whitespace-nowrap px-2",
          "animate-[agent-role-marquee_22s_linear_infinite]",
          variant === "hero" && "[animation-duration:18s]"
        )}
        aria-hidden
      >
        {loop.map((role, i) => (
          <span key={`${role}-${i}`} className={cn("inline-flex items-center gap-5", itemClass)}>
            {role}
            <span className="font-normal text-teal-600/35 dark:text-teal-400/35" aria-hidden>
              ·
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function AgentCapabilityChips({
  items,
  max = 4,
  size = "sm",
  className,
}: {
  items: string[]
  max?: number
  size?: "sm" | "md"
  className?: string
}) {
  const visible = items.slice(0, max)
  if (visible.length === 0) return null
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((label) => (
        <span
          key={label}
          className={cn(
            "rounded-full border border-stone-200/90 bg-white font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-400",
            size === "md" ? "px-2.5 py-1 text-[11px]" : "px-2 py-0.5 text-[10px]"
          )}
        >
          {label}
        </span>
      ))}
    </div>
  )
}

export function AgentTeamRolesRow({
  roles,
  className,
}: {
  roles: string[]
  className?: string
}) {
  if (roles.length === 0) return null
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {roles.map((role) => (
        <span
          key={role}
          className="rounded-lg bg-teal-50/90 px-2 py-1 text-[10px] font-semibold text-teal-900 dark:bg-teal-950/40 dark:text-teal-100"
        >
          {role}
        </span>
      ))}
    </div>
  )
}

export function AgentProfileSummary({
  agentId,
  name,
  scenario,
  profile: profileProp,
  variant = "compact",
  className,
}: {
  agentId: number
  name: string
  scenario?: AgentScenarioId
  profile?: AgentCapabilityProfile
  variant?: "compact" | "expanded"
  className?: string
}) {
  const profile =
    profileProp ?? (agentId === 0 ? MINDAR_COPILOT_PROFILE : getMindAgentProfile(agentId))
  if (!profile) return null

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        {agentId === 0 ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-mind dark:bg-sky-950/40">
            <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
            Mindar
          </span>
        ) : null}
        <AgentScenarioPill scenario={scenario} />
      </div>
      {profile.multiRole && profile.teamRoles?.length ? (
        <AgentMultiRoleFlow
          roles={profile.teamRoles}
          variant={variant === "expanded" ? "hero" : "inline"}
          className={variant === "expanded" ? "mt-2" : "mt-1"}
        />
      ) : (
        <p
          className={cn(
            "font-medium text-zinc-600 dark:text-zinc-400",
            variant === "expanded" ? "mt-2 text-[13px] leading-snug" : "mt-1 text-[12px] leading-snug"
          )}
        >
          {profile.tagline}
        </p>
      )}
      {!profile.multiRole ? (
        <AgentCapabilityChips
          items={profile.capabilities}
          max={variant === "expanded" ? 4 : 3}
          size={variant === "expanded" ? "md" : "sm"}
          className={variant === "expanded" ? "mt-2.5" : "mt-1.5"}
        />
      ) : null}
      {variant === "expanded" && !profile.multiRole && profile.strengthDetail ? (
        <p className="mt-2.5 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400">{profile.strengthDetail}</p>
      ) : null}
    </div>
  )
}

export function resolveAgentProfileFromCatalog(agent: {
  id: number
  scenario?: AgentScenarioId
  profile?: AgentCapabilityProfile
}): AgentCapabilityProfile | undefined {
  if (agent.profile) return agent.profile
  return getMindAgentProfile(agent.id)
}

export type { MindAgent }
