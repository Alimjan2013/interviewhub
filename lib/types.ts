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

export interface MessagePayload {
  source: "ai" | "user"
  message: string
}

// New types for agent configuration
export type LLMType =
  | "claude-2"
  | "claude-instant"
  | "gpt-3.5-turbo"
  | "gpt-4"
  | "palm-2"
  | "command"
  | "command-nightly"
  | "j2-light"
  | "j2-mid"
  | "j2-ultra"
  | "llama-2-7b"
  | "llama-2-13b"
  | "llama-2-70b"

export interface AgentConfig {
  name: string
  description?: string
  initial_message?: string
  display_name?: string
}

export interface PromptConfig {
  prompt: string
  llm?: LLMType
  temperature?: number
  max_tokens?: number
  tools?: Array<{
    type: string
    config: Record<string, unknown>
  }>
  tool_ids?: string[]
}

export interface ConversationConfig {
  agent?: AgentConfig
  prompt?: PromptConfig
  first_message?: string
  language?: string
  dynamic_variables?: Record<string, unknown>
  asr?: {
    enable_voice_activity_detection?: boolean
    provider?: string
    config?: Record<string, unknown>
  }
  tts?: {
    voice_id?: string
    model_id?: string
    stability?: number
    similarity_boost?: number
    style?: number
    use_speaker_boost?: boolean
    speaking_rate?: number
  }
}

