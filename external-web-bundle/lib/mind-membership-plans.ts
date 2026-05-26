/** Monthly membership tiers — shared by mobile Me credits and web upgrade UI. */

export type MembershipPlanId = "starter" | "standard" | "pro"

export type MembershipPlan = {
  id: MembershipPlanId
  name: string
  /** Display string for monthly included credits */
  monthlyCreditsLabel: string
  monthlyCredits: number
  priceLabel: string
  priceMonthly: number
  blurb: string
  /** Highlighted column in the comparison table (e.g. Pro) */
  highlight: boolean
  features: string[]
}

export type MembershipBenefitRow = {
  id: string
  label: string
  free: string
  starter: string
  standard: string
  pro: string
}

export const MEMBERSHIP_PLANS: readonly MembershipPlan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyCreditsLabel: "15,000",
    monthlyCredits: 15_000,
    priceLabel: "~$19/mo",
    priceMonthly: 19,
    blurb: "Daily capture, summaries, and light agent use",
    highlight: false,
    features: [
      "15,000 credits / month",
      "Library Q&A and note summaries",
      "Standard Studio outputs",
      "Mobile + web sync",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    monthlyCreditsLabel: "50,000",
    monthlyCredits: 50_000,
    priceLabel: "~$49/mo",
    priceMonthly: 49,
    blurb: "Steady knowledge work and team-sized libraries",
    highlight: false,
    features: [
      "50,000 credits / month",
      "Priority transcription queue",
      "Frontier models in library chat",
      "Team libraries (demo)",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyCreditsLabel: "150,000",
    monthlyCredits: 150_000,
    priceLabel: "~$99/mo",
    priceMonthly: 99,
    blurb: "Heavy agents, Studio batches, and public libraries",
    highlight: true,
    features: [
      "150,000 credits / month",
      "Unused credits roll over",
      "Advanced Studio formats",
      "Published library agents",
    ],
  },
] as const

/** Feature matrix — Free baseline + three paid tiers (reference: 会员权益对比). */
export const MEMBERSHIP_BENEFIT_ROWS: readonly MembershipBenefitRow[] = [
  {
    id: "credits",
    label: "Monthly credits",
    free: "500",
    starter: "15,000",
    standard: "50,000",
    pro: "150,000",
  },
  {
    id: "recording",
    label: "Voice recording",
    free: "30 min / mo",
    starter: "10 hr / mo",
    standard: "40 hr / mo",
    pro: "Unlimited",
  },
  {
    id: "libraries",
    label: "Knowledge libraries",
    free: "1",
    starter: "5",
    standard: "20",
    pro: "Unlimited",
  },
  {
    id: "transcription",
    label: "Transcription",
    free: "Standard",
    starter: "Standard",
    standard: "Priority",
    pro: "Priority + lexicon",
  },
  {
    id: "agents",
    label: "Agent chat",
    free: "Basic",
    starter: "Standard",
    standard: "Frontier",
    pro: "Frontier + Studio",
  },
  {
    id: "studio",
    label: "Studio outputs",
    free: "—",
    starter: "Core formats",
    standard: "All formats",
    pro: "All + batch runs",
  },
  {
    id: "rollover",
    label: "Credit rollover",
    free: "—",
    starter: "—",
    standard: "—",
    pro: "Yes",
  },
  {
    id: "team",
    label: "Team libraries",
    free: "—",
    starter: "—",
    standard: "Yes",
    pro: "Yes",
  },
] as const

export function membershipPlanById(id: MembershipPlanId): MembershipPlan | undefined {
  return MEMBERSHIP_PLANS.find((p) => p.id === id)
}

export function membershipBenefitValue(
  row: MembershipBenefitRow,
  planId: MembershipPlanId | "free"
): string {
  if (planId === "free") return row.free
  return row[planId]
}
