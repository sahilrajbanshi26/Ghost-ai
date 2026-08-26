import { db } from "@/lib/prisma"
import { requireUserId } from "@/lib/api-auth"

interface ProjectRouteContext {
  params: Promise<{ projectId: string }>
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
  const userId = await requireUserId()
  if (userId instanceof Response) return userId

  const { projectId } = await context.params
  const project = await db.project.findUnique({ where: { id: projectId } })

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: { name?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    return Response.json({ error: "Project name is required" }, { status: 400 })
  }

  const updatedProject = await db.project.update({
    where: { id: projectId },
    data: { name: body.name.trim() },
  })

  return Response.json(updatedProject)
}

export async function DELETE(_request: Request, context: ProjectRouteContext) {
  const userId = await requireUserId()
  if (userId instanceof Response) return userId

  const { projectId } = await context.params
  const project = await db.project.findUnique({ where: { id: projectId } })

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 })
  }

  if (project.ownerId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  await db.project.delete({ where: { id: projectId } })

  return new Response(null, { status: 204 })
}