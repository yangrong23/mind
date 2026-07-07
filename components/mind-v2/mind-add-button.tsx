"use client"

import { CirclePlus, Plus, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"

export type MindAddButtonProps = {
  onClick: () => void
  "aria-label": string
  title?: string
  /** `fab-dark` primary float; `fab-light` on canvas; `toolbar` composer; `header` top bar */
  variant?: "fab-dark" | "fab-light" | "toolbar" | "header"
  icon?: LucideIcon
  useCirclePlus?: boolean
  className?: string
  iconClassName?: string
}

export function MindAddButton({
  onClick,
  "aria-label": ariaLabel,
  title,
  variant = "fab-dark",
  icon: IconProp,
  useCirclePlus = false,
  className,
  iconClassName,
}: MindAddButtonProps) {
  const DefaultIcon = useCirclePlus ? CirclePlus : Plus
  const Icon = IconProp ?? DefaultIcon

  const iconSize =
    variant === "fab-dark" || variant === "fab-light"
      ? "h-5 w-5"
      : variant === "header"
        ? "h-[18px] w-[18px]"
        : "h-4 w-4"

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        variant === "fab-dark" && cn("h-14 w-14 rounded-full", mx.addFabDark, mx.pressable),
        variant === "fab-light" && cn("h-14 w-14 rounded-full", mx.addFabLight, mx.pressable),
        variant === "toolbar" && cn("h-8 w-8 rounded-full", mx.addToolbarBtn, mx.pressableChip),
        variant === "header" && cn("h-9 w-9 rounded-full", mx.addHeaderBtn, mx.pressableChip),
        className
      )}
    >
      <Icon
        className={cn(iconSize, variant === "fab-dark" && "text-white dark:text-zinc-900", iconClassName)}
        strokeWidth={variant === "toolbar" || variant === "header" ? 2 : 2.25}
        aria-hidden
      />
    </button>
  )
}

/** Floating wrapper — bottom-right above tab bar */
export function MindAddFab({
  onClick,
  ariaLabel,
  variant = "fab-dark",
  className,
  wrapperClassName,
}: {
  onClick: () => void
  ariaLabel: string
  variant?: "fab-dark" | "fab-light"
  className?: string
  wrapperClassName?: string
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute right-4 z-20 bottom-[calc(3.5rem+env(safe-area-inset-bottom))]",
        wrapperClassName
      )}
    >
      <MindAddButton
        onClick={onClick}
        aria-label={ariaLabel}
        variant={variant}
        className={cn("pointer-events-auto", className)}
      />
    </div>
  )
}
