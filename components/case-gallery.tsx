"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { CaseCard, type CaseCategory } from "@/components/case-card"
import { FilterButtons } from "@/components/filter-buttons"
import { Button } from "@/components/ui/button"

const cases: { category: CaseCategory; title: string; description: string; imagePosition: { row: number; col: number } }[] = [
  {
    category: "Single Cell",
    title: "Single-cell atlas of human lung development",
    description: "Comprehensive scRNA-seq analysis workflow",
    imagePosition: { row: 0, col: 0 },
  },
  {
    category: "Graph Maker",
    title: "Publication figures for Cell paper",
    description: "Automated figure generation and formatting",
    imagePosition: { row: 0, col: 1 },
  },
  {
    category: "Paper Write",
    title: "Methods section for Phase II trial",
    description: "Clinical protocol documentation",
    imagePosition: { row: 0, col: 2 },
  },
  {
    category: "Code",
    title: "Seurat to Scanpy migration",
    description: "Bioinformatics pipeline conversion",
    imagePosition: { row: 1, col: 0 },
  },
  {
    category: "Clinical",
    title: "Systematic review meta-analysis",
    description: "Literature review automation",
    imagePosition: { row: 1, col: 1 },
  },
  {
    category: "Single Cell",
    title: "Spatial transcriptomics workflow",
    description: "Spatial data analysis pipeline",
    imagePosition: { row: 1, col: 2 },
  },
  {
    category: "Graph Maker",
    title: "Automated figure generation pipeline",
    description: "Batch figure creation for publications",
    imagePosition: { row: 2, col: 0 },
  },
  {
    category: "Paper Write",
    title: "Grant proposal for NIH funding",
    description: "Research funding application support",
    imagePosition: { row: 2, col: 1 },
  },
  {
    category: "Clinical",
    title: "Clinical trial data analysis",
    description: "Statistical analysis and reporting",
    imagePosition: { row: 2, col: 2 },
  },
]

export function CaseGallery() {
  const [activeFilter, setActiveFilter] = useState("all")

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-[32px] font-bold text-zinc-900 tracking-tight">Case Gallery</h1>
        <p className="text-zinc-500 text-[15px]">
          Explore real-world research workflows powered by MedrixAI
        </p>
      </div>

      {/* Filters */}
      <FilterButtons activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {cases.map((caseItem, index) => (
          <CaseCard
            key={index}
            category={caseItem.category}
            title={caseItem.title}
            description={caseItem.description}
            imagePosition={caseItem.imagePosition}
          />
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          className="px-8 py-2 rounded-full text-zinc-600 border-zinc-200 hover:bg-zinc-50"
        >
          Load more cases...
          <ChevronDown className="size-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
