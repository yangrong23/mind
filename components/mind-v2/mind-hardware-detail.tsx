"use client"

import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export interface MindHardwareDetailProps {
  open: boolean
  onBack: () => void
  deviceName?: string
  batteryPercent: number
  onDisconnect: () => void
}

function Row({
  label,
  value,
  action,
  onClick,
  danger,
}: {
  label: string
  value?: ReactNode
  action?: boolean
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      disabled={!onClick}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 border-b border-zinc-100/95 bg-white px-4 py-3.5 text-left last:border-b-0 active:bg-zinc-50/80",
        !onClick && "cursor-default active:bg-white",
        danger && "text-red-600"
      )}
    >
      <span className={cn("text-[15px] text-zinc-900", danger && "text-red-600")}>{label}</span>
      <span className="flex min-w-0 items-center gap-1 text-[14px] text-zinc-400">
        {value}
        {action ? <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" strokeWidth={2} /> : null}
      </span>
    </button>
  )
}

export function MindHardwareDetail({
  open,
  onBack,
  deviceName = "Mindar Note Pro",
  batteryPercent,
  onDisconnect,
}: MindHardwareDetailProps) {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-[70] flex min-h-0 flex-col bg-[#f2f2f3] dark:bg-zinc-950">
      <header className="flex shrink-0 items-center border-b border-zinc-200/80 bg-white px-1 py-2.5 dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold text-zinc-900 dark:text-zinc-50">
          {deviceName}
        </h1>
        <div className="h-10 w-10 shrink-0" aria-hidden />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="bg-white px-6 pb-6 pt-8 dark:bg-zinc-950">
          <div
            className="mx-auto max-w-[132px] rounded-2xl bg-gradient-to-b from-zinc-600 via-zinc-800 to-zinc-950 shadow-inner"
            style={{ aspectRatio: "2 / 3.2" }}
            aria-hidden
          />
          <p className="mt-5 text-center text-[13px] text-zinc-400 dark:text-zinc-500">
            Approx. 16.5 h recording time remaining (demo)
          </p>
        </div>

        <div className="mt-2 border-y border-zinc-100/90 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <p className="px-4 pb-1 pt-3 text-[16px] font-semibold text-zinc-900 dark:text-zinc-50">General</p>
          <Row label="Name" value={deviceName} />
          <Row
            label="Battery"
            value={
              <span className="truncate">
                High-performance · {batteryPercent}%
              </span>
            }
            action
            onClick={() => toast.message("Battery", { description: "Power mode and charging (demo)." })}
          />
          <Row label="Serial no." value={<span className="text-[13px] tabular-nums">MR-8810A30270024592</span>} />
          <Row
            label="Firmware"
            value="v1.4"
            action
            onClick={() => toast.message("Firmware", { description: "Check for updates (demo)." })}
          />
        </div>

        <div className="mt-2 bg-white dark:bg-zinc-950">
          <Row
            label="Disconnect or unbind"
            action
            danger
            onClick={() => {
              onDisconnect()
              onBack()
              toast.message("Disconnected", { description: "Hardware link cleared (demo)." })
            }}
          />
        </div>
      </div>
    </div>
  )
}
