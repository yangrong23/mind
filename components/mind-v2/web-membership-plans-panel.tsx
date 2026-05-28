"use client"

import { useState } from "react"
import { Check, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  MEMBERSHIP_BENEFIT_ROWS,
  MEMBERSHIP_PLANS,
  membershipBenefitValue,
  type MembershipPlan,
  type MembershipPlanId,
} from "@/lib/mind-membership-plans"

export type WebMembershipStats = {
  creditsRemaining: number
  creditsMonthlyAllowance: number
}

type BillingCycle = "monthly" | "yearly"

const PLAN_COLUMNS: { id: MembershipPlanId | "free"; label: string }[] = [
  { id: "free", label: "Free" },
  { id: "starter", label: "Starter" },
  { id: "standard", label: "Standard" },
  { id: "pro", label: "Pro" },
]

function yearlyPerMonth(monthly: number) {
  return Math.round(monthly * 0.85)
}

function planPriceLabel(plan: MembershipPlan, cycle: BillingCycle) {
  const price = cycle === "yearly" ? yearlyPerMonth(plan.priceMonthly) : plan.priceMonthly
  return `$${price}/mo`
}

export function WebMembershipPlansPanel({
  stats,
  currentPlanId = "standard",
  onSubscribe,
  className,
}: {
  stats: WebMembershipStats
  currentPlanId?: MembershipPlanId
  onSubscribe?: (planId: MembershipPlanId) => void
  className?: string
}) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly")
  const pct = Math.min(100, Math.round((stats.creditsRemaining / stats.creditsMonthlyAllowance) * 100))

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-4 border-b border-stone-100 px-6 py-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mind">Credits</p>
          <p className="mt-1 text-[26px] font-semibold tabular-nums text-zinc-900">
            {stats.creditsRemaining.toLocaleString("en-US")}
            <span className="ml-1.5 text-[15px] font-medium text-zinc-500">remaining</span>
          </p>
          <p className="mt-1 text-[13px] text-zinc-500">
            {stats.creditsMonthlyAllowance.toLocaleString("en-US")} included this billing cycle
          </p>
          <div className="mt-3 h-1.5 w-56 max-w-full overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-mind to-[color-mix(in_oklch,var(--mind-blue)_70%,#38bdf8)]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="inline-flex rounded-xl bg-stone-100/90 p-1">
          {(
            [
              { id: "monthly" as const, label: "Monthly" },
              { id: "yearly" as const, label: "Yearly · Save ~15%" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setCycle(opt.id)}
              className={cn(
                "rounded-lg px-4 py-2 text-[13px] font-medium transition-all",
                cycle === opt.id ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-auto px-6 py-5">
        <div className="overflow-x-auto rounded-2xl border border-stone-200/90 bg-white shadow-sm ring-1 ring-black/[0.03]">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/80">
                <th
                  scope="col"
                  className="sticky left-0 z-[2] min-w-[11rem] bg-stone-50/95 px-4 py-3 text-[12px] font-semibold text-zinc-500"
                >
                  Compare plans
                </th>
                {PLAN_COLUMNS.map((col) => {
                  const plan = col.id === "free" ? null : MEMBERSHIP_PLANS.find((p) => p.id === col.id)
                  const isCurrent = plan?.id === currentPlanId
                  const isHighlight = plan?.highlight

                  return (
                    <th
                      key={col.id}
                      scope="col"
                      className={cn(
                        "min-w-[9.5rem] px-3 py-3 align-bottom",
                        isHighlight && "bg-sky-50/60",
                        isCurrent && "bg-teal-50/50"
                      )}
                    >
                      <div className="flex flex-col gap-1">
                        <span
                          className={cn(
                            "text-[14px] font-semibold",
                            isHighlight ? "text-sky-800" : "text-zinc-800"
                          )}
                        >
                          {col.label}
                        </span>
                        {plan ? (
                          <>
                            <span className="text-[18px] font-semibold tabular-nums text-zinc-900">
                              {planPriceLabel(plan, cycle)}
                            </span>
                            <span className="text-[11px] text-zinc-500">
                              {cycle === "yearly" ? "Billed annually" : "Billed monthly"}
                            </span>
                            <span className="text-[11px] font-medium text-zinc-600">
                              {plan.monthlyCreditsLabel} credits / mo
                            </span>
                            <button
                              type="button"
                              disabled={isCurrent}
                              onClick={() => onSubscribe?.(plan.id)}
                              className={cn(
                                "mt-2 w-full rounded-lg py-2 text-[12px] font-semibold transition-colors",
                                isCurrent
                                  ? "cursor-default bg-stone-200 text-zinc-500"
                                  : isHighlight
                                    ? "bg-sky-600 text-white hover:bg-sky-700"
                                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                              )}
                            >
                              {isCurrent ? "Current" : "Choose plan"}
                            </button>
                          </>
                        ) : (
                          <span className="text-[13px] font-medium text-zinc-600">$0</span>
                        )}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {MEMBERSHIP_BENEFIT_ROWS.map((row, rowIdx) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-stone-100 last:border-0",
                    rowIdx % 2 === 1 && "bg-stone-50/40"
                  )}
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-[1] bg-white px-4 py-3 text-[13px] font-medium text-zinc-700 even:bg-stone-50/40"
                  >
                    {row.label}
                  </th>
                  {PLAN_COLUMNS.map((col) => {
                    const value = membershipBenefitValue(row, col.id)
                    const isDash = value === "—"
                    const plan = col.id === "free" ? null : MEMBERSHIP_PLANS.find((p) => p.id === col.id)
                    const isHighlight = plan?.highlight

                    return (
                      <td
                        key={`${row.id}-${col.id}`}
                        className={cn(
                          "px-3 py-3 text-[13px] leading-snug",
                          isHighlight && "bg-sky-50/30",
                          plan?.id === currentPlanId && "bg-teal-50/30"
                        )}
                      >
                        <span
                          className={cn(
                            "font-medium",
                            isDash ? "text-zinc-300" : isHighlight ? "text-sky-900" : "text-zinc-800"
                          )}
                        >
                          {value}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-5 grid gap-2 sm:grid-cols-3">
          {MEMBERSHIP_PLANS.map((plan) => (
            <li
              key={plan.id}
              className={cn(
                "flex items-start gap-2 rounded-xl border border-stone-200/80 px-3 py-2.5 text-[12px] text-zinc-600",
                plan.highlight && "border-sky-200/80 bg-sky-50/40"
              )}
            >
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" strokeWidth={2.5} />
              <span>
                <span className="font-semibold text-zinc-800">{plan.name}:</span> {plan.blurb}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="shrink-0 border-t border-stone-100 bg-stone-50/80 px-6 py-3">
        <p className="flex items-center justify-center gap-1.5 text-[12px] text-zinc-500">
          <Zap className="h-3.5 w-3.5 text-amber-500" aria-hidden />
          Prices are approximate (demo) · Pro includes credit rollover
        </p>
      </div>
    </div>
  )
}
