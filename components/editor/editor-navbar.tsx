import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
}: EditorNavbarProps) {
  const ToggleIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b bg-background/95 px-3 backdrop-blur">
      <div className="flex flex-1 items-center justify-start">
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
        <span className="text-sm font-medium text-muted-foreground">
          Ghost AI
        </span>
      </div>

      <div className="flex flex-1 items-center justify-end" />
    </header>
  )
}
