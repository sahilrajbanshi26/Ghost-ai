import { currentUser } from "@clerk/nextjs/server"
import { Prisma } from "@/app/generated/prisma/client"

import { enrichCollaborators, getProjectAccess } from "@/lib/collaborators"
import { db } from "@/lib/prisma"

interface RouteContext {
  params: Promise<{ projectId: string }>
}

async function getContext(context: RouteContext) {
  const user = await currentUser()
  if (!user) return { response: Response.json({ error: "Unauthorized" }, { status: 401 }) }

  const { projectId } = await context.params
  const access = await getProjectAccess(projectId, user.id, user.primaryEmailAddress?.emailAddress)
  if (!access) return { response: Response.json({ error: "Project not found" }, { status: 404 }) }
  if (!access.canView) return { response: Response.json({ error: "Forbidden" }, { status: 403 }) }

  return { user, access }
}

export async function GET(_request: Request, context: RouteContext) {
  const result = await getContext(context)
  if (result.response) return result.response

  return Response.json({
    collaborators: await enrichCollaborators(result.access.project.collaborators),
    canManage: result.access.isOwner,
  })
}

export async function POST(request: Request, context: RouteContext) {
  const result = await getContext(context)
  if (result.response) return result.response
  if (!result.access.isOwner) return Response.json({ error: "Forbidden" }, { status: 403 })

  let body: { email?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  if (!/^[^@\s]+@[^@\s]+$/.test(email)) {
    return Response.json({ error: "A valid email is required" }, { status: 400 })
  }

  const existingCollaborator = await db.projectCollaborator.findUnique({
    where: {
      projectId_collaboratorEmail: {
        projectId: result.access.project.id,
        collaboratorEmail: email,
      },
    },
  })
  if (existingCollaborator) {
    return Response.json({ error: "Collaborator already has access" }, { status: 409 })
  }

  let collaborator
  try {
    collaborator = await db.projectCollaborator.create({
      data: { projectId: result.access.project.id, collaboratorEmail: email },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return Response.json({ error: "Collaborator already has access" }, { status: 409 })
    }
    throw error
  }

  return Response.json((await enrichCollaborators([collaborator]))[0], { status: 201 })
}