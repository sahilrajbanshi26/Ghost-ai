import { clerkClient } from "@clerk/nextjs/server"

import { db } from "@/lib/prisma"

export async function getProjectAccess(projectId: string, userId: string, email?: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { collaborators: true },
  })

  if (!project) return null

  const isOwner = project.ownerId === userId
  const normalizedEmail = email?.trim().toLowerCase()
  const isCollaborator = Boolean(
    normalizedEmail &&
      project.collaborators.some(
        (collaborator) => collaborator.collaboratorEmail.toLowerCase() === normalizedEmail
      )
  )

  return { project, isOwner, isCollaborator, canView: isOwner || isCollaborator }
}

export async function enrichCollaborators(collaborators: { id: string; collaboratorEmail: string }[]) {
  if (!collaborators.length) return []

  const client = await clerkClient()
  const users = await client.users.getUserList({
    emailAddress: collaborators.map((collaborator) => collaborator.collaboratorEmail),
  })

  return collaborators.map((collaborator) => {
    const user = users.data.find((candidate) =>
      candidate.emailAddresses.some(
        (emailAddress) => emailAddress.emailAddress.toLowerCase() === collaborator.collaboratorEmail.toLowerCase()
      )
    )

    return {
      id: collaborator.id,
      email: collaborator.collaboratorEmail,
      displayName: user
        ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || collaborator.collaboratorEmail
        : collaborator.collaboratorEmail,
      avatarUrl: user?.imageUrl ?? null,
    }
  })
}