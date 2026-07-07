"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { Bluetooth, ChevronRight, Loader2, Radio } from "lucide-react"

export type DevicePairStep = "idle" | "scanning" | "found" | "pairing"

export const MOCK_PAIR_DEVICE = {
  name: "Mindar Note Pro",
  serial: "MR-8810A30270024592",
} as const

const SCAN_MS = 2000
const PAIR_MS = 1500

export function useDevicePairingMock(onConnected: () => void) {
  const [step, setStep] = useState<DevicePairStep>("idle")
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    setStep("idle")
  }, [clearTimers])

  const startScan = useCallback(() => {
    clearTimers()
    setStep("scanning")
    timersRef.current.push(setTimeout(() => setStep("found"), SCAN_MS))
  }, [clearTimers])

  const connectSelected = useCallback(() => {
    clearTimers()
    setStep("pairing")
    timersRef.current.push(
      setTimeout(() => {
        setStep("idle")
        onConnected()
        toast.success("Device connected", {
          description: `${MOCK_PAIR_DEVICE.name} is linked and ready to sync.`,
        })
      }, PAIR_MS)
    )
  }, [clearTimers, onConnected])

  const cancelScan = useCallback(() => {
    reset()
  }, [reset])

  useEffect(() => () => clearTimers(), [clearTimers])

  return { step, startScan, connectSelected, cancelScan, reset }
}

export function DevicePairingFlowPanel({
  step,
  onStartScan,
  onConnect,
  onCancel,
}: {
  step: DevicePairStep
  onStartScan: () => void
  onConnect: () => void
  onCancel: () => void
}) {
  if (step === "scanning") {
    return (
      <div className="rounded-2xl border border-stone-200/90 bg-stone-50/80 px-4 py-8 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-mind" strokeWidth={2} aria-hidden />
        <p className="mt-4 text-[15px] font-medium text-zinc-900 dark:text-zinc-100">Searching nearby…</p>
        <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
          Turn on your recorder and keep it close to this phone
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="mt-5 text-[14px] font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          Cancel
        </button>
      </div>
    )
  }

  if (step === "found") {
    return (
      <div className="space-y-3">
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">1 device found</p>
        <button
          type="button"
          onClick={onConnect}
          className="flex w-full items-center gap-3 rounded-2xl border border-stone-200/90 bg-white p-4 text-left transition-colors hover:border-mind/30 hover:bg-stone-50 active:scale-[0.99] dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800/80"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-mind to-mind">
            <Bluetooth className="h-6 w-6 text-white" strokeWidth={2} aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">{MOCK_PAIR_DEVICE.name}</p>
            <p className="text-[12px] text-zinc-500 dark:text-zinc-400">
              SN …{MOCK_PAIR_DEVICE.serial.slice(-8)} · Strong signal
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300 dark:text-zinc-600" strokeWidth={2} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2 text-[14px] font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Search again
        </button>
      </div>
    )
  }

  if (step === "pairing") {
    return (
      <div className="rounded-2xl border border-stone-200/90 bg-stone-50/80 px-4 py-8 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
        <Radio className="mx-auto h-8 w-8 animate-pulse text-mind" strokeWidth={2} aria-hidden />
        <p className="mt-4 text-[15px] font-medium text-zinc-900 dark:text-zinc-100">Connecting…</p>
        <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">Pairing with {MOCK_PAIR_DEVICE.name}</p>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onStartScan}
      className={cn("flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium text-white", mx.brandCta)}
    >
      <Bluetooth className="h-5 w-5" strokeWidth={2} aria-hidden />
      Search & connect
    </button>
  )
}
