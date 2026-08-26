import { db } from "@/lib/prisma"
import { requireUserId } from "@/lib/api-auth"

export async function GET() {
  const userId = await requireUserId()
  if (userId instanceof Response) return userId

  const projects = await db.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  })

  return Response.json(projects)
}

export async function POST(request: Request) {
  const userId = await requireUserId()
  if (userId instanceof Response) return userId

  let body: { name?: unknown; description?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const name = typeof body.name === "string" && body.name.trim()
    ? body.name.trim()
    : "Untitled Project"
  const description = typeof body.description === "string"
    ? body.description
    : undefined

  const project = await db.project.create({
    data: {
      ownerId: userId,
      name,
      ...(description !== undefined ? { description } : {}),
    },
  })

  return Response.json(project, { status: 201 })
}