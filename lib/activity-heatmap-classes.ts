import { cn } from "@/lib/utils"

/** Activity heatmap cell — mind blue opacity scale. */
export function activityHeatmapCellClass(value: number) {
  return cn(
    "w-full aspect-square rounded-sm min-h-[10px] min-w-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-mind/40",
    value === 0 && "bg-stone-100 hover:bg-stone-200/80",
    value === 1 && "bg-mind/10 hover:bg-mind/16",
    value === 2 && "bg-mind/22 hover:bg-mind/30",
    value === 3 && "bg-mind/34 hover:bg-mind/42",
    value >= 4 && "bg-mind/48 hover:bg-mind/56"
  )
}

/** Linear timeline row — activity level dot */
export function activityTimelineDotClass(value: number) {
  return cn(
    value === 0 && "bg-stone-200 dark:bg-zinc-700",
    value === 1 && "bg-mind/30",
    value === 2 && "bg-mind/45",
    value === 3 && "bg-mind/60",
    value >= 4 && "bg-mind"
  )
}

export function activityHeatmapCellClassTiny(value: number) {
  return cn(
    "aspect-square w-full min-h-0 min-w-0 p-0 border-0 focus:outline-none focus-visible:ring-1 focus-visible:ring-mind/40",
    value === 0 && "bg-stone-100 hover:bg-stone-200",
    value === 1 && "bg-mind/14 hover:bg-mind/22",
    value === 2 && "bg-mind/26 hover:bg-mind/36",
    value === 3 && "bg-mind/40 hover:bg-mind/48",
    value >= 4 && "bg-mind/54 hover:bg-mind/62"
  )
}
