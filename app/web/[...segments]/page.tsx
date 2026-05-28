import { Suspense } from "react"
import { MindAppWeb } from "@/components/mind-v2/mind-app-web"

/** Nested /web/* routes — /web itself is handled by app/web/page.tsx */
export default function WebAppSegmentsPage() {
  return (
    <Suspense fallback={null}>
      <MindAppWeb />
    </Suspense>
  )
}
