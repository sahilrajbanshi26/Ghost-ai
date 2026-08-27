import { Pencil, Plus, Trash2, X } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProjectSummary } from "@/lib/projects"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  ownedProjects: ProjectSummary[]
  sharedProjects: ProjectSummary[]
  onCreate: () => void
  onRename: (project: ProjectSummary) => void
  onDelete: (project: ProjectSummary) => void
}

function ProjectList({
  projects,
  canManage,
  onRename,
  onDelete,
}: {
  projects: ProjectSummary[]
  canManage: boolean
  onRename: (project: ProjectSummary) => void
  onDelete: (project: ProjectSummary) => void
}) {
  if (!projects.length) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center rounded-md border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">No projects yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {projects.map((project) => (
        <div className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent" key={project.id}>
          <div className="min-w-0 flex-1">
            <Link className="block truncate text-sm font-medium" href={`/editor/${project.id}`}>{project.name}</Link>
            <p className="truncate text-xs text-muted-foreground">{project.status.toLowerCase()}</p>
          </div>
          {canManage && (
            <div className="flex shrink-0">
              <Button aria-label={`Rename ${project.name}`} size="icon" type="button" variant="ghost" onClick={() => onRename(project)}>
                <Pencil />
              </Button>
              <Button aria-label={`Delete ${project.name}`} size="icon" type="button" variant="ghost" onClick={() => onDelete(project)}>
                <Trash2 />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function ProjectSidebar({ isOpen, onClose, ownedProjects, sharedProjects, onCreate, onRename, onDelete }: ProjectSidebarProps) {
  return (
    <>
      {isOpen && <button aria-label="Close sidebar" className="fixed inset-0 top-14 z-20 bg-background/60 md:hidden" type="button" onClick={onClose} />}
      <aside
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          "fixed bottom-2 left-2 top-16 z-30 flex w-[306px] max-w-[calc(100vw-1rem)] flex-col rounded-3xl border bg-card shadow-2xl transition-transform duration-200 ease-out",
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
          <ProjectList projects={ownedProjects} canManage onRename={onRename} onDelete={onDelete} />
        </TabsContent>
        <TabsContent className="min-h-0 flex-1" value="shared">
          <ProjectList projects={sharedProjects} canManage={false} onRename={onRename} onDelete={onDelete} />
        </TabsContent>
      </Tabs>

      <div className="border-t p-4">
        <Button className="w-full" type="button" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
      </aside>
    </>
  )
}
