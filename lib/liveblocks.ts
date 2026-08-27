import { Liveblocks } from "@liveblocks/node"

const cursorColors = ["#22d3ee", "#a78bfa", "#f472b6", "#facc15", "#4ade80", "#fb923c"]

const globalForLiveblocks = globalThis as typeof globalThis & {
  liveblocks?: Liveblocks
}

export function getLiveblocksClient() {
  if (globalForLiveblocks.liveblocks) return globalForLiveblocks.liveblocks

  const secret = process.env.LIVEBLOCKS_SECRET_KEY
  if (!secret) throw new Error("LIVEBLOCKS_SECRET_KEY is not configured")

  const client = new Liveblocks({ secret })
  globalForLiveblocks.liveblocks = client

  return client
}

export function getCursorColor(userId: string) {
  let hash = 0
  for (const character of userId) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return cursorColors[hash % cursorColors.length]
}