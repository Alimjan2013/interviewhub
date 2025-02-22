export type ConversationStatus = "idle" | "connecting" | "connected" | "disconnected" | "error"

export interface ConversationState {
  status: ConversationStatus
  isSpeaking: boolean
  error?: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

