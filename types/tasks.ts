export type AiStatusPhase = "start" | "processing" | "complete" | "error"

export type AiStatusFeedPayload = {
  type?: string
  phase?: AiStatusPhase
  text?: string
  message?: string
  timestamp?: string
  [key: string]: unknown
}

export type AiChatRole = "user" | "assistant" | "system"

export type AiChatFeedMessage = {
  type?: string
  sender?: string
  role?: AiChatRole
  content?: string
  timestamp?: string
  [key: string]: unknown
}

const VALID_PHASES: AiStatusPhase[] = ["start", "processing", "complete", "error"]
const VALID_CHAT_ROLES: AiChatRole[] = ["user", "assistant", "system"]

export function validateAiStatusFeedPayload(value: unknown): value is AiStatusFeedPayload {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  if (candidate.type !== undefined && typeof candidate.type !== "string") {
    return false
  }

  if (candidate.phase !== undefined && !VALID_PHASES.includes(candidate.phase as AiStatusPhase)) {
    return false
  }

  if (candidate.text !== undefined && typeof candidate.text !== "string") {
    return false
  }

  if (candidate.message !== undefined && typeof candidate.message !== "string") {
    return false
  }

  if (candidate.timestamp !== undefined && typeof candidate.timestamp !== "string") {
    return false
  }

  return true
}

export function validateAiChatFeedMessage(value: unknown): value is AiChatFeedMessage {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  if (typeof candidate.type !== "string") {
    return false
  }

  if (typeof candidate.sender !== "string" || !candidate.sender.trim()) {
    return false
  }

  if (!VALID_CHAT_ROLES.includes(candidate.role as AiChatRole)) {
    return false
  }

  if (typeof candidate.content !== "string" || !candidate.content.trim()) {
    return false
  }

  if (typeof candidate.timestamp !== "string" || !candidate.timestamp.trim()) {
    return false
  }

  return true
}

export function getLatestAiStatusMessage(messages: Array<{ data?: unknown }> | undefined): AiStatusFeedPayload | null {
  if (!Array.isArray(messages)) return null

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (!message || !validateAiStatusFeedPayload(message.data)) {
      continue
    }

    return message.data
  }

  return null
}

export function getAiChatMessages(messages: Array<{ data?: unknown }> | undefined): AiChatFeedMessage[] {
  if (!Array.isArray(messages)) return []

  return messages.flatMap((message) => {
    if (!message || !validateAiChatFeedMessage(message.data)) {
      return []
    }

    return [message.data]
  })
}
