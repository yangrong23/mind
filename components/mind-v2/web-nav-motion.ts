import { cn } from "@/lib/utils"

/** Shared nav / control motion — avoids stiff tab switches */
export const webNavMotion = {
  pressable: cn(
    "transition-[transform,background-color,box-shadow,color,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
    "hover:scale-[1.02] active:scale-[0.98]"
  ),
  panelEnter: "animate-in fade-in-0 slide-in-from-left-1 duration-300 ease-out",
  contentEnter: "animate-in fade-in-0 duration-250 ease-out",
} as const
