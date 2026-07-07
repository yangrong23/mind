import type { FactoryGenerationSettings, FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import { factoryKindShortLabel } from "@/components/mind-v2/content-factory-progress-panel"

/** Agent tab task handoff — autonomous delivery, not Studio factory. */
export function agentTaskInitialPrompt(
  kind: FactoryModalKind,
  settings?: FactoryGenerationSettings,
  libraryScope?: string
): string {
  const label = factoryKindShortLabel(kind)
  const scope = libraryScope ? ` Use sources from: ${libraryScope}.` : ""
  const slides =
    kind === "slides" && settings?.slidesPageCount
      ? ` Target about ${settings.slidesPageCount} slides.`
      : ""
  return `Run a task to produce a ${label} from my linked libraries.${slides}${scope} Deliver a concise plan, then the finished artifact outline (demo).`
}
