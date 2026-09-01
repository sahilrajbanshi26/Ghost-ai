import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Bot, Check, LoaderCircle, PanelLeftClose, PanelLeftOpen, Save, Share2, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"

const UserButton = dynamic(() => import("@clerk/nextjs").then((module) => module.UserButton), {
  ssr: false,
})

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  workspaceTitle?: string
  projectId?: string
  onShare?: () => void
  onSave?: () => void
  isCopilotOpen: boolean
  onCopilotToggle: () => void
  saveStatus?: "saving" | "saved" | "error"
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  workspaceTitle = "Untitled Workspace",
  projectId,
  onShare,
  onSave,
  isCopilotOpen,
  onCopilotToggle,
  saveStatus = "saved",
}: EditorNavbarProps) {
  const ToggleIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen
  const [displayState, setDisplayState] = useState<"idle" | "saving" | "saved" | "error">("idle")

  useEffect(() => {
    if (saveStatus === "saving") {
      setDisplayState("saving")
      return
    }

    if (saveStatus === "saved") {
      setDisplayState("saved")
      const timer = window.setTimeout(() => setDisplayState("idle"), 1200)
      return () => window.clearTimeout(timer)
    }

    if (saveStatus === "error") {
      setDisplayState("error")
      const timer = window.setTimeout(() => setDisplayState("idle"), 1200)
      return () => window.clearTimeout(timer)
    }

    setDisplayState("idle")
  }, [saveStatus])

  const SaveIcon = {
    idle: Save,
    saving: LoaderCircle,
    saved: Check,
    error: TriangleAlert,
  }[displayState]
  const saveLabel = {
    idle: "Save",
    saving: "Saving...",
    saved: "Saved",
    error: "Error",
  }[displayState]
  const saveClassName = {
    idle: "text-foreground",
    saving: "text-amber-400",
    saved: "text-emerald-400",
    error: "text-red-400",
  }[displayState]

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b bg-background/95 px-3 backdrop-blur">
      <div className="flex min-w-0 flex-1 items-center justify-start gap-3">
        <Button
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          size="icon"
          type="button"
          variant="ghost"
          onClick={onSidebarToggle}
        >
          <ToggleIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{workspaceTitle}</p>
          <p className="text-[11px] text-muted-foreground">Workspace</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        <Button disabled={!projectId} size="sm" type="button" variant="outline" onClick={onShare}>
          <Share2 />
          Share
        </Button>
        {projectId && (
          <Button aria-label="Save canvas" className="gap-2" size="sm" type="button" variant="outline" onClick={() => void onSave?.()}>
            <SaveIcon className={`h-3.5 w-3.5 ${saveClassName} ${displayState === "saving" ? "animate-spin" : ""}`} />
            <span className="text-xs">{saveLabel}</span>
          </Button>
        )}
        <Button aria-label={isCopilotOpen ? "Hide AI Copilot" : "Show AI Copilot"} size="icon" type="button" variant="ghost" onClick={onCopilotToggle}>
          <Bot className="text-auth-accent" />
        </Button>
        <UserButton />
      </div>
    </header>
  )
}
