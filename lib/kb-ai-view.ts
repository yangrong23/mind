/** Demo copy for library AI view — summary + topic chips until API-backed insights ship. */

export type KbAiInsight = {
  id: string
  label: string
}

export function kbAiSummaryParagraph(
  libraryName: string,
  sourceCount: number,
  description?: string
): string {
  const unit = sourceCount === 1 ? "source" : "sources"
  const lead = description?.trim()
  if (lead) {
    return `${lead} This AI view distills ${sourceCount} ${unit} in “${libraryName}” into themes you can scan in seconds, then explore how ideas link in the graph.`
  }
  return `Across ${sourceCount} ${unit} in “${libraryName}”, Mindar surfaces what matters: shared themes, tensions between sources, and the concepts that tie everything together. Use the graph to drill into a topic, then chat when you want citations.`
}

export function kbAiInsights(sourceCount: number): KbAiInsight[] {
  const depth =
    sourceCount >= 8 ? "deep" : sourceCount >= 4 ? "moderate" : sourceCount >= 1 ? "early" : "empty"
  if (depth === "empty") {
    return [
      { id: "add", label: "Add sources to generate an AI summary and graph" },
      { id: "plaza", label: "Or subscribe to a plaza library to explore its map" },
    ]
  }
  if (depth === "early") {
    return [
      { id: "themes", label: "Core themes will sharpen as you add more materials" },
      { id: "graph", label: "Graph links appear between related documents and concepts" },
    ]
  }
  return [
    { id: "overlap", label: "Several sources reinforce the same decision threads" },
    { id: "gap", label: "Open questions cluster where sources disagree or stay silent" },
    {
      id: "next",
      label:
        depth === "deep"
          ? "Dense libraries benefit from graph-first browsing, then targeted chat"
          : "Good moment to ask Mindar for a one-paragraph executive brief",
    },
  ]
}

export function kbAiTopicChips(libraryName: string, sourceCount: number): string[] {
  if (sourceCount === 0) return ["Getting started", "Add sources"]
  const seed = (libraryName.length + sourceCount) % 5
  const pools = [
    ["Strategy", "Risks", "Stakeholders", "Timeline", "Metrics"],
    ["Architecture", "Data model", "Retrieval", "Evaluation", "Roadmap"],
    ["Claims", "Prior art", "Specification", "Office action", "Divisional"],
    ["User research", "Workflow", "Adoption", "Integrations", "Support"],
    ["Market", "Competition", "Pricing", "GTM", "Partners"],
  ]
  return pools[seed]!.slice(0, Math.min(5, 2 + Math.min(sourceCount, 4)))
}
