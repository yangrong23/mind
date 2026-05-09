"use client"

import { Sparkles, Microscope, FileText, BarChart3, Stethoscope, Search } from "lucide-react"

const filters = [
  { id: "all", label: "All", icon: null },
  { id: "general", label: "General", icon: Sparkles },
  { id: "single-cell", label: "Single Cell", icon: Microscope },
  { id: "paper-write", label: "Paper Write", icon: FileText },
  { id: "graph-maker", label: "Graph Maker", icon: BarChart3 },
  { id: "clinical", label: "Clinical", icon: Stethoscope },
]

interface FilterButtonsProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

export function FilterButtons({ activeFilter, onFilterChange }: FilterButtonsProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id
          const Icon = filter.icon

          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                isActive
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {Icon && <Icon className="size-4" />}
              {filter.label}
            </button>
          )
        })}
      </div>

      {/* Search Input */}
      <div className="relative ml-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search cases..."
          className="pl-9 pr-4 w-[180px] h-9 bg-transparent border-0 text-sm text-gray-600 placeholder:text-gray-400 outline-none"
        />
      </div>
    </div>
  )
}
