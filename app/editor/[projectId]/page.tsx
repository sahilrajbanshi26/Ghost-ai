import { currentUser } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"

import { EditorShell } from "@/components/editor/editor-shell"
import { getProjectsForUser } from "@/lib/projects"
import { db } from "@/lib/prisma"

interface WorkspacePageProps {
  params: Promise<{ projectId: string }>
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const user = await currentUser()
  if (!user) return null

  const { projectId } = await params
  const project = await db.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: user.id },
        {
          collaborators: {
            some: { collaboratorEmail: user.primaryEmailAddress?.emailAddress ?? "" },
          },
        },
      ],
    },
  })

  if (!project) notFound()

  const { ownedProjects, sharedProjects } = await getProjectsForUser(
    user.id,
    user.primaryEmailAddress?.emailAddress
  )

  return (
    <EditorShell ownedProjects={ownedProjects} sharedProjects={sharedProjects}>
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <p className="text-sm text-muted-foreground">Architecture workspace</p>
        </div>
      </div>
    </EditorShell>
  )
}