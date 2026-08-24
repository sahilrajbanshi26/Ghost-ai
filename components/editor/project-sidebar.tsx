import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
}

function EmptyProjectState({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-64 items-center justify-center rounded-md border border-dashed p-6 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  return (
    <aside
      aria-hidden={!isOpen}
      className={cn(
        "fixed bottom-0 left-0 top-14 z-30 flex w-80 max-w-[calc(100vw-1rem)] flex-col border-r bg-card shadow-xl transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        <h2 className="text-sm font-semibold">Projects</h2>
        <Button
          aria-label="Close sidebar"
          size="icon"
          type="button"
          variant="ghost"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        className="flex min-h-0 flex-1 flex-col gap-4 p-4"
        defaultValue="my-projects"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent className="min-h-0 flex-1" value="my-projects">
          <EmptyProjectState label="No projects yet." />
        </TabsContent>
        <TabsContent className="min-h-0 flex-1" value="shared">
          <EmptyProjectState label="No shared projects yet." />
        </TabsContent>
      </Tabs>

      <div className="border-t p-4">
        <Button className="w-full" type="button">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  )
}
