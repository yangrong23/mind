"use client"

import { useState } from "react"
import { PhoneFrame } from "./phone-frame"
import { MemoHome } from "./memo-home"
import { RecordingView } from "./recording-view"
import { DetailView } from "./detail-view"
import { ProfileView } from "./profile-view"

type View = "home" | "recording" | "detail" | "profile"

export function MindApp() {
  const [currentView, setCurrentView] = useState<View>("home")
  
  return (
    <PhoneFrame>
      {currentView === "home" && (
        <MemoHome 
          onStartRecording={() => setCurrentView("recording")}
          onCardClick={() => setCurrentView("detail")}
          onProfileClick={() => setCurrentView("profile")}
        />
      )}
      {currentView === "recording" && (
        <RecordingView 
          onStop={() => setCurrentView("detail")}
          onClose={() => setCurrentView("home")}
        />
      )}
      {currentView === "detail" && (
        <DetailView onBack={() => setCurrentView("home")} />
      )}
      {currentView === "profile" && (
        <ProfileView onBack={() => setCurrentView("home")} />
      )}
    </PhoneFrame>
  )
}
