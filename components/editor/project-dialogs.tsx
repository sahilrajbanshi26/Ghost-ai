"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ProjectDialog } from "@/components/editor/use-project-dialogs"

interface ProjectDialogsProps {
  dialog: ProjectDialog
  projectName: string
  slugPreview: string
  selectedProjectName?: string
  isLoading: boolean
  onProjectNameChange: (value: string) => void
  onClose: () => void
  onCreate: () => void
  onRename: () => void
  onDelete: () => void
}

export function ProjectDialogs({
  dialog,
  projectName,
  slugPreview,
  selectedProjectName,
  isLoading,
  onProjectNameChange,
  onClose,
  onCreate,
  onRename,
  onDelete,
}: ProjectDialogsProps) {
  return (
    <>
      <Dialog open={dialog === "create"} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>
              Give your new architecture workspace a name.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onCreate() }}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="create-project-name">
                Project name
              </label>
              <Input
                autoFocus
                id="create-project-name"
                value={projectName}
                onChange={(event) => onProjectNameChange(event.target.value)}
                placeholder="e.g. Mercury"
              />
              <p className="text-xs text-muted-foreground">
                Slug preview: {slugPreview || "project-slug"}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button disabled={isLoading || !projectName.trim()} type="submit">Create project</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "rename"} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
            <DialogDescription>
              Rename the current project, {selectedProjectName}.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); onRename() }}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="rename-project-name">
                Project name
              </label>
              <Input
                autoFocus
                id="rename-project-name"
                value={projectName}
                onChange={(event) => onProjectNameChange(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button disabled={isLoading || !projectName.trim()} type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "delete"} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Delete {selectedProjectName}? This project will be removed from your list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button disabled={isLoading} type="button" variant="destructive" onClick={onDelete}>
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}