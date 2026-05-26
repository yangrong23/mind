/**
 * Mesh gradient — sits inside `.mind-landing-root` (absolute, z-0).
 * Do not use fixed + negative z-index (hidden behind body bg).
 */
export function LandingMeshBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-[#f5f0ff] to-sky-50" />

      {/* Top-left cyan */}
      <div className="absolute -left-[15%] -top-[20%] h-[70vh] w-[75vw] max-h-[780px] max-w-[900px] rounded-full bg-sky-300 opacity-60 blur-[100px]" />
      <div className="absolute left-[5%] top-[5%] h-[40vh] w-[45vw] max-h-[420px] max-w-[480px] rounded-full bg-cyan-200 opacity-50 blur-[80px]" />

      {/* Top-right peach / yellow */}
      <div className="absolute -right-[10%] -top-[5%] h-[65vh] w-[70vw] max-h-[720px] max-w-[820px] rounded-full bg-amber-200 opacity-55 blur-[110px]" />
      <div className="absolute right-[8%] top-[12%] h-[35vh] w-[40vw] max-h-[380px] max-w-[420px] rounded-full bg-orange-200 opacity-45 blur-[90px]" />

      {/* Center lavender */}
      <div className="absolute -left-[5%] top-[30%] h-[68vh] w-[72vw] max-h-[700px] max-w-[780px] rounded-full bg-violet-300 opacity-55 blur-[120px]" />
      <div className="absolute left-[25%] top-[45%] h-[50vh] w-[55vw] max-h-[500px] max-w-[600px] rounded-full bg-fuchsia-200 opacity-40 blur-[100px]" />

      {/* Bottom-right blue */}
      <div className="absolute -bottom-[15%] -right-[12%] h-[72vh] w-[78vw] max-h-[760px] max-w-[860px] rounded-full bg-blue-400 opacity-50 blur-[110px]" />
      <div className="absolute bottom-[5%] right-[20%] h-[42vh] w-[48vw] max-h-[440px] max-w-[500px] rounded-full bg-sky-300 opacity-45 blur-[85px]" />

      {/* Bottom fill */}
      <div className="absolute -bottom-[8%] left-[15%] h-[50vh] w-[60vw] max-h-[560px] max-w-[640px] rounded-full bg-sky-400 opacity-35 blur-[95px]" />
    </div>
  )
}
