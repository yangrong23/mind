import { LandingMeshBackground } from "@/components/mind-landing/landing-mesh-background"

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="en" className="mind-landing-root relative min-h-screen w-full">
      <LandingMeshBackground />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
