"use client"

import { Loader2, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export function DeviceTransferBanner({
  deviceName = "Mindar Recorder",
  progressLabel = "1/1",
  speedLabel = "0.00 KB/s",
  onFastTransfer,
}: {
  deviceName?: string
  progressLabel?: string
  speedLabel?: string
  onFastTransfer?: () => void
}) {
  return (
    <div className="mx-5 mb-3 rounded-xl border border-stone-200/90 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium leading-snug text-zinc-800 dark:text-zinc-100">
            Transferring recordings from {deviceName} to app… ({progressLabel})
          </p>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-stone-100 dark:bg-zinc-800">
            <div className="h-full w-[42%] rounded-full bg-zinc-900 transition-all dark:bg-zinc-100" />
          </div>
          <p className="mt-1.5 text-[11px] tabular-nums text-zinc-400">{speedLabel}</p>
        </div>
        {onFastTransfer ? (
          <button
            type="button"
            onClick={onFastTransfer}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-[11px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            <Zap className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            Fast transfer
          </button>
        ) : null}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[12px] text-mind">
        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.5} aria-hidden />
        <span>Transfer in progress</span>
      </div>
    </div>
  )
}
