import { currentUser } from "@clerk/nextjs/server"

import { db } from "@/lib/prisma"

interface RouteContext {
  params: Promise<{ projectId: string; collaboratorId: string }>
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await currentUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId, collaboratorId } = await context.params
  const project = await db.project.findUnique({ where: { id: projectId } })
  if (!project) return Response.json({ error: "Project not found" }, { status: 404 })
  if (project.ownerId !== user.id) return Response.json({ error: "Forbidden" }, { status: 403 })

  await db.projectCollaborator.deleteMany({ where: { id: collaboratorId, projectId } })
  return new Response(null, { status: 204 })
}