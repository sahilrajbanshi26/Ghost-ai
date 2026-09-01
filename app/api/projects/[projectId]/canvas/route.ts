import { currentUser } from "@clerk/nextjs/server"
import { get, put } from "@vercel/blob"

import { getProjectAccess } from "@/lib/collaborators"
import { db } from "@/lib/prisma"

interface CanvasRouteContext {
  params: Promise<{ projectId: string }>
}

export async function GET(_request: Request, context: CanvasRouteContext) {
  const user = await currentUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await context.params
  const emails = [
    user.primaryEmailAddress?.emailAddress,
    ...user.emailAddresses.map((entry) => entry.emailAddress),
  ].filter((email): email is string => Boolean(email))

  const access = await getProjectAccess(projectId, user.id, emails)
  const project = access?.project

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 })
  }

  if (!access?.canView) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ nodes: [], edges: [] }, { status: 200 })
  }

  if (!project.canvasJsonPath) {
    return Response.json({ nodes: [], edges: [] }, { status: 200 })
  }

  try {
    const blob = await get(project.canvasJsonPath, { access: "private" })
    if (!blob || !blob.stream) {
      return Response.json({ error: "Canvas not found" }, { status: 404 })
    }

    const payload = await new Response(blob.stream).json()
    return Response.json(payload)
  } catch (error) {
    console.error("Failed to load canvas JSON from blob store", error)
    return Response.json({ error: "Unable to load canvas" }, { status: 500 })
  }
}

export async function PUT(request: Request, context: CanvasRouteContext) {
  const user = await currentUser()
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { projectId } = await context.params
  const emails = [
    user.primaryEmailAddress?.emailAddress,
    ...user.emailAddresses.map((entry) => entry.emailAddress),
  ].filter((email): email is string => Boolean(email))

  const access = await getProjectAccess(projectId, user.id, emails)
  const project = access?.project

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 })
  }

  if (!access?.canView) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: { nodes?: unknown; edges?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  if (!blobToken) {
    console.warn("Canvas save skipped: BLOB_READ_WRITE_TOKEN is not configured")
    return Response.json({ url: null, skipped: true }, { status: 200 })
  }

  const payload = JSON.stringify({
    nodes: Array.isArray(body.nodes) ? body.nodes : [],
    edges: Array.isArray(body.edges) ? body.edges : [],
  })

  try {
    const blob = await put(`canvas/${projectId}.json`, payload, {
      access: "private",
      allowOverwrite: true,
      contentType: "application/json",
    })

    await db.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: blob.url },
    })

    return Response.json({ url: blob.url })
  } catch (error) {
    console.error("Failed to save canvas JSON to blob store", error)
    return Response.json({ error: "Unable to save canvas" }, { status: 500 })
  }
}
