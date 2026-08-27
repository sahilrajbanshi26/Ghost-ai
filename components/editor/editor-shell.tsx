"use client"

import { useSyncExternalStore, useState } from "react"

import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ShareDialog } from "@/components/editor/share-dialog"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { LiveCanvas } from "@/components/editor/live-canvas"
import { CanvasBlock } from "@/components/editor/canvas-block"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { ProjectSummary } from "@/lib/projects"
import { Bot, Sparkles } from "lucide-react"

interface EditorShellProps {
  ownedProjects: ProjectSummary[]
  sharedProjects: ProjectSummary[]
  children?: React.ReactNode
  workspaceTitle?: string
  projectId?: string
  isOwner?: boolean
}

export function EditorShell({ ownedProjects, sharedProjects, children, workspaceTitle, projectId, isOwner = false }: EditorShellProps) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const projectActions = useProjectActions()
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isCopilotOpen, setIsCopilotOpen] = useState(true)
  const isMobile = useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia("(max-width: 767px)")
      mediaQuery.addEventListener("change", onStoreChange)
      return () => mediaQuery.removeEventListener("change", onStoreChange)
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false
  )
  const isSidebarOpen = isMobile ? isMobileSidebarOpen : isDesktopSidebarOpen

  return (
    <div className="min-h-screen bg-background">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => {
            if (isMobile) {
              setIsMobileSidebarOpen((isOpen) => !isOpen)
            } else {
              setIsDesktopSidebarOpen((isOpen) => !isOpen)
            }
          }}
          workspaceTitle={workspaceTitle}
          projectId={projectId}
          onShare={() => setIsShareOpen(true)}
          isCopilotOpen={isCopilotOpen}
          onCopilotToggle={() => setIsCopilotOpen((isOpen) => !isOpen)}
      />
      <main className="h-screen overflow-hidden pt-14">
        <div className="relative h-[calc(100vh-3.5rem)] min-h-0">
          <ProjectSidebar
            isOpen={isSidebarOpen}
            onClose={() => {
              if (isMobile) {
                setIsMobileSidebarOpen(false)
              } else {
                setIsDesktopSidebarOpen(false)
              }
            }}
            ownedProjects={ownedProjects}
            sharedProjects={sharedProjects}
            onCreate={projectActions.openCreate}
            onRename={projectActions.openRename}
            onDelete={projectActions.openDelete}
          />
          <div className="h-full min-h-0">
            <CanvasBlock projectName={workspaceTitle}>
              {projectId ? <LiveCanvas roomId={projectId} projectName={workspaceTitle ?? "Untitled Workspace"} /> : children ?? (
          <div className="flex h-full min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">Create a project or open an existing one</h1>
              <p className="text-sm text-muted-foreground">Start a new architecture workspace, or choose a project from the sidebar.</p>
            </div>
            <button className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90" type="button" onClick={projectActions.openCreate}>
              New Project
            </button>
          </div>
              )}
            </CanvasBlock>
          </div>
          {isCopilotOpen && <aside className="fixed bottom-4 right-4 top-[4.5rem] z-30 hidden w-[316px] flex-col overflow-hidden rounded-2xl border bg-card/95 shadow-2xl backdrop-blur lg:flex">
            <div className="flex h-16 items-center justify-between border-b px-5">
              <div>
                <h2 className="text-sm font-semibold">AI Copilot</h2>
                <p className="text-xs text-muted-foreground">Placeholder panel</p>
              </div>
              <Sparkles className="h-4 w-4 text-violet-400" />
            </div>
            <div className="flex flex-1 flex-col justify-between p-5">
              <div className="rounded-2xl border bg-background/50 p-5">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                  <Bot className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-medium">Chat surface pending</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">The toggle is wired. Messaging and generation are intentionally out of scope here.</p>
              </div>
              <div className="border-t border-dashed pt-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Future hooks</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Prompt composer, artifacts, and architecture guidance will attach to this panel.</p>
              </div>
            </div>
          </aside>}
        </div>
      </main>
      <ProjectDialogs
        dialog={projectActions.dialog}
        projectName={projectActions.projectName}
        roomIdPreview={projectActions.roomIdPreview}
        selectedProjectName={projectActions.selectedProject?.name}
        isLoading={projectActions.isLoading}
        error={projectActions.error}
        onProjectNameChange={projectActions.updateProjectName}
        onClose={projectActions.closeDialog}
        onCreate={projectActions.submitCreate}
        onRename={projectActions.submitRename}
        onDelete={projectActions.submitDelete}
      />
      <ShareDialog
        key={projectId}
        projectId={projectId}
        projectName={workspaceTitle}
        isOwner={isOwner}
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
      />
    </div>
  )
}
