"use client"

import { X } from "lucide-react"
import {
  WebMembershipPlansPanel,
  type WebMembershipStats,
} from "@/components/mind-v2/web-membership-plans-panel"
import type { MembershipPlanId } from "@/lib/mind-membership-plans"

export type WebCreditsStats = WebMembershipStats

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
  currentPlanId?: MembershipPlanId
  onUpgrade?: (tierId: MembershipPlanId) => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal>
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 flex max-h-[min(92vh,820px)] w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/10 ring-1 ring-black/[0.06]">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-100 px-6 py-4">
          <div>
            <h2 className="text-[22px] font-semibold tracking-tight text-zinc-800">Membership</h2>
            <p className="mt-0.5 text-[13px] text-zinc-500">Compare plans side by side</p>
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

        <WebMembershipPlansPanel
          stats={stats}
          currentPlanId={currentPlanId}
          onSubscribe={onUpgrade}
          className="min-h-0 flex-1"
        />
      </div>
    </div>
  )
}
