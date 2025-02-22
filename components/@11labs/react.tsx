"use client"

import { useState, useCallback } from "react"

interface ConversationOptions {
  apiKey: string
  agentId: string
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage?: (message: string) => void
  onError?: (error: unknown) => void
}

interface Conversation {
  startSession: (options: { agentId: string }) => Promise<void>
  endSession: () => Promise<void>
  isSpeaking: boolean
}

export function useConversation(options: ConversationOptions): Conversation {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const startSession = useCallback(
    async (agentOptions: { agentId: string }) => {
      options.onConnect?.()
      setIsSpeaking(true) // Mock speaking
      setTimeout(() => {
        options.onMessage?.("Hello, I am your AI interviewer.")
        setIsSpeaking(false)
      }, 1000)
    },
    [options],
  )

  const endSession = useCallback(async () => {
    options.onDisconnect?.()
  }, [options])

  return {
    startSession,
    endSession,
    isSpeaking,
  }
}

