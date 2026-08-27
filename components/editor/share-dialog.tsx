"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy, Trash2, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Collaborator {
  id: string
  email: string
  displayName: string
  avatarUrl: string | null
}

interface ShareDialogProps {
  projectId?: string
  projectName?: string
  isOwner: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareDialog({ projectId, projectName, isOwner, open, onOpenChange }: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [email, setEmail] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestGeneration = useRef(0)

  useEffect(() => {
    if (!open || !projectId) return
    const controller = new AbortController()
    const generation = ++requestGeneration.current
    const resetCollaborators = window.setTimeout(() => setCollaborators([]), 0)
    fetch(`/api/projects/${projectId}/collaborators`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load collaborators")
        return response.json()
      })
      .then((data) => {
        if (generation !== requestGeneration.current) return
        setCollaborators(data.collaborators)
        setError(null)
      })
      .catch((caughtError) => {
        if (controller.signal.aborted) return
        setError(caughtError instanceof Error ? caughtError.message : "Unable to load collaborators")
      })
    return () => {
      controller.abort()
      window.clearTimeout(resetCollaborators)
    }
  }, [open, projectId])

  const invite = async () => {
    if (!projectId || !email.trim()) return
    requestGeneration.current += 1
    setError(null)
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        return setError(data?.error ?? "Unable to invite collaborator")
      }
      const collaborator = await response.json()
      setCollaborators((current) => [...current, collaborator])
      setEmail("")
    } catch {
      setError("Unable to invite collaborator")
    }
  }

  const remove = async (collaboratorId: string) => {
    if (!projectId) return
    requestGeneration.current += 1
    setError(null)
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators/${collaboratorId}`, { method: "DELETE" })
      if (response.ok) {
        setCollaborators((current) => current.filter((collaborator) => collaborator.id !== collaboratorId))
      } else {
        const data = await response.json().catch(() => null)
        setError(data?.error ?? "Unable to remove collaborator")
      }
    } catch {
      setError("Unable to remove collaborator")
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setError(null)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setError("Unable to copy project link")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {projectName}</DialogTitle>
          <DialogDescription>Invite collaborators to this architecture workspace.</DialogDescription>
        </DialogHeader>
        {isOwner && (
          <div className="flex gap-2">
            <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="colleague@example.com" type="email" />
            <Button aria-label="Invite collaborator" size="icon" type="button" onClick={invite}><UserPlus /></Button>
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm font-medium">People with access</p>
          {collaborators.length ? collaborators.map((collaborator) => (
            <div className="flex items-center gap-3 rounded-md border px-3 py-2" key={collaborator.id}>
              <div
                aria-label={collaborator.displayName}
                className="h-8 w-8 rounded-full bg-muted bg-cover bg-center"
                role="img"
                style={collaborator.avatarUrl ? { backgroundImage: `url(${collaborator.avatarUrl})` } : undefined}
              />
              <div className="min-w-0 flex-1"><p className="truncate text-sm">{collaborator.displayName}</p><p className="truncate text-xs text-muted-foreground">{collaborator.email}</p></div>
              {isOwner && <Button aria-label={`Remove ${collaborator.email}`} size="icon" type="button" variant="ghost" onClick={() => remove(collaborator.id)}><Trash2 /></Button>}
            </div>
          )) : <p className="text-sm text-muted-foreground">No collaborators yet.</p>}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={copyLink}>{copied ? <Check /> : <Copy />}{copied ? "Copied!" : "Copy link"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}