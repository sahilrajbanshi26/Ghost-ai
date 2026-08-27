import { UserButton } from "@clerk/nextjs"
import { Bot, PanelLeftClose, PanelLeftOpen, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  workspaceTitle?: string
  projectId?: string
  onShare?: () => void
  isCopilotOpen: boolean
  onCopilotToggle: () => void
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  workspaceTitle = "Untitled Workspace",
  projectId,
  onShare,
  isCopilotOpen,
  onCopilotToggle,
}: EditorNavbarProps) {
  const ToggleIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen

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
        <Button aria-label={isCopilotOpen ? "Hide AI Copilot" : "Show AI Copilot"} size="icon" type="button" variant="ghost" onClick={onCopilotToggle}>
          <Bot className="text-auth-accent" />
        </Button>
        <UserButton />
      </div>
    </header>
  )
}
