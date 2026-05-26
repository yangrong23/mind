import { cn } from "@/lib/utils"

/** Activity heatmap cell — mind blue opacity scale. */
export function activityHeatmapCellClass(value: number) {
  return cn(
    "w-full aspect-square rounded-sm min-h-[10px] min-w-0 focus:outline-none focus:ring-2 focus:ring-mind/30 focus:ring-offset-1",
    value === 0 && "bg-stone-100 hover:bg-stone-200/80",
    value === 1 && "bg-mind/10 hover:bg-mind/16",
    value === 2 && "bg-mind/22 hover:bg-mind/30",
    value === 3 && "bg-mind/34 hover:bg-mind/42",
    value >= 4 && "bg-mind/48 hover:bg-mind/56"
  )
}

export function activityHeatmapCellClassTiny(value: number) {
  return cn(
    "rounded-[1px] min-w-[8px] p-0 border-0 focus:outline-none focus:ring-1 focus:ring-mind/30",
    value === 0 && "bg-stone-100 hover:bg-stone-200",
    value === 1 && "bg-mind/14 hover:bg-mind/22",
    value === 2 && "bg-mind/26 hover:bg-mind/36",
    value === 3 && "bg-mind/40 hover:bg-mind/48",
    value >= 4 && "bg-mind/54 hover:bg-mind/62"
  )
}
