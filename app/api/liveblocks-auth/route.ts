import { currentUser } from "@clerk/nextjs/server"

import { getCursorColor, getLiveblocksClient } from "@/lib/liveblocks"
import { getProjectAccess } from "@/lib/collaborators"

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  let body: { room?: unknown; roomId?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const roomValue = typeof body.room === "string" ? body.room : body.roomId
  const roomId = typeof roomValue === "string" ? roomValue.trim() : ""
  if (!roomId) return Response.json({ error: "Project ID is required" }, { status: 400 })

  const access = await getProjectAccess(
    roomId,
    user.id,
    user.primaryEmailAddress?.emailAddress
  )
  if (!access?.canView) return Response.json({ error: "Forbidden" }, { status: 403 })

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.username ||
    user.primaryEmailAddress?.emailAddress ||
    "Ghost AI user"
  const liveblocks = getLiveblocksClient()

  await liveblocks.getOrCreateRoom(roomId, { defaultAccesses: [] })

  const session = liveblocks.prepareSession(user.id, {
    userInfo: {
      displayName,
      avatarUrl: user.imageUrl ?? null,
      cursorColor: getCursorColor(user.id),
    },
  })
  session.allow(roomId, session.FULL_ACCESS)

  const { status, body: token } = await session.authorize()
  return new Response(token, {
    status,
    headers: { "Content-Type": "application/json" },
  })
}