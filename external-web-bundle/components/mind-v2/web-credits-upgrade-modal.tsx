"use client"

import { useState } from "react"
import { Check, X, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { MEMBERSHIP_PLANS } from "@/lib/mind-membership-plans"

export type WebCreditsStats = {
  creditsRemaining: number
  creditsMonthlyAllowance: number
}

type BillingCycle = "monthly" | "yearly"

/** ~15% off when billed yearly (demo). */
function yearlyPerMonth(monthly: number) {
  return Math.round(monthly * 0.85)
}

export function WebCreditsUpgradeModal({
  open,
  onClose,
  stats,
  currentPlanId = "standard",
  onUpgrade,
}: {
  open: boolean
  onClose: () => void
  stats: WebCreditsStats
  currentPlanId?: string
  onUpgrade?: (tierId: string) => void
}) {
  const [cycle, setCycle] = useState<BillingCycle>("monthly")

  if (!open) return null

  const pct = Math.min(100, Math.round((stats.creditsRemaining / stats.creditsMonthlyAllowance) * 100))

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal>
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 flex max-h-[min(92vh,760px)] w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/10 ring-1 ring-black/[0.06]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-stone-100 px-6 py-5">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight text-zinc-800">Membership</h2>
            <p className="mt-1 text-[13px] text-zinc-500">
              <span className="font-semibold tabular-nums text-zinc-700">
                {stats.creditsRemaining.toLocaleString("en-US")}
              </span>{" "}
              credits left · {stats.creditsMonthlyAllowance.toLocaleString("en-US")} / month allowance
            </p>
            <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-violet-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-stone-100 hover:text-zinc-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex shrink-0 justify-center px-6 pb-4">
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

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MEMBERSHIP_PLANS.map((tier) => {
              const price = cycle === "yearly" ? yearlyPerMonth(tier.priceMonthly) : tier.priceMonthly
              const isHighlight = tier.highlight
              const isCurrent = tier.id === currentPlanId

              return (
                <div
                  key={tier.id}
                  className={cn(
                    "flex flex-col rounded-2xl border bg-white p-5",
                    isHighlight ? "border-blue-400 ring-2 ring-blue-400/30" : "border-stone-200",
                    isCurrent && "ring-1 ring-teal-500/40"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <p className="text-[17px] font-semibold text-zinc-800">{tier.name}</p>
                    {isCurrent ? (
                      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-teal-700">
                        Current
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-[28px] font-semibold tabular-nums text-zinc-800">
                    ${price}
                    <span className="text-[14px] font-normal text-zinc-500"> / mo</span>
                  </p>
                  <p className="mt-0.5 text-[12px] text-zinc-500">
                    {cycle === "yearly" ? "Billed annually" : "Billed monthly"}
                  </p>
                  <p className="mt-2 text-[13px] font-medium text-zinc-600">
                    {tier.monthlyCreditsLabel} credits / month
                  </p>
                  <p className="mt-1 text-[12px] text-zinc-500">{tier.blurb}</p>

                  <button
                    type="button"
                    onClick={() => onUpgrade?.(tier.id)}
                    disabled={isCurrent}
                    className={cn(
                      "mt-4 w-full rounded-xl py-2.5 text-[14px] font-semibold text-white transition-colors",
                      isCurrent
                        ? "cursor-default bg-stone-200 text-zinc-500"
                        : isHighlight
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-zinc-900 hover:bg-zinc-800"
                    )}
                  >
                    {isCurrent ? "Current plan" : "Upgrade"}
                  </button>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[12px] leading-snug text-zinc-600">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        <div className="shrink-0 border-t border-stone-100 bg-stone-50/80 px-6 py-3">
          <p className="flex items-center justify-center gap-1.5 text-[12px] text-zinc-500">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Monthly credits reset each cycle · Pro and above roll over unused credits (demo)
          </p>
        </div>
      </div>
    </div>
  )
}
