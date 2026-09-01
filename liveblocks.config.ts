import type { LiveblocksFlow } from "@liveblocks/react-flow"

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null
      thinking: boolean
      tabId?: string
    }

    Storage: {
      canvas: LiveblocksFlow
    }

    UserMeta: {
      id: string
      info: {
        displayName: string
        avatarUrl: string | null
        cursorColor: string
      }
    }

    RoomEvent: Record<string, never>
    ThreadMetadata: Record<string, never>
    RoomInfo: Record<string, never>
  }
}

export {}