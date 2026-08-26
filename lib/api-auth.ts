import { auth } from "@clerk/nextjs/server"

export async function requireUserId() {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  return userId
}