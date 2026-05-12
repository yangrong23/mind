"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { Bluetooth, X, Battery, HardDrive, RefreshCw, Wifi } from "lucide-react"

export interface MindDevicesSheetProps {
  open: boolean
  onClose: () => void
  isDeviceConnected: boolean
  onSetDeviceConnected: (connected: boolean) => void
  /** Stack above full-screen overlays (e.g. recording) */
  zOverlayClass?: string
  /** Extra device-related settings (e.g. hardware summary, lexicon, offline capture) — Me tab only */
  children?: ReactNode
}

export function MindDevicesSheet({
  open,
  onClose,
  isDeviceConnected,
  onSetDeviceConnected,
  zOverlayClass = "z-[59]",
  children,
}: MindDevicesSheetProps) {
  if (!open) return null

  return (
    <div className={cn("absolute inset-0", zOverlayClass)}>
      <div className="absolute inset-0 bg-zinc-900/25" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 flex max-h-[min(92vh,calc(100dvh-24px))] animate-in slide-in-from-bottom flex-col rounded-t-3xl bg-white duration-300">
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-400" />
        </div>
        <div className="flex shrink-0 items-center justify-between px-5 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Devices</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-200"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="px-5 pb-4">
          <div
            className={cn(
              "rounded-2xl border-2 p-4 transition-all",
              isDeviceConnected
                ? "border-stone-300/80 bg-gradient-to-br from-stone-100 to-stone-50"
                : "border-gray-300 bg-gray-100"
            )}
          >
            <div className="mb-4 flex items-center gap-4">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl",
                  isDeviceConnected ? "bg-gradient-to-br from-sky-600 to-sky-800" : "bg-gray-400"
                )}
              >
                <Bluetooth className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-semibold text-gray-900">Mind Recorder</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      isDeviceConnected ? "bg-zinc-700 text-white" : "bg-gray-300 text-gray-700"
                    )}
                  >
                    {isDeviceConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
                <span className="text-sm text-gray-600">SN: MR-2024-001234</span>
              </div>
            </div>

            {isDeviceConnected && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-white/80 p-3 text-center">
                  <Battery className={cn("mx-auto mb-1 h-5 w-5", mx.navActiveIcon)} />
                  <div className="text-lg font-semibold text-gray-900">85%</div>
                  <div className="text-xs text-gray-600">Battery</div>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-center">
                  <HardDrive className={cn("mx-auto mb-1 h-5 w-5", mx.navActiveIcon)} />
                  <div className="text-lg font-semibold text-gray-900">2.3G</div>
                  <div className="text-xs text-gray-600">Free</div>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-center">
                  <Wifi className={cn("mx-auto mb-1 h-5 w-5", mx.navActiveIcon)} />
                  <div className="text-lg font-semibold text-gray-900">v2.1</div>
                  <div className="text-xs text-gray-600">Firmware</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 px-5 pb-4">
          {isDeviceConnected ? (
            <>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-500 py-3 font-medium text-white hover:bg-zinc-600"
              >
                <RefreshCw className="h-5 w-5" />
                Sync now
              </button>
              <button
                type="button"
                onClick={() => onSetDeviceConnected(false)}
                className="w-full rounded-xl bg-gray-200 py-3 font-medium text-gray-700 hover:bg-gray-300"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onSetDeviceConnected(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-500 py-3 font-medium text-white hover:bg-zinc-600"
            >
              <Bluetooth className="h-5 w-5" />
              Search & connect
            </button>
          )}
        </div>

        {children ? (
          <div className="border-t border-stone-100 px-5 pb-6 pt-2">{children}</div>
        ) : null}
        </div>
      </div>
    </div>
  )
}
